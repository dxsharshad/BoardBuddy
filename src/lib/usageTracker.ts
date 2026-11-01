/**
 * Foreground app-usage tracker (framework-free, unit-tested in tests/usage.test.mjs).
 *
 * What it measures: how long BoardBuddy has been OPEN AND VISIBLE on this device, per local calendar day.
 * What it does NOT measure: whether the student was actually studying. It is never added to planner minutes,
 * quiz time or the study-goal counter, and must never be labelled "study time".
 *
 * Rules
 *  - Counting only happens between start() and stop(); both are idempotent (no double counting on repeated events).
 *  - Time is added in 1-second ticks. A gap bigger than maxGapMs (phone slept, timers frozen, tab suspended
 *    without an event) is DROPPED, not credited. A clock that goes backwards never produces negative time.
 *  - A span that crosses local midnight is split between the two days.
 *  - Two tabs/windows open at once: only the "owner" tab counts (lease stored in localStorage), so time is not doubled.
 *  - Totals are persisted every few seconds and on stop(); a crash loses at most persistEveryMs of data and can
 *    never double-count because only completed ticks are stored.
 */

export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

export const DATA_KEY = 'boardbuddy:usage:v1';
export const OWNER_KEY = 'boardbuddy:usage:owner';
export const MAX_DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');
export function localDayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function nextLocalMidnight(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
}

export interface UsageOptions {
  storage: KV | null;
  now?: () => number;
  /** unique id of this tab/page; random by default */
  id?: string;
  /** a tick longer than this since the previous one is not counted (default 10 s) */
  maxGapMs?: number;
  /** another tab's lease older than this is considered dead (default 15 s) */
  ownerTtlMs?: number;
  persistEveryMs?: number;
}

export class UsageTracker {
  private days: Record<string, number> = {};
  private running = false;
  private lastTick = 0;
  private lastPersist = 0;
  private lastOwnerWrite = 0;
  private dirty = false;
  private listeners = new Set<() => void>();
  private readonly storage: KV | null;
  private readonly nowFn: () => number;
  private readonly id: string;
  private readonly maxGapMs: number;
  private readonly ownerTtlMs: number;
  private readonly persistEveryMs: number;

  constructor(o: UsageOptions) {
    this.storage = o.storage;
    this.nowFn = o.now ?? (() => Date.now());
    this.id = o.id ?? Math.random().toString(36).slice(2, 10);
    this.maxGapMs = o.maxGapMs ?? 10_000;
    this.ownerTtlMs = o.ownerTtlMs ?? 15_000;
    this.persistEveryMs = o.persistEveryMs ?? 5_000;
    this.load();
  }

