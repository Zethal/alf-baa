import { test, expect, type Page } from "@playwright/test";
import { bundledPacks } from "../src/data/packs";

test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("/");
});
const score = (page: Page, team: number) =>
  page.locator(".score-number").nth(team);
async function start(page: Page, mode: "Bank" | "Top Ten", rounds = "1") {
  await page.getByRole("button", { name: new RegExp(`Play ${mode}$`) }).click();
  await page.getByLabel("Number of rounds").selectOption(rounds);
  await page.getByRole("button", { name: "Start game", exact: true }).click();
}
test("Bank: correct, three strikes, steal, undo, alternate starters, finish and replay", async ({
  page,
}) => {
  await start(page, "Bank", "3");
  await page.getByLabel("Check a spoken answer").fill("Mercury");
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm answer", exact: true })
    .click();
  await expect(page.locator(".answer-tile.revealed")).toHaveCount(1);
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "Wrong answer", exact: true })
      .click();
  await expect(
    page.getByRole("heading", { name: "Time to steal." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Steal successful", exact: true })
    .click();
  await expect(score(page, 1)).toContainText("1");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(score(page, 1)).toContainText("0");
  await page.getByRole("button", { name: "Steal failed", exact: true }).click();
  await expect(score(page, 0)).toContainText("1");
  await page.getByRole("button", { name: "Next round", exact: true }).click();
  await expect(page.locator(".turn-label")).toContainText("Team 2");
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "End round", exact: true }).click();
    await page
      .getByRole("button", { name: "Award to Team 1", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: i ? "Final scores" : "Next round",
        exact: true,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Team 1 wins!" }),
  ).toBeVisible();
  await expect(score(page, 0)).toContainText("3");
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(page.getByLabel("Number of rounds")).toHaveValue("3");
});
test("Top Ten: 1–10 scoring, duplicate guard, pass and total 55", async ({
  page,
}) => {
  await start(page, "Top Ten");
  const top = bundledPacks.find((p) => p.id === "top-science")!;
  for (const index of [0, 9, 1, 2, 3, 4, 5, 6, 7, 8]) {
    await page
      .getByLabel("Check a spoken answer")
      .fill(top.answers[index].label.en);
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm answer", exact: true })
      .click();
    if (index === 0) {
      await expect(score(page, 0)).toContainText("1");
      await page.getByLabel("Check a spoken answer").fill("Hydrogen");
      await page
        .getByRole("button", { name: "Check answer", exact: true })
        .click();
      await expect(
        page.getByText("This answer has already been found.", { exact: true }),
      ).toBeVisible();
    }
    if (index === 9) await expect(score(page, 1)).toContainText("10");
  }
  const values = await page.locator(".score-number").allTextContents();
  expect(values.reduce((a, v) => a + parseInt(v), 0)).toBe(55);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".answer-tile.revealed")).toHaveCount(9);
  await page.getByRole("button", { name: "Wrong / pass", exact: true }).click();
  await page.getByRole("button", { name: "End round", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "End round", exact: true })
    .click();
  await page.getByRole("button", { name: "Final scores", exact: true }).click();
  await expect(page.getByText("That’s a wrap.", { exact: true })).toBeVisible();
});
test("resume retains progress and undo after refresh; navigation asks before leaving", async ({
  page,
}) => {
  await start(page, "Bank");
  await page.getByRole("button", { name: "Wrong answer", exact: true }).click();
  await page.reload();
  await page.locator(".resume-banner").click();
  await expect(page.locator(".strikes")).toHaveAttribute(
    "aria-label",
    "Strikes: 1 / 3",
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".strikes")).toHaveAttribute(
    "aria-label",
    "Strikes: 0 / 3",
  );
  await page.goBack();
  await expect(page.getByRole("dialog")).toContainText("Take a break?");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".game-page")).toBeVisible();
});
test("custom JSON: reject malformed data, review, import, export, play and delete", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Explore topics", exact: true })
    .click();
  await page.getByRole("button", { name: "Custom topic", exact: true }).click();
  await page.getByLabel("What is your topic?").fill("Solar system");
  await expect(
    page.getByRole("button", { name: "Copy request", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Your pack JSON").fill("{ nope }");
  await page
    .getByRole("button", { name: "Check & preview", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "This pack needs a few fixes.",
  );
  const pack = structuredClone(bundledPacks[0]);
  pack.id = "custom-solar-demo";
  pack.category = { en: "Solar demo", ar: "تجربة فضائية" };
  await page.getByLabel("Your pack JSON").fill(JSON.stringify(pack));
  await page
    .getByRole("button", { name: "Check & preview", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add to my topics", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("I have reviewed the answers, Arabic wording and sources.")
    .check();
  await page
    .getByRole("button", { name: "Add to my topics", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Your pack is ready to play.",
  );
  await page.locator(".topic-select").filter({ hasText: "Solar demo" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("custom-solar-demo.json");
  await page.getByRole("button", { name: "Delete pack", exact: true }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.locator(".topic-select").filter({ hasText: "Solar demo" }),
  ).toHaveCount(0);
});
test("Arabic game, all requested sizes and zoom layouts have no horizontal overflow", async ({
  page,
}) => {
  for (const lang of ["en", "ar"]) {
    await page
      .getByRole("button", {
        name: lang === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute(
      "dir",
      lang === "ar" ? "rtl" : "ltr",
    );
    for (const width of [320, 375, 390, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${lang} home ${width}`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/home-ar-mobile.png",
    fullPage: true,
  });
  await page.locator(".top-card").click();
  await page.getByLabel("عدد الجولات").selectOption("5");
  await expect(page.locator(".lineup-row")).toHaveCount(5);
  await page.getByLabel("عدد الجولات").selectOption("1");
  await page.getByRole("button", { name: "ابدأ اللعبة", exact: true }).click();
  await page.getByLabel("تحقق من إجابة مسموعة").fill("الهيدروجين");
  await page.getByRole("button", { name: "تحقق", exact: true }).click();
  await page
    .getByRole("button", { name: "تأكيد الإجابة", exact: true })
    .click();
  await expect(page.locator(".answer-tile.revealed")).toContainText(
    "الهيدروجين",
  );
  for (const width of [320, 375, 390, 430, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Arabic game ${width}`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/game-ar-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".answer-tile.revealed")).toContainText("Hydrogen");
  await page.evaluate(() => (document.documentElement.style.fontSize = "32px"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "200% font size",
  ).toBe(true);
});
test("host key is gated, hides on reveal and traps keyboard focus inside its dialog", async ({
  page,
}) => {
  await start(page, "Bank");
  await page
    .getByRole("button", { name: "Show answer key", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let i = 0; i < 7; i++) await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => document.activeElement?.closest("dialog") !== null,
    ),
  ).toBe(true);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Show answer key", exact: true })
    .click();
  await expect(page.locator(".host-key")).toBeVisible();
  await page.locator(".host-key>button").first().click();
  await expect(page.locator(".host-key")).toHaveCount(0);
  await expect(page.locator(".answer-tile.revealed")).toHaveCount(1);
});
