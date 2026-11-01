import { useMemo, useState } from 'react';
import { useTr } from '../lib/useTr';
import { useStore } from '../lib/store';
import { Empty, Page } from '../components/ui';
import { ErrorLine, Field, InfoBox, Loading, useLoad } from '../components/common';
import TestRunner, { ResultView, clearSession, type ResultItem, type RunQ } from '../components/TestRunner';
import { loadKey, loadPublishedTests, scoreTest, type PubTest } from '../lib/published';
import { allMcqs, subjectById, subjects } from '../data/subjects';
import { cx, dateKey, tx, uid } from '../lib/utils';

/* ---------- small local persistence helpers (all wrapped: storage can be blocked) ---------- */
const HIST_KEY = 'boardbuddy:testhistory:v1';
const MINE_KEY = 'boardbuddy:mytests:v1';
interface Hist { id: string; title: string; score: number; max: number; correct: number; wrong: number; skipped: number; at: number }
interface MyTest { id: string; title: string; durationMin: number; questions: { id: string; text: string; options: string[]; answer: number; explanation: string }[] }
function rd<T>(k: string, d: T): T { try { const j = JSON.parse(localStorage.getItem(k) || 'null'); return j ?? d; } catch { return d; } }
function wr(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }
const readHist = (): Hist[] => { const h = rd<Hist[]>(HIST_KEY, []); return Array.isArray(h) ? h.filter((x) => x && typeof x.title === 'string' && Number.isFinite(x.score)) : []; };
const pushHist = (h: Hist) => wr(HIST_KEY, [h, ...readHist()].slice(0, 50));
const readMine = (): MyTest[] => { const m = rd<MyTest[]>(MINE_KEY, []); return Array.isArray(m) ? m.filter((x) => x && Array.isArray(x.questions) && x.questions.length > 0) : []; };

/* ---------- deterministic daily practice: same 10 questions for everyone on a date ---------- */
function seeded(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function dailyIds(day: string, n = 10): string[] {
  const ids = allMcqs.map((m) => m.id).sort();
  let seed = 0; for (const c of day) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const r = seeded(seed); const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, Math.min(n, a.length));
}

type View = { k: 'hub' } | { k: 'daily' } | { k: 'pub'; t: PubTest } | { k: 'mine'; t: MyTest } | { k: 'build' };

export default function TestSeries() {
  const { tr } = useTr();
  const [view, setView] = useState<View>({ k: 'hub' });
  const back = view.k === 'hub' ? undefined : () => setView({ k: 'hub' });
  return (
    <Page title={`📝 ${tr('Test Series', 'टेस्ट सीरीज़')}`} back={back}>
      {view.k === 'hub' && <Hub go={setView} />}
      {view.k === 'daily' && <Daily />}
      {view.k === 'pub' && <PubRun t={view.t} done={() => setView({ k: 'hub' })} />}
      {view.k === 'mine' && <MineRun t={view.t} />}
      {view.k === 'build' && <Builder done={() => setView({ k: 'hub' })} />}
    </Page>
  );
}

