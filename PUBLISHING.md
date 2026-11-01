# Publishing teacher notes and tests (no server needed)

You (the app owner) are the "admin". Check the teacher yourself, then add their content to the repository. Students see it after the next automatic build (about 5–10 minutes). All steps work from the GitHub website on your phone.

## Add a teacher note
1. GitHub → your repo → `public/teacher-notes/` → **Add file → Upload files**: upload the photo (`.jpg/.png/.webp`) or `.pdf`. Keep names simple: letters, digits, `.`, `-`, `_`.
2. Open `public/teacher-notes/notes.json` → pencil icon → edit:
```json
{
  "teachers": [
    { "id": "ravi", "name": "Ravi Sir", "bio": "Maths teacher", "instagramUrl": "https://www.instagram.com/ravi_sir/", "verified": true }
  ],
  "notes": [
    { "id": "ravi-real-numbers-1", "title": "Real Numbers – HCF/LCM", "teacherId": "ravi", "subject": "math",
      "chapter": "Real Numbers", "language": "en", "description": "Short notes", "tags": ["hcf", "lcm"],
      "type": "image", "file": "real-numbers-1.jpg", "date": "2026-11-01" }
  ]
}
```
- `subject`: `math`, `science`, `sst`, `hindi`, `english`, `sanskrit`. `language`: `en`, `hi`, `both`. `type`: `image`, `pdf` (use `file`) or `link` (use `"url": "https://..."`).
- "verified" simply means *you listed this teacher*; the app says "Listed by the BoardBuddy owner".
- Shortcut: in **My Notes** tap **For publishing** on a note to copy a ready entry.
3. **Commit changes**. A bad entry is skipped by the app (invalid file names, non-https links, missing fields) and never crashes it.

## Add a test
1. Edit `public/tests/tests.json` → add a test to `"tests"` (see the demo entry; **delete the demo when you go live**).
2. Create `public/tests/<keyFile>` with `{ "answers": { "q1": 1 }, "explanations": { "q1": "why" } }` (answer = option number starting at 0).
3. Shortcut: **Test Series → Create a practice test → Copy JSON** gives both pieces.
`marksPerQ` and `negative` set scoring. Scoring happens on the student's phone.

## Important honesty note
The answer key is a separate file that the app only downloads **after** the student submits, so the questions screen never contains answers. But on static hosting every file is public: a determined student could open the key URL directly. Treat these tests as practice, not as a secure exam. Secret keys need a server.
