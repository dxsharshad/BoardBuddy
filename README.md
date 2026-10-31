# BoardBuddy – Class 10 Bihar Board

Made by Arshad Kamal.

A mobile-first study app (PWA, Android-ready) with notes, MCQ quizzes, flashcards, planner, progress tracking, bookmarks, search, a PYQ section and an optional AI doubt solver. Hindi + English, light + dark mode. v0.2.0 also estimates foreground app-open time separately from practice time.

## Status (please read)

- **Start here for phones: [PHONE_GUIDE.md](PHONE_GUIDE.md)** – install as an app on Android using only your phone (PWA, or a real APK built in the cloud).
- v0.2.0 update: added a foreground app-open timer that pauses when the page is hidden and on page lifecycle events, stores daily totals by local date, and displays it separately from quiz/practice time. Planner task durations and chapter completion no longer inflate recorded practice time. Added restrained glass-style cards/header/bottom navigation.
- **Not yet verified:** dependency installation, TypeScript checking, production build, browser tests, and APK build. Package installation was attempted in this environment but npm registry access failed (`EAI_AGAIN`), so no successful build or APK is claimed. Run the GitHub Actions workflow described in PHONE_GUIDE.md to build in the cloud and share any failing logs for debugging.
- **All educational content is SAMPLE content** (12 chapters across 6 subjects, 43 MCQs, 30 flashcards). It has not been checked against the official BSEB textbooks or syllabus, and chapter names may not match the official list. Every chapter is marked `status: 'sample'` and shows a warning banner in the app until you verify it. Hindi text covers only part of the notes.
- **No previous-year papers are included.** `src/data/pyq.ts` is empty on purpose. Add only papers you have downloaded from BSEB (biharboardonline.bihar.gov.in) or another source you trust.
- The doubt solver is configured for Google Gemini and gives real AI answers only when the backend runs with your own server-side `GEMINI_API_KEY`. Without it the app says so and shows a limited keyword search over the sample notes (clearly labelled "not AI"). The phone-only setup does not include the backend.
- Your progress is stored in the browser/app on each device (localStorage key `boardbuddy:v1`, unchanged). The installed PWA and the APK keep separate data, and clearing site/app data erases it.
- Official syllabus and textbooks: biharboardonline.bihar.gov.in and bstbpc.gov.in. Exam dates for 2027 were not confirmed by the board at the time of writing, so the app shows none.

## Features not implemented or not yet configured

Firebase Authentication UI, a custom-claim-gated Admin entry point, an initial admin provisioning script, and restrictive starter Firestore/Storage rules are included. They remain inactive until you configure your own Firebase project. Teacher verification, cloud-hosted Teacher Notes, cloud objective-test authoring, Google Drive OAuth, and Meta/Instagram API integration are not implemented yet. These require Firebase project setup, secure Firestore/Storage rules and trusted server-side authorization, plus provider credentials/approval where applicable. The current quiz system is local practice quizzes, not a teacher publishing platform. See `IMPLEMENTATION_STATUS.md` for the exact boundary and next steps.

## Architecture choice

React + TypeScript + Vite + Tailwind, all data in the browser (localStorage). No accounts and no database are needed for the MVP, which keeps it free to host, fast on low-end phones and usable offline as a PWA. Firebase sign-in and a secure initial admin-claim workflow are now optional; the study content and progress remain local-first until cloud sync is implemented. The only server piece is a small Express proxy that keeps the AI API key secret.

Routing uses `HashRouter`, so the site works on any static host and inside the Android (Capacitor) wrapper without server rewrite rules.

## Project structure

```
boardbuddy/
├─ index.html  package.json  vite.config.ts  tailwind.config.js  postcss.config.js  tsconfig.json
├─ capacitor.config.json  .env.example  .gitignore  PHONE_GUIDE.md
├─ .github/workflows/build.yml   (cloud build: PWA on GitHub Pages + debug APK)
├─ public/            icon.svg  icon-192.png  icon-512.png   (+ put PYQ PDFs in public/pyq/)
├─ server/            index.js  package.json                 (doubt-solver backend)
└─ src/
   ├─ main.tsx  App.tsx  index.css  types.ts  vite-env.d.ts
   ├─ lib/            store.tsx (state + localStorage)  i18n.ts  utils.ts  progress.ts
   ├─ components/     Layout.tsx (bottom nav / sidebar)  ui.tsx (ring, bars, banners, chart)
   ├─ data/           subjects.ts  math.ts  science.ts  others.ts  helpers.ts  pyq.ts
   └─ pages/          Dashboard Subjects SubjectPage ChapterPage Practice Quiz Flashcards
                      Planner Progress Doubt Pyq Search Bookmarks Formulas More Settings
```

