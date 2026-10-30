import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { chapterById, subjectById } from '../data/subjects';
import { BookmarkBtn, Empty, Page, SampleBanner } from '../components/ui';
import { tx } from '../lib/utils';

export default function ChapterPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { s, toggleComplete, setLastChapter } = useStore();
  const ch = id ? chapterById(id) : undefined;

  useEffect(() => {
    if (ch) setLastChapter(ch.id);
  }, [ch?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ch) return <Empty text="Chapter not found" icon="🔎" action={<Link className="btn-primary" to="/subjects">{t('subjects', s.lang)}</Link>} />;
  const sub = subjectById(ch.subjectId)!;
  const done = !!s.completed[ch.id];
  const L = s.lang;

  return (
    <Page title={tx(ch.title, L)} back={() => nav(`/subject/${sub.id}`)} right={<BookmarkBtn k={`ch:${ch.id}`} />}>
      {ch.status === 'sample' && <SampleBanner />}

      <Section title={t('notes', L)}>
        <div className="space-y-3 leading-relaxed">
          {ch.notes.map((n, i) => <p key={i}>{tx(n, L)}</p>)}
        </div>
      </Section>

      {ch.definitions.length > 0 && (
        <Section title={t('definitions', L)}>
          <dl className="space-y-3">
            {ch.definitions.map((d, i) => (
              <div key={i}>
                <dt className="font-semibold">{tx(d.term, L)}</dt>
                <dd className="muted">{tx(d.meaning, L)}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {ch.formulas.length > 0 && (
        <Section title={t('formulas', L)}>
          <ul className="space-y-2">
            {ch.formulas.map((f, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-slate-800 p-3">
                <div className="flex-1">
                  <p className="text-sm muted">{tx(f.name, L)}</p>
                  <p className="font-mono font-semibold break-words">{f.expr}</p>
                </div>
                <BookmarkBtn k={`f:${ch.id}:${i}`} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t('keyPoints', L)}>
        <ul className="list-disc pl-5 space-y-1">
          {ch.keyPoints.map((k, i) => <li key={i}>{tx(k, L)}</li>)}
        </ul>
      </Section>

      <Section title={t('important', L)}>
        <ul className="space-y-2">
          {ch.important.map((q, i) => (
            <li key={i} className="flex items-start gap-1">
              <span className="flex-1">{i + 1}. {tx(q, L)}</span>
              <BookmarkBtn k={`iq:${ch.id}:${i}`} />
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid grid-cols-2 gap-2">
        <Link to={`/quiz?chapter=${ch.id}`} className="btn-primary">📝 {t('takeQuiz', L)}</Link>
        <Link to={`/flashcards?chapter=${ch.id}`} className="btn-ghost">🃏 {t('flashcards', L)}</Link>
      </div>
      <button className={done ? 'btn-ghost w-full' : 'btn-primary w-full'} onClick={() => toggleComplete(ch.id)} aria-pressed={done}>
        {done ? `✅ ${t('completed', L)}` : t('markDone', L)}
      </button>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <h2 className="h2 mb-2">{title}</h2>
      {children}
    </div>
  );
}
