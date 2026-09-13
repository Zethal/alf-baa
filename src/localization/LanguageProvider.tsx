import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "../domain/content";
import { readLocal, saveLocal } from "../lib/storage";
import { ar, en, type TranslationKey } from "./strings";

type I18n = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};
const Context = createContext<I18n | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() =>
    readLocal("language") === "ar" ? "ar" : "en",
  );
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    saveLocal("language", lang);
  }, [lang]);
  const t: I18n["t"] = (key, vars = {}) =>
    (lang === "ar" ? ar : en)[key].replace(
      /\{(\w+)\}/g,
      (match: string, key: string) => String(vars[key] ?? match),
    );
  return (
    <Context.Provider value={{ lang, setLang, t }}>{children}</Context.Provider>
  );
}
export function useLanguage(): I18n {
  const value = useContext(Context);
  if (!value) throw new Error("Missing language provider");
  return value;
}
