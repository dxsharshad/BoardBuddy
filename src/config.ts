/** Optional public links shown in the app. Leave empty to hide. */
export const INSTAGRAM_URL = ((import.meta.env.VITE_INSTAGRAM_URL as string | undefined) || '').trim();
export const isSafeHttpUrl = (u: string) => {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' || x.protocol === 'http:';
  } catch {
    return false;
  }
};
export const isNative = () => {
  const c = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!c?.isNativePlatform?.();
};
