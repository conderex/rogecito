# DoingTheDoings — Estado actual del UX/UI (producción)

> **ACTUALIZACIÓN (ago 2026):** el sistema de color descrito aquí fue reemplazado
> por el **sistema de temas v2** (Oat Milk default + Matcha + Lavanda + Cielo
> Nocturno, tokens re-escopados por `data-theme`, selector en modo edición,
> estrellas animadas en Nocturno). Este documento queda como snapshot del v1;
> el lenguaje de formas (sombras sólidas, bordes tinta, rotaciones) sigue vigente.

*Fotografía fiel de lo que está EN VIVO en https://conderex.github.io/rogecito/ a
agosto 2026 (tras PR #23). Escrito para llevarse a herramientas de diseño (Claude
design u otras) como base de un rediseño. Sin propuestas: solo lo que existe.*

---

## 1. Identidad visual vigente ("Golden Casket")

Estética artesanal/sticker: papel cálido, bordes de tinta gruesos, **sombras sólidas
desplazadas (nunca blur)**, rotaciones sutiles (±0.3° a 2°), flor ✿ como firma, emojis
como parte del lenguaje (🔥 ☕ 🏆 📊 ✨ 🤍).

### Tokens de color (el `:root` real, completo)

| Token | Valor | Uso |
|---|---|---|
| `--sand` | `#e7d8b8` | Fondo global (beige arena) |
| `--sand-deep` | `#d8c39a` | Degradados del fondo |
| `--paper` | `#f4ead0` | Superficie de tarjetas |
| `--ink` | `#2a2118` | Texto principal y TODOS los bordes (`--line` es igual) |
| `--ink-soft` | `#6b5d49` | Texto secundario, hints, iconos apagados |
| `--gold` | `#d9a441` | Botón "Hoy", acento de contadores |
| `--orange` | `#cf6a39` | LED offline, loader, botones warn |
| `--orange-deep` | `#b04f22` | Subtítulo manuscrito del header, resaltados de texto |
| `--teal` | `#3f8a80` | Acento default de tablitas, LED sync |
| `--lavender` | `#8f82c2` | Acento de tablitas |
| `--pink` | `#d98798` | Acento de tablitas |
| `--shadow` | `rgba(42,33,24,.28)` | Sombras sólidas |
| `--shine` | `rgba(255,255,255,.55)` | Brillo del glint |

Otros tokens: `--r-card:18px` (radio de tarjetas), `--r-bar:999px` (pastillas),
`--bar-h:30px` (alto de celda), easings `--bounce: cubic-bezier(0.34,1.56,0.64,1)` y
`--ease-out: cubic-bezier(0.22,1,0.36,1)`, `--col-template:78px repeat(7,1fr)`
(cuadrícula: columna de etiquetas + 7 días).

**El fondo NO es plano:** `body` lleva 2 radial-gradients (dorado arriba-derecha
`rgba(217,164,65,.30)`, lavanda abajo-izquierda `rgba(143,130,194,.28)`) + una capa de
grano SVG + viñeta, todo `background-attachment:fixed`. Da textura de papel envejecido.

La paleta que el usuario puede asignar a tablitas/contadores: teal, orange, lavender,
gold, pink (swatches en los modales de edición).

### Tipografía

| Familia | Rol | Ejemplos de tamaño |
|---|---|---|
| **Fraunces** (Google Fonts, 800; opsz alto) | Display: títulos, números, wordmark | Marca header `clamp(1.02rem, 4.7vw, 1.32rem)`; título de tablita 1.3rem; h3 insights 1.22rem; números de racha |
| **Space Grotesk** (400–700) | UI y cuerpo | Tabs .98rem; labels .82–.9rem; hints .72–.78rem |
| **Caveat** (500–700) | Manuscrita emocional | Subtítulo marca 1.02rem rotado −2°; intros de insights 1.45rem; footer 1.25rem rotado −1.5° |

## 2. Pantallas

