import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { allChapters, chapterById } from '../data/subjects';
import { BookmarkBtn, Empty, Page } from '../components/ui';
import { tx } from '../lib/utils';

export default function Bookmarks() {
  const { s } = useStore();
  const L = s.lang;

  // Resolve every bookmark key into something displayable; silently drop keys whose content was removed.
  const items = s.bookmarks
    .map((k) => {
      const [type, a, b] = k.split(':');
      if (type === 'ch') {
        const c = chapterById(a);
        return c && { k, kind: t('chapter', L), text: tx(c.title, L), link: `/chapter/${c.id}`, sub: '' };
      }
      if (type === 'f') {
        const c = chapterById(a);
        const f = c?.formulas[Number(b)];
        return c && f && { k, kind: t('formulas', L), text: `${tx(f.name, L)}: ${f.expr}`, link: `/chapter/${c.id}`, sub: tx(c.title, L) };
      }
      if (type === 'iq') {
        const c = chapterById(a);
        const q = c?.important[Number(b)];
        return c && q && { k, kind: t('important', L), text: tx(q, L), link: `/chapter/${c.id}`, sub: tx(c.title, L) };
      }
      if (type === 'card') {
        for (const c of allChapters) {
          const cd = c.cards.find((x) => x.id === a);
          if (cd) return { k, kind: t('flashcards', L), text: `${tx(cd.q, L)} → ${tx(cd.a, L)}`, link: `/flashcards?chapter=${c.id}`, sub: tx(c.title, L) };
        }
      }
      return null;
    })
    .filter(Boolean) as { k: string; kind: string; text: string; link: string; sub: string }[];

  // Quick revision = bookmarked formulas gathered in one place
  const formulaItems = items.filter((i) => i.kind === t('formulas', L));

  return (
    <Page title={t('bookmarks', L)}>
      <Link to="/quiz?retry=1" className="btn-primary w-full">🔁 {t('reviseWrong', L)} ({s.wrongIds.length})</Link>

      {items.length === 0 ? (
        <Empty icon="⭐" text={t('empty', L)} />
      ) : (
        <>
          {formulaItems.length > 0 && (
            <div className="card">
              <h2 className="h2 mb-2">⚡ {t('quickRevision', L)}</h2>
              <ul className="space-y-1 font-mono text-sm">
                {formulaItems.map((i) => <li key={i.k}>{i.text}</li>)}
              </ul>
            </div>
          )}
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.k} className="card flex items-start gap-2">
                <Link to={i.link} className="flex-1 min-w-0">
                  <p className="text-xs muted">{i.kind}{i.sub ? ` · ${i.sub}` : ''}</p>
                  <p className="break-words">{i.text}</p>
                </Link>
                <BookmarkBtn k={i.k} />
              </li>
            ))}
          </ul>
        </>
      )}
    </Page>
  );
}
