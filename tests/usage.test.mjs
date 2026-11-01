// Run with:  npm run test:usage   (compiles src/lib/usageTracker.ts with esbuild into .tmp/, then runs node:test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UsageTracker, attachLifecycle, localDayKey, DATA_KEY, OWNER_KEY } from '../.tmp/usageTracker.mjs';

const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => void m.set(k, String(v)), removeItem: (k) => void m.delete(k), _m: m }; };
const clock = (t0) => { let t = t0; return { now: () => t, advance: (ms) => { t += ms; }, set: (v) => { t = v; } }; };
const T0 = new Date(2026, 9, 31, 10, 0, 0).getTime(); // 31 Oct 2026 10:00 local

function run(tr, c, seconds) { for (let i = 0; i < seconds; i++) { c.advance(1000); tr.tick(); } }

test('counts only while started; stop is idempotent', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: mem(), now: c.now });
  tr.start(); tr.start(); run(tr, c, 30);
  tr.stop(); tr.stop(); tr.stop();
  assert.equal(tr.todayMs(), 30_000);
  c.advance(60_000); tr.tick(); // not running -> nothing
  assert.equal(tr.todayMs(), 30_000);
});

test('background time is not counted, resume continues', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: mem(), now: c.now });
  tr.start(); run(tr, c, 10); tr.stop();
  c.advance(30 * 60_000); // 30 min in background
  tr.start(); run(tr, c, 5); tr.stop();
  assert.equal(tr.todayMs(), 15_000);
});

test('repeated lifecycle events never double count', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: mem(), now: c.now });
  tr.start(); tr.start(); run(tr, c, 3); tr.start(); run(tr, c, 3); tr.stop(); tr.stop();
  assert.equal(tr.todayMs(), 6_000);
});

test('large gap (phone slept / frozen timers) is dropped, not credited', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: mem(), now: c.now });
  tr.start(); run(tr, c, 5);
  c.advance(20 * 60_000); tr.tick(); // timers frozen for 20 min while "visible"
  run(tr, c, 5);
  assert.equal(tr.todayMs(), 10_000);
});

test('clock going backwards never produces negative or extra time', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: mem(), now: c.now });
  tr.start(); run(tr, c, 5);
  c.advance(-60_000); tr.tick(); // user changed clock back
  run(tr, c, 5);
  assert.equal(tr.todayMs(), 10_000);
  assert.ok(Object.values(tr.totals()).every((v) => v >= 0));
});

test('span crossing local midnight is split between days', () => {
  const c = clock(new Date(2026, 9, 31, 23, 59, 55).getTime());
  const tr = new UsageTracker({ storage: mem(), now: c.now });
  tr.start(); run(tr, c, 10);
  tr.stop();
  assert.equal(tr.dayMs('2026-10-31'), 5_000);
  assert.equal(tr.dayMs('2026-11-01'), 5_000);
});

test('totals persist across restart and are not duplicated', () => {
  const st = mem(); const c = clock(T0);
  const a = new UsageTracker({ storage: st, now: c.now, id: 'a' });
  a.start(); run(a, c, 12); a.stop();
  const b = new UsageTracker({ storage: st, now: c.now, id: 'b' });
  assert.equal(b.todayMs(), 12_000);
  b.start(); run(b, c, 3); b.stop();
  const d = new UsageTracker({ storage: st, now: c.now, id: 'd' });
  assert.equal(d.todayMs(), 15_000);
});

test('crash while running (no stop) loses at most the unsaved window and never double counts', () => {
  const st = mem(); const c = clock(T0);
  const a = new UsageTracker({ storage: st, now: c.now, id: 'a', persistEveryMs: 5000 });
  a.start(); run(a, c, 12); // persisted at ~5s and ~10s ticks; no stop (killed)
  const b = new UsageTracker({ storage: st, now: c.now, id: 'b' });
  assert.ok(b.todayMs() <= 12_000 && b.todayMs() >= 7_000, 'got ' + b.todayMs());
});

