import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { t, type Key } from '../lib/i18n';
import { cx } from '../lib/utils';

const tabs: { to: string; icon: string; label: Key }[] = [
  { to: '/', icon: '🏠', label: 'home' },
  { to: '/subjects', icon: '📚', label: 'subjects' },
  { to: '/practice', icon: '✏️', label: 'practice' },
  { to: '/planner', icon: '🗓️', label: 'planner' },
  { to: '/more', icon: '☰', label: 'more' },
];

export default function Layout() {
  const { s, setTheme, setLang } = useStore();
  const { pathname } = useLocation();
  // NOTE: braces matter. Recent Chrome returns a Promise from scrollTo(); returning it from an effect crashes React.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen md:flex">
      {/* Side navigation on tablets / desktops */}
      <aside className="hidden md:flex md:w-56 lg:w-64 shrink-0 flex-col gap-1 p-4 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        <Logo />
        {tabs.map((tb) => (
          <NavLink
            key={tb.to}
            to={tb.to}
            end={tb.to === '/'}
            className={({ isActive }) =>
              cx('flex items-center gap-3 rounded-xl px-3 py-3 font-medium', isActive ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-200' : 'hover:bg-slate-100 dark:hover:bg-slate-900')
            }
          >
            <span aria-hidden>{tb.icon}</span> {t(tb.label, s.lang)}
          </NavLink>
        ))}
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <div className="md:hidden"><Logo /></div>
          <div className="flex-1" />
          <Link to="/search" className="btn-ghost !px-3" aria-label={t('search', s.lang)}>🔍</Link>
          <button className="btn-ghost !px-3 text-sm" onClick={() => setLang(s.lang === 'en' ? 'hi' : 'en')} aria-label={t('language', s.lang)}>
            {s.lang === 'en' ? 'हिं' : 'EN'}
          </button>
          <button className="btn-ghost !px-3" onClick={() => setTheme(s.theme === 'dark' ? 'light' : 'dark')} aria-label={t('darkMode', s.lang)}>
            {s.theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        <main className="max-w-3xl mx-auto p-4 pb-28 md:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation on phones */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]" aria-label="Main">
        {tabs.map((tb) => (
          <NavLink
            key={tb.to}
            to={tb.to}
            end={tb.to === '/'}
            className={({ isActive }) =>
              cx('flex flex-col items-center py-2 text-xs font-medium min-h-[56px] justify-center', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500')
            }
          >
            <span className="text-xl" aria-hidden>{tb.icon}</span>
            {t(tb.label, s.lang)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold text-lg">
      <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="w-8 h-8 rounded-lg" />
      <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">BoardBuddy</span>
    </Link>
  );
}
