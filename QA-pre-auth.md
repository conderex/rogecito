# QA & Safety Net — antes de la migración a multiusuario (2026-06-08)

Este documento es la **red de seguridad** antes de agregar autenticación multiusuario
(registro, contraseña, reset, y privacidad por-usuario). Si algo se rompe en producción,
aquí está cómo volver atrás.

## Estado: ✅ Listo para planear la migración

---

## 1. Respaldos (3 capas)

| Capa | Qué es | Dónde |
|---|---|---|
| **Snapshots en la base** | Copia exacta de cada tabla *antes* de tocar nada | Tablas `bak_checks_pre_auth`, `bak_tablitas_pre_auth`, `bak_sub_activities_pre_auth`, `bak_counters_pre_auth` (RLS activado, **no** legibles con la llave pública) |
| **Rama de retorno (código)** | El `index.html` bueno conocido | Rama `rollback/v1-pre-auth` → commit `3f4000b` |
| **Export off-site (recomendado)** | CSV de cada tabla | Pendiente: Roge lo puede bajar del dashboard de Supabase → Table editor → Export, para tener copia fuera de Supabase |

Conteos verificados al respaldar: **84 checks · 3 tablitas · 12 sub-actividades · 4 contadores**.

### Cómo restaurar (si la migración sale mal)
**Datos** (en el SQL editor de Supabase, con cuidado):
```sql
-- Ejemplo para checks; repetir por tabla. Vacía la tabla y reinserta el snapshot.
truncate checks;
insert into checks select * from bak_checks_pre_auth;
```
**Código**: en GitHub, restaurar `index.html` desde la rama `rollback/v1-pre-auth`
(o `git checkout rollback/v1-pre-auth -- index.html` y push a `main`). GitHub Pages
vuelve a publicar la versión buena en ~1 min.

---

## 2. Auditoría de seguridad (Supabase advisors)

- **4 WARN — `rls_policy_always_true`** en `checks`, `tablitas`, `sub_activities`,
  `counters`: políticas `allow_all` (`USING true / WITH CHECK true`). Significa
  "cualquiera con la llave pública lee y escribe todo". **Es exactamente lo que la
  migración multiusuario va a reemplazar** con políticas por-usuario (`auth.uid()`).
- **0 ERROR** pendientes tras blindar los snapshots (se les activó RLS).

> Nota de privacidad importante: RLS evita que un usuario vea los datos de otro. Pero el
> **dueño del proyecto** (Roge) siempre puede ver las filas crudas desde el dashboard de
> Supabase / `service_role`. Para que *ni siquiera el dueño* pueda leer lo que trackean,
> haría falta **cifrado del lado del cliente (E2E)**, que es un proyecto aparte y más
> grande. Decisión a tomar en el plan.

---

## 3. Regresión de lógica (código vivo) — 11/11 ✅

Ejecutado con `node` sobre el `<script>` extraído de `index.html`, con datos
representativos reales:

- Parsea sin errores.
- Rachas: `dientitos` racha máxima ≥ 5; tabla vacía = 0.
- `monthBuckets` arranca en `2026-05`, etiqueta año al cambiar.
- Cumplimiento %: las 3 series siempre dentro de 0–100 (incluye proración del mes actual).
- Contadores: incluye el nuevo "Cafecito ☕️"; totales ≥ 0.
- `niceMax`, SVG multi-mes (línea+puntos) y 1-mes (solo puntos) correctos.
- Conteos de config activa: 3 tablas, 4 contadores.

---

## 4. Checklist manual (probar en el teléfono) — pendiente de Roge

Lo que el código no puede auto-verificar (UI/táctil). Marca rápido antes de migrar:

- [ ] Tracker: marcar/desmarcar una casilla de hoy y que persista al recargar.
- [ ] Tracker: semana pasada editable; semanas viejas con 🔒 (solo lectura).
- [ ] Contador: + / − en Stogies/Cafecito; el total cuadra.
- [ ] Editar ✎: crear / renombrar / color / reordenar / archivar una tabla y una fila.
- [ ] Editar ✎: archivar y **restaurar** (que no se pierda historial).
- [ ] Insights: gráfica "Constancia por mes", chips de "Rachas máximas", gráfica "Conteos por mes".
- [ ] Modo offline (avión): marcar casillas funciona; pill cambia a "local"; al volver, sincroniza.

---

## 5. Riesgos conocidos para la migración (a cubrir en el plan)

1. **Asignar los datos actuales a la cuenta de Roge** (backfill `user_id`) sin perder nada.
2. **Reemplazar `allow_all`** por políticas `auth.uid() = user_id` en las 4 tablas.
3. La app pasa de llave anónima compartida a **sesión autenticada** (login, signup, reset).
4. Manejo de **sesión/estado offline** con auth (token expira; UX cuando no hay sesión).
5. Nivel de privacidad real (RLS vs E2E) — decisión de producto.
