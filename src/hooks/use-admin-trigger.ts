import { useCallback, useEffect, useRef, useState } from "react";

const RELOADS_KEY = "sys_reload_times";
const REVEALED_KEY = "sys_admin_trigger_revealed";
export const RELOAD_WINDOW_MS = 10_000;
export const RELOADS_NEEDED = 3;
export const LOGO_CLICKS_NEEDED = 5;
export const LOGO_CLICK_WINDOW_MS = 3_000;

/** Keeps only timestamps inside the window and reports whether the threshold is reached. */
export function countRecent(times: number[], now: number, windowMs: number) {
  return times.filter((t) => now - t <= windowMs);
}

function isReloadNavigation() {
  const entry = performance.getEntriesByType?.("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry ? entry.type === "reload" : true;
}

/**
 * Hidden entrance for the judging committee:
 *  - refresh the page 3 times within 10 seconds, or
 *  - click the navbar logo 5 times quickly.
 */
export function useAdminTrigger() {
  const [revealed, setRevealed] = useState(false);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(REVEALED_KEY) === "1") {
        setRevealed(true);
        return;
      }
      if (!isReloadNavigation()) return;
      const now = Date.now();
      const stored = JSON.parse(sessionStorage.getItem(RELOADS_KEY) ?? "[]") as number[];
      // Ignore duplicate effect runs in development (same load within 500ms).
      const last = stored[stored.length - 1];
      if (last !== undefined && now - last < 500) return;
      const recent = [...countRecent(stored, now, RELOAD_WINDOW_MS), now];
      sessionStorage.setItem(RELOADS_KEY, JSON.stringify(recent));
      if (recent.length >= RELOADS_NEEDED) {
        sessionStorage.setItem(REVEALED_KEY, "1");
        sessionStorage.removeItem(RELOADS_KEY);
        setRevealed(true);
      }
    } catch {
      /* sessionStorage unavailable */
    }
  }, []);

  const registerLogoClick = useCallback(() => {
    const now = Date.now();
    clicks.current = [...countRecent(clicks.current, now, LOGO_CLICK_WINDOW_MS), now];
    if (clicks.current.length >= LOGO_CLICKS_NEEDED) {
      clicks.current = [];
      try {
        sessionStorage.setItem(REVEALED_KEY, "1");
      } catch {
        /* ignore */
      }
      setRevealed(true);
    }
  }, []);

  const hide = useCallback(() => {
    try {
      sessionStorage.removeItem(REVEALED_KEY);
    } catch {
      /* ignore */
    }
    setRevealed(false);
  }, []);

  return { revealed, registerLogoClick, hide };
}
