import { useState } from 'react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { Page } from '../components/ui';

export default function Settings() {
  const { s, setLang, setTheme, setName, setGoal, resetAll } = useStore();
  const L = s.lang;
  const [confirming, setConfirming] = useState(false);
  const [goalText, setGoalText] = useState(String(s.dailyGoalMin));

  return (
    <Page title={t('settings', L)}>
      <div className="card space-y-4">
        <div>
          <label htmlFor="nm" className="font-semibold block mb-1">{t('yourName', L)}</label>
          <input id="nm" className="input" value={s.name} maxLength={30} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="goal" className="font-semibold block mb-1">{t('dailyGoal', L)} ({t('minutes', L)})</label>
          <input id="goal" className="input" type="number" min={10} max={600} step={5} value={goalText} onChange={(e) => { setGoalText(e.target.value); const n = Number(e.target.value); if (n >= 10) setGoal(n); }} onBlur={() => setGoalText(String(s.dailyGoalMin))} />
        </div>
        <div>
          <p className="font-semibold mb-1">{t('language', L)}</p>
          <div className="grid grid-cols-2 gap-2">
            <button className={s.lang === 'en' ? 'btn-primary' : 'btn-ghost'} onClick={() => setLang('en')}>English</button>
            <button className={s.lang === 'hi' ? 'btn-primary' : 'btn-ghost'} onClick={() => setLang('hi')}>हिंदी</button>
          </div>
        </div>
        <label className="flex items-center justify-between min-h-[44px]">
          <span className="font-semibold">{t('darkMode', L)}</span>
          <input type="checkbox" className="w-6 h-6" checked={s.theme === 'dark'} onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} />
        </label>
      </div>

      <div className="card space-y-2">
        {!confirming ? (
          <button className="btn-ghost w-full text-red-600" onClick={() => setConfirming(true)}>{t('resetProgress', L)}</button>
        ) : (
          <>
            <p role="alert">{t('resetConfirm', L)}</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-ghost" onClick={() => setConfirming(false)}>{t('cancel', L)}</button>
              <button className="btn-danger" onClick={() => { resetAll(); setConfirming(false); }}>{t('resetProgress', L)}</button>
            </div>
          </>
        )}
      </div>

      <p className="text-sm muted text-center">
        BoardBuddy v0.2.0 · {L === 'hi' ? 'यह एक स्वतंत्र अध्ययन ऐप है, BSEB से संबद्ध नहीं।' : 'An independent study app, not affiliated with BSEB.'}
      </p>
      <p className="text-sm text-center font-semibold">
        {L === 'hi' ? 'निर्माता: अरशद कमाल' : 'Made by Arshad Kamal'}
      </p>
    </Page>
  );
}
