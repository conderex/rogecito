# Sistema de color v2 — propuesta (fondo claro + temas)

*Agosto 2026. Estado: PROPUESTA, nada aplicado a la app. Mockups entregados por chat.*

## Por qué

1. Roge detectó que el fondo sand/beige ya es un cliché reconocible de "sitio hecho con
   Claude": hay que diferenciarse por color. El lenguaje de formas (bordes tinta, sombras
   sólidas, rotaciones, Fraunces/Caveat, ✿) se queda: ESO sí es nuestro.
2. Requisitos de Roge: fondo default claro (no sand), cero naranja tipo Anthropic
   (se retira el `#cf6a39` terracota), y **temas seleccionables por el usuario** donde
   cambian los hues pero los niveles (luminosidad/saturación) y la congruencia se
   mantienen.

## Lecciones de Duolingo (investigado)

1. **Fondo blanco/casi blanco + acentos saturados**: el neutro hace que el color cargue
   significado; sobre fondo teñido (nuestro sand) los acentos compiten y se ensucian.
2. **UN color héroe con disciplina**: Feather Green `#58CC02` se reserva para el CTA
   principal; un solo color es dueño del reconocimiento de marca.
3. **Acentos con trabajo semántico**: verde=progreso, rojo `#FF4B4B`=error,
   azul `#1CB0F6`=info, amarillo `#FFC800`=recompensa. El color significa, no decora.
4. **Neutros amables**: texto Eel `#4B4B4B`, no negro puro.

Fuentes: [design.duolingo.com/identity/color](https://design.duolingo.com/identity/color)
(referenciada vía [BrandColorCode](https://www.brandcolorcode.com/duolingo) y
[Mobbin](https://mobbin.com/colors/brand/duolingo)),
[blog de arte de Duolingo](https://blog.duolingo.com/shape-language-duolingos-art-style/),
[Canny brand breakdown](https://www.canny-creative.com/brand-breakdown/brand/duolingo/).

## El sistema (tokens semánticos)

**Neutros (fijos en todos los temas):**

| Token | Hex | Rol | Contraste |
|---|---|---|---|
| `--bg` | `#fbfaf7` | fondo | — |
| `--surface` | `#ffffff` | tarjetas | — |
| `--ink` | `#372f28` | texto/bordes | 12.6:1 sobre bg ✅ |
| `--ink-soft` | `#6e655c` | texto secundario | 5.5:1 ✅ |
| `--shadow` | `rgba(55,47,40,.2)` | sombras sólidas | — |

**Familia de acentos (igual en todos los temas):**

| Acento | Puro (celdas/decoración) | Deep (texto y pills con blanco) | Contraste deep |
|---|---|---|---|
| Rosa | `#d64d7d` | `#ad2f5c` | 6.0:1 bg ✅ · blanco 6.3:1 ✅ |
| Menta | `#1fa886` | `#14735c` | 5.5:1 ✅ · blanco 5.8:1 ✅ |
| Jacaranda | `#8578cb` | `#5f51a8` | 6.2:1 ✅ · blanco 6.5:1 ✅ |
| Oro | `#dfa32e` | `#8a6212` | 5.2:1 ✅ · blanco 5.5:1 ✅ |
| Cielo | `#4a9bd4` | `#2f6f9e` | 5.2:1 ✅ · blanco 5.4:1 ✅ |

**Reglas de uso (esto ES la congruencia entre temas):**
- Acento **puro**: rellenos de celdas, barras, decoración, ícono grande.
- Acento **deep**: texto acentuado sobre fondo, y relleno de pills que llevan texto
  blanco (rachas, etiquetas).
- Texto ink sobre puro solo en oro (5.9:1 ✅); en los demás, usar deep+blanco.

**Un TEMA = qué acento es el héroe.** El héroe pinta: subtítulo de marca, botón
principal, resaltados. El resto de la familia sigue disponible para tablitas/counters.
Cambiar de tema no cambia ningún nivel, solo rota el rol de héroe (y opcionalmente el
orden del picker de acentos). Con L/C fijos, el contraste AA se conserva en todos los
temas por construcción. Un futuro tema "Nocturno" es el mismo sistema con la
luminosidad de los neutros invertida (mismos hues).

## Candidatos a DEFAULT (mockups del app real entregados)

- **A · Rosa** — héroe `#d64d7d`/`#ad2f5c`. Cálido con carácter; hereda la
  investigación de identidad mexicana (rosa mexicano suavizado).
- **B · Menta** — héroe `#1fa886`/`#14735c`. Crecimiento/calma; la lección de Duolingo
  con un hue propio (verde-azulado, no lima).
- **C · Jacaranda** — héroe `#8578cb`/`#5f51a8`. Sereno y poco usado en la categoría.

## Implementación (fase siguiente, tras la elección de Roge)

`:root` con tokens semánticos + los nombres viejos como alias (diff mínimo), bloques
`:root[data-theme="…"]`, selector de tema con chips en modo edición, persistencia
`roge_theme_v1`, `<meta name="theme-color">` dinámico, sync de manifest/privacy/
scrollbar, bump SW v2→v3, verificación de contraste por tema + jsdom + screenshots.
Después: regenerar flyer de testers y assets de tienda con la paleta ganadora.
