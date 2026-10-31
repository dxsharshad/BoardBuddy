# BoardBuddy: Gemini + Firebase + Initial Admin Setup

This project has been adapted for Google Gemini and Firebase Authentication. **The project is not connected to your Firebase project yet**, and no API key or admin service credential is included. Do not commit `.env`, `server/.env`, Firebase service-account JSON, or API keys.

## A. Configure Gemini (server-side only)

1. Open Google AI Studio and create a Gemini API key for your own project.
2. Deploy the `server/` folder to a Node.js host that supports environment secrets (for example, Render or Railway).
3. Set these variables in the host dashboard:
   - `GEMINI_API_KEY` = your key (paste it into the host's secret field, never into frontend code)
   - `GEMINI_MODEL` = `gemini-2.5-flash` (change only to a model enabled for your API key)
   - `ALLOWED_ORIGIN` = your deployed BoardBuddy website origin; if testing an Android Capacitor build, include `https://localhost` as a comma-separated allowed origin
   - `PORT` = usually supplied by the host; otherwise `8787`
4. Deploy the frontend with `VITE_API_URL` set to the deployed backend's HTTPS base URL. For local development, leave it blank and run the backend on port 8787 so Vite can proxy `/api`.
5. Test `https://YOUR-API-HOST/api/health`. It should return `ok: true` and `aiConfigured: true`. Do not put the Gemini key in any `VITE_*` variable; Vite variables are bundled into the public app.

Local backend testing:

```bash
cd server
npm install
cp .env.example .env
# Edit server/.env locally and set GEMINI_API_KEY. Never upload/commit it.
npm start
```

## B. Create/configure Firebase

1. Open https://console.firebase.google.com/ and create a project.
2. In **Build → Authentication → Sign-in method**, enable **Email/Password** and **Google**.
3. In **Project settings → General → Your apps**, register a Web app and copy its Firebase web config values into the deployment environment as `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.
4. In Authentication → Settings → Authorized domains, add the exact domain where BoardBuddy is hosted. For a local test, add `localhost` if needed.
5. If using the included GitHub Actions build, add repository **Actions secrets** named `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, and `VITE_API_URL` (the deployed backend URL). The Firebase web config values are public app identifiers but the workflow passes them through secrets for convenience. `VITE_API_URL` can be blank for a site-only build, but Gemini will not work until the backend is deployed.
6. In **Firestore Database**, create a database and deploy the root `firestore.rules`. These rules allow a user to create/read their own limited profile document while preventing users from changing role/verification fields.
7. In **Storage**, deploy `storage.rules`; all file uploads are denied until a verified teacher-publishing workflow is implemented.
8. Rebuild and redeploy the frontend after setting `VITE_FIREBASE_*`. The public web config is not a secret; authorization comes from Firebase rules and server-side claims.

## C. Create your account and set the initial admin claim

The intended initial admin email is `phoolnesha924@gmail.com` (from your setup request). You must first create that account in BoardBuddy or Firebase Authentication and verify the email address. Use an email you control. Email/password registration sends a verification email; Google accounts should have a verified email.

**Trusted provisioning only:** run the script below from a trusted computer or cloud shell where you can securely configure Firebase Admin credentials. Do not upload a service-account key into this chat, GitHub repo, or the public app. A mobile-only workflow is possible only if your chosen cloud shell can keep the credential secure; do not paste credentials into public files.

1. In Firebase Console → Project settings → Service accounts, create/download a private service-account credential only if your environment requires it. Prefer Google Cloud Application Default Credentials in Cloud Shell where possible.
2. In the trusted shell, set `FIREBASE_PROJECT_ID` to your Firebase project ID, `BOARD_BUDDY_ADMIN_EMAIL=phoolnesha924@gmail.com`, and configure Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS` to a private file path outside the repository.
3. From the project root:

```bash
cd server
npm install
BOARD_BUDDY_ADMIN_EMAIL=phoolnesha924@gmail.com FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID npm run set-admin -- phoolnesha924@gmail.com
```

If using `GOOGLE_APPLICATION_CREDENTIALS`, set it in that shell to the private credential path. The script refuses to promote an email other than the configured allowlisted email. Run it only against your own Firebase project.
4. Sign out of BoardBuddy and sign in again. The Admin Dashboard checks the Firebase ID token's `admin: true` custom claim. A Firestore profile field alone does not grant admin access.

## D. Current security boundaries / not yet implemented

- New accounts default to student permissions.
- The account page supports email/password registration/login, Google sign-in, password reset, and logout once Firebase is configured.
- Admin access is gated by a trusted Firebase custom claim. The initial admin provisioning script requires privileged server credentials and an exact email allowlist.
- The Admin Dashboard is currently an admin-only entry point/status page, not a full user-management console.
- Teacher verification, Teacher Notes uploads, cloud test authoring, Drive OAuth, Instagram API, and cloud moderation are not yet implemented. Storage rules deny all uploads until that workflow is built and reviewed.
- The AI backend has a basic per-IP in-memory rate limit. For production at scale, add authenticated quotas and a shared rate limiter. Never expose the Gemini key to the browser.
- Build and integration tests must be run in your GitHub Actions/cloud environment. Do not claim the app is production-ready until the build and Firebase/Gemini flows are tested.
