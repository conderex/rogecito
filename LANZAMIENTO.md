# Lanzamiento — guía paso a paso

Todo lo que falta para que `doingthedoings.com` esté vivo y la app llegue a Google Play.
Escrito para retomarse en frío: cada paso dice **dónde**, **qué escribir** y **cómo saber
que salió bien**.

## Datos que siempre se te olvidan (guárdalos aquí)

| Qué | Valor |
|---|---|
| Dominio | `doingthedoings.com` (comprado 6 ago 2026, vence 6 ago 2027) |
| Repo | `conderex/rogecito`, GitHub Pages sirve `main` |
| URL vieja | `conderex.github.io/rogecito/` (seguirá redirigiendo sola) |
| Supabase — organización | **RogerThatHeart** (plan Free) |
| Supabase — proyecto | **DoingTheDoings** |
| Supabase — ref | `gqjpkftshxqeuigcrecc` ← lo genera Supabase, NO se puede cambiar y no importa |
| Google Cloud — nº de proyecto | `77738106335` |
| Google Cloud — cuenta | `rogerthatheart@gmail.com` |
| Google — Client ID | `77738106335-mchl8982p0mmo29fbblg3ldl1hfmobj8.apps.googleusercontent.com` |
| Paquete Android (TWA) | `com.doingthedoings.app` |

**Atajo:** para entrar directo a la config de Google, abre
`https://console.cloud.google.com/auth/branding?project=77738106335`

---

## ⛔ Las tres cosas que NO hay que hacer

1. **No crear un proyecto nuevo de Supabase.** El ref feo es aleatorio: uno nuevo saldría
   igual de feo, y perderías las 17 usuarias que ya tienes.
2. **No borrar `gqjpkftshxqeuigcrecc.supabase.co`** de los *Authorized domains* de Google.
   Es lo que hace funcionar el login. El dominio nuevo se **agrega**, no reemplaza.
3. **No subir el logo** a la pantalla de consentimiento de Google antes de tener el dominio
   vivo y verificado — dispara una verificación que se atoraría.

---

## Paso 1 — DNS (en el registrador donde compraste el dominio)

**Dónde:** tu registrador → el dominio `doingthedoings.com` → sección **DNS** /
**Registros DNS** / **DNS Settings**.

Agrega estos **4 registros tipo A**. El "host"/"nombre" es `@` (significa el dominio
pelón). Si el campo no acepta `@`, déjalo vacío o pon `doingthedoings.com`:

| Tipo | Host | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

Y uno más para que `www.doingthedoings.com` también jale:

| Tipo | Host | Valor |
|---|---|---|
| CNAME | `www` | `conderex.github.io` |

**Opcional (IPv6)** — si tu registrador deja poner AAAA, agrégalos; si no, sáltatelos:
`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

**Cómo sabes que salió bien:** los cambios tardan entre 15 minutos y 2 horas. Cuando
`doingthedoings.com` deje de dar error de "no se encuentra el servidor" (aunque muestre
un 404 de GitHub), ya propagó. Ese 404 es buena señal: significa que ya llegó a GitHub.

---

## Paso 2 — GitHub Pages (solo cuando el paso 1 propagó)

**Dónde:** repo `conderex/rogecito` → **Settings** → **Pages**.

1. En **Custom domain** escribe `doingthedoings.com` → **Save**.
   (GitHub crea solo un archivo `CNAME` en el repo — es normal, déjalo.)
2. Espera la palomita verde de "DNS check successful".
3. Marca **Enforce HTTPS**. El certificado tarda unos minutos en emitirse; si la casilla
   sale gris, espera y recarga.

**Cómo sabes que salió bien:** `https://doingthedoings.com` abre tu app con candado.

---

## Paso 3 — Supabase (si no, el login se rompe)

**Dónde:** panel de Supabase → proyecto **DoingTheDoings** → barra izquierda,
**Authentication** → sección CONFIGURATION → **URL Configuration**.

1. **Site URL** → `https://doingthedoings.com`
2. **Redirect URLs** → agrega `https://doingthedoings.com/**`
   **Deja también la URL vieja** unos días, por si alguien tiene un correo de login
   pendiente de abrir.

**Cómo sabes que salió bien:** pide un enlace mágico ✨ a tu correo y comprueba que te
deja entrar desde el dominio nuevo.

---

## Paso 4 — Google (para el botón de Google)

**Dónde:** `https://console.cloud.google.com/auth/branding?project=77738106335`
con la cuenta `rogerthatheart@gmail.com`.

1. En **Authorized domains** → **+ Add domain** → `doingthedoings.com`
   (recuerda: **se suma**, el de supabase.co se queda).
2. Verifica que el dominio es tuyo en **Google Search Console** (Google te manda ahí;
   normalmente se comprueba con un registro TXT en el mismo DNS del paso 1).
3. Ya con el dominio verificado, llena el resto:
   - **App logo:** `icon-512.png` del repo
   - **Application home page:** `https://doingthedoings.com`
   - **Privacy policy:** `https://doingthedoings.com/privacy.html`
   - **Terms of service:** falta escribirla (pídesela a Claude)
4. Manda a verificación.

**Ojo:** la verificación de Google **es gratis pero tarda** — de días a semanas. Mientras
tanto la pantalla de login sigue mostrando el ref feo. No bloquea nada más.

**Nota:** el campo **App name** ya dice `DoingTheDoings`. Google lo esconde y muestra la
dirección técnica hasta que la app pasa verificación; es una medida anti-fraude, no un
error tuyo.

---

## Paso 5 — Android / Google Play (después de todo lo anterior)

La receta completa está en [`store/twa/README.md`](store/twa/README.md). Resumen:

1. Construir el `.aab` con Bubblewrap **en una laptop** (el entorno en la nube no puede
   descargar el SDK de Android). El `twa-manifest.json` ya apunta a `doingthedoings.com`.
2. Subirlo a **closed testing** en Play Console.
3. Copiar la **huella SHA-256** de *App integrity → App signing* y pegarla en
   `.well-known/assetlinks.json` (donde ahora dice `TODO_REPLACE...`), y hacer merge.
   Con el dominio propio ese archivo ya vive en el lugar correcto: se sirve en
   `https://doingthedoings.com/.well-known/assetlinks.json`.
4. **12 testers opted-in durante 14 días seguidos** antes de poder publicar (requisito de
   cuentas personales de Play). Estado: ~2 de 15 comprometidos.
