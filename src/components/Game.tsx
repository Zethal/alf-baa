import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Eye,
  EyeOff,
  Flag,
  Search,
  Shield,
  Undo2,
  X,
} from "lucide-react";
import { BANK_STRIKES } from "../domain/constants";
import { matchAnswer, type Answer } from "../domain/content";
import type { GameAction, Session } from "../domain/engine";
import { useLanguage } from "../localization/LanguageProvider";
import { Scoreboard } from "./Scoreboard";
import { Modal } from "./Modal";
import { PackPreview } from "./PackPreview";
import { TopicIcon } from "./TopicIcon";

export function Game({
  session,
  dispatch,
}: {
  session: Session;
  dispatch: (action: GameAction) => void;
}) {
  const { lang, t } = useLanguage();
  const [keyVisible, setKeyVisible] = useState(false);
  const [confirmKey, setConfirmKey] = useState(false);
  const [ending, setEnding] = useState(false);
  const [source, setSource] = useState(false);
  const [fullList, setFullList] = useState(false);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [feedback, setFeedback] = useState<"noMatch" | "alreadyFound" | null>(
    null,
  );
  const s = session.current;
  const pack = session.packs[s.round];
  const isBank = pack.gameType === "bank";
  const playing = s.stage === "play";
  const complete = s.stage === "round-end";
  const revealedCount = Object.keys(s.revealed).length;
  const answers =
    pack.gameType === "top-ten"
      ? [...pack.answers].sort((a, b) => a.rank - b.rank)
      : pack.answers;
  useEffect(() => {
    setKeyVisible(false);
    setInput("");
    setAnswer(null);
    setFeedback(null);
    setFullList(false);
  }, [s.round]);
  useEffect(() => {
    if (!playing) {
      setAnswer(null);
      setInput("");
      setKeyVisible(false);
    }
  }, [playing]);
  function award(id: string) {
    dispatch({ type: "reveal", answerId: id });
    setInput("");
    setAnswer(null);
    setFeedback(null);
    setKeyVisible(false);
  }
  function check() {
    const found = matchAnswer(pack, input);
    setAnswer(null);
    if (!found) {
      setFeedback("noMatch");
      return;
    }
    if (Object.hasOwn(s.revealed, found.id)) {
      setFeedback("alreadyFound");
      return;
    }
    setFeedback(null);
    setAnswer(found);
  }
  return (
    <div
      className={`game-page page-enter ${isBank ? "bank-game" : "top-game"}`}
    >
      <div className="game-meta">
        <span className={`badge mode-${pack.gameType}`}>
          {t(pack.gameType)}
        </span>
        <span>
          {t("savedRound", { round: s.round + 1, total: session.packs.length })}
        </span>
        <div className="round-progress" aria-hidden="true">
          {session.packs.map((p, i) => (
            <span key={p.id} className={i <= s.round ? "done" : ""} />
          ))}
        </div>
      </div>
      <Scoreboard
        session={session}
        onSelect={
          !isBank && playing
            ? (team) => dispatch({ type: "select-team", team })
            : undefined
        }
      />
      <section className="question-panel">
        <div className="question-eyebrow">
          <span>
            <TopicIcon category={pack.category.en} size={18} />
            {pack.category[lang]}
          </span>
          <button className="source-badge" onClick={() => setSource(true)}>
            {t(pack.source.kind === "house" ? "house" : "factual")}
            <CircleHelp size={15} />
          </button>
        </div>
        <h1>{pack.title[lang]}</h1>
        <div className="question-bottom">
          <span>
            {t("answersFound", {
              count: revealedCount,
              total: pack.answers.length,
            })}
          </span>
          {!isBank && <span>{t("ranking")}</span>}
        </div>
      </section>
      {s.stage === "steal" && (
        <section className="steal-banner" role="status">
          <Shield size={28} />
          <div>
            <h2>{t("stealTime")}</h2>
            <p>
              {t("stealDesc", {
                team: session.teams[s.activeTeam === 0 ? 1 : 0],
              })}
            </p>
          </div>
          <div className="steal-actions">
            <button
              className="button success"
              onClick={() => dispatch({ type: "steal", success: true })}
            >
              <Check size={20} />
              {t("stealSuccess")}
            </button>
            <button
              className="button secondary"
              onClick={() => dispatch({ type: "steal", success: false })}
            >
              <X size={20} />
              {t("stealFailed")}
            </button>
          </div>
        </section>
      )}
      {complete && (
        <section className="round-summary" role="status">
          <span className="summary-icon">
            <Check size={26} />
          </span>
          <div>
            <small>{t("roundComplete")}</small>
            <h2>
              {isBank && s.roundWinner !== null
                ? t("roundWon", { team: session.teams[s.roundWinner] })
                : t("roundComplete")}
            </h2>
            <p>
              {isBank
                ? t("roundPoint")
                : t("answersFound", { count: revealedCount, total: 10 })}
            </p>
            {session.packs[s.round + 1] && (
              <small>
                {t("nextTopic")}: {session.packs[s.round + 1].category[lang]}
              </small>
            )}
          </div>
          <button
            className="button primary"
            onClick={() => dispatch({ type: "next" })}
          >
            {t(s.round + 1 === session.packs.length ? "finish" : "next")}
            <ArrowRight size={19} className="directional" />
          </button>
        </section>
      )}
      {playing && (
        <div className="turn-row">
          <span className={`turn-label team-${s.activeTeam}`}>
            <span className="team-marker">{s.activeTeam + 1}</span>
            {t("currentTurn", { team: session.teams[s.activeTeam] })}
          </span>
          {isBank && (
            <div
              className="strikes"
              aria-label={`${t("strikes")}: ${s.strikes} / ${BANK_STRIKES}`}
            >
              <span>{t("strikes")}</span>
              {Array.from({ length: BANK_STRIKES }, (_, i) => (
                <span
                  key={i}
                  className={`strike ${i < s.strikes ? "used" : ""}`}
                  aria-hidden="true"
                >
                  <X size={21} />
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        className={`answer-board ${isBank ? "bank-board" : "top-board"}`}
        aria-label={t("hostKey")}
      >
        {answers.map((item, i) => {
          const revealed = Object.hasOwn(s.revealed, item.id);
          return (
            <div
              key={item.id}
              className={`answer-tile ${revealed ? "revealed" : ""} ${revealed ? `team-${s.revealed[item.id]}` : ""}`}
            >
              <span className="answer-rank">{i + 1}</span>
              <span className="answer-label">
                {revealed ? (
                  item.label[lang]
                ) : (
                  <span className="hidden-answer" aria-label="?">
                    •••
                  </span>
                )}
              </span>
              {revealed ? (
                <Check size={19} />
              ) : !isBank ? (
                <span className="answer-points">
                  {i + 1}
                  <small>{t("points")}</small>
                </span>
              ) : (
                <span className="empty-dot" />
              )}
            </div>
          );
        })}
      </div>
      {playing && (
        <section className="host-controls">
          <form
            className="answer-form"
            onSubmit={(e) => {
              e.preventDefault();
              check();
            }}
          >
            <label htmlFor="spoken-answer">{t("answerInput")}</label>
            <div className="answer-input-row">
              <div className="search-input">
                <Search size={20} />
                <input
                  id="spoken-answer"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setFeedback(null);
                    setAnswer(null);
                  }}
                  placeholder={t("answerPlaceholder")}
                  maxLength={200}
                  autoComplete="off"
                  dir="auto"
                />
              </div>
              <button className="button primary" disabled={!input.trim()}>
                {t("checkAnswer")}
              </button>
            </div>
          </form>
          {feedback && (
            <p role="status" className="notice">
              {t(feedback)}
            </p>
          )}
          {answer && (
            <div className="match-result">
              <span>
                <small>{t("answerMatched")}</small>
                <strong>{answer.label[lang]}</strong>
              </span>
              <button
                className="button success"
                onClick={() => award(answer.id)}
              >
                <Check size={18} />
                {t("reveal")}
              </button>
            </div>
          )}
          <div className="host-buttons">
            <button
              className="button danger-outline"
              onClick={() => {
                dispatch({ type: isBank ? "wrong" : "pass" });
                setInput("");
                setAnswer(null);
                setFeedback(null);
              }}
            >
              <X size={20} />
              {t(isBank ? "wrong" : "pass")}
            </button>
            <button
              className="button secondary"
              onClick={() =>
                keyVisible ? setKeyVisible(false) : setConfirmKey(true)
              }
            >
              {keyVisible ? <EyeOff size={19} /> : <Eye size={19} />}{" "}
              {t(keyVisible ? "hideKey" : "showKey")}
            </button>
          </div>
          {keyVisible && (
            <div className="host-key">
              <div className="notice">{t("keyWarning")}</div>
              {answers.map((item, i) => (
                <button
                  key={item.id}
                  disabled={Object.hasOwn(s.revealed, item.id)}
                  onClick={() => award(item.id)}
                >
                  <span>
                    {i + 1}. {item.label[lang]}
                  </span>
                  <span>
                    {Object.hasOwn(s.revealed, item.id)
                      ? t("found")
                      : t("reveal")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      <div className="game-utility">
        <button
          className="text-button"
          disabled={!session.history.length}
          onClick={() => {
            dispatch({ type: "undo" });
            setAnswer(null);
            setFeedback(null);
          }}
        >
          <Undo2 size={18} />
          {t("undo")}
        </button>
        {playing && (
          <button className="text-button" onClick={() => setEnding(true)}>
            <Flag size={17} />
            {t("endRound")}
          </button>
        )}
        {complete && (
          <button className="text-button" onClick={() => setFullList(true)}>
            <Eye size={18} />
            {t("viewAnswers")}
          </button>
        )}
      </div>
      {confirmKey && (
        <Modal title={t("hostKey")} onClose={() => setConfirmKey(false)}>
          <p>{t("keyWarning")}</p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setConfirmKey(false)}
            >
              {t("cancel")}
            </button>
            <button
              className="button primary"
              onClick={() => {
                setConfirmKey(false);
                setKeyVisible(true);
              }}
            >
              {t("showKey")}
            </button>
          </div>
        </Modal>
      )}
      {ending && (
        <Modal title={t("endRoundTitle")} onClose={() => setEnding(false)}>
          <p>{t(isBank ? "bankEndDesc" : "topEndDesc")}</p>
          <div className="modal-actions">
            {isBank ? (
              ([0, 1] as const).map((team) => (
                <button
                  className={`button team-action-${team}`}
                  key={team}
                  onClick={() => {
                    dispatch({ type: "award-bank", team });
                    setEnding(false);
                  }}
                >
                  {t("awardTo", { team: session.teams[team] })}
                </button>
              ))
            ) : (
              <button
                className="button primary"
                onClick={() => {
                  dispatch({ type: "end-round" });
                  setEnding(false);
                }}
              >
                {t("endRound")}
              </button>
            )}
            <button
              className="button secondary"
              onClick={() => setEnding(false)}
            >
              {t("cancel")}
            </button>
          </div>
        </Modal>
      )}
      {(source || fullList) && (
        <Modal
          title={t(source ? "source" : "viewAnswers")}
          onClose={() => {
            setSource(false);
            setFullList(false);
          }}
        >
          {fullList ? (
            <PackPreview pack={pack} />
          ) : (
            <>
              <p>{pack.source.context[lang]}</p>
              <p>
                {t("checked")}: <bdi>{pack.source.checked}</bdi>
              </p>
              {pack.source.url && (
                <a href={pack.source.url} target="_blank" rel="noreferrer">
                  {t("source")}
                </a>
              )}
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
