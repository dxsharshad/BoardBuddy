import { useStore } from './store';

/** tr('English', 'हिंदी') picks the text for the current app language. */
export function useTr() {
  const { s } = useStore();
  const L = s.lang;
  const tr = (en: string, hi: string) => (L === 'hi' ? hi : en);
  return { L, tr };
}
