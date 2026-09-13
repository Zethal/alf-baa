import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { bundledPacks } from "../data/packs";
import { packSchema, parsePack, matchAnswer } from "./content";
import {
  applyAction,
  createSession,
  restoreSession,
  type Session,
} from "./engine";

const bank = bundledPacks.find((p) => p.id === "bank-space")!;
const top = bundledPacks.find((p) => p.id === "top-science")!;
const start = (pack = bank) => createSession(["Red", "Blue"], [pack]);
const strikes = (s: Session) =>
  Array.from({ length: 3 }).reduce<Session>(
    (a) => applyAction(a, { type: "wrong" }),
    s,
  );

describe("Bank", () => {
  it("keeps both teams on one answer pool, then awards successful steals once", () => {
    let s = applyAction(start(), {
      type: "reveal",
      answerId: bank.answers[0].id,
    });
    s = strikes(s);
    expect(s.current.stage).toBe("steal");
    expect(s.current.strikes).toBe(3);
    expect(s.current.revealed[bank.answers[0].id]).toBe(0);
    const ended = applyAction(s, { type: "steal", success: true });
    expect(ended.current.scores).toEqual([0, 1]);
    expect(applyAction(ended, { type: "steal", success: true })).toBe(ended);
  });
  it("failed steals award the original team", () =>
    expect(
      applyAction(strikes(start()), { type: "steal", success: false }).current
        .scores,
    ).toEqual([1, 0]));
  it("undo restores two strikes and removes a round award exactly", () => {
    const stealing = strikes(start());
    expect(applyAction(stealing, { type: "undo" }).current).toMatchObject({
      strikes: 2,
      stage: "play",
    });
    const ended = applyAction(stealing, { type: "steal", success: true });
    expect(applyAction(ended, { type: "undo" }).current).toEqual(
      stealing.current,
    );
  });
  it("clearing the entire board awards one point only", () => {
    let s = start();
    for (const answer of bank.answers)
      s = applyAction(s, { type: "reveal", answerId: answer.id });
    expect(s.current.scores).toEqual([1, 0]);
    expect(s.current.stage).toBe("round-end");
  });
  it("ignores invalid transitions", () => {
    const s = start();
    for (const action of [
      { type: "next" },
      { type: "steal", success: true },
      { type: "pass" },
      { type: "select-team", team: 1 },
      { type: "reveal", answerId: "missing" },
    ] as const)
      expect(applyAction(s, action)).toBe(s);
    const stealing = strikes(s);
    expect(applyAction(stealing, { type: "wrong" })).toBe(stealing);
    expect(
      applyAction(stealing, { type: "reveal", answerId: bank.answers[0].id }),
    ).toBe(stealing);
  });
});

describe("Top Ten", () => {
  it("rank 1 is 1 point, rank 10 is 10 points, with alternating turns", () => {
    let s = applyAction(start(top), {
      type: "reveal",
      answerId: top.answers[0].id,
    });
    expect(s.current.scores).toEqual([1, 0]);
    expect(s.current.activeTeam).toBe(1);
    s = applyAction(s, { type: "reveal", answerId: top.answers[9].id });
    expect(s.current.scores).toEqual([1, 10]);
  });
  it("awards precisely 55 points across the full board and prevents duplicates", () => {
    let s = start(top);
    for (const answer of top.answers) {
      s = applyAction(s, { type: "reveal", answerId: answer.id });
      expect(applyAction(s, { type: "reveal", answerId: answer.id })).toBe(s);
    }
    expect(s.current.scores).toEqual([25, 30]);
    expect(s.current.stage).toBe("round-end");
    expect(applyAction(s, { type: "undo" }).current.scores).toEqual([25, 20]);
  });
  it("supports passing, manual team selection and ending early without awarding hidden answers", () => {
    let s = applyAction(start(top), { type: "pass" });
    expect(s.current.activeTeam).toBe(1);
    s = applyAction(s, { type: "select-team", team: 0 });
    s = applyAction(s, { type: "reveal", answerId: top.answers[4].id });
    expect(applyAction(s, { type: "end-round" }).current.scores).toEqual([
      5, 0,
    ]);
  });
});

describe("sessions and content", () => {
  it("validates the example import and prevents repeated categories", () => {
    const example = JSON.parse(
      readFileSync(
        new URL("../../examples/custom-gulf.json", import.meta.url),
        "utf8",
      ),
    );
    expect(packSchema.safeParse(example).success).toBe(true);
    expect(() =>
      createSession(["a", "b"], [bank, { ...bank, id: "custom-same-topic" }]),
    ).toThrow("different topic");
  });
  it("plays ten rounds, alternates starting teams, and supports undo across rounds", () => {
    const packs = bundledPacks
      .filter((p) => p.gameType === "bank")
      .slice(0, 10);
    let s = createSession(["الفريق الأول", "الفريق الثاني"], packs);
    for (let i = 0; i < 10; i++) {
      expect(s.current.activeTeam).toBe(i % 2);
      s = applyAction(s, { type: "award-bank", team: 0 });
      const ended = s;
      s = applyAction(s, { type: "next" });
      expect(applyAction(s, { type: "undo" }).current).toEqual(ended.current);
    }
    expect(s.current.stage).toBe("finished");
    expect(s.current.scores).toEqual([10, 0]);
    expect(restoreSession(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it("rejects malformed saved sessions and mixed or repeated packs", () => {
    expect(restoreSession({})).toBeNull();
    const s = start();
    s.current.round = 7;
    expect(restoreSession(s)).toBeNull();
    expect(() => createSession(["a", "b"], [bank, bank])).toThrow();
    expect(() => createSession(["a", "b"], [bank, top])).toThrow();
  });
  it.each(bundledPacks.map((p) => [p.id, p] as const))(
    "validates bundled pack %s",
    (_, pack) => expect(packSchema.safeParse(pack).success).toBe(true),
  );
  it("validates imports and rejects duplicate ranks, aliases, unsafe URLs and missing Arabic", () => {
    expect(parsePack(JSON.stringify(top)).ok).toBe(true);
    expect(parsePack("not json").ok).toBe(false);
    expect(parsePack("x".repeat(150001)).ok).toBe(false);
    const badRank = structuredClone(top);
    if (badRank.gameType === "top-ten") badRank.answers[9].rank = 1;
    expect(packSchema.safeParse(badRank).success).toBe(false);
    const duplicate = structuredClone(bank);
    duplicate.answers[1].label = duplicate.answers[0].label;
    expect(packSchema.safeParse(duplicate).success).toBe(false);
    const unsafe = structuredClone(bank);
    unsafe.source.url = "javascript:alert(1)";
    expect(packSchema.safeParse(unsafe).success).toBe(false);
    expect(packSchema.safeParse({ ...bank, title: { en: "a" } }).success).toBe(
      false,
    );
  });
  it("matches conservative aliases in either language without guessing", () => {
    expect(matchAnswer(bank, "  MERCURY  ")?.label.ar).toBe("عطارد");
    expect(matchAnswer(bank, "عطارد")?.label.en).toBe("Mercury");
    expect(matchAnswer(bank, "Mercu")).toBeUndefined();
    expect(
      matchAnswer(
        bundledPacks.find((p) => p.id === "bank-gulf")!,
        "UAE",
      )?.label.en,
    ).toBe("United Arab Emirates");
  });
});
