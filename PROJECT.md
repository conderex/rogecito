# DoingTheDoings — Documento Maestro / Master Doc

*Contexto para cualquier Claude (chat, design, Cowork, Claude Code). Última actualización:
finales de julio 2026 (tras PR #17). Cambios recientes: brief de marca (Parte 1), Conteos
ahora es timeline mensual, kit completo de Google Play.*

- **App en vivo:** https://doingthedoings.com/
- **Privacidad:** https://doingthedoings.com/privacy.html
- **Repo:** `conderex/rogecito`. **Producción = Vercel** (integración Git, rama `main`,
  auto-deploy en cada merge) sirviendo `doingthedoings.com`. El viejo
  `conderex.github.io/rogecito/` sigue encendido en GitHub Pages **solo** como
  salvavidas de las usuarias ya instaladas — Pages NO tiene el dominio custom.
- **Fundadora:** Roge (rogerthatheart@gmail.com) — solo founder, construye con Claude Code.
- Docs hermanos en el repo: `POSITIONING.md` (tesis y mensajes por canal),
  `store/play-listing.md` (ficha de Play), `store/twa/README.md` (paquete Android).

---

# PARTE 1 — Brief de producto y marca

## Concepto

**DoingTheDoings** es un tracker de hábitos cálido y sin culpa, basado en la **activación
conductual** (AC) — una terapia real, de tercera generación, nacida para tratar la
depresión. La app convierte el *activity scheduling* de la AC en **"tablitas"**: pequeñas
tablas de actividades diarias significativas que se marcan con un tap. En los días
difíciles, primero actúas — y el ánimo llega después.

## Objetivo

Ayudar a construir **constancia sin culpa, un día a la vez** — especialmente a personas
que atraviesan días grises y no tienen energía para apps exigentes.

**North Star (métricas que importan):**
- Tiempo-hasta-marcar: **< 10 segundos** desde abrir la app.
- **Retención en días de bajo uso** (que vuelvan aunque fallen).
- NO minutos de sesión — queremos sesiones cortas.

**El trade-off que nos define:** las apps de productividad compiten en funciones;
DoingTheDoings compite en **fricción**: 10 segundos, un tap, cero configuración.

## Alcance

**Lo que ES hoy:** tracker semanal de tablitas + contadores (+/−) + rachas + Insights
(constancia, rachas máximas, conteos mes a mes) + bilingüe ES/EN + PWA instalable y
offline + borrado de cuenta in-app.

**Lo que NO es (decisiones, no pendientes):**
- No es red social — no hay feed, likes ni comparación con otros.
- No es app médica — no diagnostica ni trata; "no sustituye terapia" siempre.
- No castiga — sin rachas rotas en rojo, sin notificaciones culposas, sin anuncios.
- No impone metas — cada quien (o su terapeuta) define sus tablitas.

**Roadmap corto:** ① Google Play (kit listo; faltan testers + cuenta de consola) →
② iOS con Capacitor (requiere Mac y Sign in with Apple) → ③ comunidad fundadora de
psicólogos hispanohablantes (gratis) → ④ tier Pro para terapeutas (panel de progreso de
pacientes) como monetización futura. Sin anuncios, decidido.

## Valores

1. **Sin culpa** — fallar un día es información, no fracaso.
2. **Amabilidad** — la app le habla al usuario como a alguien querido.
3. **Mínima fricción** — cada pantalla extra es una razón para abandonar; simplicidad
   es la decisión clínicamente correcta.
4. **Honestidad clínica** — la app es la *tarea entre sesiones*; el análisis funcional
   es del terapeuta. Nunca claims médicos.
5. **Privacidad real** — sin rastreadores, sin venta de datos, borrado total in-app.
6. **Calidez artesanal** — hecho a mano, imperfecto a propósito, humano.

## Audiencia

- **Primaria:** personas hispanohablantes (México/LatAm primero) que quieren constancia
  en lo pequeño, incluyendo quienes están en terapia o pasan por depresión/ansiedad.
- **Secundaria (multiplicadores):** psicólogos y terapeutas que la recomiendan a
  pacientes como tarea entre sesiones — cada terapeuta trae varios usuarios.
- Bilingüe: default español; inglés a un tap.

## Tono y voz

- Cálido, honesto, cercano, un poquito juguetón. Diminutivos con cariño (tablitas,
  cafecito). Firma: **un día a la vez ✿**
- Celebra lo pequeño ("¡3 días seguidos!"), jamás regaña ("llevas 5 días sin…" ❌).
- **Reglas duras:** nunca culpa, nunca presión, nunca claims médicos, nunca jerga
  clínica en textos de consumidor (la jerga vive en el pitch a psicólogos).
- Taglines oficiales: ES *"Constancia sin culpa, un día a la vez ✿"* ·
  EN *"Guilt-free consistency, one day at a time ✿"*

## Sistema de temas — v2 (agosto 2026)

*Tokens semánticos re-escopados por tema via `html[data-theme]`. Los acentos se
guardan en DB como `var(--teal)` etc., así que cambiar de tema re-pinta todas las
tablitas sin migración. Elección por dispositivo (`roge_theme_v1`), selector en
modo edición ("apariencia"). Detalle completo en `branding/UX-ESTADO-ACTUAL.md`.*

| Tema | Fondo | Tarjetas | Nota |
|---|---|---|---|
| ☕ **Oat Milk** (default) | `#ffffff` | `#ffffff` | lienzo blanco plano (sin tinte: un off-white amarillento se lee como palidez); frambuesa `#ef476f` releva a la terracota |
| 🍵 Matcha | `#eff4ec` | `#ffffff` | verdes al frente |
| 🍇 Lavanda | `#f4f1f8` | `#ffffff` | corrido al frío |
| 🌙 Cielo Nocturno | `#1d1d24` | `#5f6879` | estrellas CSS que respiran; lunita SVG; solo elección manual |
| ✦ Golden Casket | `#e7d8b8` | `#f4ead0` | la paleta original, elegible para quien la extrañe |

Cada tema define sus PROPIOS 5 acentos (roles: teal/cálido/lavanda/oro/rosa),
contraste AA verificado. La lunita y la florecita son isotipos SVG, jamás emoji.

### Golden Casket — la paleta original (hoy un tema más)

*Desierto cálido: dorados polvorientos, naranjas quemados, teals apagados sobre arena.*

| Nombre | Hex | Uso |
|---|---|---|
| Sand | `#e7d8b8` | Fondo base de todo |
| Sand deep | `#d8c39a` | Degradados/washes del fondo |
| Paper | `#f4ead0` | Superficie de tarjetas |
| Ink | `#2a2118` | Texto principal, bordes, líneas (café casi negro) |
| Ink soft | `#6b5d49` | Texto secundario, hints |
| Gold | `#d9a441` | Acento (botón Hoy, contador Cafecito) |
| Orange | `#cf6a39` | Acento quemado (LEDs, loader, avisos) |
| Orange deep | `#b04f22` | Subtítulos manuscritos (mejor contraste) |
| Teal | `#3f8a80` | Acento principal de tablitas |
| Lavender | `#8f82c2` | Acento de tablitas |
| Pink | `#d98798` | Acento cálido |
| Shadow | `rgba(42,33,24,.28)` | Sombras sólidas desplazadas |

Los acentos de tablitas/contadores se eligen de: teal, orange, lavender, gold, pink.

## Tipografías

| Fuente | Rol | Cómo se usa |
|---|---|---|
| **Fraunces** (800, opsz 144, SOFT alto) | Display | Títulos, números grandes, wordmark. Serif expresiva y suavecita |
| **Space Grotesk** (400–700) | Cuerpo | UI, botones, texto corrido |
| **Caveat** (500–700) | Manuscrita | Subtítulos, frases emotivas, captions — siempre con rotación −1° a −3° |

Servidas por Google Fonts. Para gráficos generados: TTFs desde el repo google/fonts.

## Elementos visuales (el "look" artesanal)

- **Tarjetas papel:** fondo paper, borde tinta **2.5–3.5px**, radio 12–18px.
- **Sombras SÓLIDAS desplazadas** (ej. `4px 4px 0 shadow`) — **nunca blur**; estética
  sticker/recorte.
- **Rotaciones sutiles** (±0.3° a ±2°) en tarjetas, captions y sellos — imperfección
  a propósito.
- **Pills** por todos lados: rachas (🔥 + número), toggle ES/EN, selector de periodo,
  botones redondeados.
- **Flor ✿** como firma de marca (footer, taglines, watermarks gigantes al 4–5% de
  opacidad en material de marketing).
- **Emojis con cariño:** ☕ 🏆 🔥 📊 ✨ 🤍 — parte del lenguaje, no decoración random.
- **Scrollbar de marca:** pulgar ink-soft sobre riel sand, thin.
- Gráficas propias (SVG/CSS inline, sin librerías): barras pastilla redondeadas y líneas
  con puntos, siempre en los acentos de la paleta.

---

# PARTE 2 — Technical Reference (English)

## 1. Product features (current)

- **Tracker (home):** "tablitas" — sub-activities (rows) × 7 day columns; tap to
  fill/unfill. Week runs **Thursday → Wednesday** (deliberate quirk). Prev/next/Hoy
  navigation. Days before the start of last week are **locked** (~2 editable weeks).
- **Counters:** tally trackers (+/− per day) under the grid.
- **Streaks:** per-tablita current & longest (counts days with ≥1 check). **Gentle
  grace:** tolerates up to 2 consecutive missed days; only 3 in a row breaks it.
  Forgiven days show as a patch ✿, not a gap; the pill shows ✿ when a patch is holding
  the streak. Tapping the 🔥 pill opens a "how streaks work" explainer. A one-time
  welcome card greets brand-new accounts.
- **Insights tab:**
  1. **Constancia** — per-tablita completion, selector *Semana/Mes/Año*: week = 7 daily
     bars (zero days pop as stubs), month & year = % line charts; reward headline
     `86% · 18/21`.
  2. **Rachas máximas** — longest-streak pills.
  3. **Conteos** — **month-over-month timeline**: one line per counter (accent colors),
     monthly totals from first month with data (last 12 max), clean y-axis (1/2/5×10ⁿ),
     localized month labels, legend.
- **Edit mode (✎):** create/rename/reorder/archive tablitas, subs, counters (archive
  preserves history); color accents; **account deletion** (danger zone, double confirm).
- **Auth:** Supabase — email+password, Google OAuth, magic link, reset; PKCE.
- **i18n:** symmetric `I18N.es/en` dicts, `tr()` helper, `data-i18n*` attributes;
  Spanish default; starter seed matches signup language (*Estirarme/Stretch* +
  *Casa Limpia/Clean House* + counters ☕/🏆).
- **Footer links:** `privacidad` (privacy.html) + `comentarios` (feedback mailto with
  prefilled subject) — on the login gate and the Insights footer.
- **Owner-only Stats tab (📊):** gated by owner email + server-verified `owner_stats()`.
- **PWA:** manifest + icons (incl. maskable) + service worker (offline shell; Supabase
  never cached).

## 2. Architecture

- **Frontend:** ONE file, `index.html` (~2,400 lines) — inline CSS + vanilla JS, no
  framework, no build. supabase-js v2 from CDN (jsdelivr→unpkg fallback) for auth only.
  Direct-DOM renders (`renderTrackerArea`, `renderInsights`, `renderEditor`…) off a
  `state` object mirrored to localStorage (`roge_checks_v1`, `roge_config_v1`,
  `roge_counters_v1`, `roge_lang_v1`). Offline falls back to local mode (SYNC/LOCAL pill;
  the pill is `display:none` when not shown — it must never reserve header space).
- **Check-key encoding (core data model):** tablita check = `"<tablitaId>|<subId>|YYYY-MM-DD"`;
  counter tap = `"conteo|<counterId>#<token>|YYYY-MM-DD"` (one row per tap).
- **Backend — Supabase** (project `gqjpkftshxqeuigcrecc`): Postgres with RLS scoping all
  rows to `auth.uid()`. Tables: `checks`, `tablitas`, `sub_activities`, `counters`
  (+ frozen `bak_*_pre_auth`). Data access via raw REST `fetch` with anon key + user JWT.
  RPCs (SECURITY DEFINER, in `supabase/*.sql`): `owner_stats()` (owner metrics),
  `delete_user()` (self-service deletion, `authenticated` grant only).
- **Dates:** `iso/addDays/startOfToday/weekStart` (Thursday!), `lockBeforeISO`.
- **Insights math:** `computeStreaks`, `tablitaConsData` (day/month buckets, future
  flagged, % = filled/(nSubs×elapsed) capped 100), `counterMonthlyTimeline` + `niceMax`
  + `countsLine` (multi-series SVG).
- **Security hygiene:** accents stored as CSS-var strings whitelisted by `safeAccent()`;
  `esc()` for HTML.
- **Hosting/deploys:** **Vercel** (Git integration, project `doingthedoings`, root `./`,
  Framework=Other, no build — static). Production branch = `main`; every merge to `main`
  auto-deploys to `doingthedoings.com`. No `vercel.json` in the repo. DNS lives at
  **Squarespace** (`A @ 216.198.79.1`, `CNAME www cname.vercel-dns.com`); Vercel issues
  and forces HTTPS. GitHub Pages is still on for the legacy `github.io/rogecito/` origin
  only — do **not** add a custom domain there (the CNAME would fight Vercel). Workflow:
  branch `claude/roge-tracker-app-b3FPy` → PR → squash merge → hard-reset branch to main.
  `vercel.json` sets Cache-Control:no-cache on sw.js (deploys reach users without the
  double-reload dance); `.vercelignore` keeps internal docs/branding/store/supabase/test
  out of the public site. Tests live in `test/` (jsdom; `cd test && npm i && node
  app.test.js`). Future idea borrowed from Mary's cycle tracker: CSV/report export.
  Verification style: `node --check` on the inline script + jsdom harness tests
  (render functions driven with seeded state, DOM assertions, i18n symmetry).

### 2.1 Visual/marketing asset inventory

- In-repo: `icon.png` (1000² source) + `icon-192/512/maskable-512/1024`, `og-image.png`,
  `store/feature-graphic.png` (1024×500), `store/screens/01–04` (1080×2340 framed
  screenshots), `manifest.json`, branded scrollbar CSS.
- Delivered as chat files (HTML sources in the session scratchpad, NOT in repo):
  IG-story flyers ES/EN (1080×1920).
- **Reproduction recipe:** marketing graphics are HTML pages using the app's exact CSS
  variables/fonts, rendered with headless Chromium (Playwright) — fonts (Fraunces,
  Caveat, Space Grotesk, Noto Color Emoji) installed from the google/fonts GitHub repo.
  App screenshots: load `index.html` locally, stub network, inject demo state, render.

## 3. Launch assets & store pipeline (status: late July 2026)

- **Google Play — everything prepared, waiting on testers/console:**
  - `store/play-listing.md`: paste-ready ES/EN listing (limits verified), Data Safety
    answers, IARC content-rating answers, reviewer access instructions (test-account
    credentials go ONLY in Play Console), 18+/no-ads declarations, launch-day checklist.
  - `store/twa/twa-manifest.json` + `README.md`: Bubblewrap config (packageId
    `com.doingthedoings.app`) and the exact build recipe. The `.aab` must be built on a
    laptop (~15 min) — the cloud dev environment's proxy blocks Android SDK downloads.
  - `.well-known/assetlinks.json`: placeholder awaiting the Play App Signing SHA-256.
    With the custom apex domain this repo is the site root, so the file serves
    directly at https://doingthedoings.com/.well-known/assetlinks.json — the old
    workaround of hosting it from the user-site repo no longer applies.
  - **Closed-test requirement:** 12 testers opted-in for 14 continuous days (personal
    account policy). Status: **~2 of 15 committed**; invitation copy (WhatsApp/LinkedIn/
    short, ES+EN) already written.
  - Roge's pending: Play Console account ($25 + ID verification), tester Gmails,
    reviewer test account.
- **iOS (phase 2, not started):** Capacitor with bundled HTML (Apple rejects thin
  wrappers), local-notification reminders + haptics, **Sign in with Apple required**
  (Google login exists) or hide Google on iOS; needs a Mac or cloud macOS build. $99/yr.
- **Users:** ~8 registered (owner's network). No paid acquisition, no analytics beyond
  owner Stats (privacy stance).

## 4. History (PR changelog)

| PR | What |
|---|---|
| #1 | Rebrand to **DoingTheDoings** (title, OG images, icon) |
| #2 | Full **ES/EN i18n** + toggle; Spanish default |
| #3 | English starter tables for EN signups |
| #4 | Owner-only **Stats panel** + `owner_stats()` |
| #5 | Header polish (responsive title, darker tagline) |
| #6–#8 | Insights redesign → **Constancia** card (bars + lines) |
| #9 | Fix tracker cells collapsing (`.bar` CSS collision) |
| #10 | Constancia: Month as line, Quarter removed |
| #11 | **Store-readiness**: PWA, in-app **account deletion**, **privacy.html** |
| #12 | Starter table → **Estirarme/Stretch** |
| #13 | `POSITIONING.md` |
| #14 | Branded scrollbar |
| #15 | `PROJECT.md` (this doc, v1) |
| #16 | **Conteos → month-over-month timeline** (comparison view removed) |
| #17 | **Play-launch prep kit** (listing, graphics, TWA scaffold, feedback link, 360px header fix) |

Pre-history: personal tracker for Roge → multi-user auth migration (`PLAN-auth.md`);
owner's original data preserved in `bak_*` tables.

## 5. Known quirks & deliberate decisions

- Week starts **Thursday** (day headers `J V S D L Ma Mi`).
- Repo/URL still "rogecito"; product is DoingTheDoings.
- `TABLITAS_DEFAULT`/`COUNTERS_DEFAULT` = owner's original offline-fallback config —
  intentionally NOT the new-user seed (`NEW_USER_TABLITAS*`).
- Editing lock: current + previous week only.
- Language pref survives account deletion (only data keys wiped).
- Privacy-policy contact = owner's personal Gmail (may swap for an alias later).
- The Claude Code cloud env cannot reach `conderex.github.io` (network policy) — deploy
  verification happens on Roge's phone.

## 6. Glossary

- **Tablita** — a habit table (one tracker card) · **Sub-actividad** — a row in it
- **Conteo** — tally counter (+/−) · **Racha** — streak
- **AC** — activación conductual (behavioral activation)
- **Golden Casket** — the design system name

---

# Cómo usar este documento (para cualquier Claude)

1. **Orden de verdad:** este doc → `POSITIONING.md` → el código (`index.html`). Si algo
   contradice, gana lo más específico y reciente; pregunta a Roge ante dudas grandes.
2. **Reglas innegociables en cualquier texto o diseño:** nunca culpa, nunca presión,
   nunca claims médicos ("no sustituye terapia"), siempre bilingüe-ready (ES primero).
3. **Para trabajo de diseño:** usa la Parte 1 (paleta exacta, tipografías, elementos
   visuales). Sello de la casa: bordes tinta gruesos + sombras sólidas SIN blur +
   rotaciones sutiles + ✿. Si un diseño se ve "corporativo y pulido", está mal.
