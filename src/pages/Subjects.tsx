import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { subjects } from '../data/subjects';
import { Page, ProgressBar } from '../components/ui';
import { subjectProgress } from '../lib/progress';
import { tx } from '../lib/utils';

export default function Subjects() {
  const { s } = useStore();
  return (
    <Page title={t('subjects', s.lang)}>
      <div className="space-y-3">
        {subjects.map((sub) => {
          const p = subjectProgress(sub, s);
          return (
            <Link key={sub.id} to={`/subject/${sub.id}`} className="card flex items-center gap-4 hover:shadow-md transition">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: sub.color + '22' }} aria-hidden>
                {sub.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{tx(sub.name, s.lang)}</p>
                <p className="text-sm muted mb-1">{p.done}/{p.total} {t('chapters', s.lang)}</p>
                <ProgressBar value={p.percent} color={sub.color} label={tx(sub.name, s.lang)} />
              </div>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
