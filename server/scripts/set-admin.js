// Run only in a trusted local/cloud shell with Firebase Admin SDK credentials.
// This script promotes only the exact email configured in BOARD_BUDDY_ADMIN_EMAIL.
import 'dotenv/config';
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const allowedEmail = (process.env.BOARD_BUDDY_ADMIN_EMAIL || '').trim().toLowerCase();
const requestedEmail = (process.argv[2] || '').trim().toLowerCase();
if (!allowedEmail || !requestedEmail || requestedEmail !== allowedEmail) {
  console.error('Refusing to proceed. Set BOARD_BUDDY_ADMIN_EMAIL and pass that exact email as the argument.');
  process.exit(1);
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_CONFIG && !process.env.GCLOUD_PROJECT && !process.env.FIREBASE_PROJECT_ID) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to a trusted service-account JSON path, or configure Google Application Default Credentials. Never commit the credential file.');
  process.exit(1);
}
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT });
const auth = getAuth();
try {
  const user = await auth.getUserByEmail(requestedEmail);
  if (!user.emailVerified) {
    console.error('Refusing to promote an unverified email. Verify this account email first, then rerun.');
    process.exit(1);
  }
  const current = user.customClaims || {};
  await auth.setCustomUserClaims(user.uid, { ...current, admin: true, role: 'admin' });
  console.log(`Admin custom claim set for ${user.email} (${user.uid}).`);
  console.log('Next: sign out of BoardBuddy and sign in again to refresh the ID token.');
} catch (error) {
  console.error('Could not set admin claim:', error?.message || error);
  process.exit(1);
}
