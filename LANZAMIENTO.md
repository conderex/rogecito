# Lanzamiento — estado y pasos restantes

`doingthedoings.com` **YA ESTÁ EN VIVO** (servido por Vercel). Este documento describe
cómo quedó armado el despliegue y lo único que falta para llegar a Google Play.

> Historia: el plan original era GitHub Pages + DNS en el registrador. Al final Roge y
> Claude Cowork lo montaron en **Vercel + Supabase** con el DNS en **Squarespace**, que
> resultó más limpio. Lo de abajo refleja lo que de verdad está corriendo.

## Datos que siempre se te olvidan (guárdalos aquí)

| Qué | Valor |
|---|---|
| Dominio | `doingthedoings.com` (registrado en **Squarespace**, comprado 6 ago 2026) |
| Hosting producción | **Vercel** — proyecto `doingthedoings`, integración Git, rama `main`, auto-deploy |
| Repo | `conderex/rogecito` (público; **no privatizar ni renombrar** hasta migrar a todas) |
| Origen viejo | `conderex.github.io/rogecito/` — GitHub Pages, salvavidas de las usuarias instaladas |
| Supabase — proyecto / ref | **DoingTheDoings** / `gqjpkftshxqeuigcrecc` (el MISMO — 17 usuarias intactas) |
| Google Cloud — nº proyecto | `77738106335` (ID `my-first-sanbox-project-360917`), cuenta `rogerthatheart@gmail.com` |
| Google — Client ID | `77738106335-mchl8982p0mmo29fbblg3ldl1hfmobj8.apps.googleusercontent.com` |
| Paquete Android (TWA) | `com.doingthedoings.app` |

## Cómo fluye todo hoy

```
usuaria → doingthedoings.com
          → DNS en Squarespace (A @ 216.198.79.1 · CNAME www → cname.vercel-dns.com)
          → Vercel (sirve el repo estático desde main, HTTPS forzado)
          → la app llama a Supabase (auth + datos) y a Google (login)
```

`www` redirige (307) al dominio pelón. **Cada merge a `main` se publica solo** en Vercel.

## ⛔ Las cosas que NO hay que hacer

1. **No crear un proyecto nuevo de Supabase.** El ref es aleatorio: uno nuevo saldría
   igual, y perderías las 17 usuarias. El actual es el bueno.
2. **No borrar `gqjpkftshxqeuigcrecc.supabase.co`** de los *Authorized domains* de Google.
   Es lo que hace funcionar el login. El dominio nuevo se **suma**, no reemplaza.
3. **No ponerle un dominio custom a GitHub Pages** (crearía un `CNAME` en el repo que
   competiría con Vercel por `doingthedoings.com`). Pages se queda solo con `github.io`.
4. **No privatizar ni renombrar el repo** hasta que todas las usuarias estén en el dominio
   nuevo — mataría el origen viejo de Pages donde varias tienen la PWA instalada.
5. **No subir el logo** a la pantalla de consentimiento de Google hasta que el dominio
   esté verificado — dispara una verificación que se atoraría.

---

## ✅ Ya hecho

- **Dominio vivo** en `doingthedoings.com` con HTTPS (Vercel).
- **DNS** en Squarespace apuntando a Vercel; `www` → apex.
- **Supabase URL Configuration:** Site URL = `https://doingthedoings.com`; Redirect URLs
  incluyen `https://doingthedoings.com/**` y `…/` **más** las viejas de `github.io`
  (se dejaron a propósito durante la transición).
- **Google → Authorized domains:** `doingthedoings.com` agregado; el de `supabase.co`
  se conservó. Los *redirect URIs* del cliente OAuth NO se tocaron (y está bien: el login
  de Google pasa por el callback de Supabase, que no cambió).
- **Repo:** el código no necesitó cambios de host — `manifest.json` (`start_url:"./"`,
  `scope:"./"`) y `sw.js` (shell relativo, cache `dtd-v6`) usan rutas relativas al origen.
  Los meta `og:`/`twitter:` y el `twa-manifest.json` ya apuntan a `doingthedoings.com`.

---

## ⬜ Lo que falta

### 1. Probar los 4 logins desde el dominio nuevo
Solo se confirmó **un** login exitoso (no quedó registrado con cuál método). Antes de
Play, probar cada uno en `doingthedoings.com`: correo+contraseña · crear cuenta ·
enlace mágico ✨ · botón de Google. La config los soporta; falta el chequeo humano.

### 2. Verificar el dominio en Google + terminar la pantalla de consentimiento
La app OAuth sigue en estado **"Testing"**. Para quitar el ref feo de la pantalla de
Google y poder publicar:
1. `https://console.cloud.google.com/auth/branding?project=77738106335`
2. Verificar `doingthedoings.com` (Google manda a Search Console; se comprueba con un
   registro TXT en el DNS de Squarespace).
3. Ya verificado: subir logo (`icon-512.png`), poner home `https://doingthedoings.com`,
   privacy `https://doingthedoings.com/privacy.html`, y los **términos** (falta escribir
   esa página — pídesela a Claude).
4. Mandar a verificación. **Es gratis pero tarda** (días o semanas).

### 3. Google Play (TWA)
Receta completa en [`store/twa/README.md`](store/twa/README.md). Resumen:
1. Construir el `.aab` con Bubblewrap **en una laptop** (el entorno en la nube no baja el
   SDK de Android). El `twa-manifest.json` ya apunta a `doingthedoings.com`.
2. Subirlo a **closed testing** en Play Console.
3. Copiar la huella **SHA-256** de *App integrity → App signing* y pegarla en
   `.well-known/assetlinks.json` (reemplazando el `TODO`), y mergear. Vercel lo sirve en
   `https://doingthedoings.com/.well-known/assetlinks.json`.
4. **12 testers opted-in durante 14 días seguidos** antes de publicar (regla de cuentas
   personales de Play). Estado: ~2 de 15 comprometidos.
