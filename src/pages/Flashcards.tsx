import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { allChapters, chapterById, subjectById } from '../data/subjects';
import { BookmarkBtn, Empty, Page } from '../components/ui';
import { cx, tx } from '../lib/utils';

export default function Flashcards() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { s, setCardStatus } = useStore();
  const L = s.lang;
  const chapterId = params.get('chapter') ?? '';
  const subjectId = params.get('subject') ?? '';

  const [revisionOnly, setRevisionOnly] = useState(false);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const chapters = useMemo(() => {
    if (chapterId) return allChapters.filter((c) => c.id === chapterId);
    if (subjectId) return allChapters.filter((c) => c.subjectId === subjectId);
    return allChapters;
  }, [chapterId, subjectId]);

  const cards = useMemo(() => {
    const all = chapters.flatMap((c) => c.cards.map((cd) => ({ ...cd, chapterId: c.id })));
    return revisionOnly ? all.filter((cd) => s.cardStatus[cd.id] !== 'known') : all;
  }, [chapters, revisionOnly, s.cardStatus]);

  useEffect(() => {
    setI(0);
    setFlipped(false);
  }, [chapterId, subjectId, revisionOnly]);

  const idx = Math.min(i, Math.max(0, cards.length - 1));
  const card = cards[idx];
  const go = (d: number) => {
    setFlipped(false);
    setI((x) => Math.min(cards.length - 1, Math.max(0, x + d)));
  };

  const title = chapterId ? tx(chapterById(chapterId)?.title, L) : subjectId ? tx(subjectById(subjectId)?.name, L) : t('flashcards', L);
  const known = cards.filter((c) => s.cardStatus[c.id] === 'known').length;

  return (
    <Page title={title} back={() => nav(-1)}>
      <div className="flex gap-2 items-center">
        <select
          className="input"
          aria-label={t('chapter', L)}
          value={chapterId}
          onChange={(e) => setParams(e.target.value ? { chapter: e.target.value } : {})}
        >
          <option value="">{t('all', L)}</option>
          {allChapters.map((c) => <option key={c.id} value={c.id}>{tx(c.title, L)}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-3 min-h-[44px]">
        <input type="checkbox" className="w-5 h-5" checked={revisionOnly} onChange={(e) => setRevisionOnly(e.target.checked)} />
        <span>{t('revisionMode', L)}</span>
      </label>

      {!card ? (
        <Empty icon={revisionOnly ? '🎉' : '🃏'} text={revisionOnly ? t('noWrong', L) : t('empty', L)} />
      ) : (
        <>
          <p className="text-sm muted text-center">{idx + 1} / {cards.length} · ✅ {known}</p>
          <div className="flip-scene h-56">
            <div
              className={cx('flip-card h-full w-full cursor-pointer', flipped && 'flipped')}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label={t('flip', L)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
            >
              <div className="flip-face card flex flex-col items-center justify-center text-center bg-gradient-to-br from-brand-50 to-accent-50 dark:from-slate-900 dark:to-slate-900">
                <p className="text-xl font-semibold">{tx(card.q, L)}</p>
                <p className="text-xs muted mt-3">{t('flip', L)}</p>
              </div>
              <div className="flip-face flip-back card flex items-center justify-center text-center bg-gradient-to-br from-accent-500 to-brand-600 text-white border-0">
                <p className="text-xl font-semibold">{tx(card.a, L)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => go(-1)} disabled={idx === 0} aria-label={t('prev', L)}>←</button>
              <button className="btn-ghost" onClick={() => go(1)} disabled={idx >= cards.length - 1} aria-label={t('next', L)}>→</button>
            </div>
            <BookmarkBtn k={`card:${card.id}`} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={cx('btn', s.cardStatus[card.id] === 'revise' ? 'bg-amber-500 text-white' : 'btn-ghost')}
              onClick={() => { setCardStatus(card.id, 'revise'); if (idx < cards.length - 1) go(1); }}
            >
              🔁 {t('needsRevision', L)}
            </button>
            <button
              className={cx('btn', s.cardStatus[card.id] === 'known' ? 'bg-green-600 text-white' : 'btn-ghost')}
              onClick={() => { setCardStatus(card.id, 'known'); if (idx < cards.length - 1) go(1); }}
            >
              ✅ {t('known', L)}
            </button>
          </div>
        </>
      )}
    </Page>
  );
}
