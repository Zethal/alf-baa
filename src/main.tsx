import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts.css";
import "./styles.css";
import "./mobile-game.css";
import App from "./App";
import { LanguageProvider } from "./localization/LanguageProvider";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Alf Baa UI error", error, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <main className="fatal-error">
        <h1>
          Something interrupted the game.
          <br />
          <span lang="ar" dir="rtl">
            حدثت مشكلة أثناء اللعب.
          </span>
        </h1>
        <p>Your saved game may be available after reloading.</p>
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          Reload / أعد التحميل
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
