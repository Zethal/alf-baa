import { z } from "zod";
import {
  BANK_ROUND_POINTS,
  BANK_STRIKES,
  MAX_ROUNDS,
  TOP_TEN_RANK_POINTS,
} from "./constants";
import { packSchema, type Pack, type TeamIndex } from "./content";

export const snapshotSchema = z
  .object({
    round: z
      .number()
      .int()
      .min(0)
      .max(MAX_ROUNDS - 1),
    scores: z.tuple([
      z.number().int().min(0).max(1000),
      z.number().int().min(0).max(1000),
    ]),
    activeTeam: z.union([z.literal(0), z.literal(1)]),
    strikes: z.number().int().min(0).max(BANK_STRIKES),
    revealed: z.record(z.string(), z.union([z.literal(0), z.literal(1)])),
    stage: z.enum(["play", "steal", "round-end", "finished"]),
    roundWinner: z.union([z.literal(0), z.literal(1), z.null()]),
    results: z
      .array(
        z.object({
          scores: z.tuple([z.number(), z.number()]),
          winner: z.union([z.literal(0), z.literal(1), z.null()]),
        }),
      )
      .max(MAX_ROUNDS),
  })
  .strict();
export type Snapshot = z.infer<typeof snapshotSchema>;
const sessionSchema = z
  .object({
    version: z.literal(1),
    teams: z.tuple([
      z.string().trim().min(1).max(32),
      z.string().trim().min(1).max(32),
    ]),
    packs: z.array(packSchema).min(1).max(MAX_ROUNDS),
    current: snapshotSchema,
    history: z.array(snapshotSchema).max(120),
  })
  .strict();
export type Session = z.infer<typeof sessionSchema>;
export type GameAction =
  | { type: "reveal"; answerId: string }
  | { type: "wrong" }
  | { type: "steal"; success: boolean }
  | { type: "award-bank"; team: TeamIndex }
  | { type: "select-team"; team: TeamIndex }
  | { type: "pass" }
  | { type: "end-round" }
  | { type: "next" }
  | { type: "undo" };

export function createSession(teams: [string, string], packs: Pack[]): Session {
  if (
    !packs.length ||
    packs.length > MAX_ROUNDS ||
    packs.some((p) => p.gameType !== packs[0].gameType)
  )
    throw new Error("Choose 1–10 packs of the same game.");
  if (new Set(packs.map((p) => p.id)).size !== packs.length)
    throw new Error("Choose a different pack for every round.");
  if (
    new Set(packs.map((p) => p.category.en.toLowerCase())).size !== packs.length
  )
    throw new Error("Choose a different topic for every round.");
  if (teams.some((t) => !t.trim() || t.trim().length > 32))
    throw new Error("Team names must be 1–32 characters.");
  return {
    version: 1,
    teams: teams.map((t) => t.trim()) as [string, string],
    packs,
    history: [],
    current: {
      round: 0,
      scores: [0, 0],
      activeTeam: 0,
      strikes: 0,
      revealed: {},
      stage: "play",
      roundWinner: null,
      results: [],
    },
  };
}

function finishRound(state: Snapshot, winner: TeamIndex | null): Snapshot {
  return {
    ...state,
    stage: "round-end",
    roundWinner: winner,
    results: [...state.results, { scores: [...state.scores], winner }],
  };
}
function awardBank(state: Snapshot, team: TeamIndex): Snapshot {
  const scores: [number, number] = [...state.scores];
  scores[team] += BANK_ROUND_POINTS;
  return finishRound({ ...state, scores }, team);
}

