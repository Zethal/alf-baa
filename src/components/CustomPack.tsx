import { useMemo, useState } from "react";
import { Check, Clipboard, FileJson, Plus, Sparkles } from "lucide-react";
import { MAX_IMPORT_BYTES } from "../domain/constants";
import type { GameType, Pack } from "../domain/content";
import { manualProvider } from "../domain/provider";
import { useLanguage } from "../localization/LanguageProvider";
import { PackPreview } from "./PackPreview";

export function CustomPack({
  initialTopic,
  initialGame,
  onAdd,
}: {
  initialTopic: string;
  initialGame: GameType;
  onAdd: (pack: Pack) => string | null;
}) {
  const { lang, t } = useLanguage();
  const [topic, setTopic] = useState(initialTopic);
  const [game, setGame] = useState(initialGame);
  const [raw, setRaw] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"ready" | "copied" | "failed">(
    "ready",
  );
  const [candidate, setCandidate] = useState<Pack | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const prompt = useMemo(
    () => manualProvider.generationRequest(topic, game, lang),
    [topic, game, lang],
  );
  function validate() {
    const result = manualProvider.validateGeneratedContent(raw);
    setReviewed(false);
    if (result.ok) {
      setCandidate(result.pack);
      setErrors([]);
    } else {
      setCandidate(null);
      setErrors(result.errors);
    }
  }
  async function loadFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setErrors([
        lang === "ar"
          ? "الحد الأقصى لحجم الملف 150 كيلوبايت."
          : "The file limit is 150 KB.",
      ]);
      return;
    }
    try {
      setRaw(await file.text());
      setCandidate(null);
      setErrors([]);
    } catch {
      setErrors([
        lang === "ar" ? "تعذّرت قراءة الملف." : "Could not read this file.",
      ]);
    }
  }
  return (
    <div className="custom-page page-enter">
      <div className="page-title">
        <span className="badge">
          <Sparkles size={14} />
          {t("custom")}
        </span>
        <h1>{t("customTitle")}</h1>
        <p>{t("customDesc")}</p>
      </div>
      <div className="custom-layout">
        <section className="panel">
          <h2>{t("step1")}</h2>
          <p className="muted">{t("step1Desc")}</p>
          <label className="field">
            <span>{t("topicLabel")}</span>
            <input
              maxLength={120}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setCopyState("ready");
              }}
              placeholder={t("topicPlaceholder")}
            />
          </label>
          <label className="field">
            <span>{t("gameLabel")}</span>
            <select
              value={game}
              onChange={(e) => {
                setGame(e.target.value as GameType);
                setCopyState("ready");
              }}
            >
              <option value="bank">{t("bank")}</option>
              <option value="top-ten">{t("top-ten")}</option>
            </select>
          </label>
          <button
            className="button primary full"
            disabled={!topic.trim()}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                setCopyState("copied");
              } catch {
                setCopyState("failed");
              }
            }}
          >
            {copyState === "copied" ? (
              <Check size={18} />
            ) : (
              <Clipboard size={18} />
            )}{" "}
            {t(copyState === "copied" ? "copied" : "copyPrompt")}
          </button>
          {copyState === "failed" && <p role="status">{t("copyFailed")}</p>}
          <textarea
            className="prompt-preview"
            aria-label={t("copyPrompt")}
            dir="ltr"
            readOnly
            value={prompt}
          />
        </section>
        <section className="panel">
          <h2>{t("step2")}</h2>
          <p className="muted">{t("step2Desc")}</p>
          <label className="file-input">
            <FileJson size={19} />
            {t("fileLabel")}
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => void loadFile(e.target.files?.[0])}
            />
          </label>
          <label className="field">
            <span>{t("jsonLabel")}</span>
            <textarea
              dir="ltr"
              spellCheck={false}
              value={raw}
              maxLength={MAX_IMPORT_BYTES}
              placeholder={
                '{\n  "schemaVersion": 1,\n  "gameType": "' +
                game +
                '",\n  …\n}'
              }
              onChange={(e) => {
                setRaw(e.target.value);
                setCandidate(null);
                setErrors([]);
              }}
            />
          </label>
          <button
            className="button primary full"
            disabled={!raw.trim()}
            onClick={validate}
          >
            <Check size={18} />
            {t("validate")}
          </button>
          {errors.length > 0 && (
            <div className="error-box" role="alert">
              <strong>{t("invalidPack")}</strong>
              <ul>
                {errors.map((e, i) => (
                  <li key={i} dir="auto">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
      {candidate && (
        <section className="panel review-panel">
          <h2>{t("review")}</h2>
          <PackPreview pack={candidate} allowExport={false} />
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            <span>{t("reviewConfirm")}</span>
          </label>
          <button
            className="button primary"
            disabled={!reviewed}
            onClick={() => {
              const error = onAdd(candidate);
              if (error) setErrors([error]);
            }}
          >
            <Plus size={18} />
            {t("addPack")}
          </button>
        </section>
      )}
      <p className="device-note">{t("deviceOnly")}</p>
    </div>
  );
}
