# BoardBuddy on your Android phone – no computer needed

You will put the project on GitHub (free) and let GitHub build it in the cloud. You get two things:

- **A website you can install as an app (PWA)** – ready a few minutes after the first build.
- **A real APK file** – a "debug" APK you can install on your own phone. It is not a Play Store release.

Tip: in Chrome tap ⋮ and tick **Desktop site** while doing steps 2–5; GitHub's code editor is easier to use that way.

## One-time setup

1. **Get the ZIP onto your phone.** Download the updated project ZIP from the chat (for example, `BoardBuddy-Updated.zip`). Do not unzip it. Use the exact downloaded filename in the terminal commands below.
2. **Sign in to GitHub.** Open github.com in Chrome and log in (or **Sign up**, it is free).
3. **Create the repository.** Tap **+** (top right) → **New repository**. Name: `boardbuddy`. Choose **Public** (needed for free GitHub Pages). Tick **Add a README file**. Tap **Create repository**.
4. **Open a cloud editor.** On the repo page tap the green **<> Code** button → **Codespaces** tab → **Create codespace on main**. Wait 1–2 minutes until you see an editor with a file list on the left.
5. **Upload the ZIP.** In the file list, touch and hold on the empty area (or on the repo folder name) → **Upload…** → pick `BoardBuddy-Updated.zip` (or the exact name of the ZIP you downloaded) from Downloads.
6. **Unzip and push.** Open the terminal (tap ☰ top left → **Terminal** → **New Terminal**) and run these two lines, one at a time:

   ```
   unzip -o BoardBuddy-Updated.zip && rm BoardBuddy-Updated.zip
   git add -A && git commit -m "BoardBuddy v0.2.0" && git push
   ```

   If the editor asks about syncing or sign-in, accept.
7. **Turn on GitHub Pages (once).** Go back to your repo on github.com → **Settings** → **Pages** → under **Build and deployment → Source** choose **GitHub Actions**.
8. **Start or restart the build.** Repo → **Actions** tab → **Build BoardBuddy** → **Run workflow** → **Run workflow**. It takes about 5–10 minutes. Three jobs run: `web`, `deploy-pages`, `apk`. A green tick means success.
   If a job shows a red ✗, tap it, open the failed step, and send me the last 30 lines of the log.

## Option A – Install as a PWA (fastest)

1. Open `https://YOUR-GITHUB-USERNAME.github.io/boardbuddy/` in Chrome on your phone.
2. Tap ⋮ → **Install app** (or **Add to Home screen**) → **Install**.
3. Open it once while online. After that it opens offline.

## Option B – Install the APK

1. On your repo page, tap **Releases** (right side) → the newest **BoardBuddy APK build** → under **Assets** tap `BoardBuddy-debug.apk`.
2. When the download finishes, tap **Open**.
3. If Android says "For your security, your phone is not allowed to install unknown apps from this source", tap **Settings** → switch on **Allow from this source** → go back.
4. Tap **Install**. If Google Play Protect warns about an unknown app, tap **More details** → **Install anyway** (it is your own app).

## Updating later

Edit files in the Codespace (or upload new ones), then run `git add -A && git commit -m "update" && git push`. The build runs again; reopen the PWA (it updates itself) or download the newest APK from **Releases**. Install the new APK over the old one to keep your data.

## Things to know

- Your progress (streak, bookmarks, quiz history, planner) is stored on the device, separately for the PWA and the APK. Clearing Chrome site data or uninstalling the app erases it. Installing a newer APK over the old one keeps it, as long as it is a debug APK from the same repo.
- The AI doubt solver needs a separate server and your own API key (see README). Without it the Doubt screen shows a clearly labelled offline keyword search.
- All study content is sample content and must be checked against the official BSEB books before students rely on it.
- Codespaces has a free monthly allowance. Stop the Codespace when done: ☰ → **Stop Current Codespace**, or github.com/codespaces.


## Gemini AI and Admin account

For Gemini API and Firebase setup, follow `FIREBASE_GEMINI_SETUP.md`. Firebase is optional until you create a project and set the `VITE_FIREBASE_*` deployment variables. The Gemini API key belongs only in the backend host secret `GEMINI_API_KEY`. Never commit secrets. The initial admin custom claim is set using the trusted provisioning script, not from the app UI.
