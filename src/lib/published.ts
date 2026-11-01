/**
 * Content published by the app OWNER through the repository (no server, no accounts):
 *   public/teacher-notes/notes.json   + the files it points to
 *   public/tests/tests.json           + public/tests/<id>.key.json (answer keys)
 * A "verified teacher" here means: someone the owner chose to list in these files.
 * The data is validated defensively because anyone editing JSON by hand can make mistakes.
 */
const BASE = (import.meta.env.BASE_URL as string) || './';

export interface PubTeacher { id: string; name: string; bio: string; instagramUrl: string; verified: boolean }
export interface PubNote {
  id: string; title: string; teacherId: string; subject: string; chapter: string; language: 'en' | 'hi' | 'both';
  description: string; tags: string[]; type: 'image' | 'pdf' | 'link'; file: string; url: string; date: string;
}
export interface PubQuestion { id: string; text: string; options: string[] }
export interface PubTest {
  id: string; title: string; subject: string; chapter: string; instructions: string; durationMin: number; marksPerQ: number; negative: number;
  teacherName: string; sample: boolean; questions: PubQuestion[]; keyFile: string;
}
export interface PubKey { answers: Record<string, number>; explanations: Record<string, string> }

const s = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');
const n = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const safeFile = (f: string) => /^[A-Za-z0-9][A-Za-z0-9._ -]{0,100}$/.test(f) && !f.includes('..');
const httpsUrl = (u: string) => /^https:\/\/[^\s]+$/i.test(u);
const igUrl = (u: string) => u === '' || /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]{1,30}\/?$/.test(u);

async function getJson(path: string): Promise<unknown> {
  const r = await fetch(`${BASE}${path}`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Could not load ${path} (${r.status})`);
  return r.json();
}

export function parseNotes(j: unknown): { teachers: PubTeacher[]; notes: PubNote[]; skipped: number } {
  const o = (j && typeof j === 'object' ? j : {}) as { teachers?: unknown; notes?: unknown };
  let skipped = 0;
  const teachers: PubTeacher[] = (Array.isArray(o.teachers) ? o.teachers : []).flatMap((t: Record<string, unknown>) => {
    if (!t || typeof t !== 'object' || !s(t.id) || !s(t.name)) { skipped++; return []; }
    return [{ id: s(t.id, 40), name: s(t.name, 60), bio: s(t.bio, 300), instagramUrl: igUrl(s(t.instagramUrl, 200)) ? s(t.instagramUrl, 200) : '', verified: t.verified === true }];
  });
  const notes: PubNote[] = (Array.isArray(o.notes) ? o.notes : []).flatMap((x: Record<string, unknown>) => {
    const type = x?.type === 'pdf' || x?.type === 'link' ? x.type : x?.type === 'image' ? 'image' : null;
    if (!x || !type || !s(x.id) || !s(x.title)) { skipped++; return []; }
    const file = s(x.file, 120), url = s(x.url, 1000);
    if ((type === 'link' && !httpsUrl(url)) || (type !== 'link' && !safeFile(file))) { skipped++; return []; }
    return [{
      id: s(x.id, 40), title: s(x.title, 120), teacherId: s(x.teacherId, 40), subject: s(x.subject, 40), chapter: s(x.chapter, 120),
      language: x.language === 'hi' || x.language === 'both' ? x.language : 'en', description: s(x.description, 1000),
      tags: (Array.isArray(x.tags) ? x.tags : []).map((t) => s(t, 30)).filter(Boolean).slice(0, 8), type, file, url, date: s(x.date, 20),
    } as PubNote];
  });
  return { teachers, notes, skipped };
}

export async function loadPublishedNotes() {
  const r = parseNotes(await getJson('teacher-notes/notes.json'));
  return { ...r, notes: r.notes.sort((a, b) => b.date.localeCompare(a.date)) };
}
export const noteFileUrl = (f: string) => `${BASE}teacher-notes/${encodeURIComponent(f)}`;

export function parseTests(j: unknown): { tests: PubTest[]; skipped: number } {
  const o = (j && typeof j === 'object' ? j : {}) as { tests?: unknown };
  let skipped = 0;
  const tests: PubTest[] = (Array.isArray(o.tests) ? o.tests : []).flatMap((t: Record<string, unknown>) => {
    const qs = (Array.isArray(t?.questions) ? (t.questions as Record<string, unknown>[]) : []).flatMap((q) => {
      const opts = (Array.isArray(q?.options) ? q.options : []).map((x) => s(x, 200)).filter(Boolean);
      return s(q?.id, 40) && s(q?.text, 500) && opts.length >= 2 ? [{ id: s(q.id, 40), text: s(q.text, 500), options: opts }] : [];
    });
    if (!t || !s(t.id, 40) || !s(t.title) || qs.length === 0 || !safeFile(s(t.keyFile, 100))) { skipped++; return []; }
    const marks = Math.min(10, Math.max(0.25, n(t.marksPerQ, 1)));
    return [{
      id: s(t.id, 40), title: s(t.title, 120), subject: s(t.subject, 40), chapter: s(t.chapter, 120), instructions: s(t.instructions, 1000),
      durationMin: Math.min(300, Math.max(1, Math.round(n(t.durationMin, 10)))), marksPerQ: marks, negative: Math.min(marks, Math.max(0, n(t.negative, 0))),
      teacherName: s(t.teacherName, 60), sample: t.sample === true, questions: qs, keyFile: s(t.keyFile, 100),
    }];
  });
  return { tests, skipped };
}
export async function loadPublishedTests() {
  return parseTests(await getJson('tests/tests.json'));
}
/** Fetched only AFTER the student submits, so answers are not shipped with the questions. (Static hosting: not secret, see README.) */
export async function loadKey(file: string): Promise<PubKey> {
  const j = (await getJson(`tests/${encodeURIComponent(file)}`)) as { answers?: Record<string, unknown>; explanations?: Record<string, unknown> };
  const answers: Record<string, number> = {};
  for (const [k, v] of Object.entries(j?.answers ?? {})) if (typeof v === 'number' && Number.isInteger(v) && v >= 0) answers[k] = v;
  const explanations: Record<string, string> = {};
  for (const [k, v] of Object.entries(j?.explanations ?? {})) if (typeof v === 'string') explanations[k] = v.slice(0, 500);
  return { answers, explanations };
}

export function scoreTest(questions: PubQuestion[], key: PubKey, answers: Record<string, number>, marksPerQ: number, negative: number) {
  let correct = 0, wrong = 0, skipped = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined) skipped++;
    else if (a === key.answers[q.id]) correct++;
    else wrong++;
  }
  return { correct, wrong, skipped, score: Math.round((correct * marksPerQ - wrong * negative) * 100) / 100 };
}
