import { useTr } from '../lib/useTr';
import { InfoBox } from '../components/common';
import { Page } from '../components/ui';
import { INSTAGRAM_URL, isSafeHttpUrl } from '../config';

/** Honest status page: only plain links that work today; account-linking features are listed as "not configured". */
export default function Connect() {
  const { tr } = useTr();
  const ig = INSTAGRAM_URL && isSafeHttpUrl(INSTAGRAM_URL) ? INSTAGRAM_URL : '';
  return (
    <Page title={`🔗 ${tr('Connect', 'कनेक्ट')}`}>
      <div className="card space-y-2">
        <h2 className="h2">📸 Instagram</h2>
        {ig ? <a className="btn-primary" href={ig} target="_blank" rel="noopener noreferrer">{tr('Open our Instagram page', 'हमारा Instagram पेज खोलें')}</a>
          : <p className="muted text-sm">{tr('Not configured. The owner can set VITE_INSTAGRAM_URL (see INTEGRATIONS.md).', 'सेट नहीं है। मालिक VITE_INSTAGRAM_URL सेट कर सकता है (INTEGRATIONS.md देखें)।')}</p>}
        <p className="text-xs muted">{tr('This is only a link. BoardBuddy does not read your Instagram account and never asks for your Instagram password.', 'यह सिर्फ़ एक लिंक है। BoardBuddy आपका Instagram अकाउंट नहीं पढ़ता और पासवर्ड कभी नहीं माँगता।')}</p>
      </div>
      <div className="card space-y-2">
        <h2 className="h2">☁️ Google Drive</h2>
        <p className="text-sm"><span className="chip">{tr('Pending configuration', 'कॉन्फ़िगरेशन बाकी')}</span></p>
        <p className="muted text-sm">{tr('Saving notes to your own Google Drive needs Google sign-in set up by the app owner. It is not active in this version. Meanwhile, use “Save a copy” in My Notes to store a file in Drive or Files yourself.', 'अपने Google Drive में नोट सेव करने के लिए ऐप मालिक को Google साइन-इन सेट करना होगा। इस संस्करण में चालू नहीं है। तब तक “My Notes” में “कॉपी सहेजें” से फ़ाइल Drive/Files में खुद रख सकते हैं।')}</p>
      </div>
      <InfoBox title={tr('Privacy', 'गोपनीयता')}><p>{tr('No sign-in, no accounts and no tokens are stored by this app.', 'यह ऐप कोई साइन-इन, अकाउंट या टोकन नहीं रखता।')}</p></InfoBox>
    </Page>
  );
}
