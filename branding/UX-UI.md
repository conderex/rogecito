# DoingTheDoings — Sistema de UX / UI

*Referencia viva del diseño. Refleja lo que está en producción a agosto 2026.*
*Snapshot anterior (paleta Golden Casket como default): [`UX-ESTADO-ACTUAL.md`](UX-ESTADO-ACTUAL.md).*

Todo vive en un solo `index.html` (~2,675 líneas): CSS en un `<style>`, JS en un
`<script>`. Sin framework, sin build. Los números de línea son aproximados.

---

## 1. Los principios

1. **Nunca culpa.** La app no regaña, no presiona, no dramatiza una falta. Las rachas
   perdonan; los días perdidos se cubren con una flor, no con un hueco.
2. **Un tap y ya.** Marcar el día es un solo toque. Nada que configurar para empezar.
3. **Libreta hecha a mano, no dashboard.** Bordes gruesos de tinta, sombras sólidas sin
   difuminar, tarjetas ligeramente chuecas. Se siente pegado con cinta, no renderizado.
4. **Sin jerga clínica de cara al usuario.** "Activación conductual" es el subtítulo de
   marca; el resto del texto habla como una amiga.
5. **El color es ropa, no estructura.** Cinco temas comparten trazos idénticos.

**Taglines:** ES *"Constancia sin culpa, un día a la vez ✿"* · EN *"Guilt-free
consistency, one day at a time ✿"*

---

## 2. Sistema de temas

Tokens semánticos re-escopados por `html[data-theme]`. Los acentos de las tablitas se
guardan en la base como el string literal `var(--teal)`, así que **cambiar de tema
repinta todas las tablitas sin migrar un solo dato**.

Elección **por dispositivo** (`localStorage` → `roge_theme_v1`), aplicada antes del
primer pintado para que no haya parpadeo. También actualiza el `<meta name="theme-color">`
para que la barra del navegador acompañe.

### Los cinco roles de acento

Cada tema define **sus propios cinco**: `--teal` (verde) · `--orange` (cálido) ·
`--lavender` (violeta) · `--gold` (dorado) · `--pink` (rosa).

| Token | ☕ Oat Milk *(default)* | 🍵 Matcha | 🍇 Lavanda | ✦ Golden Casket | 🌙 Cielo Nocturno |
|---|---|---|---|---|---|
| `--sand` fondo | `#ffffff` | `#eff4ec` | `#f4f1f8` | `#e7d8b8` | `#1d1d24` |
| `--sand-deep` | `#f7f7f7` | `#e2eadd` | `#e9e3f1` | `#d8c39a` | `#16161c` |
| `--paper` tarjetas | `#ffffff` | `#ffffff` | `#ffffff` | `#f4ead0` | `#5f6879` |
| `--ink` tinta | `#1a1a1a` | `#1e231d` | `#221e28` | `#2a2118` | `#f7f7fb` |
| `--ink-soft` | `#6f6862` | `#67705f` | `#6d6577` | `#6b5d49` | `#e8eaf1` |
| `--shadow` | `rgba(26,26,26,.16)` | `rgba(30,35,29,.16)` | `rgba(34,30,40,.16)` | `rgba(42,33,24,.28)` | `rgba(0,0,0,.85)` |
| `--teal` | `#3f8a80` | `#2f8f7a` | `#4a93a8` | `#3f8a80` | `#7fd4c8` |
| `--orange` | `#ef476f` | `#7fb069` | `#d54f7d` | `#cf6a39` | `#f6a0b8` |
| `--lavender` | `#8f82c2` | `#b5a4d6` | `#8b7ad1` | `#8f82c2` | `#b7a9f0` |
| `--gold` | `#e8b23a` | `#dcae3c` | `#d9a45b` | `#d9a441` | `#f2cf7e` |
| `--pink` | `#ea8fa8` | `#e08f9d` | `#c495d6` | `#d98798` | `#9cc8f0` |
| `--orange-deep` subtítulos | `#c02a52` | `#256e5e` | `#6e51c4` | `#963f14` | `#fde0e9` |

Tokens de apoyo: `--line` (= `--ink`), `--shine`, `--scrim`, `--card-hi`, `--box-hi`,
`--on-gold` (texto sobre rellenos dorados, siempre oscuro), y `--wash1/2/3` (los
degradados de ambiente del fondo).

### Reglas duras del color

- **El lienzo del default es blanco plano, a propósito.** Un blanco roto con matiz
  amarillo-gris (`#f9f8f6`: hue 40°, sat 20%, lum 97%) se lee como **palidez mortis** —
  el color que toma la piel clara al morir. Lo identificó Mary, ex asistente de hospicio.
  El blanco puro no tiene matiz, así que no hay lectura de piel posible. Los washes
  también van en `transparent` en este tema: cualquier tinte devuelve el problema.
- **Guardia automática en las pruebas:** ningún lienzo puede caer en
  `lum > 93% && sat < 35% && hue 33–58°`. Se verifica en cada cambio, con `#f9f8f6`
  guardado como control.
