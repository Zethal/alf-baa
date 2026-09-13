import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { GameType, Pack } from "../domain/content";
import { useLanguage } from "../localization/LanguageProvider";
import { PackPicker } from "./PackPicker";
import { Modal } from "./Modal";
import { PackPreview } from "./PackPreview";

export function Library({
  packs,
  onPlay,
  onCustom,
  onDelete,
}: {
  packs: Pack[];
  onPlay: (pack: Pack) => void;
  onCustom: (game: GameType, topic?: string) => void;
  onDelete: (id: string) => void;
}) {
  const { lang, t } = useLanguage();
  const [game, setGame] = useState<GameType>("bank");
  const [preview, setPreview] = useState<Pack | null>(null);
  const [remove, setRemove] = useState(false);
  return (
    <div className="library-page page-enter">
      <div className="page-title">
        <span className="eyebrow">{t("packs")}</span>
        <h1>{t("libraryTitle")}</h1>
        <p>{t("libraryDesc")}</p>
      </div>
      <div className="library-toolbar">
        <div className="tabs game-tabs">
          <button
            aria-pressed={game === "bank"}
            onClick={() => setGame("bank")}
          >
            {t("bank")}
          </button>
          <button
            aria-pressed={game === "top-ten"}
            onClick={() => setGame("top-ten")}
          >
            {t("top-ten")}
          </button>
        </div>
        <span className="muted">
          {t("packCount", {
            count: packs.filter((p) => p.gameType === game).length,
          })}
        </span>
      </div>
      <PackPicker
        packs={packs}
        game={game}
        onPick={setPreview}
        onCustom={(topic) => onCustom(game, topic)}
      />
      <p className="device-note">{t("deviceOnly")}</p>
      {preview && (
        <Modal
          title={preview.category[lang]}
          onClose={() => {
            setPreview(null);
            setRemove(false);
          }}
        >
          <PackPreview pack={preview} />
          <div className="modal-actions">
            <button className="button primary" onClick={() => onPlay(preview)}>
              <Plus size={18} />
              {t("start")}
            </button>
            {preview.id.startsWith("custom-") && (
              <button
                className="button danger-outline"
                onClick={() => setRemove(true)}
              >
                <Trash2 size={18} />
                {t("deletePack")}
              </button>
            )}
          </div>
          {remove && (
            <div className="error-box">
              <p>{t("deleteConfirm")}</p>
              <button
                className="button danger"
                onClick={() => {
                  onDelete(preview.id);
                  setPreview(null);
                  setRemove(false);
                }}
              >
                {t("delete")}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
