import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import { useTr } from '../lib/useTr';

/** Loads async data with loading / error / reload handling; ignores results that arrive after unmount. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    fnRef.current()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError((e as Error)?.message || 'Something went wrong'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((x) => x + 1), []);
  return { data, loading, error, reload, setData };
}

export function ErrorLine({ text }: { text: string }) {
  if (!text) return null;
  return <p className="text-red-600 dark:text-red-400 text-sm" role="alert">{text}</p>;
}

export function Loading() {
  return <p className="muted text-center py-6" role="status">…</p>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="block text-xs muted">{hint}</span>}
    </label>
  );
}

/** Catches a crash in one screen so navigation and the other pages keep working. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { err: Error | null; key?: string }> {
  state: { err: Error | null; key?: string } = { err: null };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  static getDerivedStateFromProps(p: { resetKey?: string }, s: { err: Error | null; key?: string }) {
    if (p.resetKey !== s.key) return { err: null, key: p.resetKey }; // navigating clears the error
    return null;
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('Screen crashed', err, info.componentStack);
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="card space-y-3 text-center">
        <p className="text-3xl" aria-hidden>😕</p>
        <p className="font-bold">Something went wrong on this screen.</p>
        <p className="text-sm muted">{this.state.err.message.slice(0, 200)}</p>
        <button className="btn-primary" onClick={() => this.setState({ err: null })}>Try again</button>
      </div>
    );
  }
}

export function InfoBox({ icon = 'ℹ️', title, children }: { icon?: string; title: string; children: ReactNode }) {
  return (
    <div className="card space-y-1">
      <p className="font-bold">{icon} {title}</p>
      <div className="text-sm muted space-y-1">{children}</div>
    </div>
  );
}

export { useTr };
