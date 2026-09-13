import { Download, ExternalLink } from "lucide-react";
import type { Pack } from "../domain/content";
import { useLanguage } from "../localization/LanguageProvider";

export function exportPack(pack: Pack) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${pack.id}.json`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function PackPreview({
  pack,
  allowExport = true,
}: {
  pack: Pack;
  allowExport?: boolean;
}) {
  const { lang, t } = useLanguage();
  const answers =
    pack.gameType === "top-ten"
      ? [...pack.answers].sort((a, b) => a.rank - b.rank)
      : pack.answers;
  return (
    <div className="pack-preview">
      <span className={`badge ${pack.source.kind}`}>
        {t(pack.source.kind === "house" ? "house" : "factual")}
      </span>
      <h3>{pack.title[lang]}</h3>
      <p className="muted">{pack.source.context[lang]}</p>
      <ol className="preview-answers">
        {answers.map((answer, i) => (
          <li key={answer.id}>
            <span>{i + 1}</span>
            <span>{answer.label[lang]}</span>
            {pack.gameType === "top-ten" && (
              <small>
                {i + 1} {t("points")}
              </small>
            )}
          </li>
        ))}
      </ol>
      <div className="source-line">
        <span>
          {t("checked")}: <bdi>{pack.source.checked}</bdi>
        </span>
        {pack.source.url && (
          <a href={pack.source.url} target="_blank" rel="noreferrer">
            {t("source")} <ExternalLink size={14} />
          </a>
        )}
      </div>
      {allowExport && (
        <button className="button secondary" onClick={() => exportPack(pack)}>
          <Download size={18} />
          {t("download")}
        </button>
      )}
    </div>
  );
}