test('two tabs visible at once: only the lease owner counts', () => {
  const st = mem(); const c = clock(T0);
  const a = new UsageTracker({ storage: st, now: c.now, id: 'a' });
  const b = new UsageTracker({ storage: st, now: c.now, id: 'b' });
  a.start(); b.start();
  for (let i = 0; i < 20; i++) { c.advance(1000); a.tick(); b.tick(); }
  a.stop(); b.stop();
  const total = new UsageTracker({ storage: st, now: c.now }).todayMs();
  assert.ok(total <= 21_000 && total >= 15_000, 'expected ~20s once, got ' + total);
});

test('dead owner lease is taken over after TTL', () => {
  const st = mem(); const c = clock(T0);
  st.setItem(OWNER_KEY, JSON.stringify({ id: 'ghost', ts: T0 - 60_000 }));
  const tr = new UsageTracker({ storage: st, now: c.now, id: 'me' });
  tr.start(); run(tr, c, 5); tr.stop();
  assert.equal(tr.todayMs(), 5_000);
});

test('corrupted or hostile storage cannot crash or inflate', () => {
  const st = mem(); st.setItem(DATA_KEY, '{not json');
  assert.equal(new UsageTracker({ storage: st }).todayMs(), 0);
  st.setItem(DATA_KEY, JSON.stringify({ days: { '2026-10-31': 1e15, 'bad': 5, '2026-10-30': -5 } }));
  const tr = new UsageTracker({ storage: st, now: () => T0 });
  assert.equal(tr.todayMs(), 86_400_000); // capped at 24 h
  assert.equal(tr.dayMs('2026-10-30'), 0);
  assert.equal(tr.dayMs('bad'), 0);
});

test('works with no storage at all (private mode)', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: null, now: c.now });
  tr.start(); run(tr, c, 4); tr.stop();
  assert.equal(tr.todayMs(), 4_000);
});

test('planner / quiz minutes are a different store: tracker never reads boardbuddy:v1', () => {
  const st = mem(); st.setItem('boardbuddy:v1', JSON.stringify({ minutesByDate: { [localDayKey(T0)]: 500 } }));
  const tr = new UsageTracker({ storage: st, now: () => T0 });
  assert.equal(tr.todayMs(), 0);
});

// ---- lifecycle wiring with fake window/document ----
function fakeEnv() {
  const L = { doc: {}, win: {} }; let vis = 'visible'; let timer = null;
  const mk = (bucket) => ({ addEventListener: (t, f) => ((bucket[t] ||= []).push(f)), removeEventListener: (t, f) => { bucket[t] = (bucket[t] || []).filter((x) => x !== f); } });
  const doc = { ...mk(L.doc), get visibilityState() { return vis; } };
  const win = { ...mk(L.win), setInterval: (f) => { timer = f; return 1; }, clearInterval: () => { timer = null; } };
  return { doc, win, L, setVis: (v) => { vis = v; (L.doc.visibilitychange || []).forEach((f) => f()); }, fire: (target, t) => (L[target][t] || []).forEach((f) => f()), tickTimer: () => timer && timer() };
}
test('lifecycle: hidden pauses, visible resumes, pagehide stops, pageshow restarts, cleanup removes listeners', () => {
  const c = clock(T0); const tr = new UsageTracker({ storage: mem(), now: c.now }); const e = fakeEnv();
  const off = attachLifecycle(tr, { win: e.win, doc: e.doc });
  assert.ok(tr.isRunning());
  for (let i = 0; i < 5; i++) { c.advance(1000); e.tickTimer(); }
  e.setVis('hidden'); assert.ok(!tr.isRunning());
  c.advance(120_000); e.tickTimer();
  e.setVis('visible'); assert.ok(tr.isRunning());
  for (let i = 0; i < 5; i++) { c.advance(1000); e.tickTimer(); }
  e.fire('win', 'pagehide'); assert.ok(!tr.isRunning());
  e.fire('win', 'pageshow'); assert.ok(tr.isRunning()); // bfcache restore
  e.fire('win', 'pagehide');
  assert.equal(tr.todayMs(), 10_000);
  off();
  assert.equal((e.L.doc.visibilitychange || []).length, 0);
  assert.equal((e.L.win.pagehide || []).length, 0);
});
