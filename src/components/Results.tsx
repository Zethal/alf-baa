import { ArrowRight, Home, RotateCcw, Trophy, Undo2 } from "lucide-react";
import type { Session } from "../domain/engine";
import { useLanguage } from "../localization/LanguageProvider";
import { Scoreboard } from "./Scoreboard";
export function Results({
  session,
  onAgain,
  onHome,
  onUndo,
}: {
  session: Session;
  onAgain: () => void;
  onHome: () => void;
  onUndo: () => void;
}) {
  const { lang, t } = useLanguage();
  const scores = session.current.scores;
  const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;
  return (
    <div className="results-page page-enter">
      <div className="results-heading">
        <span className="trophy-mark">
          <Trophy size={42} strokeWidth={1.6} />
        </span>
        <span className="eyebrow">{t("gameFinished")}</span>
        <h1>
          {winner === null
            ? t("draw")
            : t("winner", { team: session.teams[winner] })}
        </h1>
        <p>{t("finalScore")}</p>
      </div>
      <Scoreboard session={session} />
      <div className="results-actions">
        <button className="button primary" onClick={onAgain}>
          <RotateCcw size={19} />
          {t("playAgain")}
          <ArrowRight size={19} className="directional" />
        </button>
        <button className="button secondary" onClick={onHome}>
          <Home size={19} />
          {t("home")}
        </button>
      </div>
      <section className="panel recap">
        <h2>{t("roundRecap")}</h2>
        {session.current.results.map((result, i) => {
          const previous = i ? session.current.results[i - 1].scores : [0, 0];
          return (
            <div key={i}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{session.packs[i].category[lang]}</strong>
              <span className="recap-score" dir="ltr">
                {result.scores[0] - previous[0]} <small>:</small>{" "}
                {result.scores[1] - previous[1]}
              </span>
            </div>
          );
        })}
      </section>
      <button
        className="text-button results-undo"
        onClick={onUndo}
        disabled={!session.history.length}
      >
        <Undo2 size={18} />
        {t("undo")}
      </button>
    </div>
  );
}