- **Contraste AA garantizado** en los cinco temas para tinta, texto suave y subtítulos,
  sobre fondo y sobre tarjeta.
- El **Nocturno solo se activa si el usuario lo elige** — nunca automático por hora.

### El cielo nocturno

Ocho estrellas (`<div id="nightsky">`, 2–3px) fijas detrás del contenido, con
`@keyframes twinkle` de 6–9s y delays escalonados: respiran lento, de una en una. Al ser
`position:fixed`, el contenido se desplaza y el cielo se queda quieto — parallax de noche
real. Solo se muestra bajo `[data-theme="nocturno"]`.

---

## 3. Lenguaje de formas

Lo que se mantiene idéntico en los cinco temas.

**Grosor de borde, por jerarquía:**
| Grosor | Dónde |
|---|---|
| 3px | tarjetas grandes: tablita, insights, contador, bienvenida, modal |
| 2.5px | pastillas, inputs, botones primarios, barras, tracks, tarjeta del gate |
| 2px | cromo pequeño: `.ebtn`, `.editicon`, `.themechip`, `.seg`, `.langtoggle`, espinas de acento |

**Radios:** `--r-card: 18px` (tarjetas y modal) · 14px (tabs, stat-card) · 12px (navbtn,
cbtn, mbtn, inputs y botones del gate, streak-box, themechip) · 10–11px (ebtn, editicon,
tbtn, seg, modal-input) · `--r-bar: 999px` (todas las pastillas, barras y tracks).

**Sombras sólidas, jamás difuminadas.** Siempre desplazadas abajo-derecha, escaladas al
peso del elemento:

```
modal        7px 8px 0        tarjetas      6px 7px 0
contadores   5px 6px 0        tabs/toast    4px 4px 0
navbtn/cbtn  3px 3px 0        ebtn/sw       2px 2px 0
```

**El press es universal:** `translate(Npx, Npx)` + `box-shadow: 0 0 0`, con la misma N de
su sombra. El elemento literalmente aterriza sobre la página.

**Rotaciones a mano:** tarjetas ±0.25–0.4° por índice · contadores ±0.5° por paridad ·
insights ±0.3° · texto manuscrito −1° a −3°. **Los botones y modales van rectos a 0°** —
el contraste entre cromo rígido y contenido chueco es lo que da el efecto de libreta.

**Tipografías:**
| Rol | Familia | Uso |
|---|---|---|
| Display | **Fraunces** 800 | títulos, números grandes, nombres de tablita |
| UI | **Space Grotesk** | todo el texto de interfaz, botones, etiquetas |
| Emocional | **Caveat** | asides manuscritos, siempre en minúsculas y rotados |

**Isotipos dibujados, nunca emoji.** La florecita (5 pétalos + centro hueco) y la lunita
creciente son SVG inline con `currentColor`, así siempre salen en la paleta del tema y se
ven igual en todos los sistemas.

---

## 4. Pantallas

### Puerta de acceso (`.gate`)
Overlay a pantalla completa (`100dvh`, degradado radial `--sand → --sand-deep`), con la
tarjeta centrada por `margin:auto` para que nunca se recorte en pantallas cortas. De
arriba abajo: toggle ES/EN · marca + subtítulo manuscrito · frase que cambia según modo ·
correo + contraseña + botón oscuro · enlaces de cambio de modo y "olvidé mi contraseña" ·
separador "o" · botón de Google (blanco, logo oficial) · enlace mágico ✨ · línea de
estado. Los cuatro flujos comparten una sola tarjeta.

### Tracker
Header pegajoso (solo la marca; se desvanece con `mask` de gradiente, sin depender de
ningún color) → tabs → navegación de semana → tarjetas de tablita → contadores → footer.

**La semana corre jueves → miércoles.** Etiquetas: *Esta semana* / *Semana pasada* /
*Próxima semana* / *N semanas atrás*. Solo **esta semana y la pasada** son editables;
más atrás queda en solo lectura.

**Anatomía de la tablita:** espina de acento de 6px sangrando por el borde izquierdo ·
título + pastilla de racha · encabezados de día (el de hoy con punto pulsante) · una fila
por sub-actividad × 7 celdas.

### Insights
1. **Constancia** — control segmentado Semana / Mes / Año. Barras verticales por semana;
   línea por mes y por año. Porcentaje = marcas ÷ (sub-actividades × días transcurridos).
2. **Rachas máximas** — pastillas, una por tablita en su acento.
3. **Conteos** — gráfica de líneas multi-serie, mes a mes, con leyenda de puntos.

Barras y líneas se dibujan solas al entrar (`stroke-dashoffset`).

### Modo edición
Se entra con ✎ (se convierte en ✓ y se pinta de dorado). Oculta la navegación de semana,
los contadores y el footer. Requiere conexión. Secciones en orden:

