# BoardBuddy v0.2.0 — implementation status

## Inspected project

- Framework: React 18 + TypeScript + Vite + React Router (`HashRouter`) + Tailwind CSS.
- PWA: `vite-plugin-pwa`, manifest and service-worker generation configured in `vite.config.ts`.
- Android packaging: Capacitor 6 config exists; `android/` is generated during the GitHub Actions build.
- Persistence: local browser/app `localStorage` under `boardbuddy:v1`.
- Content: local TypeScript data files for subjects, chapters, notes, formulas, MCQs, and flashcards. The project README correctly labels this content as sample/unverified.
- AI doubt solver: Express backend in `server/index.js`; configured for Google Gemini and reads `GEMINI_API_KEY` server-side. Without the configured backend, the frontend displays a clearly labelled offline note search.
- PYQs: intentionally empty list in `src/data/pyq.ts`; official portal links are provided instead of fabricated papers.

## Changes made in v0.2.0

- Added `appUsageSecondsByDate` to the persisted app state, keeping old saved data compatible through defaults merging.
- Added a foreground app-open time tracker. It uses `visibilitychange`, `pagehide`, and `pageshow`, pauses while the page is hidden, and stores elapsed seconds under the local calendar date. It updates approximately every five seconds.
- Added a dashboard display for estimated app-open time with an explicit warning that this is not proof of studying.
- Removed the dashboard's manual `+10 min studied` shortcut so it cannot fabricate recorded practice time.
- Planner task completion and chapter completion no longer add planned minutes to practice-time totals. Quiz duration remains recorded as practice time.
- Applied restrained translucent glass styling to cards, the sticky header, and mobile bottom navigation.
- Updated version labels and documentation.

## Not implemented / requires additional setup

Firebase client configuration, email/password + Google authentication UI, password reset/logout, student-default profile creation, custom-claim-gated admin entry point, restrictive starter Firestore/Storage rules, and an allowlisted Firebase Admin SDK provisioning script have been added. No Firebase project credentials are included, so these features are not active until configured. Teacher verification, teacher uploads, cloud objective-test authoring, Google Drive OAuth, and Meta/Instagram API integration are still not implemented. They require a Firebase project and a trusted authorization design (for example, custom claims or server-controlled role changes), security rules, and testing. Drive/Meta also require their own OAuth/app configuration and permissions.

The current objective quizzes are local practice quizzes, not a secure online test platform: answer data is bundled in the client. Do not use them for high-stakes assessments until questions/answer keys and scoring are handled by a trusted backend.

## Verification results in this environment

- ZIP extraction and project inventory: PASS.
- Static source/config inspection: PASS.
- Dependency installation: NOT RUN TO COMPLETION — `npm install --no-audit --no-fund` timed out because registry access returned `EAI_AGAIN`.
- TypeScript check: NOT RUN — project dependencies were unavailable.
- Production Vite build: NOT RUN — project dependencies were unavailable.
- Browser / Android / APK tests: NOT RUN — no build could be produced in this environment.

No APK is included or claimed. Use the GitHub Actions workflow in `.github/workflows/build.yml` to build the PWA and debug APK in the cloud. If the workflow fails, inspect the failed step and share the final error lines.

## App-usage tracker limitations

This is a browser/PWA estimate of foreground time. It cannot prove attention or studying and cannot reliably count time while fully backgrounded, force-closed, or when the operating system suspends the page. The timer is separate from planner duration and quiz/practice time. Totals are stored locally on each install; no cross-device sync is implemented.


## Latest setup changes

- Replaced Anthropic API calls with Google Gemini `generateContent` calls using `GEMINI_API_KEY` on the server.
- Added optional Firebase initialization from `VITE_FIREBASE_*` environment variables.
- Added account screen for email/password and Google sign-in, password reset, logout, and default-student Firestore profile creation.
- Added an Admin Dashboard entry point that requires the trusted Firebase custom claim `admin: true` or `role: admin`.
- Added `server/scripts/set-admin.js`; it only targets the exact `BOARD_BUDDY_ADMIN_EMAIL` allowlisted email and must be run with trusted Firebase Admin credentials. It has not been run because no Firebase project/credentials were provided.
- Added restrictive starter Firestore and Storage rules. Teacher uploads remain blocked until a verified publishing workflow is implemented.
- Setup guide: `FIREBASE_GEMINI_SETUP.md`.
