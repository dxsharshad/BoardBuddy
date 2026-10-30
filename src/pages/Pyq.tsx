import { useState } from 'react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { Empty, Page } from '../components/ui';
import { OFFICIAL_LINKS, pyqPapers } from '../data/pyq';
import { subjects } from '../data/subjects';
import { tx } from '../lib/utils';

export default function Pyq() {
  const { s } = useStore();
  const L = s.lang;
  const [subject, setSubject] = useState('');
  const list = pyqPapers.filter((p) => !subject || p.subjectId === subject).sort((a, b) => b.year - a.year);

  return (
    <Page title={t('pyq', L)}>
      <div className="card space-y-2">
        <p className="font-semibold">{L === 'hi' ? 'आधिकारिक स्रोत' : 'Official sources'}</p>
        <p className="text-sm muted">
          {L === 'hi'
            ? 'BoardBuddy केवल वही प्रश्नपत्र दिखाता है जो उसमें जोड़े गए और सत्यापित हैं। नवीनतम आधिकारिक प्रश्नपत्र BSEB की वेबसाइट पर देखें।'
            : 'BoardBuddy only lists papers that have been added and verified. For the latest official papers, use the BSEB website.'}
        </p>
        <div className="flex flex-col gap-2">
          {OFFICIAL_LINKS.map((o) => (
            <a key={o.url} href={o.url} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-start">🔗 {o.label}</a>
          ))}
        </div>
      </div>

      <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={t('subjects', L)}>
        <option value="">{t('all', L)}</option>
        {subjects.map((x) => <option key={x.id} value={x.id}>{tx(x.name, L)}</option>)}
      </select>

      {list.length === 0 ? (
        <Empty
          icon="📄"
          text={
            L === 'hi'
              ? 'अभी कोई सत्यापित प्रश्नपत्र नहीं जोड़ा गया है। प्रश्नपत्र जोड़ने के लिए src/data/pyq.ts देखें।'
              : 'No verified papers have been added yet. See src/data/pyq.ts to add papers.'
          }
        />
      ) : (
        <ul className="space-y-3">
          {list.map((p) => (
            <li key={p.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm muted">{p.year} · {p.source}</p>
                </div>
                <span className="chip">{p.official ? (L === 'hi' ? 'आधिकारिक' : 'Official') : (L === 'hi' ? 'अनधिकृत' : 'Unofficial')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a className="btn-primary !py-2" href={p.pdfUrl} target="_blank" rel="noopener noreferrer">👁 {L === 'hi' ? 'देखें' : 'View'}</a>
                <a className="btn-ghost !py-2" href={p.pdfUrl} download>⬇ {L === 'hi' ? 'डाउनलोड' : 'Download'}</a>
                {p.answerKeyUrl && <a className="btn-ghost !py-2" href={p.answerKeyUrl} target="_blank" rel="noopener noreferrer">🔑 {L === 'hi' ? 'उत्तर कुंजी' : 'Answer key'}</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
