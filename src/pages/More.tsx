import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t, type Key } from '../lib/i18n';
import { Page } from '../components/ui';

const items: { to: string; icon: string; label: Key }[] = [
  { to: '/progress', icon: '📈', label: 'progress' },
  { to: '/doubt', icon: '🤖', label: 'doubt' },
  { to: '/flashcards', icon: '🃏', label: 'flashcards' },
  { to: '/pyq', icon: '📄', label: 'pyq' },
  { to: '/formulas', icon: '🧮', label: 'formulaSheet' },
  { to: '/bookmarks', icon: '⭐', label: 'bookmarks' },
  { to: '/search', icon: '🔍', label: 'search' },
  { to: '/settings', icon: '⚙️', label: 'settings' },
  { to: '/account', icon: '👤', label: 'account' },
  { to: '/admin', icon: '🛡️', label: 'admin' },
];

export default function More() {
  const { s } = useStore();
  return (
    <Page title={t('more', s.lang)}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="card flex flex-col items-center justify-center gap-2 py-6 hover:shadow-md transition text-center">
            <span className="text-3xl" aria-hidden>{i.icon}</span>
            <span className="font-semibold">{t(i.label, s.lang)}</span>
          </Link>
        ))}
      </div>
      <p className="text-center text-sm muted">{s.lang === 'hi' ? 'निर्माता: अरशद कमाल' : 'Made by Arshad Kamal'}</p>
    </Page>
  );
}
