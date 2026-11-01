# BoardBuddy – Class 10 Bihar Board

Made by Arshad Kamal.

A mobile-first study app (PWA, Android-ready) with notes, MCQ quizzes, flashcards, planner, progress tracking, bookmarks, search, a PYQ section and an AI doubt solver. Hindi + English, light + dark mode.

## Status (please read)

- **Start here for phones: [PHONE_GUIDE.md](PHONE_GUIDE.md)** – install as an app on Android using only your phone (PWA, or a real APK built in the cloud).
- v0.1.1 review: the code was inspected file by file, syntax-checked, and smoke-tested in a real browser (all 22 routes in English and Hindi, quiz, planner, flashcards, bookmarks, search, reset, persistence). One crash that would have shown a blank white screen on current Chrome was fixed (`window.scrollTo()` now returns a Promise; `Layout.tsx` returned it from an effect).
- **Not yet done:** a full `npm install` + `vite build` + `tsc` could not be run in the environment where v0.1.1 was prepared (no npm access), and no APK has been built yet. The first GitHub Actions run (see PHONE_GUIDE.md) is the first real build. `npm run build` no longer blocks on type errors; run `npm run typecheck` to see them.
- **All educational content is SAMPLE content** (12 chapters across 6 subjects, 43 MCQs, 30 flashcards). It has not been checked against the official BSEB textbooks or syllabus, and chapter names may not match the official list. Every chapter is marked `status: 'sample'` and shows a warning banner in the app until you verify it. Hindi text covers only part of the notes.
- **No previous-year papers are included.** `src/data/pyq.ts` is empty on purpose. Add only papers you have downloaded from BSEB (biharboardonline.bihar.gov.in) or another source you trust.
- The doubt solver gives real AI answers only when the backend runs with your own API key. Without it the app says so and shows a limited keyword search over the sample notes (clearly labelled "not AI"). The phone-only setup does not include the backend.
- Your progress is stored in the browser/app on each device (localStorage key `boardbuddy:v1`, unchanged). The installed PWA and the APK keep separate data, and clearing site/app data erases it.
- Official syllabus and textbooks: biharboardonline.bihar.gov.in and bstbpc.gov.in. Exam dates for 2027 were not confirmed by the board at the time of writing, so the app shows none.

## What's new in 0.2.0 (no backend, no accounts)
Teacher Notes, My Notes, Test Series, live "app open" timer, glass design, richer dashboard. See `CHANGELOG.md`.
Publishing content for students: `PUBLISHING.md`. Google Drive / Instagram status: `INTEGRATIONS.md`.
Run the unit tests with `npm run test:usage`.

## Architecture choice

React + TypeScript + Vite + Tailwind, all data in the browser (localStorage). No accounts and no database are needed for the MVP, which keeps it free to host, fast on low-end phones and usable offline as a PWA. Cloud sync can be added later (e.g. Supabase or Firebase) without changing the UI. The only server piece is a small Express proxy that keeps the AI API key secret.

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
cp ../.env.example .env      # then edit server/.env: set ANTHROPIC_API_KEY=...
npm start                    # API on http://localhost:8787
```

Leave `npm run dev` running in another terminal. In development Vite forwards `/api` to port 8787 automatically. Never put the key in the frontend or commit `.env`.

## Build and deploy the website

```bash
npm run build        # type-checks, then outputs dist/
npm run preview      # test the production build locally
```

Upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Firebase Hosting).

For the doubt solver in production, deploy `server/` to a Node host (Render, Railway, Fly.io, etc.), set `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, and `ALLOWED_ORIGIN` (your website URL) as environment variables there, then build the frontend with `VITE_API_URL=https://your-api-host` in `.env`.

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

### Added in 0.2.0 (all run in a browser smoke test; see CHANGELOG)
- [ ] Teacher Notes: list, search, filters, viewer, teacher page; empty state explains publishing
- [ ] My Notes: add photo/PDF, wrong type rejected, edit, delete, survives reload
- [ ] Test Series: daily practice, demo teacher test (key only fetched after submit), My tests builder, history
- [ ] Dashboard/Progress show "app open" time, labelled as not study time
- [ ] Settings → Reduce effects turns glass/blur off and stays off after reload