  private load() {
    try {
      const raw = this.storage?.getItem(DATA_KEY);
      if (!raw) return;
      const j = JSON.parse(raw) as { days?: Record<string, unknown> };
      if (!j || typeof j.days !== 'object' || j.days === null) return;
      for (const [k, v] of Object.entries(j.days)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v >= 0) {
          this.days[k] = Math.min(MAX_DAY_MS, Math.floor(v));
        }
      }
    } catch {
      /* corrupted storage: start from zero rather than crash */
    }
  }

  private persist(force: boolean, now: number) {
    if (!this.storage || !this.dirty) return;
    if (!force && now - this.lastPersist < this.persistEveryMs) return;
    try {
      // keep about 13 months of history
      const keys = Object.keys(this.days).sort();
      while (keys.length > 400) delete this.days[keys.shift() as string];
      this.storage.setItem(DATA_KEY, JSON.stringify({ v: 1, days: this.days }));
      this.lastPersist = now;
      this.dirty = false;
    } catch {
      /* storage full/blocked: keep counting in memory */
    }
  }

  /** Only one open tab may count at a time. */
  private ownsLease(now: number): boolean {
    if (!this.storage) return true;
    try {
      if (now - this.lastOwnerWrite < this.persistEveryMs) {
        // We refreshed the lease recently; re-check only that nobody stole it.
        const cur = JSON.parse(this.storage.getItem(OWNER_KEY) || 'null') as { id: string; ts: number } | null;
        return !cur || cur.id === this.id;
      }
      const cur = JSON.parse(this.storage.getItem(OWNER_KEY) || 'null') as { id: string; ts: number } | null;
      if (cur && cur.id !== this.id && now - cur.ts >= 0 && now - cur.ts <= this.ownerTtlMs) return false;
      this.storage.setItem(OWNER_KEY, JSON.stringify({ id: this.id, ts: now }));
      this.lastOwnerWrite = now;
      return true;
    } catch {
      return true;
    }
  }

  private releaseLease() {
    try {
      const cur = JSON.parse(this.storage?.getItem(OWNER_KEY) || 'null') as { id: string } | null;
      if (cur && cur.id === this.id) this.storage?.removeItem(OWNER_KEY);
    } catch {
      /* ignore */
    }
    this.lastOwnerWrite = 0;
  }

  private addSpan(from: number, to: number) {
    let a = from;
    while (a < to) {
      const boundary = nextLocalMidnight(a);
      const b = Math.min(to, boundary);
      const key = localDayKey(a);
      this.days[key] = Math.min(MAX_DAY_MS, (this.days[key] ?? 0) + (b - a));
      this.dirty = true;
      a = b;
    }
  }

  /** App became visible/active. Safe to call repeatedly. */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTick = this.nowFn();
    this.notify();
  }

  /** Call about once per second while running (attachLifecycle does this). */
  tick() {
    if (!this.running) return;
    const now = this.nowFn();
    const delta = now - this.lastTick;
    this.lastTick = now;
    if (delta <= 0) return; // clock moved backwards or duplicate tick
    if (delta > this.maxGapMs) return; // device slept / timers frozen: do not credit
    if (!this.ownsLease(now)) return;
    this.addSpan(now - delta, now);
    this.persist(false, now);
    this.notify();
  }

  /** App went to background / page hidden / closed. Safe to call repeatedly. */
  stop() {
    if (!this.running) return;
    this.tick();
    this.running = false;
    this.persist(true, this.nowFn());
    this.releaseLease();
    this.notify();
  }

  isRunning() {
    return this.running;
  }
  dayMs(key: string): number {
    return this.days[key] ?? 0;
  }
  todayMs(): number {
    return this.dayMs(localDayKey(this.nowFn()));
  }
  totals(): Record<string, number> {
    return { ...this.days };
  }
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private notify() {
    this.listeners.forEach((f) => {
      try {
        f();
      } catch {
        /* a bad listener must not stop tracking */
      }
    });
  }
}

/** Wire a tracker to the browser lifecycle. Returns a cleanup function. */
export function attachLifecycle(
  tracker: UsageTracker,
  env: { win: Window; doc: Document } = { win: window, doc: document },
  intervalMs = 1000,
): () => void {
  const { win, doc } = env;
  const visible = () => doc.visibilityState === 'visible';
  const sync = () => (visible() ? tracker.start() : tracker.stop());
  const onPageShow = () => {
    if (visible()) tracker.start();
  };
  const onStop = () => tracker.stop();
  const onResume = () => {
    if (visible()) tracker.start();
  };

  doc.addEventListener('visibilitychange', sync);
  win.addEventListener('pageshow', onPageShow);
  win.addEventListener('pagehide', onStop);
  win.addEventListener('beforeunload', onStop);
  doc.addEventListener('freeze', onStop);
  doc.addEventListener('resume', onResume);
  const iv = win.setInterval(() => tracker.tick(), intervalMs);
  sync();

  return () => {
    doc.removeEventListener('visibilitychange', sync);
    win.removeEventListener('pageshow', onPageShow);
    win.removeEventListener('pagehide', onStop);
    win.removeEventListener('beforeunload', onStop);
    doc.removeEventListener('freeze', onStop);
    doc.removeEventListener('resume', onResume);
    win.clearInterval(iv);
    tracker.stop();
  };
}