function Hub({ go }: { go: (v: View) => void }) {
  const { tr, L } = useTr();
  const pub = useLoad(loadPublishedTests, []);
  const [subject, setSubject] = useState('');
  const [mine, setMine] = useState(readMine);
  const [hist] = useState(readHist);
  const tests = (pub.data?.tests ?? []).filter((t) => !subject || t.subject === subject);
  const delMine = (id: string) => { if (!window.confirm(tr('Delete this test?', 'यह टेस्ट हटाएँ?'))) return; const n = mine.filter((m) => m.id !== id); wr(MINE_KEY, n); setMine(n); };
  return (
    <>
      <button className="card w-full text-left flex items-center gap-3" onClick={() => go({ k: 'daily' })}>
        <span className="text-3xl" aria-hidden>🎯</span>
        <span className="flex-1"><span className="block font-bold">{tr('Daily practice', 'आज का अभ्यास')}</span><span className="block text-xs muted">{tr('10 questions, same for everyone today · 10 min', '10 प्रश्न, आज सबके लिए समान · 10 मिनट')}</span></span><span aria-hidden>→</span>
      </button>

      <h2 className="h2">👩‍🏫 {tr('Teacher tests', 'टीचर टेस्ट')}</h2>
      <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={tr('Subject', 'विषय')}>
        <option value="">{tr('All subjects', 'सभी विषय')}</option>{subjects.map((s) => <option key={s.id} value={s.id}>{tx(s.name, L)}</option>)}
      </select>
      {pub.loading && !pub.data ? <Loading /> : pub.error ? <ErrorLine text={tr('Could not load tests. Check your internet.', 'टेस्ट लोड नहीं हुए। इंटरनेट जाँचें।') + ' (' + pub.error + ')'} /> : tests.length === 0 ? (
        <Empty icon="📭" text={tr('No teacher tests published yet.', 'अभी कोई टीचर टेस्ट प्रकाशित नहीं हुआ।')} />
      ) : (
        <ul className="space-y-2">{tests.map((t) => (
          <li key={t.id}><button className="card w-full text-left" onClick={() => go({ k: 'pub', t })}>
            <span className="block font-semibold break-words">{t.title} {t.sample && <span className="chip">{tr('DEMO', 'डेमो')}</span>}</span>
            <span className="block text-xs muted">{tx(subjectById(t.subject)?.name, L)}{t.chapter ? ` · ${t.chapter}` : ''} · {t.questions.length} {tr('questions', 'प्रश्न')} · {t.durationMin} {tr('min', 'मिनट')}{t.teacherName ? ` · 👩‍🏫 ${t.teacherName}` : ''}</span>
          </button></li>))}</ul>
      )}

      <h2 className="h2">🛠️ {tr('My tests', 'मेरे टेस्ट')}</h2>
      <button className="btn-ghost w-full" onClick={() => go({ k: 'build' })}>➕ {tr('Create a practice test', 'प्रैक्टिस टेस्ट बनाएँ')}</button>
      {mine.length > 0 && <ul className="space-y-2">{mine.map((m) => (
        <li key={m.id} className="card flex items-center gap-2">
          <button className="flex-1 min-w-0 text-left" onClick={() => go({ k: 'mine', t: m })}><span className="block font-semibold truncate">{m.title}</span><span className="block text-xs muted">{m.questions.length} {tr('questions', 'प्रश्न')} · {m.durationMin} {tr('min', 'मिनट')}</span></button>
          <button className="btn-ghost !px-3 !py-2" onClick={() => delMine(m.id)} aria-label={tr('Delete', 'हटाएँ')}>🗑</button>
        </li>))}</ul>}

      <h2 className="h2">📈 {tr('Recent attempts', 'हाल के प्रयास')}</h2>
      {hist.length === 0 ? <p className="muted text-sm">{tr('Nothing yet.', 'अभी कुछ नहीं।')}</p> : (
        <ul className="space-y-1">{hist.slice(0, 8).map((h, i) => <li key={i} className="card !py-2 flex justify-between gap-2 text-sm"><span className="truncate">{h.title}</span><span className="font-semibold whitespace-nowrap">{h.score}/{h.max}</span></li>)}</ul>
      )}
    </>
  );
}

