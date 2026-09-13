import { useState } from "react";
import { ArrowRight, Check, Pencil, Plus, Users, X } from "lucide-react";
import { DEFAULT_ROUNDS, MAX_ROUNDS } from "../domain/constants";
import type { GameType, Pack } from "../domain/content";
import { useLanguage } from "../localization/LanguageProvider";
import { Modal } from "./Modal";
import { PackPicker } from "./PackPicker";
import { TopicIcon } from "./TopicIcon";

export type SetupState = {
  game: GameType;
  rounds: number;
  teams: [string, string];
  ids: (string | null)[];
};
export function defaultSetup(game: GameType, packs: Pack[]): SetupState {
  return {
    game,
    rounds: DEFAULT_ROUNDS,
    teams: ["", ""],
    ids: packs
      .filter((p) => p.gameType === game)
      .slice(0, DEFAULT_ROUNDS)
      .map((p) => p.id),
  };
}

export function Setup({
  setup,
  setSetup,
  packs,
  onStart,
  onCustom,
}: {
  setup: SetupState;
  setSetup: (value: SetupState) => void;
  packs: Pack[];
  onStart: () => void;
  onCustom: (topic?: string) => void;
}) {
  const { lang, t } = useLanguage();
  const [slot, setSlot] = useState<number | null>(null);
  const chosen = setup.ids.map((id) => packs.find((p) => p.id === id));
  const count = chosen.filter(Boolean).length;
  const ready = count === setup.rounds;
  return (
    <div className="setup-page page-enter">
      <div className="page-title">
        <span className={`badge mode-${setup.game}`}>{t(setup.game)}</span>
        <h1>{t("setupTitle")}</h1>
        <p>{t("setupDesc")}</p>
      </div>
      <div className="setup-layout">
        <section className="panel team-panel">
          <div className="section-heading">
            <span className="step-number">01</span>
            <h2>{t("yourTeams")}</h2>
            <Users size={21} />
          </div>
          {([0, 1] as const).map((team) => (
            <label className={`team-input team-${team}`} key={team}>
              <span>{t(team === 0 ? "team1" : "team2")}</span>
              <input
                dir="auto"
                maxLength={32}
                value={setup.teams[team]}
                placeholder={t(team === 0 ? "team1" : "team2")}
                onChange={(e) => {
                  const teams: [string, string] = [...setup.teams];
                  teams[team] = e.target.value;
                  setSetup({ ...setup, teams });
                }}
              />
            </label>
          ))}
          <div className="rounds-control">
            <label htmlFor="round-count">{t("chooseRounds")}</label>
            <select
              id="round-count"
              value={setup.rounds}
              onChange={(e) => {
                const rounds = Number(e.target.value);
                setSetup({
                  ...setup,
                  rounds,
                  ids: Array.from(
                    { length: rounds },
                    (_, i) => setup.ids[i] ?? null,
                  ),
                });
              }}
            >
              {Array.from({ length: MAX_ROUNDS }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="setup-rule">
            <strong>{t("rules")}</strong>
            <p>{t(setup.game === "bank" ? "bankRule" : "topRule")}</p>
            <p>{t("chooseDifferent")}</p>
          </div>
        </section>
        <section className="panel lineup-panel">
          <div className="section-heading">
            <span className="step-number">02</span>
            <h2>{t("roundTopics")}</h2>
            <span className="count-pill">
              {count}/{setup.rounds}
            </span>
          </div>
          <div className="lineup">
            {chosen.map((pack, i) => (
              <div className={`lineup-row ${pack ? "" : "empty"}`} key={i}>
                <span className="lineup-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button className="lineup-choice" onClick={() => setSlot(i)}>
                  {pack ? (
                    <>
                      <TopicIcon category={pack.category.en} />
                      <span>
                        <small>
                          {t("round")} {i + 1}
                        </small>
                        <strong>{pack.category[lang]}</strong>
                      </span>
                      <Pencil size={17} />
                    </>
                  ) : (
                    <>
                      <Plus size={21} />
                      <span>{t("chooseTopic")}</span>
                    </>
                  )}
                </button>
                {pack && (
                  <button
                    className="icon-button small"
                    aria-label={`${t("remove")}: ${pack.category[lang]}`}
                    onClick={() => {
                      const ids = [...setup.ids];
                      ids[i] = null;
                      setSetup({ ...setup, ids });
                    }}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="text-button custom-link"
            onClick={() => onCustom()}
          >
            <Plus size={18} />
            {t("custom")}
          </button>
        </section>
      </div>
      <div className="setup-start">
        <div>
          <strong>
            {ready ? (
              <>
                <Check size={18} />
                {t("ready")}
              </>
            ) : (
              t("selectTopics", { count: setup.rounds - count })
            )}
          </strong>
          <small>{t("selectedCount", { count, total: setup.rounds })}</small>
        </div>
        <button className="button primary" disabled={!ready} onClick={onStart}>
          {t("start")}
          <ArrowRight size={20} className="directional" />
        </button>
      </div>
      {slot !== null && (
        <Modal
          wide
          title={`${t("chooseTopic")} · ${t("round")} ${slot + 1}`}
          onClose={() => setSlot(null)}
        >
          <PackPicker
            packs={packs}
            game={setup.game}
            used={chosen
              .filter((p, i) => p && i !== slot)
              .map((p) => p!.category.en)}
            onCustom={(topic) => {
              setSlot(null);
              onCustom(topic);
            }}
            onPick={(pack) => {
              const ids = [...setup.ids];
              ids[slot] = pack.id;
              setSetup({ ...setup, ids });
              setSlot(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
