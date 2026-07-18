# DoingTheDoings — Project Overview & Technical Reference

*Context document for analysis and planning (Claude Projects / Cowork). Last updated: July 2026.*

- **Live app:** https://conderex.github.io/rogecito/
- **Privacy policy:** https://conderex.github.io/rogecito/privacy.html
- **Repo:** `conderex/rogecito` (GitHub Pages serves `main`)
- **Owner:** Roge (rogerthatheart@gmail.com) — solo founder, building with Claude Code.
- Companion docs in this repo: `POSITIONING.md` (product thesis & messaging), `PLAN-auth.md` / `QA-pre-auth.md` (historical auth-migration notes).

---

## 1. What the product is

**DoingTheDoings** (formerly "Rogecito", repo name kept) is a warm, guilt-free, bilingual
(ES/EN, Spanish-default) habit tracker built on **behavioral activation (AC)** — the
third-wave, action-oriented therapy for depression. The app is the *activity scheduling*
component of AC made tappable: small, meaningful daily activities, checked in seconds.

**Positioning (see POSITIONING.md for the full version):**
- Productivity apps compete on features; DoingTheDoings competes on **friction**:
  ~10 seconds a day, one tap, zero configuration — designed for the day the user has
  no energy at all.
- The user (or their therapist) defines what matters (**values focus**); the app never
  imposes goals.
- Honest clinical framing: the app is the **between-sessions tool**, not the treatment.
  Functional analysis belongs to the therapist. **Never make medical claims.**
- North Star metrics: time-to-check < 10 s; retention on low days. NOT session length.

**Tagline:** ES *"Constancia sin culpa, un día a la vez ✿"* · EN *"Build consistency one
day at a time — no perfect streaks, no guilt."*

## 2. Product features (current)