## Run locally

Requires Node.js 18+.

```bash
cd boardbuddy
npm install
npm run dev          # http://localhost:5173
```

### Turn on the AI doubt solver (optional)

```bash
cd server
npm install
cp .env.example .env         # edit server/.env locally: set GEMINI_API_KEY=...
npm start                    # API on http://localhost:8787
```

Leave `npm run dev` running in another terminal. In development Vite forwards `/api` to port 8787 automatically. Never put the key in the frontend or commit `.env`.

## Build and deploy the website

```bash
npm run build        # outputs dist/
npm run typecheck    # run TypeScript checks separately
npm run preview      # test the production build locally
```

Upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Firebase Hosting).

For the doubt solver in production, deploy `server/` to a Node host (Render, Railway, Fly.io, etc.), set `GEMINI_API_KEY`, `GEMINI_MODEL`, and `ALLOWED_ORIGIN` (your website URL) as environment variables there, then build the frontend with `VITE_API_URL=https://your-api-host` in `.env`.

## Install on Android

Phone-only steps (no computer needed): see **PHONE_GUIDE.md**. In short, `.github/workflows/build.yml` builds the site (GitHub Pages, installable as a PWA) and a debug APK (attached to a GitHub Release) every time you push to `main`.

## Build an APK on your own computer (optional)

Requires Android Studio and JDK 17. Capacitor packages are already in `package.json`.

```bash
npm install
npm run build
npx cap add android       # first time only
npx cap sync android
npx cap open android      # Android Studio: Build > Build Bundle(s)/APK(s) > Build APK(s)
```

For the doubt solver inside the APK, `VITE_API_URL` must be a full `https://` URL, and add `https://localhost` to `ALLOWED_ORIGIN` on the server (comma-separated), because the Capacitor app runs from that origin. A Play Store release needs a signed release build (Android Studio: Generate Signed Bundle); the debug APK from the workflow is for installing on your own phone.

## Updating content

- Add or rename chapters in `src/data/*.ts`, and register new subjects in `src/data/subjects.ts`.
- After checking a chapter against the official textbook, set `status: 'verified'` on it to remove the sample banner.
- Hindi text is optional per field (`l('English', 'हिंदी')`); missing Hindi falls back to English. Hindi coverage in the sample data is partial.
- Add papers in `src/data/pyq.ts` (see comments there).

## Test checklist

- [ ] Dashboard: welcome, ring, streak, "+10 min" raises the ring, quote shows, subject cards link correctly
- [ ] Language toggle (EN/हिं) changes labels; dark/light toggle persists after refresh
- [ ] Subjects → subject → chapter: notes, definitions, formulas, key points, important questions render; sample banner visible
- [ ] Mark chapter completed → progress bars and counts update; bookmark chapter/formula/question
- [ ] Chapter quiz: shuffled questions and options, instant feedback + explanation, timer on/off, finish shows score and answers
- [ ] "Retry incorrect questions" and Practice → "Revise incorrect answers" work; with none wrong, a friendly empty state shows
- [ ] Subject test builds from all chapters of the subject; best score appears in Practice; history lists attempts
- [ ] Flashcards: tap flips, next/previous, known / needs revision, revision mode hides known cards, bookmark a card
- [ ] Planner: add task (validation errors for empty name / bad minutes), tick done, delete, today's pending/done counts, week list
- [ ] Progress: 7-day chart, accuracy per subject, streak; reset asks for confirmation and clears data (keeps language/theme)
- [ ] Doubt solver without backend: shows setup notice + labelled offline search; with backend and key: returns step-by-step answer; empty/too-long input is rejected
- [ ] PYQ: empty state with official links; after adding an entry, View/Download work
- [ ] Search: filters by type and subject, empty state, Hindi query when Hindi mode is on
- [ ] Bookmarks page lists saved items; removing the star removes them
- [ ] Offline: build, open once, switch to airplane mode, reload – app still opens
- [ ] Layout: bottom bar on phone width, sidebar on tablet/desktop


## Gemini and Firebase setup

Follow [FIREBASE_GEMINI_SETUP.md](FIREBASE_GEMINI_SETUP.md) for Gemini server configuration, Firebase Authentication setup, security rules, and secure initial admin provisioning for the configured email. Do not paste API keys or service-account credentials into chat or commit them.
