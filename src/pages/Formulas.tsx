import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { subjects } from '../data/subjects';
import { BookmarkBtn, Empty, Page } from '../components/ui';
import { tx } from '../lib/utils';

/** Formula sheet for Mathematics and Science (any subject with formulas shows up). */
export default function Formulas() {
  const { s } = useStore();
  const L = s.lang;
  const withFormulas = subjects.filter((sub) => sub.chapters.some((c) => c.formulas.length > 0) && ['math', 'science'].includes(sub.id));
  return (
    <Page title={t('formulaSheet', L)}>
      {withFormulas.length === 0 && <Empty text={t('empty', L)} />}
      {withFormulas.map((sub) => (
        <div key={sub.id} className="space-y-3">
          <h2 className="h2">{sub.emoji} {tx(sub.name, L)}</h2>
          {sub.chapters.filter((c) => c.formulas.length > 0).map((c) => (
            <div key={c.id} className="card">
              <p className="font-semibold mb-2">{tx(c.title, L)}</p>
              <ul className="space-y-2">
                {c.formulas.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-xl bg-brand-50 dark:bg-slate-800 p-3">
                    <div className="flex-1">
                      <p className="text-sm muted">{tx(f.name, L)}</p>
                      <p className="font-mono font-semibold break-words">{f.expr}</p>
                    </div>
                    <BookmarkBtn k={`f:${c.id}:${i}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </Page>
  );
}
