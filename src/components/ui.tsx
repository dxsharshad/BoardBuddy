import type { ReactNode } from 'react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { cx } from '../lib/utils';

export function ProgressBar({ value, color = '#2563eb', label }: { value: number; color?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: color }} />
    </div>
  );
}

export function Ring({ value, size = 84, children }: { value: number; size?: number; children?: ReactNode }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="9" className="stroke-white/30" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke="url(#ringg)"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          style={{ transition: 'stroke-dashoffset .6s' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold">{children ?? `${v}%`}</div>
    </div>
  );
}

export function Empty({ text, icon = '📭', action }: { text: string; icon?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-10 px-4 muted">
      <div className="text-4xl mb-2" aria-hidden>{icon}</div>
      <p>{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Page({ title, children, back, right }: { title: string; children: ReactNode; back?: () => void; right?: ReactNode }) {
  const { s } = useStore();
  return (
    <section className="animate-fadeUp space-y-4">
      <div className="flex items-center gap-2">
        {back && (
          <button onClick={back} className="btn-ghost !px-3" aria-label={t('back', s.lang)}>
            ←
          </button>
        )}
        <h1 className="h1 flex-1">{title}</h1>
        {right}
      </div>
      {children}
    </section>
  );
}

export function SampleBanner() {
  const { s } = useStore();
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800 p-3 text-sm" role="note">
      ⚠️ {t('sampleBanner', s.lang)}
    </div>
  );
}

export function BookmarkBtn({ k }: { k: string }) {
  const { s, toggleBookmark, isBookmarked } = useStore();
  const on = isBookmarked(k);
  return (
    <button
      onClick={() => toggleBookmark(k)}
      aria-pressed={on}
      aria-label={t(on ? 'bookmarked' : 'bookmark', s.lang)}
      className={cx('rounded-lg px-2 py-1 text-xl min-w-[44px] min-h-[44px]', on ? 'text-amber-500' : 'text-slate-400')}
    >
      {on ? '★' : '☆'}
    </button>
  );
}

/** Simple SVG bar chart – no chart library so the app stays light on low-end phones. */
export function BarChart({ data, unit = '' }: { data: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-36" role="img" aria-label="bar chart">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
          <span className="text-xs muted mb-1">{d.value > 0 ? `${d.value}${unit}` : ''}</span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-accent-400 transition-all duration-500"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 6 : 2, opacity: d.value > 0 ? 1 : 0.25 }}
          />
          <span className="text-xs mt-1 muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
