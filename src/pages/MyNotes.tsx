import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTr } from '../lib/useTr';
import { Empty, Page } from '../components/ui';
import { ErrorLine, Field, InfoBox, Loading, useLoad } from '../components/common';
import { ACCEPT, askPersistentStorage, deleteMyNote, extOf, kindOf, listMyNotes, MAX_NOTE_BYTES, newId, putMyNote, validateFile, type MyNote } from '../lib/notesDb';
import { compressImage, fmtBytes } from '../lib/image';
import { allChapters, subjectById, subjects } from '../data/subjects';
import { tx } from '../lib/utils';

/** Personal notes: photos / PDFs stored on THIS phone only. Not uploaded, not shared. */
export default function MyNotes() {
  const { tr, L } = useTr();
  const notes = useLoad(listMyNotes, []);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const list = (notes.data ?? []).filter((n) => (!subject || n.subject === subject) && (!q.trim() || `${n.title} ${n.chapter} ${n.tags.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <Page title={`🗂️ ${tr('My Library', 'मेरी लाइब्रेरी')}`}>
      <InfoBox icon="🔒" title={tr('Private, on this phone only', 'निजी, केवल इसी फ़ोन में')}>
        <p>{tr('Photos, PDFs and documents (Word, PowerPoint, Excel, text) you add here are stored in this app on your device. They are not uploaded anywhere and other students cannot see them. Clearing the app’s data deletes them.', 'यहाँ जोड़ी गई फ़ोटो, PDF और दस्तावेज़ (Word, PowerPoint, Excel, text) इसी फ़ोन में रहती हैं। कहीं अपलोड नहीं होतीं और दूसरे विद्यार्थी नहीं देख सकते। ऐप का डेटा साफ़ करने पर ये मिट जाएँगी।')}</p>
      </InfoBox>
      <Uploader onSaved={notes.reload} />
      <div className="grid grid-cols-2 gap-2">
        <input className="input" type="search" placeholder={tr('Search', 'खोजें')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tr('Search', 'खोजें')} />
        <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={tr('Subject', 'विषय')}>
          <option value="">{tr('All subjects', 'सभी विषय')}</option>{subjects.map((s) => <option key={s.id} value={s.id}>{tx(s.name, L)}</option>)}
        </select>
      </div>
      <ErrorLine text={notes.error} />
      {notes.loading && !notes.data ? <Loading /> : list.length === 0 ? <Empty icon="🗂️" text={tr('No notes yet. Add your first photo or PDF above.', 'अभी कोई नोट नहीं। ऊपर से पहली फ़ोटो या PDF जोड़ें।')} /> : (
        <ul className="space-y-2">
          {list.map((n) => <NoteCard key={n.id} n={n} open={open === n.id} onToggle={() => setOpen(open === n.id ? null : n.id)} onChanged={notes.reload} />)}
        </ul>
      )}
    </Page>
  );
}

function Uploader({ onSaved }: { onSaved: () => void }) {
  const { tr, L } = useTr();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [f, setF] = useState({ title: '', subject: subjects[0].id, chapter: '', language: 'en' as MyNote['language'], description: '', tags: '' });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const busyRef = useRef(false); // blocks double taps

  useEffect(() => {
    if (!file || kindOf(file) !== 'image') { setPreview(''); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const pick = (list: FileList | null) => {
    setErr(''); setOk('');
    const x = list?.[0];
    if (!x) return;
    const v = validateFile(x);
    if (v === 'type') return setErr(tr('Allowed: JPG, PNG, WebP photos, PDF, Word, PowerPoint, Excel, TXT, CSV.', 'चलेंगे: JPG, PNG, WebP फ़ोटो, PDF, Word, PowerPoint, Excel, TXT, CSV।'));
    if (v === 'empty') return setErr(tr('This file is empty.', 'यह फ़ाइल खाली है।'));
    if (v === 'size' && kindOf(x) !== 'image') return setErr(tr('File is larger than 10 MB. Choose a smaller file.', 'फ़ाइल 10 MB से बड़ी है। छोटी फ़ाइल चुनें।'));
    setFile(x); // big photos are shrunk on save
    if (!f.title) setF((p) => ({ ...p, title: x.name.replace(/\.[^.]+$/, '').slice(0, 120) }));
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    setErr(''); setOk('');
    if (!file) return setErr(tr('Choose a photo or PDF first.', 'पहले फ़ोटो या PDF चुनें।'));
    if (f.title.trim().length < 2) return setErr(tr('Enter a title.', 'शीर्षक लिखें।'));
    busyRef.current = true; setBusy(true); setProgress(10);
    try {
      const prepared = kindOf(file) === 'image' ? await compressImage(file) : file;
      setProgress(60);
      if (prepared.size > MAX_NOTE_BYTES) throw new Error(tr('File is still larger than 10 MB after shrinking.', 'छोटा करने के बाद भी फ़ाइल 10 MB से बड़ी है।'));
      await askPersistentStorage();
      const now = Date.now();
      await putMyNote({
        id: newId(), title: f.title.trim().slice(0, 120), subject: f.subject, chapter: f.chapter.trim().slice(0, 120), language: f.language,
        description: f.description.trim().slice(0, 1000), tags: f.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
        kind: kindOf(file) as MyNote['kind'], fileName: file.name.slice(0, 120), mime: prepared.type || file.type, size: prepared.size, createdAt: now, updatedAt: now, blob: prepared,
      });
      setProgress(100);
      setOk(tr('Saved on this phone.', 'इस फ़ोन में सहेज लिया।'));
      setFile(null); setF({ ...f, title: '', description: '', tags: '' });
      onSaved();
    } catch (e2) { setErr((e2 as Error).message || tr('Could not save. Try again.', 'सहेज नहीं पाए। फिर कोशिश करें।')); }
    finally { busyRef.current = false; setBusy(false); setTimeout(() => setProgress(0), 600); }
  };

  const chapters = allChapters.filter((c) => c.subjectId === f.subject);
  return (
    <form onSubmit={save} className="card space-y-3" noValidate>
      <h2 className="h2">➕ {tr('Add a note', 'नोट जोड़ें')}</h2>
      <div className="grid grid-cols-2 gap-2">
        <label className="btn-ghost cursor-pointer">📷 {tr('Camera', 'कैमरा')}<input type="file" accept="image/*" capture="environment" className="sr-only" disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = ''; }} /></label>
        <label className="btn-ghost cursor-pointer">📁 {tr('Files', 'फ़ाइलें')}<input type="file" accept={ACCEPT} className="sr-only" disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = ''; }} /></label>
      </div>
      {file && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-sm flex gap-3 items-center">
          {preview ? <img src={preview} alt={tr('Preview', 'पूर्वावलोकन')} className="w-20 h-20 object-cover rounded-lg" /> : <span className="text-3xl" aria-hidden>📄</span>}
          <div className="min-w-0 flex-1"><p className="truncate font-medium">{file.name}</p><p className="muted">{fmtBytes(file.size)}</p></div>
          <button type="button" className="btn-ghost !px-3" disabled={busy} onClick={() => setFile(null)} aria-label={tr('Remove', 'हटाएँ')}>✕</button>
        </div>
      )}
      <Field label={tr('Title', 'शीर्षक')}><input className="input" maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} disabled={busy} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={tr('Subject', 'विषय')}><select className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value, chapter: '' })} disabled={busy}>{subjects.map((s) => <option key={s.id} value={s.id}>{tx(s.name, L)}</option>)}</select></Field>
        <Field label={tr('Language', 'भाषा')}><select className="input" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value as MyNote['language'] })} disabled={busy}><option value="en">English</option><option value="hi">हिंदी</option><option value="both">{tr('Both', 'दोनों')}</option></select></Field>
      </div>
      <Field label={tr('Chapter', 'अध्याय')}><input className="input" list="mynote-chapters" maxLength={120} value={f.chapter} onChange={(e) => setF({ ...f, chapter: e.target.value })} disabled={busy} /><datalist id="mynote-chapters">{chapters.map((c) => <option key={c.id} value={tx(c.title, 'en')} />)}</datalist></Field>
      <Field label={tr('Description (optional)', 'विवरण (वैकल्पिक)')}><textarea className="input min-h-[60px]" maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} disabled={busy} /></Field>
      <Field label={tr('Tags (comma separated)', 'टैग (कॉमा से अलग)')}><input className="input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} disabled={busy} /></Field>
      {progress > 0 && <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div>}
      <ErrorLine text={err} />
      {ok && <p className="text-green-700 dark:text-green-400 text-sm" role="status">{ok}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? tr('Saving…', 'सहेज रहे हैं…') : err && file ? tr('Retry', 'फिर कोशिश करें') : tr('Save note', 'नोट सहेजें')}</button>
    </form>
  );
}

function NoteCard({ n, open, onToggle, onChanged }: { n: MyNote; open: boolean; onToggle: () => void; onChanged: () => void }) {
  const { tr, L } = useTr();
  const [url, setUrl] = useState('');
  const [edit, setEdit] = useState(false);
  const [t, setT] = useState({ title: n.title, chapter: n.chapter, description: n.description, tags: n.tags.join(', ') });
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) { setUrl(''); return; }
    const u = URL.createObjectURL(n.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [open, n.blob]);

  const del = async () => {
    if (!window.confirm(tr('Delete this note from your phone?', 'यह नोट आपके फ़ोन से हटाएँ?'))) return;
    try { await deleteMyNote(n.id); onChanged(); } catch (e) { setErr((e as Error).message); }
  };
  const saveEdit = async () => {
    if (t.title.trim().length < 2) return setErr(tr('Enter a title.', 'शीर्षक लिखें।'));
    try {
      await putMyNote({ ...n, title: t.title.trim().slice(0, 120), chapter: t.chapter.trim().slice(0, 120), description: t.description.trim().slice(0, 1000), tags: t.tags.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean).slice(0, 8), updatedAt: Date.now() });
      setEdit(false); setErr(''); onChanged();
    } catch (e) { setErr((e as Error).message); }
  };
  // helps the owner publish a good note: a ready-made notes.json entry (file name = note id)
  const copyEntry = async () => {
    const ext = n.kind === 'pdf' ? 'pdf' : n.mime === 'image/png' ? 'png' : n.mime === 'image/webp' ? 'webp' : 'jpg';
    const entry = { id: n.id, title: n.title, teacherId: 'TEACHER_ID', subject: n.subject, chapter: n.chapter, language: n.language, description: n.description, tags: n.tags, type: n.kind, file: `${n.id}.${ext}`, date: new Date(n.createdAt).toISOString().slice(0, 10) };
    try { await navigator.clipboard.writeText(JSON.stringify(entry, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setErr(tr('Could not copy. Long-press to copy manually.', 'कॉपी नहीं हुआ।')); }
  };

  return (
    <li className="card space-y-2">
      <button className="w-full text-left flex items-start gap-3" onClick={onToggle} aria-expanded={open}>
        <span className="icon-glass text-2xl" aria-hidden>{n.kind === 'image' ? '🖼️' : n.kind === 'pdf' ? '📄' : /^xlsx?$|csv/.test(extOf(n.fileName ?? '')) ? '📊' : /^pptx?$/.test(extOf(n.fileName ?? '')) ? '📽️' : '📝'}</span>
        <span className="min-w-0 flex-1"><span className="block font-semibold break-words">{n.title}</span>
          <span className="block text-xs muted">{tx(subjectById(n.subject)?.name, L)}{n.chapter ? ` · ${n.chapter}` : ''} · {fmtBytes(n.size)} · {new Date(n.createdAt).toLocaleDateString()}</span></span>
        <span aria-hidden>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
          {n.description && <p className="whitespace-pre-wrap text-sm">{n.description}</p>}
          {n.tags.length > 0 && <p className="flex flex-wrap gap-1">{n.tags.map((x) => <span key={x} className="chip">#{x}</span>)}</p>}
          {url && n.kind === 'image' && <img src={url} alt={n.title} className="w-full rounded-xl" />}
          {url && <div className="grid grid-cols-2 gap-2"><a className="btn-primary !py-2" href={url} target="_blank" rel="noopener noreferrer">👁 {tr('Open', 'खोलें')}</a><a className="btn-ghost !py-2" href={url} download={`${n.title.replace(/[^\wऀ-ॿ -]/g, '').slice(0, 60) || 'note'}.${n.kind === 'image' ? 'jpg' : n.kind === 'pdf' ? 'pdf' : extOf(n.fileName ?? '') || 'bin'}`}>⬇ {tr('Save a copy', 'कॉपी सहेजें')}</a></div>}
          {edit ? (
            <div className="space-y-2">
              <input className="input" maxLength={120} value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} aria-label={tr('Title', 'शीर्षक')} />
              <input className="input" maxLength={120} value={t.chapter} onChange={(e) => setT({ ...t, chapter: e.target.value })} aria-label={tr('Chapter', 'अध्याय')} />
              <textarea className="input min-h-[60px]" maxLength={1000} value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} aria-label={tr('Description', 'विवरण')} />
              <input className="input" value={t.tags} onChange={(e) => setT({ ...t, tags: e.target.value })} aria-label="Tags" />
              <div className="grid grid-cols-2 gap-2"><button className="btn-ghost" onClick={() => setEdit(false)}>{tr('Cancel', 'रद्द करें')}</button><button className="btn-primary" onClick={saveEdit}>{tr('Save', 'सहेजें')}</button></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button className="btn-ghost !py-2 !px-2 text-sm" onClick={() => setEdit(true)}>✏️ {tr('Edit', 'बदलें')}</button>
              {n.kind !== 'file' && <button className="btn-ghost !py-2 !px-2 text-sm" onClick={copyEntry}>{copied ? '✓' : '📤'} {copied ? tr('Copied', 'कॉपी') : tr('For publishing', 'प्रकाशन हेतु')}</button>}
              <button className="btn-ghost !py-2 !px-2 text-sm text-red-600" onClick={del}>🗑 {tr('Delete', 'हटाएँ')}</button>
            </div>
          )}
          <ErrorLine text={err} />
        </div>
      )}
    </li>
  );
}
