import { useState } from 'react';
import { fmtUsage, useUsageTotals } from '../lib/useUsage';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { subjects } from '../data/subjects';
import { BarChart, Page, ProgressBar, Ring } from '../components/ui';
import { accuracyFor, overallProgress, subjectProgress } from '../lib/progress';
import { addDays, dateKey, pct, tx } from '../lib/utils';

export default function Progress() {
  const { s, streak, todayMinutes, resetAll } = useStore();
  const L = s.lang;
  const [confirming, setConfirming] = useState(false);
  const overall = overallProgress(subjects, s);
  const totalQ = s.quizHistory.reduce((n, r) => n + r.total, 0);
  const totalRight = s.quizHistory.reduce((n, r) => n + r.correct, 0);

  const usage = useUsageTotals();
  const today = dateKey();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    return { label: new Date(d + 'T00:00:00').toLocaleDateString(L === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' }), value: s.minutesByDate[d] ?? 0 };
  });

  return (
    <Page title={t('progress', L)}>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="card"><p className="text-2xl font-bold">{overall.percent}%</p><p className="text-xs muted">{t('chapters', L)}</p></div>
        <div className="card"><p className="text-2xl font-bold">🔥 {streak}</p><p className="text-xs muted">{t('streak', L)}</p></div>
        <div className="card"><p className="text-2xl font-bold">{pct(totalRight, totalQ)}%</p><p className="text-xs muted">{t('accuracy', L)}</p></div>
      </div>

      <div className="card flex items-center gap-4">
        <div className="text-white bg-gradient-to-br from-brand-600 to-accent-600 rounded-full p-1">
          <Ring value={Math.min(100, pct(todayMinutes, s.dailyGoalMin))} size={76} />
        </div>
        <div>
          <p className="font-semibold">{t('dailyGoal', L)}</p>
          <p className="muted">{todayMinutes} / {s.dailyGoalMin} {t('minutes', L)}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="h2 mb-3">{t('weekMinutes', L)}</h2>
        <BarChart data={week} />
      </div>

      <div className="card">
        <h2 className="h2 mb-1">{L === 'hi' ? 'ऐप खुले रहने का समय' : 'Time app was open'}</h2>
        <p className="text-xs muted mb-3">{L === 'hi' ? 'सिर्फ़ वह समय जब BoardBuddy स्क्रीन पर खुला था (मिनट)। यह पढ़ाई का समय नहीं है।' : 'Only time BoardBuddy was open on screen (minutes). This is not study time.'}</p>
        <BarChart data={week.map((w, i) => ({ label: w.label, value: Math.round((usage[addDays(today, i - 6)] ?? 0) / 60000) }))} />
        <p className="text-sm mt-2">{L === 'hi' ? 'आज' : 'Today'}: {fmtUsage(usage[today] ?? 0, L)}</p>
      </div>

      <div className="card space-y-4">
        <h2 className="h2">{t('subjectProgress', L)}</h2>
        {subjects.map((sub) => {
          const p = subjectProgress(sub, s);
          const acc = accuracyFor((sc) => sc === sub.id || sub.chapters.some((c) => c.id === sc), s);
          return (
            <div key={sub.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{sub.emoji} {tx(sub.name, L)}</span>
                <span className="muted">{p.done}/{p.total} · {t('accuracy', L)} {acc.attempts ? `${acc.percent}%` : '—'}</span>
              </div>
              <ProgressBar value={p.percent} color={sub.color} label={tx(sub.name, L)} />
            </div>
          );
        })}
      </div>

      <div className="card space-y-2">
        {!confirming ? (
          <button className="btn-ghost w-full text-red-600" onClick={() => setConfirming(true)}>{t('resetProgress', L)}</button>
        ) : (
          <>
            <p role="alert">{t('resetConfirm', L)}</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-ghost" onClick={() => setConfirming(false)}>{t('cancel', L)}</button>
              <button className="btn-danger" onClick={() => { resetAll(); setConfirming(false); }}>{t('resetProgress', L)}</button>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
