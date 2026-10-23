import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/fonts.css";
import BrandPage from "./BrandPage";
import type { BrandGuide } from "./types";
import styles from "./BrandPage.module.css";

const HOME = "https://coffister.art/";
const slug = location.pathname.match(/^\/brand\/([a-z0-9-]+)\/?$/)?.[1];

type State = { status: "loading" } | { status: "error" } | { status: "ready"; guide: BrandGuide };

function App() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      // explicit Accept: Vite dev would otherwise answer a missing file with index.html
      const res = await fetch(`/brands/${slug}/guide.json`, { headers: { Accept: "application/json" } });
      // missing or archived (folder moved out of public/): nothing to show here
      if (res.status === 404) return location.replace(HOME);
      if (!res.ok) throw new Error(String(res.status));
      setState({ status: "ready", guide: await res.json() });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    if (slug) load();
    else location.replace(HOME);
  }, [load]);

  if (state.status === "ready") return <BrandPage guide={state.guide} slug={slug!} />;
  if (state.status === "loading") return <div className={styles.skeleton} aria-busy="true" aria-label="Načítava sa" />;
  return (
    <main className={styles.failed}>
      <h1>Sprievodcu sa nepodarilo načítať</h1>
      <p>Skontrolujte pripojenie a skúste to znova.</p>
      <button type="button" className={styles.button} onClick={load}>
        Skúsiť znova
      </button>
      <a href={HOME}>Prejsť na coffister.art</a>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
