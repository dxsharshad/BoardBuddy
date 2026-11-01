/** "Reduce effects" switch (blur/glass off). Stored separately so the main app state key stays unchanged. */
const KEY = 'boardbuddy:fx';
export const readNoFx = (): boolean => { try { return localStorage.getItem(KEY) === 'off'; } catch { return false; } };
export function applyFx(off: boolean) {
  document.documentElement.classList.toggle('no-fx', off);
  try { if (off) localStorage.setItem(KEY, 'off'); else localStorage.removeItem(KEY); } catch { /* ignore */ }
}
