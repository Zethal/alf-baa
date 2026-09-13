import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("WCAG checks for home, setup, play, library and custom import in both languages", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", (d) => d.accept());
  for (const lang of ["en", "ar"]) {
    await page.goto("/");
    await page
      .getByRole("button", {
        name: lang === "ar" ? "العربية" : "English",
        exact: true,
      })
      .click();
    async function scan(name: string) {
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        `${lang}: ${name}`,
      ).toEqual([]);
    }
    await scan("home");
    await page.locator(".bank-card").click();
    await scan("setup");
    await page
      .getByRole("button", {
        name: lang === "ar" ? "ابدأ اللعبة" : "Start game",
        exact: true,
      })
      .click();
    if (await page.getByRole("dialog").isVisible())
      await page
        .getByRole("button", {
          name: lang === "ar" ? "ابدأ لعبة جديدة" : "Start new game",
          exact: true,
        })
        .click();
    await scan("game");
    await page.goto("/");
    await page
      .getByRole("button", {
        name: lang === "ar" ? "تصفّح المواضيع" : "Explore topics",
        exact: true,
      })
      .click();
    await scan("library");
    await page
      .getByRole("button", {
        name: lang === "ar" ? "موضوع مخصص" : "Custom topic",
        exact: true,
      })
      .click();
    await scan("custom");
  }
  expect(errors).toEqual([]);
});
