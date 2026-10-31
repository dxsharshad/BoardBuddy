import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { QUOTES, t } from '../lib/i18n';
import { chapterById, subjects } from '../data/subjects';
import { Empty, ProgressBar, Ring } from '../components/ui';
import { overallProgress, subjectProgress } from '../lib/progress';
import { dateKey, pct, tx } from '../lib/utils';

export default function Dashboard() {
  const { s, streak, todayMinutes, todayAppSeconds } = useStore();
  const goalPct = Math.min(100, pct(todayMinutes, s.dailyGoalMin));
  const overall = overallProgress(subjects, s);
  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const today = dateKey();
  const todayTasks = s.tasks.filter((x) => x.date === today);
  const last = s.lastChapter ? chapterById(s.lastChapter) : undefined;
  const nextChapter = last ?? subjects.flatMap((x) => x.chapters).find((c) => !s.completed[c.id]);

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Hero */}
      <div className="rounded-3xl p-5 text-white bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 shadow-lg">
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
        </div>
        {nextChapter && <p className="mt-2 text-sm opacity-90">{tx(nextChapter.title, s.lang)}</p>}
        <p className="mt-3 text-xs opacity-80">{s.lang === 'hi' ? 'लक्ष्य में केवल रिकॉर्ड किया गया क्विज़/प्रैक्टिस समय गिना जाता है। प्लानर समय और ऐप खुला रहने का समय अलग हैं।' : 'Only recorded quiz/practice time counts toward this goal. Planner time and app-open time are separate.'}</p>
      </div>

      {/* Actual foreground time is deliberately separate from the study goal and planner. */}
      <div className="card glass-card">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 dark:bg-slate-800 p-3 text-2xl" aria-hidden>⏱️</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold">{s.lang === 'hi' ? 'आज ऐप खुला रहने का समय' : 'App open today'}</h2>
            <p className="text-2xl font-extrabold tabular-nums">{Math.floor(todayAppSeconds / 3600) > 0 ? `${Math.floor(todayAppSeconds / 3600)}h ` : ''}{Math.floor((todayAppSeconds % 3600) / 60)}m</p>
            <p className="text-xs muted">{s.lang === 'hi' ? 'केवल foreground समय का अनुमान; पढ़ाई का प्रमाण नहीं।' : 'Estimated foreground time only; not proof of studying.'}</p>
          </div>
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
                <div className="text-2xl" aria-hidden>{sub.emoji}</div>
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

      <blockquote className="rounded-2xl p-4 bg-accent-50 dark:bg-slate-900 border-l-4 border-accent-500 italic">
        “{quote[s.lang]}”
      </blockquote>
    </div>
  );
}
