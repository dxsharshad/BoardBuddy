import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { QUOTES, t } from '../lib/i18n';
import { chapterById, subjects } from '../data/subjects';
import { Empty, ProgressBar, Ring } from '../components/ui';
import { fmtUsage, useTodayUsageMs } from '../lib/useUsage';
import { useLoad } from '../components/common';
import { loadPublishedNotes, loadPublishedTests } from '../lib/published';
import { overallProgress, subjectProgress } from '../lib/progress';
import { dateKey, pct, tx } from '../lib/utils';

export default function Dashboard() {
  const { s, streak, todayMinutes, logMinutes } = useStore();
  const L = s.lang;
  const goalPct = Math.min(100, pct(todayMinutes, s.dailyGoalMin));
  const overall = overallProgress(subjects, s);
  // same quote all day, changes at local midnight, cycles through the whole list
  const dayNo = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime() / 86400000);
  const quote = QUOTES[dayNo % QUOTES.length];
  const openMs = useTodayUsageMs();
  const notes = useLoad(loadPublishedNotes, []);
  const tests = useLoad(loadPublishedTests, []);
  const recentNotes = (notes.data?.notes ?? []).slice(0, 3);
  const testCount = tests.data?.tests.length ?? 0;
  const today = dateKey();
  const todayTasks = s.tasks.filter((x) => x.date === today);
  const last = s.lastChapter ? chapterById(s.lastChapter) : undefined;
  const nextChapter = last ?? subjects.flatMap((x) => x.chapters).find((c) => !s.completed[c.id]);

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Hero */}
      <div className="rounded-3xl p-5 text-white bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 shadow-lg border border-white/30">
        <p className="opacity-90">{t('welcome', s.lang)}</p>
        <h1 className="text-2xl font-extrabold">{s.name || t('student', s.lang)} 👋</h1>
        <div className="mt-4 flex items-center gap-4">
          <Ring value={goalPct} />
          <div className="flex-1">
            <p className="font-semibold">{t('dailyGoal', s.lang)}</p>
            <p className="text-sm opacity-90">
              {todayMinutes} / {s.dailyGoalMin} {t('minutes', s.lang)}
            </p>
            <p className="text-sm mt-1">🔥 {streak} {t('streak', s.lang)}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {nextChapter && (
            <Link to={`/chapter/${nextChapter.id}`} className="btn bg-white text-brand-700 flex-1">
              ▶ {t(last ? 'continueLearning' : 'startLearning', s.lang)}
            </Link>
          )}
          <button className="btn bg-white/20 text-white" onClick={() => logMinutes(10)}>
            {t('addTen', s.lang)}
          </button>
        </div>
        {nextChapter && <p className="mt-2 text-sm opacity-90">{tx(nextChapter.title, s.lang)}</p>}
      </div>

      {/* App-open time: separate from study goal on purpose */}
      <div className="card flex items-center gap-3">
        <span className="icon-glass icon-glass-lg" aria-hidden>📱</span>
        <div className="flex-1">
          <p className="font-semibold">{L === 'hi' ? 'आज ऐप खुला रहा' : 'App open today'}: {fmtUsage(openMs, L)}</p>
          <p className="text-xs muted">{L === 'hi' ? 'यह पढ़ाई का समय नहीं है; दैनिक लक्ष्य अलग गिना जाता है।' : 'This is not study time; the daily goal is counted separately.'}</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card">
        <div className="flex justify-between mb-2">
          <h2 className="h2">{t('progress', s.lang)}</h2>
          <span className="font-semibold">{overall.done}/{overall.total} {t('chapters', s.lang)}</span>
        </div>
        <ProgressBar value={overall.percent} label={t('progress', s.lang)} />
      </div>

      {/* Today's plan */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="h2">{t('todayPlan', s.lang)}</h2>
          <Link to="/planner" className="text-brand-600 text-sm font-semibold">{t('planner', s.lang)} →</Link>
        </div>
        {todayTasks.length === 0 ? (
          <p className="muted">{t('noTasksToday', s.lang)}</p>
        ) : (
          <ul className="space-y-1">
            {todayTasks.map((x) => (
              <li key={x.id} className={x.done ? 'line-through muted' : ''}>
                {x.done ? '✅' : '⬜'} {x.title} · {x.minutes} {t('minutes', s.lang)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subject progress */}
      <div>
        <h2 className="h2 mb-2">{t('subjectProgress', s.lang)}</h2>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((sub) => {
            const p = subjectProgress(sub, s);
            return (
              <Link key={sub.id} to={`/subject/${sub.id}`} className="card block hover:shadow-md transition">
                <div className="icon-glass" aria-hidden>{sub.emoji}</div>
                <p className="font-semibold mt-1">{tx(sub.name, s.lang)}</p>
                <p className="text-xs muted mb-2">{p.done}/{p.total} {t('chapters', s.lang)}</p>
                <ProgressBar value={p.percent} color={sub.color} label={tx(sub.name, s.lang)} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent quizzes */}
      <div className="card">
        <h2 className="h2 mb-2">{t('recentActivity', s.lang)}</h2>
        {s.quizHistory.length === 0 ? (
          <Empty icon="📝" text={t('noActivity', s.lang)} action={<Link to="/practice" className="btn-primary">{t('practice', s.lang)}</Link>} />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {s.quizHistory.slice(0, 4).map((r) => (
              <li key={r.id} className="py-2 flex justify-between gap-2">
                <span className="truncate">{r.label}</span>
                <span className="font-semibold">{r.correct}/{r.total} ({pct(r.correct, r.total)}%)</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link to="/teacher-notes" className="card block"><p className="icon-glass mb-1" aria-hidden>📚</p><p className="font-semibold">{L === 'hi' ? 'टीचर नोट्स' : 'Teacher Notes'}</p><p className="text-xs muted">{notes.data ? `${notes.data.notes.length} ${L === 'hi' ? 'नोट्स' : 'notes'}` : '…'}</p></Link>
        <Link to="/tests" className="card block"><p className="icon-glass mb-1" aria-hidden>📝</p><p className="font-semibold">{L === 'hi' ? 'टेस्ट सीरीज़' : 'Test Series'}</p><p className="text-xs muted">{tests.data ? `${testCount} ${L === 'hi' ? 'टीचर टेस्ट + आज का अभ्यास' : 'teacher tests + daily practice'}` : '…'}</p></Link>
      </div>
      {recentNotes.length > 0 && (
        <div className="card">
          <h2 className="h2 mb-2">{L === 'hi' ? 'नए टीचर नोट्स' : 'Recent teacher notes'}</h2>
          <ul className="space-y-1">{recentNotes.map((n) => <li key={n.id}><Link to={`/teacher-notes/${n.id}`} className="block truncate text-brand-600 font-medium">{n.title}</Link></li>)}</ul>
        </div>
      )}

      <blockquote className="rounded-2xl p-4 glass border-l-4 border-accent-500 italic">
        “{quote[s.lang]}”
      </blockquote>
    </div>
  );
}
