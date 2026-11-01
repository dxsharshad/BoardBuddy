# Integrations – real status

| Integration | Status in 0.2.0 | Why |
|---|---|---|
| Instagram link | **Works** if you set `VITE_INSTAGRAM_URL` (GitHub → repo Settings → Secrets and variables → Actions → *Variables*; add it to the build step `env`) | It is only a link. Teacher Instagram links come from `notes.json`. |
| Google Drive upload | **Pending configuration** (not built) | Needs a Google Cloud project, OAuth consent screen and client ID, and a place to run the sign-in. Use only the narrow `drive.file` scope. No token is ever stored in this repo. Until then use "Save a copy" in My Notes. |
| Instagram account / feed | **Not built** | Needs a Meta developer app, a business account and Meta app review, plus a server to hold tokens. |
| AI doubt solver | Works only with the optional backend (`npm run server`) and your key in `server/.env` | Keys must never be in the app. Without it the app says so and offers the offline snippet search. |

Nothing here is claimed to work unless it was run; see CHANGELOG "Not included".