### 2.1 Login ("gate")
Overlay `position:fixed` a pantalla completa (alto `100dvh`, scrolleable si no cabe),
fondo radial arena→arena-profunda. Tarjeta central (max-width 360px, papel, borde
2.5px, radio 18px, sombra 6px 6px): toggle ES/EN arriba-derecha → wordmark + subtítulo
Caveat naranja → tagline "entra para ver tu progreso" → inputs correo/contraseña
(bordes tinta, fondo arena suave) → botón "Entrar" (tinta, texto papel) → links teal
("¿No tienes cuenta? Regístrate", "¿Olvidaste tu contraseña?") → separador "o" →
botón blanco "Continuar con Google" (logo SVG) → botón fantasma "Enviar enlace mágico
✨" → área de mensajes (naranja para error, teal para ok). Abajo del overlay: "un día
a la vez ✿" en Caveat + links `privacidad` y `comentarios` (subrayado punteado).

### 2.2 Tracker (pantalla principal)
- **Header sticky** (SOLO la fila de marca queda fija al hacer scroll; el fondo es un
  degradado arena→transparente que desvanece el contenido al pasar por debajo):
  wordmark + subtítulo, pill SYNC/LOCAL (LED teal/naranja; `display:none` cuando no
  aplica), toggle `ES / EN`, botón ✎ (editar), botón ⏻ (salir). Botones 44px, borde
  2px, sombra 3px.
- **Tabs** Tracker/Insights: contenedor papel borde 2.5px radio 14px; tab activa =
  fondo tinta, texto papel. Se desplazan con el scroll (no fijas). (+tab 📊 oculta,
  solo la dueña.)
- **Weeknav**: ‹ › cuadrados, centro "Esta semana / 30 JUL – 5 AGO" (Fraunces +
  small uppercase), botón "Hoy" en gold.
- **Tarjeta de tablita**: papel, borde 3px, radio 18px, sombra `6px 7px 0`, rotación
  alternada ±0.4°; barrita vertical del acento a la izquierda; título Fraunces; pill
  de racha arriba-derecha (fondo acento, texto papel, 🔥 + número, anima "pop" al
  crecer; **es tappable → abre explicación de rachas**; muestra ✿ cuando un parche la
  sostiene). Racha amable: aguanta hasta 2 días sin marcar, se rompe al 3ro; los días
  perdonados llevan ✿ bajo su letra. Cuadrícula: fila de días `J V S D L Ma Mi` (hoy en
  negrita + puntito naranja pulsante), filas por sub-actividad: etiqueta + 7 celdas.
- **Celda**: botón 44px min; dentro, "bar" pastilla (alto 30px, borde 2.5px, radio
  999px, fondo tinta al 7% + sombra interna). Al marcar: el relleno del acento entra
  con `scaleX` desde la izquierda + **glint** (destello que viaja, .7s). Al desmarcar
  sale en .2s. Días bloqueados (anteriores a la semana pasada): opacidad .5, borde
  punteado, sin interacción.
- **Contadores**: grid 2 columnas; tarjeta con emoji + nombre, número grande Fraunces
  (anima pop al subir), botones − / + de 44px (+ fondo acento, − fantasma;
  deshabilitado en 0).
- Footer: hint Caveat "tap para llenar · tap para vaciar".

### 2.3 Insights
Intro Caveat "¿cómo va la semana?". Tres tarjetas (mismo estilo de tarjeta, con
encabezado swatch/emoji + h3):
1. **Constancia**: selector segmentado Semana/Mes/Año (contenedor papel, opción
   activa fondo tinta); por tablita: nombre + headline `83% 15/18` (Fraunces);
   Semana = 7 barras verticales pastilla (altura = % del día, días en cero = stub
   gris, futuros = tenues, etiquetas J–Mi); Mes y Año = línea SVG con puntos
   (grid punteado, se dibuja animada con stroke-dashoffset 1s).
2. **Rachas máximas**: pills por tablita (fondo acento, nombre + número + 🔥).
3. **Conteos**: línea de tiempo mes a mes multi-serie (una línea por contador en su
   acento, eje Y limpio 0/½/max, meses localizados, leyenda con puntos de color).
Footer: "un día a la vez ✿" + links privacidad/comentarios.

