import { useState } from "react";
import { Check, Eye, Plus, Search } from "lucide-react";
import type { GameType, Pack } from "../domain/content";
import { topics } from "../data/packs";
import { useLanguage } from "../localization/LanguageProvider";
import { TopicIcon } from "./TopicIcon";
import { Modal } from "./Modal";
import { PackPreview } from "./PackPreview";

export function PackPicker({
  packs,
  game,
  onPick,
  onCustom,
  used = [],
}: {
  packs: Pack[];
  game: GameType;
  onPick: (pack: Pack) => void;
  onCustom: (topic?: string) => void;
  used?: string[];
}) {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState("");
  const [all, setAll] = useState(false);
  const [preview, setPreview] = useState<Pack | null>(null);
  const match = (en: string, ar: string) =>
    `${en} ${ar}`.toLowerCase().includes(search.toLowerCase());
  const available = packs.filter(
    (p) => p.gameType === game && match(p.category.en, p.category.ar),
  );
  return (
    <div className="pack-picker">
      <div className="search-input">
        <Search size={20} />
        <input
          aria-label={t("searchTopics")}
          placeholder={t("searchTopics")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="picker-toolbar">
        <div className="tabs">
          <button aria-pressed={!all} onClick={() => setAll(false)}>
            {t("readyPacks")}
          </button>
          <button aria-pressed={all} onClick={() => setAll(true)}>
            {t("allTopics")}
          </button>
        </div>
        <button className="text-button" onClick={() => onCustom()}>
          <Plus size={18} />
          {t("custom")}
        </button>
      </div>
      {all ? (
        <div className="topic-cloud">
          {topics
            .filter((topic) => match(topic.en, topic.ar))
            .map((topic) => {
              const pack = packs.find(
                (p) => p.gameType === game && p.category.en === topic.en,
              );
              return (
                <button
                  key={topic.en}
                  onClick={() =>
                    pack && !used.includes(pack.category.en)
                      ? onPick(pack)
                      : onCustom(topic[lang])
                  }
                >
                  <TopicIcon category={topic.en} size={18} />
                  <span>{topic[lang]}</span>
                  <small>{pack ? t("available") : "+"}</small>
                </button>
              );
            })}
        </div>
      ) : (
        <div className="pack-grid">
          {available.map((pack) => {
            const selected = used.includes(pack.category.en);
            return (
              <article
                className={`topic-card ${selected ? "is-selected" : ""}`}
                key={pack.id}
              >
                <button
                  className="topic-select"
                  disabled={selected}
                  onClick={() => onPick(pack)}
                >
                  <span className="topic-symbol">
                    <TopicIcon category={pack.category.en} />
                  </span>
                  <strong>{pack.category[lang]}</strong>
                  <small>{pack.title[lang]}</small>
                  <span className="topic-type">
                    {selected ? (
                      <>
                        <Check size={14} />
                        {t("selected")}
                      </>
                    ) : (
                      t(pack.source.kind === "house" ? "house" : "factual")
                    )}
                  </span>
                </button>
                <button
                  className="preview-button"
                  onClick={() => setPreview(pack)}
                  aria-label={`${t("preview")}: ${pack.category[lang]}`}
                >
                  <Eye size={17} />
                </button>
              </article>
            );
          })}
        </div>
      )}
      {!all && !available.length && (
        <p className="empty-state">{t("noResults")}</p>
      )}
      {preview && (
        <Modal title={t("preview")} onClose={() => setPreview(null)}>
          <PackPreview pack={preview} />
        </Modal>
      )}
    </div>
  );
}