export function applyAction(session: Session, action: GameAction): Session {
  const s = session.current;
  const pack = session.packs[s.round];
  if (action.type === "undo") {
    const previous = session.history.at(-1);
    return previous
      ? { ...session, current: previous, history: session.history.slice(0, -1) }
      : session;
  }
  let next = s;
  if (action.type === "next" && s.stage === "round-end") {
    next =
      s.round + 1 === session.packs.length
        ? { ...s, stage: "finished" }
        : {
            ...s,
            round: s.round + 1,
            activeTeam: ((s.round + 1) % 2) as TeamIndex,
            strikes: 0,
            revealed: {},
            stage: "play",
            roundWinner: null,
          };
  }
  if (s.stage === "play") {
    if (
      action.type === "select-team" &&
      pack.gameType === "top-ten" &&
      action.team !== s.activeTeam
    )
      next = { ...s, activeTeam: action.team };
    if (action.type === "pass" && pack.gameType === "top-ten")
      next = { ...s, activeTeam: s.activeTeam === 0 ? 1 : 0 };
    if (action.type === "wrong" && pack.gameType === "bank") {
      const strikes = s.strikes + 1;
      next = {
        ...s,
        strikes,
        stage: strikes === BANK_STRIKES ? "steal" : "play",
      };
    }
    if (action.type === "award-bank" && pack.gameType === "bank")
      next = awardBank(s, action.team);
    if (action.type === "end-round" && pack.gameType === "top-ten")
      next = finishRound(s, null);
    if (
      action.type === "reveal" &&
      !Object.hasOwn(s.revealed, action.answerId)
    ) {
      const answer = pack.answers.find((a) => a.id === action.answerId);
      if (answer) {
        const revealed = { ...s.revealed, [answer.id]: s.activeTeam };
        if (pack.gameType === "bank") {
          next = { ...s, revealed };
          if (Object.keys(revealed).length === pack.answers.length)
            next = awardBank(next, s.activeTeam);
        } else {
          const ranked = pack.answers.find((a) => a.id === action.answerId)!;
          const scores: [number, number] = [...s.scores];
          scores[s.activeTeam] += TOP_TEN_RANK_POINTS[ranked.rank];
          next = {
            ...s,
            revealed,
            scores,
            activeTeam: s.activeTeam === 0 ? 1 : 0,
          };
          if (Object.keys(revealed).length === 10)
            next = finishRound(next, null);
        }
      }
    }
  }
  if (
    action.type === "steal" &&
    s.stage === "steal" &&
    pack.gameType === "bank"
  )
    next = awardBank(
      s,
      action.success ? (s.activeTeam === 0 ? 1 : 0) : s.activeTeam,
    );
  return next === s
    ? session
    : {
        ...session,
        current: next,
        history: [...session.history, s].slice(-120),
      };
}

export function restoreSession(value: unknown): Session | null {
  const parsed = sessionSchema.safeParse(value);
  if (!parsed.success) return null;
  const session = parsed.data;
  if (
    new Set(session.packs.map((p) => p.id)).size !== session.packs.length ||
    new Set(session.packs.map((p) => p.category.en.toLowerCase())).size !==
      session.packs.length ||
    session.packs.some((p) => p.gameType !== session.packs[0].gameType)
  )
    return null;
  for (const s of [session.current, ...session.history]) {
    const pack = session.packs[s.round];
    if (
      !pack ||
      Object.keys(s.revealed).some(
        (id) => !pack.answers.some((a) => a.id === id),
      )
    )
      return null;
    if (
      s.stage === "steal" &&
      (pack.gameType !== "bank" || s.strikes !== BANK_STRIKES)
    )
      return null;
    if (
      s.stage === "play" &&
      pack.gameType === "bank" &&
      s.strikes === BANK_STRIKES
    )
      return null;
    if (s.stage === "finished" && s.round !== session.packs.length - 1)
      return null;
    if (
      pack.gameType === "top-ten" &&
      (s.strikes !== 0 || s.roundWinner !== null)
    )
      return null;
    const expected =
      s.round + (s.stage === "round-end" || s.stage === "finished" ? 1 : 0);
    if (s.results.length !== expected) return null;
  }
  return session;
}