### 2.4 Modo edición (✎)
Reemplaza el tracker: título Caveat "editar tablas"; por tablita una tarjeta con
header (nombre + controles ↑ ↓ ✎ 🗑 de 40px) y filas de sub-actividades con los
mismos controles; botón punteado "+ nueva fila"; botón grande "+ nueva tabla";
sección contadores igual; sección "archivadas" con filas apagadas y botón
"restaurar"; al final sección "cuenta" (nota de advertencia + botón "Borrar mi
cuenta…" borde rojo-quemado). Modales centrados (overlay oscuro, tarjeta papel,
popin .9→1): input de nombre + **swatches de color** (5 círculos, el activo con
anillo) o emoji para contadores; confirmaciones con botón cancel fantasma + botón
peligro naranja. Toast inferior (tinta, borde naranja) para avisos.

### 2.5 Otras
- **Loader** inicial: punto naranja pulsante centrado.
- **Stats** (📊, solo la dueña): tarjetas de métricas simples.
- **privacy.html**: página estática con el mismo sistema (tarjetas papel sobre arena).

## 3. Sistema de interacción y animación

- Marcar celda = 1 tap (sin confirmación). Deshacer = otro tap. Optimista: UI primero,
  sync después.
- Animaciones: fill `scaleX` .38s con `--bounce`; glint .7s; pop de números (scale
  1→1.7→1, .45s bounce); fadein de paneles (.4s, translateY 6px); dibujo de líneas
  SVG 1s; pulse del puntito "hoy"; loadpulse del loader; botones se hunden al
  presionar (translate + sombra a 0).
- Semana empieza en **jueves** (decisión de la dueña); solo semana actual + anterior
  editables (candado).
- Scrollbar de marca: pulgar ink-soft sobre riel arena, thin.

## 4. Estados del sistema
- **SYNC** (LED teal) / **LOCAL** (LED naranja) en el header; modo local = solo
  localStorage.
- Errores de auth en texto naranja dentro del gate; toasts para acciones.
- Offline: la app abre (service worker) con datos locales.

## 5. Responsive e i18n
- Columna única, `max-width:560px` centrada (680px en ≥900px). Optimizada 360–430px;
  ajustes extra ≤380px (título clamp más agresivo, pill compacta) y ≤600px (columnas
  60px, barras 28px). Safe-areas iOS respetadas. Targets táctiles ≥44px.
- Bilingüe ES (default) / EN con toggle vivo; textos vía diccionarios `I18N`.

## 6. Restricciones para cualquier rediseño (decisiones ya tomadas)
1. **Se va**: el fondo sand como default (cliché "hecho con Claude"); el naranja
   terracota tipo Anthropic (`#cf6a39`).
2. **Se queda**: el lenguaje de formas completo (bordes tinta, sombras sólidas sin
   blur, rotaciones, pastillas, ✿, las 3 tipografías, emojis).
3. **Requisito arquitectónico**: el nuevo sistema debe soportar **temas elegibles por
   el usuario** donde cambiar de tema rota los hues pero conserva niveles de
   luminosidad/saturación y congruencia (contraste AA garantizado por construcción).
   Está planeado un "Nocturno suave": no invertido, solo un paso más oscuro.
4. **Ya explorado y rechazado por Roge** (no volver a proponer igual): paleta
   saturada estilo Duolingo (héroes #d64d7d/#1fa886/#8578cb sobre #fbfaf7) y su
   versión pastel (#f3aec8/#a3ddc9/#c6bee9). La investigación útil que sí queda:
   fondo claro neutro + un héroe disciplinado + acentos con trabajo semántico
   (`branding/COLOR-SYSTEM.md`).
5. No claims médicos; tono cálido y sin culpa en todo texto visible.

## 7. Referencias
- Código: un solo `index.html` (~2,400 líneas, CSS+JS inline, CSS variables — todo
  el theming pasa por `:root`).
- Docs hermanos: `PROJECT.md` (marca+técnico), `POSITIONING.md`,
  `branding/COLOR-SYSTEM.md` (propuesta v2 no aplicada), `branding/PROPUESTA-MX.md`.
- Screenshots actuales de producción: en el chat de esta sesión y en
  `store/screens/` (versiones enmarcadas para Play Store).
