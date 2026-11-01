/**
 * Personal notes stored ON THIS DEVICE (IndexedDB). Nothing is uploaded anywhere.
 * Files are validated (type + size) before they are stored.
 */
export type NoteKind = 'image' | 'pdf' | 'file';
export interface MyNote {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  language: 'en' | 'hi' | 'both';
  description: string;
  tags: string[];
  kind: NoteKind;
  mime: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  blob: Blob;
  /** original file name (for documents) */
  fileName?: string;
}

export const MAX_NOTE_BYTES = 10 * 1024 * 1024;
export const OK_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
/** Documents allowed besides photos and PDFs. Allow-list only: no scripts, HTML, SVG or executables. */
export const DOC_EXT = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'];
export const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv';
export const extOf = (name: string) => (name.includes('.') ? name.split('.').pop()!.toLowerCase() : '');
export function kindOf(f: { type: string; name: string }): NoteKind | '' {
  if (f.type.startsWith('image/') && OK_MIME.includes(f.type)) return 'image';
  if (f.type === 'application/pdf' || extOf(f.name) === 'pdf') return 'pdf';
  if (DOC_EXT.includes(extOf(f.name))) return 'file';
  return '';
}
const DB = 'boardbuddy-notes';
const STORE = 'notes';

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') return rej(new Error('This browser cannot store files on the device.'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error ?? new Error('Could not open storage'));
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((res, rej) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => {
      db.close();
      res(req.result);
    };
    t.onabort = t.onerror = () => {
      db.close();
      const e = t.error ?? req.error;
      rej(e && e.name === 'QuotaExceededError' ? new Error('Your phone storage is full. Delete some notes or free up space.') : e ?? new Error('Storage error'));
    };
  });
}

export const listMyNotes = async (): Promise<MyNote[]> => ((await tx('readonly', (s) => s.getAll())) as MyNote[]).sort((a, b) => b.createdAt - a.createdAt);
export const putMyNote = (n: MyNote) => tx('readwrite', (s) => s.put(n));
export const deleteMyNote = (id: string) => tx('readwrite', (s) => s.delete(id));

export function validateFile(f: File): string {
  if (!kindOf(f)) return 'type';
  if (f.size === 0) return 'empty';
  if (f.size > MAX_NOTE_BYTES) return 'size';
  return '';
}
export const newId = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export async function askPersistentStorage() {
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* optional */
  }
}
