import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { Page } from '../components/ui';
import { allChapters } from '../data/subjects';
import { tx } from '../lib/utils';

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

type Mode = 'checking' | 'ai' | 'offline';

/** Very limited keyword lookup over the sample notes. It is NOT an AI and is labelled as such in the UI. */
function offlineHelper(q: string, lang: 'en' | 'hi') {
  const words = q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
  const hits: { title: string; text: string; score: number }[] = [];
  for (const c of allChapters) {
    const blocks: string[] = [
      ...c.notes.map((n) => tx(n, lang)),
      ...c.formulas.map((f) => `${tx(f.name, lang)}: ${f.expr}`),
      ...c.keyPoints.map((k) => tx(k, lang)),
      ...c.definitions.map((d) => `${tx(d.term, lang)} – ${tx(d.meaning, lang)}`),
    ];
    for (const b of blocks) {
      const lb = b.toLowerCase();
      const score = words.filter((w) => lb.includes(w)).length;
      if (score > 0) hits.push({ title: tx(c.title, lang), text: b, score });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 4);
}

export default function Doubt() {
  const { s, logMinutes } = useStore();
  const L = s.lang;
  const [mode, setMode] = useState<Mode>('checking');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [hits, setHits] = useState<ReturnType<typeof offlineHelper> | null>(null);
  const lastAsk = useRef(0);

  useEffect(() => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 6000); // never hang on "checking"
    fetch(`${API}/api/health`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setMode(j?.aiConfigured ? 'ai' : 'offline'))
      .catch(() => setMode('offline'))
      .finally(() => clearTimeout(to));
    return () => { clearTimeout(to); ctrl.abort(); };
  }, []);

  const ask = async () => {
    const question = q.trim();
    setError('');
    setAnswer('');
    setHits(null);
    if (question.length < 3) return setError(L === 'hi' ? 'कृपया अपना प्रश्न लिखें (कम से कम 3 अक्षर)।' : 'Please type your question (at least 3 characters).');
    if (question.length > 1000) return setError(L === 'hi' ? 'प्रश्न 1000 अक्षरों से छोटा रखें।' : 'Keep the question under 1000 characters.');

    if (mode !== 'ai') {
      setHits(offlineHelper(question, L));
      return;
    }
    // small client-side cooldown (the server has its own rate limit too)
    if (Date.now() - lastAsk.current < 3000) return setError(L === 'hi' ? 'कृपया कुछ सेकंड रुककर फिर पूछें।' : 'Please wait a few seconds before asking again.');
    lastAsk.current = Date.now();
    setLoading(true);
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 30000);
    try {
      const r = await fetch(`${API}/api/doubt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang: L }),
        signal: ctrl.signal,
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) throw new Error(L === 'hi' ? 'बहुत ज़्यादा अनुरोध। एक मिनट बाद फिर कोशिश करें।' : 'Too many requests. Please try again in a minute.');
      if (!r.ok) throw new Error(j?.error || `Server error (${r.status})`);
      setAnswer(j.answer);
      logMinutes(2);
    } catch (e) {
      const aborted = (e as Error).name === 'AbortError';
      setError(aborted ? (L === 'hi' ? 'जवाब आने में बहुत समय लगा। फिर कोशिश करें।' : 'The answer took too long. Please try again.') : (e as Error).message || 'Something went wrong. Please try again.');
    } finally {
      clearTimeout(to);
      setLoading(false);
    }
  };

  return (
    <Page title={t('doubt', L)}>
      {mode === 'checking' && <p className="muted">…</p>}
      {mode === 'offline' && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 p-3 text-sm" role="note">
          <p className="font-semibold">{L === 'hi' ? 'AI सहायक अभी चालू नहीं है' : 'AI doubt solver is not set up'}</p>
          <p>
            {L === 'hi'
              ? 'AI उत्तर के लिए बैकएंड सर्वर चालू करें और उसमें API कुंजी डालें (README देखें)। तब तक नीचे केवल एक सीमित "ऑफ़लाइन खोज" है जो ऐप के नमूना नोट्स से मिलते-जुलते अंश दिखाती है। यह AI नहीं है और प्रश्न हल नहीं करती।'
              : 'To get real AI answers, run the backend server and add your API key (see README). Until then, a very limited offline search shows matching snippets from the sample notes. It is not AI and does not solve problems.'}
          </p>
        </div>
      )}

      <div className="card space-y-3">
        <label htmlFor="q" className="font-semibold">{t('doubt', L)}</label>
        <textarea
          id="q"
          className="input min-h-[110px]"
          placeholder={t('doubtPlaceholder', L)}
          value={q}
          maxLength={1000}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary w-full" onClick={ask} disabled={loading || mode === 'checking'}>
          {loading ? t('thinking', L) : mode === 'ai' ? `🤖 ${t('ask', L)}` : `🔎 ${L === 'hi' ? 'नोट्स में खोजें' : 'Search notes'}`}
        </button>
        {error && (
          <div className="space-y-2" role="alert">
            <p className="text-red-600 text-sm">{error}</p>
            {mode === 'ai' && q.trim().length >= 3 && (
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-ghost !py-2" onClick={() => { lastAsk.current = 0; void ask(); }}>↻ {L === 'hi' ? 'फिर कोशिश करें' : 'Retry'}</button>
                <button className="btn-ghost !py-2" onClick={() => { setError(''); setHits(offlineHelper(q.trim(), L)); }}>🔎 {L === 'hi' ? 'ऑफ़लाइन खोज' : 'Offline search'}</button>
              </div>
            )}
          </div>
        )}
      </div>

      {answer && (
        <div className="card animate-fadeUp">
          <p className="chip mb-2">🤖 AI</p>
          <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>
          <p className="text-xs muted mt-3">
            {L === 'hi' ? 'AI से गलती हो सकती है। महत्वपूर्ण उत्तर अपनी पाठ्यपुस्तक/शिक्षक से जाँचें।' : 'AI can make mistakes. Verify important answers with your textbook or teacher.'}
          </p>
        </div>
      )}

      {hits && (
        <div className="card animate-fadeUp space-y-3">
          <p className="chip">{L === 'hi' ? 'ऑफ़लाइन नमूना खोज (AI नहीं)' : 'Offline sample search (not AI)'}</p>
          {hits.length === 0 ? (
            <p className="muted">{t('noResults', L)}</p>
          ) : (
            hits.map((h, i) => (
              <div key={i}>
                <p className="text-sm font-semibold">{h.title}</p>
                <p>{h.text}</p>
              </div>
            ))
          )}
        </div>
      )}
    </Page>
  );
}