/* ---------- Daily practice (answers are in the app bank, scored on device) ---------- */
function Daily() {
  const { tr, L } = useTr();
  const { addQuizResult } = useStore();
  const day = dateKey();
  const qs = useMemo(() => dailyIds(day).map((id) => allMcqs.find((m) => m.id === id)!).filter(Boolean), [day]);
  const run: RunQ[] = useMemo(() => qs.map((m) => ({ id: m.id, text: tx(m.q, L), options: m.options.map((o) => tx(o, L)) })), [qs, L]);
  const [res, setRes] = useState<{ items: ResultItem[]; stats: { correct: number; wrong: number; skipped: number; score: number; maxScore: number }; sec: number } | null>(null);
  const key = `daily-${day}`;
  if (qs.length === 0) return <Empty icon="📭" text={tr('No questions available.', 'कोई प्रश्न उपलब्ध नहीं।')} />;
  if (res) return <ResultView items={res.items} stats={res.stats} durationSec={res.sec} />;
  return <TestRunner sessionKey={key} questions={run} durationSec={qs.length * 60} onSubmit={async (ans, sec) => {
    const right: string[] = [], wrong: string[] = []; const items: ResultItem[] = [];
    qs.forEach((m, i) => { const p = ans[m.id]; if (p !== undefined) (p === m.answer ? right : wrong).push(m.id); items.push({ q: run[i], picked: p, correct: m.answer, explanation: tx(m.explain, L) }); });
    const stats = { correct: right.length, wrong: wrong.length, skipped: qs.length - right.length - wrong.length, score: right.length, maxScore: qs.length };
    addQuizResult({ scope: key, label: tr('Daily practice', 'आज का अभ्यास'), total: qs.length, correct: right.length, seconds: sec }, wrong, right);
    pushHist({ id: key, title: `${tr('Daily practice', 'आज का अभ्यास')} ${day}`, score: stats.score, max: stats.maxScore, correct: stats.correct, wrong: stats.wrong, skipped: stats.skipped, at: Date.now() });
    setRes({ items, stats, sec });
  }} />;
}

/* ---------- Teacher-published test: key is fetched only after submit ---------- */
function PubRun({ t, done }: { t: PubTest; done: () => void }) {
  const { tr } = useTr();
  const { addQuizResult } = useStore();
  const [started, setStarted] = useState(() => { try { return !!localStorage.getItem(`boardbuddy:testsession:pub-${t.id}`); } catch { return false; } });
  const [res, setRes] = useState<{ items: ResultItem[]; stats: { correct: number; wrong: number; skipped: number; score: number; maxScore: number }; sec: number } | null>(null);
  const key = `pub-${t.id}`;
  if (res) return <ResultView items={res.items} stats={res.stats} durationSec={res.sec} note={t.sample ? tr('Demo test — not a real exam.', 'डेमो टेस्ट — असली परीक्षा नहीं।') : undefined} onAgain={() => { clearSession(key); setRes(null); setStarted(false); }} />;
  if (!started) return (
    <div className="card space-y-2">
      <h2 className="h2 break-words">{t.title}</h2>
      {t.sample && <p className="chip">{tr('DEMO — sample questions for testing the feature', 'डेमो — फ़ीचर जाँचने के नमूना प्रश्न')}</p>}
      <p className="text-sm muted">{t.questions.length} {tr('questions', 'प्रश्न')} · {t.durationMin} {tr('min', 'मिनट')} · +{t.marksPerQ}{t.negative ? ` / −${t.negative}` : ''}</p>
      {t.instructions && <p className="whitespace-pre-wrap text-sm">{t.instructions}</p>}
      <button className="btn-primary w-full" onClick={() => setStarted(true)}>{tr('Start test', 'टेस्ट शुरू करें')}</button>
      <button className="btn-ghost w-full" onClick={done}>{tr('Back', 'वापस')}</button>
    </div>
  );
  const run: RunQ[] = t.questions;
  return <TestRunner sessionKey={key} questions={run} durationSec={t.durationMin * 60} onSubmit={async (ans, sec) => {
    const k = await loadKey(t.keyFile); // throws on network error → runner shows retry, answers kept
    const s = scoreTest(t.questions, k, ans, t.marksPerQ, t.negative);
    const items = t.questions.map((q) => ({ q, picked: ans[q.id], correct: k.answers[q.id] ?? -1, explanation: k.explanations[q.id] }));
    const stats = { ...s, maxScore: Math.round(t.questions.length * t.marksPerQ * 100) / 100 };
    addQuizResult({ scope: key, label: t.title, total: t.questions.length, correct: s.correct, seconds: sec }, [], []);
    pushHist({ id: key, title: t.title, score: s.score, max: stats.maxScore, correct: s.correct, wrong: s.wrong, skipped: s.skipped, at: Date.now() });
    setRes({ items, stats, sec });
  }} />;
}

