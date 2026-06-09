# Plan — Migración a multiusuario con autenticación (v1: RLS)

> **ESTADO: ✅ IMPLEMENTADO Y VERIFICADO (2026-06-09).** Resumen al pie del documento.

> Decisiones tomadas (2026-06-09):
> - **Privacidad v1 = RLS** (cada quien ve lo suyo). E2E queda para cuando se publique al mercado.
> - **Login**: Email+contraseña+reset · Magic link · Google.
> - **Onboarding nuevo**: arranca con tablitas **Dientitos** y **Casa Limpia**; contadores **Cafecito** y **Logros del día**.
> - **Datos actuales** se atan a la cuenta **rogerthatbunny@gmail.com**.

## Arquitectura actual (lo que hay que tocar)
- `index.html` (1 archivo, 1572 líneas) habla por **REST crudo** con la **llave anónima** fija en los headers (`authHeaders()`, líneas 678/725/735/746). No usa `supabase-js`.
- Tablas: `tablitas(id text PK)`, `sub_activities(id text PK, tablita_id→tablitas)`, `counters(id text PK)`, `checks(id serial PK, tablita, sub_activity, check_date)`. **Ninguna tiene `user_id`.**
- IDs = claves naturales (`dientitos`, `d_manana`, `stogies`) → con multiusuario **colisionan**. Las PK deben volverse **por-usuario**.
- Políticas actuales `allow_all` (USING true) = todo compartido. Se reemplazan por `auth.uid() = user_id`.
- Red de seguridad ya lista: snapshots `bak_*_pre_auth`, rama `rollback/v1-pre-auth`, runbook en `QA-pre-auth.md`.

---

## Estrategia de corte SIN downtime
El backfill necesita el `user_id` de Roge, que solo existe **después** de que cree su cuenta. Por eso el orden es:

1. **Esquema** (columnas `user_id` nullable) — la app sigue viva en modo anónimo.
2. **Deploy del frontend con login**, pero RLS todavía en `allow_all`. Roge entra y crea su cuenta con `rogerthatbunny@gmail.com`. (En esta ventana solo existe su cuenta, así que "todo compartido" = solo sus datos.)
3. **Backfill** de todas las filas existentes → su `user_id`; `NOT NULL`; PKs por-usuario.
4. **Flip de RLS** a por-usuario (`auth.uid() = user_id`) + quitar `allow_all`.
5. **Verificación** con una 2ª cuenta de prueba (aislamiento).

---

## Fase 0 — Configurar Auth (panel Supabase) — manual
- Activar proveedores: **Email** (con confirmación + reset), **Magic Link** (OTP por email), **Google**.
- **Google** requiere credenciales OAuth (Client ID/Secret) de Google Cloud Console → pegarlas en Auth ▸ Providers ▸ Google. *Email + Magic link pueden salir sin esto; Google se suma cuando estén las credenciales.*
- **Redirect/Site URLs**: la URL de GitHub Pages de la app (para que reset/magic-link/Google regresen bien).
- Revisar plantillas de correo (confirmación, reset) en español.

## Fase 1 — Esquema (migración SQL, reversible vía snapshots)
```sql
-- 1. user_id nullable en las 4 tablas
alter table tablitas       add column user_id uuid references auth.users(id) on delete cascade;
alter table sub_activities add column user_id uuid references auth.users(id) on delete cascade;
alter table counters       add column user_id uuid references auth.users(id) on delete cascade;
alter table checks         add column user_id uuid references auth.users(id) on delete cascade;
-- índices para el filtrado por usuario
create index on tablitas(user_id); create index on sub_activities(user_id);
create index on counters(user_id); create index on checks(user_id);
```

## Fase 2 — (tras login de Roge) Backfill + PKs por-usuario
```sql
-- backfill: <ROGE_UID> = id de auth.users de rogerthatbunny@gmail.com
update tablitas       set user_id='<ROGE_UID>' where user_id is null;
update sub_activities set user_id='<ROGE_UID>' where user_id is null;
update counters       set user_id='<ROGE_UID>' where user_id is null;
update checks         set user_id='<ROGE_UID>' where user_id is null;
-- NOT NULL + default = usuario en sesión
alter table tablitas       alter column user_id set not null, alter column user_id set default auth.uid();
-- (idem sub_activities, counters, checks)
-- PKs por-usuario (evita colisión de ids entre usuarios)
alter table tablitas       drop constraint tablitas_pkey,       add primary key (user_id, id);
alter table counters       drop constraint counters_pkey,       add primary key (user_id, id);
alter table sub_activities drop constraint sub_activities_pkey, add primary key (user_id, id);
-- FK compuesta de sub_activities → tablitas
alter table sub_activities drop constraint <fk_tablita>,
  add constraint sub_activities_tablita_fk foreign key (user_id, tablita_id)
  references tablitas(user_id, id) on delete cascade;
-- checks: unicidad por usuario+día
alter table checks add constraint checks_uniq unique (user_id, tablita, sub_activity, check_date);
```

## Fase 3 — RLS por-usuario
```sql
-- quitar allow_all y poner políticas por usuario en las 4 tablas
drop policy allow_all on checks;  -- (idem en las otras)
alter table checks enable row level security;
create policy own_select on checks for select using (auth.uid() = user_id);
create policy own_insert on checks for insert with check (auth.uid() = user_id);
create policy own_update on checks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_delete on checks for delete using (auth.uid() = user_id);
grant select,insert,update,delete on checks to authenticated;
-- repetir el bloque para tablitas, sub_activities, counters
```

