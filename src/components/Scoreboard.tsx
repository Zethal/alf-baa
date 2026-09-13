import type { Session } from "../domain/engine";
import type { TeamIndex } from "../domain/content";
import { useLanguage } from "../localization/LanguageProvider";

export function Scoreboard({
  session,
  onSelect,
}: {
  session: Session;
  onSelect?: (team: TeamIndex) => void;
}) {
  const { t } = useLanguage();
  const s = session.current;
  return (
    <div className="scoreboard">
      <span className="sr-only" role="status" aria-live="polite">
        {t("scoreAnnounce", {
          first: session.teams[0],
          a: s.scores[0],
          second: session.teams[1],
          b: s.scores[1],
        })}
      </span>
      {([0, 1] as const).map((team) => {
        const content = (
          <>
            <span className="team-name">
              <span className="team-marker">{team + 1}</span>
              <bdi>{session.teams[team]}</bdi>
            </span>
            <span className="score-number">
              {s.scores[team]}
              <small>{t("points")}</small>
            </span>
          </>
        );
        const classes = `score-card team-${team} ${s.activeTeam === team && s.stage === "play" ? "active-team" : ""}`;
        return onSelect ? (
          <button
            key={team}
            className={classes}
            onClick={() => onSelect(team)}
            aria-label={t("selectTeam", { team: session.teams[team] })}
            aria-pressed={s.activeTeam === team}
          >
            {content}
          </button>
        ) : (
          <div key={team} className={classes}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
