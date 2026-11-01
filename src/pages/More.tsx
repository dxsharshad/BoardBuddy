import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t, type Key } from '../lib/i18n';
import { Page } from '../components/ui';

const items: { to: string; icon: string; label: Key }[] = [
  { to: '/planner', icon: '🗓️', label: 'planner' },
  { to: '/progress', icon: '📈', label: 'progress' },
  { to: '/doubt', icon: '🤖', label: 'doubt' },
  { to: '/flashcards', icon: '🃏', label: 'flashcards' },
  { to: '/pyq', icon: '📄', label: 'pyq' },
  { to: '/formulas', icon: '🧮', label: 'formulaSheet' },
  { to: '/bookmarks', icon: '⭐', label: 'bookmarks' },
  { to: '/search', icon: '🔍', label: 'search' },
  { to: '/teacher-notes', icon: '📚', label: 'teacherNotes' },
  { to: '/my-notes', icon: '🗂️', label: 'myNotes' },
  { to: '/connect', icon: '🔗', label: 'connect' },
  { to: '/settings', icon: '⚙️', label: 'settings' },
];

export default function More() {
  const { s } = useStore();
  return (
    <Page title={t('more', s.lang)}>
      <div className="partition-label">{s.lang === 'hi' ? 'मेरी लाइब्रेरी' : 'My Library'}</div>
      <Link to="/my-notes" className="card flex items-center gap-4 hover:shadow-md transition">
        <span className="icon-glass icon-glass-lg is-active" aria-hidden>📁</span>
        <span className="flex-1 min-w-0">
          <span className="block font-bold">{s.lang === 'hi' ? 'PDF और फ़ाइलें जोड़ें' : 'Add PDFs & files'}</span>
          <span className="block text-xs muted">{s.lang === 'hi' ? 'PDF, फ़ोटो, Word, PowerPoint, Excel — सिर्फ़ आपके फ़ोन में' : 'PDF, photos, Word, PowerPoint, Excel — stored only on your phone'}</span>
        </span>
        <span aria-hidden>＋</span>
      </Link>
      <div className="partition-label">{s.lang === 'hi' ? 'सब कुछ' : 'Everything'}</div>
      <div className="grid grid-cols-2 gap-3">
        {items.filter((i) => i.to !== '/my-notes').map((i) => (
          <Link key={i.to} to={i.to} className="card flex flex-col items-center justify-center gap-2 py-6 hover:shadow-md transition text-center">
            <span className="icon-glass icon-glass-lg" aria-hidden>{i.icon}</span>
            <span className="font-semibold">{t(i.label, s.lang)}</span>
          </Link>
        ))}
      </div>
      <p className="text-center text-sm muted">{s.lang === 'hi' ? 'निर्माता: अरशद कमाल' : 'Made by Arshad Kamal'}</p>
    </Page>
  );
}
