import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { allChapters, subjects } from '../data/subjects';
import { Empty, Page } from '../components/ui';
import { cx, tx } from '../lib/utils';

type Kind = 'chapter' | 'note' | 'formula' | 'question';
interface Hit { kind: Kind; chapterId: string; subjectId: string; title: string; text: string }

export default function Search() {
  const { s } = useStore();
  const L = s.lang;
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<'all' | Kind>('all');
  const [subject, setSubject] = useState('');

  // Build the index once per language
  const index = useMemo<Hit[]>(() => {
    const out: Hit[] = [];
    for (const c of allChapters) {
      const base = { chapterId: c.id, subjectId: c.subjectId, title: tx(c.title, L) };
      out.push({ ...base, kind: 'chapter', text: tx(c.title, L) });
      c.notes.forEach((n) => out.push({ ...base, kind: 'note', text: tx(n, L) }));
      c.keyPoints.forEach((n) => out.push({ ...base, kind: 'note', text: tx(n, L) }));
      c.definitions.forEach((d) => out.push({ ...base, kind: 'note', text: `${tx(d.term, L)} – ${tx(d.meaning, L)}` }));
      c.formulas.forEach((f) => out.push({ ...base, kind: 'formula', text: `${tx(f.name, L)}: ${f.expr}` }));
      c.important.forEach((n) => out.push({ ...base, kind: 'question', text: tx(n, L) }));
      c.mcqs.forEach((m) => out.push({ ...base, kind: 'question', text: tx(m.q, L) }));
    }
    return out;
  }, [L]);

  const term = q.trim().toLowerCase();
  const results = term.length < 2 ? [] : index.filter((h) => (kind === 'all' || h.kind === kind) && (!subject || h.subjectId === subject) && h.text.toLowerCase().includes(term)).slice(0, 50);

  const kinds: { k: 'all' | Kind; label: string }[] = [
    { k: 'all', label: t('all', L) },
    { k: 'chapter', label: t('chapter', L) },
    { k: 'note', label: t('notes', L) },
    { k: 'formula', label: t('formulas', L) },
    { k: 'question', label: t('questions', L) },
  ];

  return (
    <Page title={t('search', L)}>
      <input className="input" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder', L)} aria-label={t('search', L)} />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {kinds.map((x) => (
          <button key={x.k} onClick={() => setKind(x.k)} className={cx('chip whitespace-nowrap min-h-[36px]', kind === x.k && '!bg-brand-600 !text-white')}>{x.label}</button>
        ))}
      </div>
      <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={t('subjects', L)}>
        <option value="">{t('all', L)} – {t('subjects', L)}</option>
        {subjects.map((x) => <option key={x.id} value={x.id}>{tx(x.name, L)}</option>)}
      </select>

      {term.length < 2 ? (
        <Empty icon="🔍" text={t('searchPlaceholder', L)} />
      ) : results.length === 0 ? (
        <Empty icon="🤷" text={t('noResults', L)} />
      ) : (
        <ul className="space-y-2">
          {results.map((h, i) => (
            <li key={i}>
              <Link to={`/chapter/${h.chapterId}`} className="card block hover:shadow-md transition">
                <p className="text-xs muted">{h.title} · {kinds.find((k) => k.k === h.kind)?.label}</p>
                <p className="mt-1">{h.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