## Fase 4 — Frontend (`index.html`)
1. **Cargar `supabase-js`** (CDN) solo para auth (maneja tokens, refresh y storage).
2. **Pantalla de acceso** (gate antes del tracker):
   - Email + contraseña (registro / entrar), enlace "¿Olvidaste tu contraseña?" → `resetPasswordForEmail`.
   - Botón "Enviar enlace mágico" → `signInWithOtp`.
   - Botón "Continuar con Google" → `signInWithOAuth`.
   - Manejo del retorno de reset/magic/OAuth (leer sesión del hash de la URL).
3. **Sesión**: `onAuthStateChange` → si hay sesión, mostrar la app; si no, el gate. Botón **Cerrar sesión**.
4. **Headers autenticados**: `authHeaders()` pasa a usar `Bearer <access_token>` de la sesión (la `apikey` sigue siendo la anónima, que es lo correcto). RLS hace el filtrado; no hace falta filtrar por `user_id` en cada query.
5. **Inserts**: no mandar `user_id` (lo pone el default `auth.uid()`), o mandarlo explícito.
6. **Onboarding nuevo** (siembra al primer login si la cuenta no tiene tablitas):
   - `NEW_USER_TABLITAS` = **Dientitos** (Mañana/Tarde/Noche) + **Casa Limpia** (Cocina/Cuarto/Baño/Oficina).
   - `NEW_USER_COUNTERS` = **Cafecito ☕** + **Logros del día 🏆**.
   - (Se quita "Salud" del set de arranque; los defaults viejos quedan solo como fallback offline.)
7. **Offline**: el caché local y el modo `local` (edición deshabilitada sin conexión) se conservan; `supabase-js` renueva el token. Definir UX cuando expira la sesión (volver al gate).

## Fase 5 — Verificación y limpieza
- Crear **2ª cuenta de prueba** → confirmar que **no ve** los datos de Roge (aislamiento RLS) y que recibe el set de arranque correcto.
- Probar: reset de contraseña (llega correo), magic link, Google.
- Correr la **checklist manual** de `QA-pre-auth.md`.
- Re-correr advisors (deben quedar 0 WARN de `allow_all`).
- Mantener snapshots `bak_*_pre_auth` hasta validar en producción; luego, opcional, borrarlos.

---

## Riesgos / decisiones abiertas
- **Google OAuth** necesita credenciales de Google Cloud (paso manual). Si no las tienes a mano, arrancamos con Email + Magic link y sumamos Google después.
- **Ventana de corte**: las Fases 2–4 deben ir juntas y rápido; ~minutos de "mantenimiento" si algo se desfasa.
- **Confirmar** que la cuenta dueña es `rogerthatbunny@gmail.com` (distinta del correo del perfil `rogerthatheart@gmail.com`).

---

## ✅ Resultado de la implementación (2026-06-09)

**Base de datos** (migraciones aplicadas, snapshots `bak_*_pre_auth` intactos como respaldo):
- `multiuser_phase1_add_user_id` — `user_id` + índices + backfill (84→90 checks a la cuenta de Roge).
- `multiuser_phase2_per_user_keys` — `user_id NOT NULL DEFAULT auth.uid()`, PKs `(user_id, id)`, FK compuesta, unicidad de checks por usuario.
- `multiuser_phase3_per_user_rls` — fuera `allow_all`; políticas `own_rows` (`auth.uid() = user_id`) para `authenticated`; `anon` revocado.

**Cuenta dueña:** `rogerthatbunny@gmail.com` (confirmada, contraseña la fijó Roge).
uid `17681eed-0893-43c8-8856-80d403a371ec` — sus 90 checks / 3 tablitas / 4 contadores / 12 subs.

**Frontend** (`index.html`, desplegado a `main`): `supabase-js` para sesión; gate de acceso
(contraseña + registro, enlace mágico, reset); logout; REST con el JWT del usuario; seeding
del set de arranque (Dientitos + Casa Limpia, Cafecito + Logros del día) para cuentas nuevas.

**Verificación (RLS simulado en Postgres):**
- Roge → ve 90/3/4/12. · Otro usuario → ve **0**. · `anon` → **permission denied**.
- Advisors: **0** WARN `allow_all`. Backups = INFO (blindados a propósito).
- Sintaxis JS OK; regresión de lógica 8/8.

## Pendientes manuales (panel Supabase / Roge)
1. **Auth ▸ URL Configuration**: poner el **Site URL** = URL de GitHub Pages de la app
   (p. ej. `https://conderex.github.io/rogecito/`) y agregarla a *Redirect URLs*, para que
   los correos de **enlace mágico y reset** regresen a la app. (El login con contraseña ya
   funciona sin esto.)
2. **Probar en el teléfono**: entrar con `rogerthatbunny@gmail.com`, ver datos intactos;
   crear una 2ª cuenta y confirmar que arranca con el set nuevo y **no** ve lo de Roge.
3. *(Opcional)* Activar "Leaked password protection" (Auth ▸ Policies).
4. **Google**: pendiente para una iteración futura (credenciales de Google Cloud).