- **Tracker (home tab):** "tablitas" (little tables). Each tablita has sub-activities
  (rows) × 7 day columns. Tap a cell to fill/unfill. Week runs **Thursday → Wednesday**
  (a deliberate quirk from the owner's routine). Week navigation with prev/next/Hoy.
  Days older than the start of last week are **locked** (read-only) so history can't be
  edited by accident (~2 editable weeks).
- **Counters:** tally-type trackers (e.g. Cafecito ☕): +/− taps per day, shown under the grid.
- **Streaks:** per-tablita current & longest streak (consecutive days with ≥1 check;
  a 1-day grace: yesterday counts if today is unmarked).
- **Insights tab:** three cards —
  1. **Constancia**: per-tablita completion with selector *Semana / Mes / Año*.
     Week = 7 daily bars (zero days show as stubs — gaps pop). Month & Year = % line charts.
     Reward headline per tablita: e.g. `86% · 18/21` (% + filled/possible fraction).
  2. **Rachas máximas**: longest-streak pills per tablita.
  3. **Conteos**: current-vs-previous comparison bars per counter with selector
     *Ayer / Semana / Mes / Año*.
- **Edit mode (✎):** create/rename/reorder/archive tablitas, sub-activities and counters
  (archive, not delete — history preserved); restore archived; color accents from a
  5-color palette; **account deletion** (danger zone, double confirm).
- **Auth:** email+password, Google sign-in, magic link, password reset (Supabase, PKCE).
- **i18n:** full ES/EN dictionaries; ES is default; toggle in header & login; choice in
  localStorage; new-account starter content matches UI language at signup.
- **Starter seed for new accounts:** ES *Estirarme* (Mañana/Tarde/Noche) + *Casa Limpia*
  (Cocina/Cuarto/Baño/Oficina); counters *Cafecito* ☕ + *Logros del día* 🏆. EN equivalents:
  *Stretch*, *Clean House*, *Coffee*, *Daily wins*.
- **Owner-only Stats tab (📊):** visible only to the owner's email; server-verified RPC
  `owner_stats()` returns aggregate user/activity metrics.
- **PWA:** installable (manifest + icons incl. maskable), offline shell via service worker.

## 3. Architecture — how it's built

### 3.1 Frontend
- **One file:** `index.html` (~2,400 lines, ~110 KB): inline CSS + vanilla JS.
  **No framework, no build step, no dependencies** except `@supabase/supabase-js@2`
  loaded from CDN (jsdelivr with unpkg fallback) *only for auth*.
- **Design system "Golden Casket"** (CSS custom properties): sand `#e7d8b8` background,
  paper `#f4ead0` cards, warm-brown ink `#2a2118`, ink-soft `#6b5d49`, teal `#3f8a80`,
  burnt orange `#cf6a39`, orange-deep `#b04f22` (subtitles), gold `#d9a441`, lavender
  `#8f82c2`, pink `#d98798`. Thick ink borders (2.5–3.5px), solid offset shadows (no blur),
  slight rotations, flower ✿ motif. Fonts: **Fraunces** (display), **Space Grotesk** (body),
  **Caveat** (handwritten), via Google Fonts. Branded thin scrollbar (ink-soft on sand).
- **Rendering:** direct DOM manipulation; `renderTrackerArea()`, `renderCards()`,
  `renderEditor()`, `renderInsights()`, etc. re-render sections from `state`.
- **State (in-memory + localStorage mirror):**
  ```js
  state = { checks:Set, config:[tablitas], counters:[], mode:'local'|'supabase',
            editing, weekOffset, tab, prevStreaks, prevCounts }
  ```
  localStorage keys: `roge_checks_v1`, `roge_config_v1`, `roge_counters_v1`, `roge_lang_v1`.
- **Check key formats (the core data encoding):**
  - Tablita check: `"<tablitaId>|<subId>|YYYY-MM-DD"` (one per filled cell).
  - Counter tap: `"conteo|<counterId>#<token>|YYYY-MM-DD"` (one row per tap; token makes
    each tap unique; `COUNTER_TABLITA='conteo'`).
- **i18n:** `I18N.es` / `I18N.en` dictionaries (symmetric keys), `tr(key,...args)` helper
  (named `tr` because `t` is taken by tablita variables), static HTML uses
  `data-i18n` / `data-i18n-ph` / `data-i18n-title`; `LANG` defaults to `'es'`.
- **Date helpers:** `iso()`, `addDays()`, `startOfToday()`, `weekStart()` (returns the
  **Thursday** of the week), `weekDates(offset)`, `lockBeforeISO()`.
- **Insights math:** `computeStreaks(id)`; `tablitaConsData(t, period)` buckets completion
  (day buckets for week/month, month buckets for year; future buckets flagged; % =
  filled/(nSubs×elapsed days) capped at 100); `counterPeriodCompare(period)` +
  `periodRanges()` for current-vs-previous ranges; SVG line charts and CSS bar charts
  are generated inline (no chart library).

### 3.2 Backend — Supabase (project `gqjpkftshxqeuigcrecc`)
- **Auth:** Supabase Auth (email/password, Google OAuth, magic links; PKCE flow;
  `persistSession`, `autoRefreshToken`).
- **Database (Postgres, RLS on all tables, policies scope rows to `auth.uid()`):**
  - `checks(id serial, tablita text, sub_activity text, check_date date, created_at, user_id uuid→auth.users)`
  - `tablitas(id text, title, accent, sort_order, archived, created_at, user_id)` — PK (id, user_id)
  - `sub_activities(id text, tablita_id, label, sort_order, archived, created_at, user_id)` — PK (id, user_id), FK → tablitas
  - `counters(id text, label, emoji, accent, sort_order, archived, created_at, user_id)` — PK (id, user_id)
  - `bak_*_pre_auth` tables: frozen pre-auth backups of the owner's original data.
- **Data access:** raw REST (`fetch` to `/rest/v1/...`) with `apikey: <anon>` +
  `Authorization: Bearer <user JWT>` headers (`authHeaders()`); helpers `sbFetchAll/
  sbFetchConfig/sbFetchCounters/sbPost/sbInsert/sbDelete`. supabase-js is used for auth
  only. Optimistic UI: local state updates immediately, then syncs; offline falls back
  to localStorage (`mode:'local'`, "SYNC/LOCAL" pill in header).
- **RPCs (both in `supabase/*.sql`, applied via migrations):**
  - `owner_stats()` — SECURITY DEFINER; re-checks the caller's email server-side; returns
    aggregate metrics for the owner-only Stats panel.
  - `delete_user()` — SECURITY DEFINER, `authenticated` grant only; deletes the caller's
    sub_activities/checks/counters/tablitas then their `auth.users` row (App Store /
    Play requirement). UI wipes localStorage + signs out.
- **Seeding:** `ensureSeed()` on first login inserts the language-appropriate starter set
  (no-op if the account has tablitas).

### 3.3 PWA layer
- `manifest.json`: standalone, portrait, sand theme, `short_name:"Doings"`, icons 192/512
  + maskable 512 (`icon-1024.png` reserved for App Store).
- `sw.js` (~70 lines): precached shell (`index.html`, manifest, icons); navigations
  network-first with cached-shell offline fallback; Google Fonts + CDN libs
  stale-while-revalidate; **`*.supabase.co` never cached** (auth/data always live).
  Cache name `dtd-v1` (bump to invalidate). Registered on `load`, never blocks the app.

### 3.4 Hosting & deployment
- GitHub Pages from `main` — no build, no CI. Deploys ~1–2 min after merge.
- Workflow used throughout: work on branch `claude/roge-tracker-app-b3FPy` → PR →
  **squash-merge** to `main` → hard-reset branch back onto `main` (force-with-lease).
- Verification style: `node --check` on the extracted inline script; **jsdom harness
  tests** that load the whole page, stub `fetch`/auth, drive real functions
  (`renderInsights()`, `deleteAccount()`, i18n symmetry checks) and assert DOM output.

## 4. History (PR changelog, June–July 2026)

| PR | What |
|---|---|
| #1 | Rebrand to **DoingTheDoings** (title, OG images, icon) |
| #2 | Full **ES/EN i18n** + language toggle; ES default |
| #3 | English starter tables for EN-language signups |
| #4 | Owner-only **Stats panel** + `owner_stats()` RPC |
| #5 | Header polish (responsive title, darker tagline) |
| #6–#8 | **Insights redesign**: heatmap experiment → period-selector counter comparison → **Constancia** card (bars + lines) |
| #9 | Fix tracker cells collapsing (`.bar` CSS collision) |
| #10 | Month as line chart; removed Quarter view |
| #11 | **Phase 0 store-readiness**: PWA (manifest/SW/icons), in-app **account deletion** (`delete_user()`), **privacy.html** |
| #12 | Starter table now **Estirarme/Stretch** (was Dientitos/Teeth) |
| #13 | `POSITIONING.md` |
| #14 | Branded scrollbar |

Pre-history (before this cycle): original personal tracker for Roge; multi-user auth
migration (see `PLAN-auth.md`), owner data preserved in `bak_*` tables.

## 5. Status & roadmap

- **Users:** ~8 registered (mid-June 2026); owner's personal network. First LinkedIn post
  made; no paid acquisition. No analytics beyond the owner Stats panel (privacy stance:
  no third-party trackers).
- **App-store plan (agreed):**
  - ✅ **Phase 0 done** (PR #11): PWA, deletion, privacy policy.
  - **Next — Google Play first** (~$25 one-time): package as **TWA** (Bubblewrap/PWABuilder).
    Blocker: personal Play accounts need a **closed test with 12 testers for 14 continuous
    days** before production. Invitation copy (WhatsApp/LinkedIn/short, ES+EN) already
    written in chat.
  - **Then — iOS via Capacitor** ($99/yr): bundle the HTML in-app (Apple rejects thin
    wrappers, rule 4.2) + native touches (local notification reminders, haptics).
    ⚠️ Google sign-in exists → Apple will require **Sign in with Apple** (or hide Google
    on iOS). Needs a Mac or cloud macOS build.
  - Native Swift/Kotlin rewrite considered and **rejected for now** (three codebases,
    kills iteration speed; wrapper is the bridge, nothing is thrown away later).
- **Monetization stance:** no ads (decided). If ever: premium tier; and a future
  **therapist Pro tier** (client progress dashboards, session exports) is the most
  strategic option.
- **Community strategy:** recruit Spanish-speaking psychologists as a **free founding
  community** (the app as between-sessions homework; each therapist brings patients);
  paid tier later. Nas.io evaluated for hosting this.
- **Marketing assets made:** IG-story flyers (ES/EN, 1080×1920) matching the design
  system; social-media strategy plan (faceless, TikTok/IG, Spanish LatAm first).

## 6. Known quirks & deliberate decisions

- Week starts **Thursday** (owner preference; affects `weekStart`, day headers `J V S D L Ma Mi`).
- Repo/URL still "rogecito"; product name is DoingTheDoings.
- `TABLITAS_DEFAULT`/`COUNTERS_DEFAULT` in code are the owner's original offline-fallback
  config (Dientitos/Salud/Casa Limpia; Stogies/Porritos/Llantos) — intentionally NOT the
  new-user seed (`NEW_USER_TABLITAS*`).
- Accent colors are stored as CSS-var strings (`var(--teal)`); `safeAccent()` whitelists
  them before injecting into HTML/SVG (XSS hygiene).
- Editing lock: only current + previous week editable.
- Language preference survives account deletion (only data keys are wiped).
- Contact email in privacy policy = owner's personal Gmail (flagged; may swap for an alias).
- The environment building this (Claude Code cloud) cannot reach `conderex.github.io`
  (network policy) — deploy verification happens on the owner's phone.

## 7. Glossary

- **Tablita** — a habit table (one card in the tracker).
- **Sub-actividad** — a row within a tablita (e.g. Mañana/Tarde/Noche).
- **Conteo / counter** — tally tracker with +/− (e.g. coffees today).
- **Racha** — streak (consecutive days with ≥1 check in a tablita).
- **AC** — activación conductual (behavioral activation).
- **Golden Casket** — the app's design system/palette name.