1. **apariencia** ← los 5 chips de tema, hasta arriba
2. **editar tablas** — reordenar / renombrar / archivar tablitas y filas
3. **+ Nueva tabla**
4. **contadores**
5. **archivadas** (si hay)
6. **cuenta** — zona de peligro, borrado con doble confirmación

Un solo `promptModal` sirve para crear y renombrar: campo de emoji opcional, nombre, y
fila de 5 swatches de color que repintan la vista previa en vivo.

---

## 5. Las rachas amables

La pieza de diseño más importante de la app: **la mecánica encarna la promesa de marca.**

- Cuenta los días en que apareciste (cualquier sub-actividad marcada cuenta).
- **Perdona hasta 2 días seguidos.** Solo 3 días en blanco la rompen.
- Los días perdonados **no inflan** el número — solo no lo cortan.
- La racha sigue viva mientras la última marca esté dentro de 2 días de hoy.
- **`held`**: la racha está sostenida por gracia ahora mismo → la pastilla muestra ✿.
- **`bridged`**: los días en blanco dentro de la racha viva → esas celdas llevan la flor.
- Hoy nunca lleva flor: todavía se puede marcar.

Tocar cualquier pastilla 🔥 (o Enter/Espacio) abre la explicación en un modal de un botón.

---

## 6. Movimiento

| Animación | Para qué | Duración |
|---|---|---|
| `twinkle` | estrellas del Nocturno | 6–9s infinito |
| `fadein` | crossfade entre pestañas | .4s |
| `pop` | número de racha o contador al subir (escala 1→1.7→1) | .45s bounce |
| `pulse` | punto del día de hoy | 1.8s infinito |
| `glint` | destello que barre la barra recién llena | .7s, .12s de retraso |
| `popin` | entrada del modal | .3s bounce |
| `loadpulse` | punto del cargador | 1s infinito |

Dos curvas para todo: `--bounce: cubic-bezier(.34,1.56,.64,1)` y
`--ease-out: cubic-bezier(.22,1,.36,1)`. El llenado de la barra usa bounce (.42s); el
vaciado usa una curva plana más corta (.2s) — llenar se celebra, vaciar no.

---

## 7. Voz

Minúsculas en los asides manuscritos. **✿ es el signo de puntuación de la marca.**
Diminutivos cariñosos ("cositas", "tablitas"). Segunda persona, femenino por defecto.

> `un día a la vez ✿` — footer
> `tap para llenar · tap para vaciar` — pista del tracker
> `Tu racha cuenta los días que apareces. Y es amable: puedes faltar hasta 2 días
> seguidos y no se rompe (esos días se guardan como un parche ✿). Solo si pasan 3 días
> sin marcar nada, vuelve a empezar. Un día a la vez ✿`
> `Aquí no hay culpa, solo constancia, un día a la vez.` — bienvenida
> `Cuenta borrada. Cuídate mucho 🤍` — hasta la despedida es amable

Todo existe en ES y EN, uno a uno, en la tabla `I18N`.

---

## 8. Accesibilidad

**Lo que está bien:**
- Objetivos de toque de 44px en lo que importa (celdas, navegación, ±, tabs); 46–48px en
  botones de modal, chips de tema e inputs del gate.
- Contraste AA verificado en los cinco temas, con guardia automática de zona de palidez.
- Cada celda lleva `aria-label` descriptivo *"Título · Fila · fecha"*.
- Las pastillas de racha son accesibles por teclado (Enter / Espacio).
- Los SVG decorativos van `aria-hidden`.
- `prefers-reduced-motion` desactiva el movimiento globalmente.

**Deuda conocida** (nada de esto está resuelto todavía):

| Pendiente | Impacto |
|---|---|
| `maximum-scale=1.0` en el viewport bloquea el zoom con dos dedos | alto |
| Sin `:focus-visible` propio; algunos inputs hacen `outline:none` | alto |
| Modales sin `role="dialog"`, sin trampa de foco, sin cerrar con Escape | medio |
| El toast no es `aria-live` → los avisos de "sin conexión" y "bloqueado" no se anuncian | medio |
| `aria-label` de los botones ± del contador está **hardcodeado en español** | medio |
| Las tabs no usan `role="tablist"` / `aria-selected` | medio |
| `prefers-reduced-motion` no detiene los bucles infinitos (solo los acelera) | bajo |
| Cromo pequeño bajo 44px: `.ebtn` 38 · `.editicon` 34 · `.segbtn` 34 | bajo |
| `outline` se usa como decoración de selección, puede confundirse con foco | bajo |

---

## 9. Persistencia por dispositivo

| Clave | Guarda |
|---|---|
| `roge_theme_v1` | tema elegido (`oat` por defecto) |
| `roge_lang_v1` | idioma (`es` por defecto) |
| `roge_checks_v1` | marcas, caché offline |
| `roge_config_v1` | tablitas y filas |
| `roge_counters_v1` | contadores |
| `roge_welcome_v1` | bienvenida ya descartada |

Todo lo demás vive en Supabase con RLS. La app funciona sin conexión y sincroniza al
volver; si un guardado falla, revierte la celda y avisa sin drama.
