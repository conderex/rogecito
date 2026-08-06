# Android package (TWA) — build & launch recipe

The app ships to Google Play as a **Trusted Web Activity**: a thin, official Android
wrapper around https://doingthedoings.com/ built with
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap). No app code is duplicated —
the PWA (manifest + service worker, already live) IS the app.

## One-time build (~15 min on a laptop)

Prereqs: Node 18+. Bubblewrap offers to download its own JDK + Android SDK on first run —
say **Yes** to both.

```bash
npm i -g @bubblewrap/cli
mkdir doings-twa && cd doings-twa
cp <repo>/store/twa/twa-manifest.json .
bubblewrap build
```

- When asked to create a signing key, accept — it creates `android.keystore` with alias
  `doingthedoings` (matches this manifest). **Choose a password and save it in a password
  manager. NEVER commit the keystore or password.** Losing it is fine-ish (Play App
  Signing holds the real key), but keep it safe anyway — it signs your uploads.
- Output: **`app-release-bundle.aab`** → this is what you upload to Play.

## Play Console steps (launch day)

1. **Create app** → name `DoingTheDoings`, default language Spanish, App (not game), Free.
2. **Closed testing** → Create track release → upload `app-release-bundle.aab`.
   - Play will ask to enroll in **Play App Signing** → accept (recommended).
3. **Testers** tab → create an email list with the tester Gmails → save → copy the
   **opt-in link** and send it to testers. The 14-day clock runs while ≥12 stay opted in.
4. Complete **Store listing / Data safety / Content rating / App access** — everything is
   pre-written in [`../play-listing.md`](../play-listing.md).
5. **Digital Asset Links** (removes the browser URL bar in the TWA):
   - Play Console → *Setup → App integrity → App signing* → copy the
     **SHA-256 certificate fingerprint**.
   - Paste it into `/.well-known/assetlinks.json` in the repo (replacing the TODO),
     merge to `main`, wait for Pages to deploy.
   - Verify: https://conderex.github.io/.well-known/assetlinks.json must serve it.
     ⚠️ **GitHub Pages note:** for a *project* site, `/.well-known/` must live at the
     **domain root** — which, with the custom domain, is THIS repo. The file at
     `/.well-known/assetlinks.json` serves directly at
     https://doingthedoings.com/.well-known/assetlinks.json (no second repo needed).
     If that repo doesn't exist, create it with just this file. (Keep the copy here as
     the source of truth; the TWA's `fullScopeUrl` is now the domain root.)
6. After 14 continuous days with 12+ testers → **Apply for production** (dashboard shows
   the button) → answer the questionnaire honestly (what was tested, feedback, fixes).

## Updating the app later

UI/feature changes ship through the website (GitHub Pages) instantly — **no Play release
needed**. You only rebuild/re-upload the `.aab` when the wrapper itself changes (icon,
name, colors, notification support, version bump for store metadata).
