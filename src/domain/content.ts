import { z } from "zod";
import { MAX_IMPORT_BYTES } from "./constants";

export type Language = "en" | "ar";
export type GameType = "bank" | "top-ten";
export type TeamIndex = 0 | 1;
const text = z.string().trim().min(1).max(600);
export const bilingualSchema = z.object({ en: text, ar: text }).strict();
export type Bilingual = z.infer<typeof bilingualSchema>;
const id = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/);
const answerSchema = z
  .object({
    id,
    label: bilingualSchema,
    aliases: z
      .object({ en: z.array(text).max(12), ar: z.array(text).max(12) })
      .strict()
      .optional(),
  })
  .strict();
const sourceSchema = z
  .object({
    kind: z.enum(["factual", "house"]),
    context: bilingualSchema,
    url: z
      .string()
      .url()
      .max(1000)
      .refine((value) => /^https?:\/\//.test(value))
      .optional(),
    checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();
const common = {
  schemaVersion: z.literal(1),
  id,
  category: bilingualSchema,
  title: bilingualSchema,
  difficulty: z.enum(["easy", "medium", "hard"]),
  source: sourceSchema,
};
export const packSchema = z
  .discriminatedUnion("gameType", [
    z
      .object({
        ...common,
        gameType: z.literal("bank"),
        answers: z.array(answerSchema).min(3).max(40),
      })
      .strict(),
    z
      .object({
        ...common,
        gameType: z.literal("top-ten"),
        answers: z
          .array(answerSchema.extend({ rank: z.number().int().min(1).max(10) }))
          .length(10),
      })
      .strict(),
  ])
  .superRefine((pack, ctx) => {
    const unique = (values: string[], message: string) => {
      if (new Set(values).size !== values.length)
        ctx.addIssue({ code: "custom", message, path: ["answers"] });
    };
    unique(
      pack.answers.map((a) => a.id),
      "Answer IDs must be unique.",
    );
    for (const lang of ["en", "ar"] as const) {
      const lookup = new Map<string, string>();
      for (const answer of pack.answers) {
        for (const name of [
          answer.label[lang],
          ...(answer.aliases?.[lang] ?? []),
        ]) {
          const key = normalizeAnswer(name);
          if (!key)
            ctx.addIssue({
              code: "custom",
              message: "Answers must contain letters or numbers.",
              path: ["answers"],
            });
          if (lookup.has(key) && lookup.get(key) !== answer.id)
            ctx.addIssue({
              code: "custom",
              message: `Duplicate or ambiguous ${lang} answer: ${name}`,
              path: ["answers"],
            });
          lookup.set(key, answer.id);
        }
      }
    }
    if (pack.gameType === "top-ten")
      unique(
        pack.answers.map((a) => String(a.rank)),
        "Ranks must contain 1 through 10 exactly once.",
      );
    if (pack.source.kind === "factual" && !pack.source.url)
      ctx.addIssue({
        code: "custom",
        message: "Factual packs need an HTTP(S) source URL.",
        path: ["source", "url"],
      });
  });
export type Pack = z.infer<typeof packSchema>;
export type Answer = Pack["answers"][number];

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchAnswer(pack: Pack, value: string): Answer | undefined {
  const key = normalizeAnswer(value);
  if (!key) return undefined;
  const matches = pack.answers.filter((a) =>
    [
      a.label.en,
      a.label.ar,
      ...(a.aliases?.en ?? []),
      ...(a.aliases?.ar ?? []),
    ].some((name) => normalizeAnswer(name) === key),
  );
  return matches.length === 1 ? matches[0] : undefined;
}

export type ImportResult =
  { ok: true; pack: Pack } | { ok: false; errors: string[] };
export function parsePack(raw: string): ImportResult {
  if (new TextEncoder().encode(raw).length > MAX_IMPORT_BYTES)
    return {
      ok: false,
      errors: ["This file is too large. The limit is 150 KB."],
    };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      errors: [
        "Paste a JSON object only, without Markdown fences or extra text.",
      ],
    };
  }
  const result = packSchema.safeParse(value);
  return result.success
    ? { ok: true, pack: result.data }
    : {
        ok: false,
        errors: result.error.issues
          .map((i) => `${i.path.join(".") || "pack"}: ${i.message}`)
          .slice(0, 8),
      };
}
