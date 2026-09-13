import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Landmark,
  ListOrdered,
  Smartphone,
  Users,
  Sparkles,
  Play,
} from "lucide-react";
import type { GameType } from "../domain/content";
import type { Session } from "../domain/engine";
import { useLanguage } from "../localization/LanguageProvider";

export function Home({
  onPlay,
  onLibrary,
  onRules,
  saved,
  onResume,
}: {
  onPlay: (game: GameType) => void;
  onLibrary: () => void;
  onRules: () => void;
  saved: Session | null;
  onResume: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="home-page page-enter">
      <section className="home-intro">
        <div>
          <div className="eyebrow">ALF BAA · ألف باء</div>
          <h1>{t("welcome")}</h1>
          <p>{t("pick")}</p>
        </div>
        <button className="text-button" onClick={onRules}>
          <BookOpen size={19} />
          {t("how")}
        </button>
      </section>
      {saved && saved.current.stage !== "finished" && (
        <button className="resume-banner" onClick={onResume}>
          <span className="resume-icon">
            <Play size={21} fill="currentColor" />
          </span>
          <span>
            <strong>{t("resume")}</strong>
            <small>
              {t(saved.packs[0].gameType)} ·{" "}
              {t("savedRound", {
                round: saved.current.round + 1,
                total: saved.packs.length,
              })}
            </small>
          </span>
          <ArrowRight className="directional" size={22} />
        </button>
      )}
      <section className="game-cards" aria-label={t("pick")}>
        <button className="game-card bank-card" onClick={() => onPlay("bank")}>
          <span className="card-top">
            <span className="game-number">01 /</span>
            <span className="card-icon">
              <Landmark size={36} strokeWidth={1.7} />
            </span>
          </span>
          <span className="game-card-title">{t("bank")}</span>
          <span className="game-card-desc">{t("bankDesc")}</span>
          <span className="card-rule">
            <span className="strike-mini" aria-hidden="true">
              × × ×
            </span>
            {t("bankRule")}
          </span>
          <span className="game-card-bottom">
            <span>{t("playBank")}</span>
            <span className="round-arrow">
              <ArrowUpRight size={25} className="directional" />
            </span>
          </span>
        </button>
        <button
          className="game-card top-card"
          onClick={() => onPlay("top-ten")}
        >
          <span className="card-top">
            <span className="game-number">02 /</span>
            <span className="card-icon">
              <ListOrdered size={36} strokeWidth={1.7} />
            </span>
          </span>
          <span className="game-card-title">{t("top-ten")}</span>
          <span className="game-card-desc">{t("topDesc")}</span>
          <span className="card-rule">
            <span className="rank-mini" aria-hidden="true">
              #10
            </span>
            {t("topRule")}
          </span>
          <span className="game-card-bottom">
            <span>{t("playTop")}</span>
            <span className="round-arrow">
              <ArrowUpRight size={25} className="directional" />
            </span>
          </span>
        </button>
      </section>
      <section className="home-bottom">
        <div className="library-callout">
          <span className="library-symbol">
            <Sparkles size={26} />
          </span>
          <div>
            <h2>{t("packs")}</h2>
            <p>{t("packsDesc")}</p>
          </div>
          <button className="text-button" onClick={onLibrary}>
            {t("browse")}
            <ArrowRight size={18} className="directional" />
          </button>
        </div>
        <div className="home-details">
          <span>
            <Smartphone size={17} />
            {t("onePhone")}
          </span>
          <span>
            <Users size={18} />
            {t("twoTeams")}
          </span>
          <span>
            <Play size={17} />
            {t("noAccount")}
          </span>
        </div>
      </section>
      <p className="home-tagline">{t("tagline")}</p>
    </div>
  );
}