/* ---------- Personal test (answers live on this phone, so scoring is local) ---------- */
function MineRun({ t }: { t: MyTest }) {
  const { tr } = useTr();
  const { addQuizResult } = useStore();
  const [res, setRes] = useState<{ items: ResultItem[]; stats: { correct: number; wrong: number; skipped: number; score: number; maxScore: number }; sec: number } | null>(null);
  const key = `mine-${t.id}`;
  if (res) return <ResultView items={res.items} stats={res.stats} durationSec={res.sec} onAgain={() => { clearSession(key); setRes(null); }} />;
  return <TestRunner sessionKey={key} questions={t.questions} durationSec={t.durationMin * 60} onSubmit={async (ans, sec) => {
    let c = 0, w = 0;
    const items = t.questions.map((q) => { const p = ans[q.id]; if (p !== undefined) { if (p === q.answer) c++; else w++; } return { q, picked: p, correct: q.answer, explanation: q.explanation || undefined }; });
    const stats = { correct: c, wrong: w, skipped: t.questions.length - c - w, score: c, maxScore: t.questions.length };
    addQuizResult({ scope: key, label: t.title, total: t.questions.length, correct: c, seconds: sec }, [], []);
    pushHist({ id: key, title: t.title, score: c, max: stats.maxScore, correct: c, wrong: w, skipped: stats.skipped, at: Date.now() });
    setRes({ items, stats, sec });
  }} />;
}

