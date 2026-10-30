import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { subjectById } from '../data/subjects';
import { Empty, Page } from '../components/ui';
import { tx } from '../lib/utils';

export default function SubjectPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { s } = useStore();
  const sub = id ? subjectById(id) : undefined;
  if (!sub) return <Empty text="Subject not found" icon="🔎" action={<Link className="btn-primary" to="/subjects">{t('subjects', s.lang)}</Link>} />;

  return (
    <Page title={`${sub.emoji} ${tx(sub.name, s.lang)}`} back={() => nav('/subjects')}>
      <div className="flex gap-2">
        <Link to={`/quiz?subject=${sub.id}`} className="btn-primary flex-1">📝 {t('subjectTest', s.lang)}</Link>
        <Link to={`/flashcards?subject=${sub.id}`} className="btn-ghost flex-1">🃏 {t('flashcards', s.lang)}</Link>
      </div>
      {sub.chapters.length === 0 ? (
        <Empty text={t('empty', s.lang)} />
      ) : (
        <ol className="space-y-3">
          {sub.chapters.map((c, i) => (
            <li key={c.id}>
              <Link to={`/chapter/${c.id}`} className="card flex items-center gap-3 hover:shadow-md transition">
                <span className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: sub.color }}>
                  {s.completed[c.id] ? '✓' : i + 1}
                </span>
                <span className="flex-1 font-semibold">{tx(c.title, s.lang)}</span>
                {c.status === 'sample' && <span className="chip">sample</span>}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Page>
  );
}
