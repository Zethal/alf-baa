export const DEFAULT_ROUNDS = 3;
export const MAX_ROUNDS = 10;
export const BANK_STRIKES = 3;
export const BANK_ROUND_POINTS = 1;
export const TOP_TEN_RANK_POINTS: Readonly<Record<number, number>> =
  Object.freeze(
    Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i + 1, i + 1])),
  );
export const TOP_TEN_TOTAL = 55;
export const MAX_IMPORT_BYTES = 150_000;
export const MAX_CUSTOM_PACKS = 40;
export const STORAGE_PREFIX = "alfbaa:v1:";