/* ---------- Builder: write your own questions, then take them or export as JSON ---------- */
function Builder({ done }: { done: () => void }) {
  const { tr } = useTr();
  const [title, setTitle] = useState('');
  const [mins, setMins] = useState(10);
  const [qs, setQs] = useState<MyTest['questions']>([]);
  const [d, setD] = useState({ text: '', o: ['', '', '', ''], answer: 0, explanation: '' });
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const addQ = () => {
    const opts = d.o.map((x) => x.trim()).filter(Boolean);
    if (d.text.trim().length < 3) return setErr(tr('Write the question.', 'प्रश्न लिखें।'));
    if (d.o.slice(0, 2).some((x) => !x.trim())) return setErr(tr('At least the first two options are needed.', 'कम से कम पहले दो विकल्प चाहिए।'));
    if (!d.o[d.answer]?.trim()) return setErr(tr('The correct option is empty.', 'सही विकल्प खाली है।'));
    // keep option positions: only trailing empty options are dropped, so answer index stays valid
    const trimmed = [...d.o.map((x) => x.trim())]; while (trimmed.length > 2 && !trimmed[trimmed.length - 1]) trimmed.pop();
    if (trimmed.some((x) => !x)) return setErr(tr('Fill options in order (no gaps).', 'विकल्प क्रम से भरें (बीच में खाली नहीं)।'));
    void opts;
    setQs([...qs, { id: uid(), text: d.text.trim().slice(0, 500), options: trimmed.map((x) => x.slice(0, 200)), answer: d.answer, explanation: d.explanation.trim().slice(0, 500) }]);
    setD({ text: '', o: ['', '', '', ''], answer: 0, explanation: '' }); setErr('');
  };
  const save = () => {
    if (title.trim().length < 2) return setErr(tr('Enter a test title.', 'टेस्ट का नाम लिखें।'));
    if (qs.length === 0) return setErr(tr('Add at least one question.', 'कम से कम एक प्रश्न जोड़ें।'));
    wr(MINE_KEY, [...readMine(), { id: uid(), title: title.trim().slice(0, 120), durationMin: Math.min(300, Math.max(1, mins || 10)), questions: qs }]);
    done();
  };
  // Owner can paste these into public/tests/ to publish (questions file entry + separate key file)
  const exportJson = async () => {
    const id = uid();
    const out = { test: { id, title: title.trim() || 'Untitled', subject: '', chapter: '', instructions: '', durationMin: mins, marksPerQ: 1, negative: 0, teacherName: '', keyFile: `${id}.key.json`, questions: qs.map((q) => ({ id: q.id, text: q.text, options: q.options })) },
      keyFile: { name: `${id}.key.json`, content: { answers: Object.fromEntries(qs.map((q) => [q.id, q.answer])), explanations: Object.fromEntries(qs.filter((q) => q.explanation).map((q) => [q.id, q.explanation])) } } };
    try { await navigator.clipboard.writeText(JSON.stringify(out, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setErr(tr('Could not copy.', 'कॉपी नहीं हुआ।')); }
  };
  return (
    <div className="space-y-3">
      <Field label={tr('Test title', 'टेस्ट का नाम')}><input className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label={tr('Time (minutes)', 'समय (मिनट)')}><input className="input" type="number" min={1} max={300} value={mins} onChange={(e) => setMins(Number(e.target.value))} /></Field>
      <div className="card space-y-2">
        <h3 className="font-semibold">{tr('Question', 'प्रश्न')} {qs.length + 1}</h3>
        <textarea className="input min-h-[60px]" maxLength={500} value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} aria-label={tr('Question', 'प्रश्न')} />
        {d.o.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="radio" name="ans" checked={d.answer === i} onChange={() => setD({ ...d, answer: i })} aria-label={tr('Correct option', 'सही विकल्प') + ' ' + (i + 1)} />
            <input className="input" maxLength={200} placeholder={`${tr('Option', 'विकल्प')} ${i + 1}`} value={o} onChange={(e) => setD({ ...d, o: d.o.map((x, j) => (j === i ? e.target.value : x)) })} />
          </div>))}
        <input className="input" maxLength={500} placeholder={tr('Explanation (optional)', 'व्याख्या (वैकल्पिक)')} value={d.explanation} onChange={(e) => setD({ ...d, explanation: e.target.value })} />
        <button className="btn-ghost w-full" onClick={addQ}>➕ {tr('Add question', 'प्रश्न जोड़ें')}</button>
      </div>
      {qs.length > 0 && <ul className="space-y-1">{qs.map((q, i) => <li key={q.id} className={cx('card !py-2 flex items-center gap-2 text-sm')}><span className="flex-1 truncate">{i + 1}. {q.text}</span><button className="btn-ghost !px-2 !py-1" onClick={() => setQs(qs.filter((x) => x.id !== q.id))} aria-label={tr('Remove', 'हटाएँ')}>✕</button></li>)}</ul>}
      <ErrorLine text={err} />
      <div className="grid grid-cols-2 gap-2"><button className="btn-primary" onClick={save}>{tr('Save test', 'टेस्ट सहेजें')}</button><button className="btn-ghost" onClick={exportJson} disabled={qs.length === 0}>{copied ? '✓ ' + tr('Copied', 'कॉपी') : '📤 ' + tr('Copy JSON', 'JSON कॉपी')}</button></div>
      <InfoBox title={tr('Note', 'ध्यान दें')}><p>{tr('Tests you create stay on this phone and are scored on this phone. “Copy JSON” gives the app owner a ready entry to publish it for everyone (see PUBLISHING.md).', 'आपके बनाए टेस्ट इसी फ़ोन में रहते हैं और यहीं स्कोर होते हैं। “JSON कॉपी” से ऐप मालिक इसे सबके लिए प्रकाशित कर सकता है (PUBLISHING.md देखें)।')}</p></InfoBox>
    </div>
  );
}
