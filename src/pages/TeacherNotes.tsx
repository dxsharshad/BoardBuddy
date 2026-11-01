import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTr } from '../lib/useTr';
import { BookmarkBtn, Empty, Page } from '../components/ui';
import { ErrorLine, InfoBox, Loading, useLoad } from '../components/common';
import { loadPublishedNotes, noteFileUrl, type PubNote, type PubTeacher } from '../lib/published';
import { subjectById, subjects } from '../data/subjects';
import { tx } from '../lib/utils';
import { isSafeHttpUrl } from '../config';

const langName = (l: string, tr: (a: string, b: string) => string) => (l === 'hi' ? 'हिंदी' : l === 'both' ? tr('Both', 'दोनों') : 'English');
const icon = (n: PubNote) => (n.type === 'link' ? '🔗' : n.type === 'pdf' ? '📄' : '🖼️');
const teacherOf = (ts: PubTeacher[], id: string) => ts.find((t) => t.id === id);

export default function TeacherNotes() {
  const { tr, L } = useTr();
  const data = useLoad(loadPublishedNotes, []);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [lang, setLang] = useState('');
  const [teacher, setTeacher] = useState('');

  const notes = data.data?.notes ?? [];
  const teachers = data.data?.teachers ?? [];
  const term = q.trim().toLowerCase();
  const shown = useMemo(() => notes.filter((n) =>
    (!subject || n.subject === subject) && (!lang || n.language === lang || n.language === 'both') && (!teacher || n.teacherId === teacher) &&
    (!term || `${n.title} ${n.chapter} ${n.tags.join(' ')} ${teacherOf(teachers, n.teacherId)?.name ?? ''}`.toLowerCase().includes(term))), [notes, teachers, subject, lang, teacher, term]);

  return (
    <Page title={`📚 ${tr('Teacher Notes', 'टीचर नोट्स')}`}>
      <input className="input" type="search" placeholder={tr('Search notes, chapters, teachers…', 'नोट्स, अध्याय, शिक्षक खोजें…')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={tr('Search', 'खोजें')} />
      <div className="grid grid-cols-2 gap-2">
        <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={tr('Subject', 'विषय')}>
          <option value="">{tr('All subjects', 'सभी विषय')}</option>{subjects.map((s) => <option key={s.id} value={s.id}>{tx(s.name, L)}</option>)}
        </select>
        <select className="input" value={lang} onChange={(e) => setLang(e.target.value)} aria-label={tr('Language', 'भाषा')}>
          <option value="">{tr('All languages', 'सभी भाषाएँ')}</option><option value="en">English</option><option value="hi">हिंदी</option>
        </select>
        <select className="input col-span-2" value={teacher} onChange={(e) => setTeacher(e.target.value)} aria-label={tr('Teacher', 'शिक्षक')}>
          <option value="">{tr('All teachers', 'सभी शिक्षक')}</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {data.loading && !data.data ? <Loading /> : data.error ? <ErrorLine text={tr('Could not load notes. Check your internet and reopen this page.', 'नोट्स लोड नहीं हुए। इंटरनेट जाँचकर पेज फिर खोलें।') + ' (' + data.error + ')'} /> : notes.length === 0 ? (
        <>
          <Empty icon="📭" text={tr('No teacher notes have been published yet.', 'अभी कोई टीचर नोट प्रकाशित नहीं हुआ है।')} />
          <InfoBox title={tr('How notes get here', 'नोट्स यहाँ कैसे आते हैं')}>
            <p>{tr('Notes are published by the app owner after checking the teacher. See PUBLISHING.md: upload the photo/PDF to public/teacher-notes/ on GitHub and add one entry to notes.json. Students see it after the next automatic build (about 5–10 minutes).', 'नोट्स ऐप का मालिक शिक्षक को जाँचकर प्रकाशित करता है। PUBLISHING.md देखें: GitHub पर public/teacher-notes/ में फ़ोटो/PDF डालें और notes.json में एक एंट्री जोड़ें। अगले ऑटोमैटिक बिल्ड (लगभग 5–10 मिनट) के बाद विद्यार्थियों को दिखेगा।')}</p>
          </InfoBox>
        </>
      ) : shown.length === 0 ? <Empty icon="🔍" text={tr('No notes match your filters.', 'फ़िल्टर से कोई नोट नहीं मिला।')} /> : (
        <ul className="space-y-2">
          {shown.map((n) => {
            const t = teacherOf(teachers, n.teacherId);
            return (
              <li key={n.id}>
                <Link to={`/teacher-notes/${n.id}`} className="card flex items-start gap-3 hover:shadow-md transition">
                  <span className="text-3xl" aria-hidden>{icon(n)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold break-words">{n.title}</span>
                    <span className="block text-xs muted">{tx(subjectById(n.subject)?.name, L)}{n.chapter ? ` · ${n.chapter}` : ''} · {langName(n.language, tr)}</span>
                    {t && <span className="block text-xs muted">👩‍🏫 {t.name}{t.verified ? ' ✔' : ''}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Page>
  );
}

export function NoteViewer() {
  const { tr, L } = useTr();
  const { id } = useParams();
  const nav = useNavigate();
  const data = useLoad(loadPublishedNotes, []);
  const n = data.data?.notes.find((x) => x.id === id);
  const t = n ? teacherOf(data.data?.teachers ?? [], n.teacherId) : undefined;
  const href = n ? (n.type === 'link' ? n.url : noteFileUrl(n.file)) : '';
  const safe = n?.type === 'link' ? isSafeHttpUrl(href) : !!href;
  return (
    <Page title={tr('Note', 'नोट')} back={() => nav('/teacher-notes')} right={n ? <BookmarkBtn k={`pn:${n.id}`} /> : undefined}>
      {data.loading && !data.data ? <Loading /> : !n ? <Empty icon="🔎" text={data.error || tr('This note is not available.', 'यह नोट उपलब्ध नहीं है।')} /> : (
        <div className="space-y-3">
          <div className="card space-y-2">
            <h2 className="h2 break-words">{n.title}</h2>
            <p className="text-sm muted">{tx(subjectById(n.subject)?.name, L)}{n.chapter ? ` · ${n.chapter}` : ''} · {langName(n.language, tr)}{n.date ? ` · ${n.date}` : ''}</p>
            {n.description && <p className="whitespace-pre-wrap">{n.description}</p>}
            {n.tags.length > 0 && <p className="flex flex-wrap gap-1">{n.tags.map((x) => <span key={x} className="chip">#{x}</span>)}</p>}
          </div>
          {safe && n.type === 'image' && <img src={href} alt={n.title} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700" loading="lazy" />}
          {safe && (
            <div className="grid grid-cols-2 gap-2">
              <a className="btn-primary" href={href} target="_blank" rel="noopener noreferrer">👁 {tr('Open', 'खोलें')}</a>
              {n.type !== 'link' ? <a className="btn-ghost" href={href} download>⬇ {tr('Download', 'डाउनलोड')}</a> : <span />}
            </div>
          )}
          {n.type === 'pdf' && <p className="text-xs muted">{tr('PDFs open in your phone’s PDF viewer.', 'PDF आपके फ़ोन के PDF व्यूअर में खुलती है।')}</p>}
          {t && (
            <Link to={`/teachers/${t.id}`} className="card flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-accent-600 text-white font-bold flex items-center justify-center" aria-hidden>{t.name.slice(0, 1).toUpperCase()}</span>
              <span className="flex-1 min-w-0"><span className="block font-semibold truncate">{t.name}</span><span className="block text-xs muted">{t.verified ? `✔ ${tr('Listed by the BoardBuddy owner', 'BoardBuddy मालिक द्वारा सूचीबद्ध')}` : tr('Teacher', 'शिक्षक')}</span></span><span aria-hidden>→</span>
            </Link>
          )}
        </div>
      )}
    </Page>
  );
}

export function TeacherProfilePage() {
  const { tr, L } = useTr();
  const { id } = useParams();
  const nav = useNavigate();
  const data = useLoad(loadPublishedNotes, []);
  const t = data.data?.teachers.find((x) => x.id === id);
  const notes = (data.data?.notes ?? []).filter((x) => x.teacherId === id);
  return (
    <Page title={tr('Teacher', 'शिक्षक')} back={() => nav(-1)}>
      {data.loading && !data.data ? <Loading /> : !t ? <Empty icon="🔎" text={tr('Teacher not found.', 'शिक्षक नहीं मिले।')} /> : (
        <div className="space-y-3">
          <div className="card space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-accent-600 text-white text-xl font-bold flex items-center justify-center" aria-hidden>{t.name.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0"><p className="font-bold text-lg break-words">{t.name}</p>{t.verified && <p className="text-sm text-green-700 dark:text-green-400">✔ {tr('Listed by the BoardBuddy owner', 'BoardBuddy मालिक द्वारा सूचीबद्ध')}</p>}</div>
            </div>
            {t.bio && <p className="whitespace-pre-wrap">{t.bio}</p>}
            {t.instagramUrl && isSafeHttpUrl(t.instagramUrl) && <a className="btn-ghost" href={t.instagramUrl} target="_blank" rel="noopener noreferrer">📸 Instagram</a>}
          </div>
          <h2 className="h2">{tr('Notes by this teacher', 'इस शिक्षक के नोट्स')}</h2>
          {notes.length === 0 ? <Empty icon="📭" text={tr('No notes yet.', 'अभी कोई नोट नहीं।')} /> : (
            <ul className="space-y-2">{notes.map((n) => <li key={n.id}><Link to={`/teacher-notes/${n.id}`} className="card block"><span className="font-semibold">{n.title}</span><span className="block text-xs muted">{tx(subjectById(n.subject)?.name, L)}{n.chapter ? ` · ${n.chapter}` : ''}</span></Link></li>)}</ul>
          )}
        </div>
      )}
    </Page>
  );
}
