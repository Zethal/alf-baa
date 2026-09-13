import { MAX_CUSTOM_PACKS, STORAGE_PREFIX } from "../domain/constants";
import { packSchema, type Pack } from "../domain/content";
import { restoreSession, type Session } from "../domain/engine";

export function readLocal(key: string): unknown {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function saveLocal(key: string, value: unknown): boolean {
  try {
    if (value === null) localStorage.removeItem(STORAGE_PREFIX + key);
    else localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function loadSession(): Session | null {
  return restoreSession(readLocal("session"));
}
export function loadCustomPacks(): Pack[] {
  const value = readLocal("packs");
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_CUSTOM_PACKS).flatMap((item) => {
    const parsed = packSchema.safeParse(item);
    return parsed.success && parsed.data.id.startsWith("custom-")
      ? [parsed.data]
      : [];
  });
}
