import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { subjects } from '../data/subjects';
import { Empty, Page } from '../components/ui';
import { bestScore } from '../lib/progress';
import { pct, tx } from '../lib/utils';

export default function Practice() {
  const { s } = useStore();
  const L = s.lang;
  return (
    <Page title={t('practice', L)}>
      <Link to="/quiz?retry=1" className="card flex items-center gap-3 hover:shadow-md transition">
        <span className="text-3xl" aria-hidden>🔁</span>
        <div className="flex-1">
          <p className="font-bold">{t('reviseWrong', L)}</p>
          <p className="text-sm muted">{s.wrongIds.length} {t('questions', L).toLowerCase()}</p>
        </div>
      </Link>

      {subjects.map((sub) => (
        <div key={sub.id} className="card space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="h2">{sub.emoji} {tx(sub.name, L)}</h2>
            <Link to={`/quiz?subject=${sub.id}`} className="btn-primary !py-2 text-sm">{t('subjectTest', L)}</Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {sub.chapters.map((c) => {
              const best = bestScore(c.id, s);
              return (
                <li key={c.id}>
                  <Link to={`/quiz?chapter=${c.id}`} className="flex items-center justify-between gap-2 py-3 min-h-[44px]">
                    <span>{tx(c.title, L)}</span>
                    <span className="chip">{best === null ? `${c.mcqs.length} Q` : `${t('bestScore', L)} ${best}%`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="card">
        <h2 className="h2 mb-2">{t('history', L)}</h2>
        {s.quizHistory.length === 0 ? (
          <Empty icon="📝" text={t('noActivity', L)} />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {s.quizHistory.slice(0, 15).map((r) => (
              <li key={r.id} className="py-2 flex justify-between gap-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.label}</span>
                  <span className="muted">{new Date(r.date).toLocaleDateString()}</span>
                </span>
                <span className="font-semibold whitespace-nowrap">{r.correct}/{r.total} · {pct(r.correct, r.total)}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  );
}
