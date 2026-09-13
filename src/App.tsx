import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CircleHelp, LogOut } from "lucide-react";
import { MAX_CUSTOM_PACKS } from "./domain/constants";
import { type GameType, type Pack } from "./domain/content";
import { applyAction, createSession, type GameAction } from "./domain/engine";
import { bundledPacks } from "./data/packs";
import { loadCustomPacks, loadSession, saveLocal } from "./lib/storage";
import { useLanguage } from "./localization/LanguageProvider";
import { Home } from "./components/Home";
import { Setup, defaultSetup } from "./components/Setup";
import { Library } from "./components/Library";
import { CustomPack } from "./components/CustomPack";
import { Game } from "./components/Game";
import { Results } from "./components/Results";
import { Modal } from "./components/Modal";
import { Rules } from "./components/Rules";

type Screen = "home" | "setup" | "library" | "custom" | "game";
export default function App() {
  const { lang, setLang, t } = useLanguage();
  const [screen, setScreen] = useState<Screen>("home");
  const [session, setSession] = useState(loadSession);
  const [customPacks, setCustomPacks] = useState(loadCustomPacks);
  const packs = [...bundledPacks, ...customPacks];
  const [setup, setSetup] = useState(() => defaultSetup("bank", bundledPacks));
  const [rules, setRules] = useState(false);
  const [exit, setExit] = useState(false);
  const [replaceGame, setReplaceGame] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const [customFrom, setCustomFrom] = useState<"setup" | "library">("library");
  const [customTopic, setCustomTopic] = useState("");
  const [customGame, setCustomGame] = useState<GameType>("bank");
  const [message, setMessage] = useState("");
  function go(next: Screen) {
    setScreen(next);
    window.history.pushState({ alfbaa: true }, "", `#${next}`);
    window.scrollTo({ top: 0 });
    setMessage("");
  }
  const active =
    screen === "game" && session && session.current.stage !== "finished";
  useEffect(() => {
    if (!saveLocal("session", session)) setStorageFailed(true);
  }, [session]);
  useEffect(() => {
    if (!saveLocal("packs", customPacks)) setStorageFailed(true);
  }, [customPacks]);
  useEffect(() => {
    const onBack = () => {
      if (active) {
        window.history.pushState({ alfbaa: true }, "", "#game");
        setExit(true);
      } else {
        setScreen("home");
        window.scrollTo({ top: 0 });
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (active) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("popstate", onBack);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("popstate", onBack);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [active]);
  function home() {
    if (active) setExit(true);
    else go("home");
  }
  function play(game: GameType) {
    setSetup(defaultSetup(game, packs));
    go("setup");
  }
  function start() {
    const selected = setup.ids.flatMap((id) => {
      const p = packs.find((p) => p.id === id);
      return p ? [p] : [];
    });
    if (selected.length !== setup.rounds) return;
    const teams: [string, string] = [
      setup.teams[0].trim() || t("team1"),
      setup.teams[1].trim() || t("team2"),
    ];
    setSession(createSession(teams, selected));
    setReplaceGame(false);
    go("game");
  }
  function dispatch(action: GameAction) {
    setSession((previous) =>
      previous ? applyAction(previous, action) : previous,
    );
    if (action.type === "next") window.scrollTo({ top: 0 });
  }
  function custom(
    game: GameType,
    topic = "",
    from: "setup" | "library" = "library",
  ) {
    setCustomGame(game);
    setCustomTopic(topic);
    setCustomFrom(from);
    go("custom");
  }
  function addPack(pack: Pack): string | null {
    if (!pack.id.startsWith("custom-")) return t("customId");
    if (packs.some((p) => p.id === pack.id)) return t("duplicatePack");
    if (customPacks.length >= MAX_CUSTOM_PACKS) return t("capacity");
    setCustomPacks((previous) => [...previous, pack]);
    if (customFrom === "setup" && pack.gameType === setup.game) {
      const ids = [...setup.ids];
      const index = ids.findIndex((id) => !id);
      ids[index < 0 ? ids.length - 1 : index] = pack.id;
      // One topic per round. Clear a previous pick from this category if needed.
      ids.forEach((id, i) => {
        if (
          id !== pack.id &&
          packs.find((p) => p.id === id)?.category.en === pack.category.en
        )
          ids[i] = null;
      });
      setSetup({ ...setup, ids });
      go("setup");
    } else go("library");
    setMessage(t("imported"));
    return null;
  }
  return (
    <>
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <div className="app-shell">
        <header className="site-header">
          <button
            className="brand"
            onClick={home}
            aria-label={`Alf Baa · ${t("home")}`}
          >
            <span className="brand-mark" lang="ar">
              أب
            </span>
            <span className="brand-type">
              <strong lang="ar">ألف باء</strong>
              <small>ALF BAA</small>
            </span>
          </button>
          <div className="header-actions">
            {screen === "home" && (
              <button
                className="header-library text-button"
                onClick={() => go("library")}
              >
                <BookOpen size={18} />
                {t("packs")}
              </button>
            )}
            <div className="language-switch" aria-label="Language / اللغة">
              <button
                lang="en"
                aria-pressed={lang === "en"}
                onClick={() => setLang("en")}
              >
                English
              </button>
              <button
                lang="ar"
                aria-pressed={lang === "ar"}
                onClick={() => setLang("ar")}
              >
                العربية
              </button>
            </div>
          </div>
        </header>
        {screen !== "home" && (
          <nav className="page-nav">
            <button
              className="text-button"
              onClick={() => (screen === "custom" ? go(customFrom) : home())}
            >
              <ArrowLeft size={18} className="directional" />
              {t(active ? "home" : "back")}
            </button>
            <button className="text-button" onClick={() => setRules(true)}>
              <CircleHelp size={18} />
              {t("how")}
            </button>
            {active && (
              <button
                className="text-button exit-button"
                onClick={() => setExit(true)}
                aria-label={t("exit")}
              >
                <LogOut size={18} />
              </button>
            )}
          </nav>
        )}
        <main id="main" tabIndex={-1}>
          {storageFailed && (
            <p className="notice error-notice" role="alert">
              {t("storageFailed")}
            </p>
          )}
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          {screen === "home" && (
            <Home
              onPlay={play}
              onLibrary={() => go("library")}
              onRules={() => setRules(true)}
              saved={session}
              onResume={() => go("game")}
            />
          )}
          {screen === "setup" && (
            <Setup
              setup={setup}
              setSetup={setSetup}
              packs={packs}
              onStart={() =>
                session && session.current.stage !== "finished"
                  ? setReplaceGame(true)
                  : start()
              }
              onCustom={(topic) => custom(setup.game, topic, "setup")}
            />
          )}
          {screen === "library" && (
            <Library
              packs={packs}
              onCustom={(game, topic) => custom(game, topic)}
              onDelete={(id) =>
                setCustomPacks((previous) =>
                  previous.filter((p) => p.id !== id),
                )
              }
              onPlay={(pack) => {
                const next = defaultSetup(pack.gameType, packs);
                next.ids = [
                  pack.id,
                  ...next.ids.filter(
                    (id) =>
                      packs
                        .find((p) => p.id === id)
                        ?.category.en.toLowerCase() !==
                      pack.category.en.toLowerCase(),
                  ),
                ].slice(0, next.rounds);
                setSetup(next);
                go("setup");
              }}
            />
          )}
          {screen === "custom" && (
            <CustomPack
              initialTopic={customTopic}
              initialGame={customGame}
              onAdd={addPack}
            />
          )}
          {screen === "game" &&
            session &&
            (session.current.stage === "finished" ? (
              <Results
                session={session}
                onHome={() => go("home")}
                onUndo={() => dispatch({ type: "undo" })}
                onAgain={() => {
                  setSetup({
                    game: session.packs[0].gameType,
                    rounds: session.packs.length,
                    teams: session.teams,
                    ids: session.packs.map((p) => p.id),
                  });
                  go("setup");
                }}
              />
            ) : (
              <Game session={session} dispatch={dispatch} />
            ))}
        </main>
        <footer className="site-footer">
          <span>
            ألف باء <span aria-hidden="true">/</span> ALF BAA
          </span>
          <span>
            {t("onePhone")} · {t("twoTeams")}
          </span>
        </footer>
      </div>
      {rules && (
        <Modal title={t("rulesTitle")} onClose={() => setRules(false)}>
          <Rules />
        </Modal>
      )}
      {exit && (
        <Modal title={t("exitTitle")} onClose={() => setExit(false)}>
          <p>{t(storageFailed ? "storageFailed" : "exitDesc")}</p>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => setExit(false)}>
              {t("cancel")}
            </button>
            <button
              className="button primary"
              onClick={() => {
                setExit(false);
                go("home");
              }}
            >
              {t("leave")}
            </button>
          </div>
        </Modal>
      )}
      {replaceGame && (
        <Modal title={t("newConfirm")} onClose={() => setReplaceGame(false)}>
          <p>{t("newDesc")}</p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setReplaceGame(false)}
            >
              {t("cancel")}
            </button>
            <button className="button primary" onClick={start}>
              {t("newStart")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
