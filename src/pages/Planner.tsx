import { useState } from 'react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { allChapters, subjects } from '../data/subjects';
import { Empty, Page } from '../components/ui';
import { addDays, cx, dateKey, tx } from '../lib/utils';
import type { Task } from '../types';

export default function Planner() {
  const { s, addTask, toggleTask, deleteTask } = useStore();
  const L = s.lang;
  const today = dateKey();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0].id);
  const [chapterId, setChapterId] = useState('');
  const [date, setDate] = useState(today);
  const [minutes, setMinutes] = useState(30);
  const [error, setError] = useState('');

  const chapters = allChapters.filter((c) => c.subjectId === subjectId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ch = chapters.find((c) => c.id === chapterId);
    const finalTitle = title.trim() || (ch ? tx(ch.title, L) : '');
    if (!finalTitle) return setError(L === 'hi' ? 'कार्य का नाम लिखें या अध्याय चुनें।' : 'Enter a task name or pick a chapter.');
    if (!date) return setError(L === 'hi' ? 'तारीख चुनें।' : 'Pick a date.');
    if (!(minutes >= 5 && minutes <= 480)) return setError(L === 'hi' ? 'अवधि 5 से 480 मिनट के बीच रखें।' : 'Duration must be between 5 and 480 minutes.');
    setError('');
    addTask({ title: finalTitle.slice(0, 80), subjectId, chapterId: chapterId || undefined, date, minutes });
    setTitle('');
  };

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const byDate = (d: string) => s.tasks.filter((x) => x.date === d);
  const todays = byDate(today);
  const overdue = s.tasks.filter((x) => x.date < today && !x.done);

  return (
    <Page title={t('planner', L)}>
      <form onSubmit={submit} className="card space-y-3" noValidate>
        <h2 className="h2">{t('addTask', L)}</h2>
        <input className="input" placeholder={L === 'hi' ? 'कार्य (जैसे: त्रिकोणमिति के प्रश्न)' : 'Task (e.g. Solve trigonometry problems)'} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} aria-label="Task" />
        <div className="grid grid-cols-2 gap-2">
          <select className="input" value={subjectId} onChange={(e) => { setSubjectId(e.target.value); setChapterId(''); }} aria-label={t('subjects', L)}>
            {subjects.map((x) => <option key={x.id} value={x.id}>{tx(x.name, L)}</option>)}
          </select>
          <select className="input" value={chapterId} onChange={(e) => setChapterId(e.target.value)} aria-label={t('chapter', L)}>
            <option value="">— {t('chapter', L)} —</option>
            {chapters.map((c) => <option key={c.id} value={c.id}>{tx(c.title, L)}</option>)}
          </select>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
          <input type="number" className="input" min={5} max={480} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} aria-label={t('minutes', L)} />
        </div>
        {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
        <button className="btn-primary w-full" type="submit">＋ {t('addTask', L)}</button>
        <p className="text-xs muted">
          {L === 'hi' ? 'नोट: इस संस्करण में फ़ोन रिमाइंडर शामिल नहीं हैं।' : 'Note: phone reminders/notifications are not included in this version.'}
        </p>
      </form>

      {overdue.length > 0 && (
        <div className="card">
          <h2 className="h2 mb-2">⚠️ {t('pending', L)}</h2>
          <TaskList tasks={overdue} onToggle={toggleTask} onDelete={deleteTask} L={L} showDate />
        </div>
      )}

      <div className="card">
        <h2 className="h2 mb-2">{t('todayPlan', L)}</h2>
        {todays.length === 0 ? (
          <Empty icon="🗓️" text={t('noTasksToday', L)} />
        ) : (
          <>
            <p className="text-sm muted mb-2">
              {t('pending', L)}: {todays.filter((x) => !x.done).length} · {t('done', L)}: {todays.filter((x) => x.done).length}
            </p>
            <TaskList tasks={todays} onToggle={toggleTask} onDelete={deleteTask} L={L} />
          </>
        )}
      </div>

      <div className="card">
        <h2 className="h2 mb-2">{L === 'hi' ? 'इस सप्ताह' : 'This week'}</h2>
        <div className="space-y-3">
          {week.slice(1).map((d) => (
            <div key={d}>
              <p className="font-semibold text-sm">{new Date(d + 'T00:00:00').toLocaleDateString(L === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              {byDate(d).length === 0 ? <p className="text-sm muted">—</p> : <TaskList tasks={byDate(d)} onToggle={toggleTask} onDelete={deleteTask} L={L} />}
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

function TaskList({ tasks, onToggle, onDelete, L, showDate }: { tasks: Task[]; onToggle: (id: string) => void; onDelete: (id: string) => void; L: 'en' | 'hi'; showDate?: boolean }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {tasks.map((x) => {
        const sub = subjects.find((z) => z.id === x.subjectId);
        return (
          <li key={x.id} className="flex items-center gap-2 py-2">
            <button onClick={() => onToggle(x.id)} aria-pressed={x.done} aria-label={x.title} className="text-2xl min-w-[44px] min-h-[44px]">
              {x.done ? '✅' : '⬜'}
            </button>
            <div className={cx('flex-1 min-w-0', x.done && 'line-through muted')}>
              <p className="font-medium truncate">{x.title}</p>
              <p className="text-xs muted">{sub?.emoji} {tx(sub?.name, L)} · {x.minutes} {t('minutes', L)}{showDate ? ` · ${x.date}` : ''}</p>
            </div>
            <button onClick={() => onDelete(x.id)} className="text-slate-400 hover:text-red-600 min-w-[44px] min-h-[44px]" aria-label={t('delete', L)}>🗑</button>
          </li>
        );
      })}
    </ul>
  );
}
