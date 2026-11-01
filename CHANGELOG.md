# Changelog

## 0.2.1
- Frosted glass icon tiles (header, bottom bar, More, dashboard), glowing partition lines under the header, above the bottom bar and between More sections.
- **My Library** (More → Add PDFs & files): now also accepts Word, PowerPoint, Excel, TXT, CSV (max 10 MB, stored only on the phone).

## 0.2.0
**Added**
- **Teacher Notes** – students browse notes (photo / PDF / link) published by the app owner; search + filters (subject, language, teacher); viewer; teacher profile page.
- **My Notes** – private photos/PDFs stored on the student's own phone (IndexedDB). Camera or file picker, JPG/PNG/WebP/PDF only, max 10 MB (big photos are shrunk), edit, delete, preview, "Save a copy", and "For publishing" (copies a ready `notes.json` entry).
- **Test Series** – Daily practice (10 questions, same for everyone each day), teacher-published tests (timer, palette, mark for review, confirm dialog, auto-submit, resumes after reload, answer key fetched only after submit), "My tests" builder with JSON export, attempt history, revise-incorrect view.
- **App-open timer** – counts real foreground time (see rules below). Shown on Dashboard and as a 7-day chart on Progress. Never added to study minutes.
- **Glass design** – blue/white with a hint of purple, light + dark tokens in `src/index.css`, "Reduce effects" switch in Settings, automatic fallback for `prefers-reduced-transparency` and reduced motion.
- **Dashboard** – app-open time, teacher-notes / tests shortcuts, recent teacher notes, 20 daily quotes (same all day, changes at local midnight, English + Hindi).
- **Connect** screen – Instagram link (optional, via `VITE_INSTAGRAM_URL`); Google Drive shown honestly as "pending configuration".
- Error boundary around every page; heavier pages are lazy-loaded.
**Improved**
- Doubt solver: 30 s timeout, retry button, 3 s client cooldown, clear message on rate limit (429), one tap to switch to the offline search. AI answers and offline snippets stay clearly labelled and different.
- PWA cache: teacher files are cached at runtime (capped), JSON lists are network-first, none of it bundled in the app shell.
**Unchanged**
- Storage key `boardbuddy:v1` and every existing feature/data shape.

## App-open timer rules (src/lib/usageTracker.ts, 14 unit tests)
Counts only while the app is visible; stops on background/close; start/stop are idempotent; a gap over 10 s (phone asleep) is dropped; a backwards clock adds nothing; time is split at local midnight; two open tabs don't double count; capped at 24 h/day; corrupt storage is ignored. It proves the app was open, **not** that the student studied, and is labelled that way.

## Not included (needs a server) – deliberately not faked
Accounts and login, student/teacher/admin roles, admin dashboard and teacher-approval screen, teachers uploading from their own phone for everyone to see instantly, server-checked scores, truly secret answer keys, Google Drive sign-in/upload, Instagram account integration, image attachments in the doubt solver, in-app PDF viewer (PDFs open in the phone's viewer). Firebase was removed on request. These all need a backend or third-party credentials; `INTEGRATIONS.md` says what each would take.
