import { useEffect, useState } from 'react';
import { UsageTracker, attachLifecycle, localDayKey } from './usageTracker';

let tracker: UsageTracker | null = null;
let detach: (() => void) | null = null;

export function getTracker(): UsageTracker {
  if (!tracker) {
    let storage: Storage | null = null;
    try {
      storage = window.localStorage;
    } catch {
      /* blocked: tracker still works in memory */
    }
    tracker = new UsageTracker({ storage });
  }
  return tracker;
}

/** Call once at startup (main.tsx). */
export function startUsageTracking() {
  if (detach) return;
  detach = attachLifecycle(getTracker());
}

/** Live "app open today" in milliseconds; re-renders about once per second while the app is visible. */
export function useTodayUsageMs(): number {
  const t = getTracker();
  const [ms, setMs] = useState(() => t.todayMs());
  useEffect(() => {
    setMs(t.todayMs());
    return t.subscribe(() => setMs(t.todayMs()));
  }, [t]);
  return ms;
}

/** All stored daily totals (ms by local date). Updates live. */
export function useUsageTotals(): Record<string, number> {
  const t = getTracker();
  const [totals, setTotals] = useState(() => t.totals());
  useEffect(() => {
    setTotals(t.totals());
    return t.subscribe(() => setTotals(t.totals()));
  }, [t]);
  return totals;
}

export { localDayKey };

export function fmtUsage(ms: number, lang: 'en' | 'hi'): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return lang === 'hi' ? `${h} घंटे ${m} मिनट` : `${h}h ${m}m`;
  if (totalMin > 0) return lang === 'hi' ? `${m} मिनट ${s} सेकंड` : `${m}m ${s}s`;
  return lang === 'hi' ? `${s} सेकंड` : `${s}s`;
}
