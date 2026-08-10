# Pruebas de DoingTheDoings

Suite jsdom que carga `../index.html` real, siembra estado y verifica render,
temas, rachas amables, i18n y accesibilidad. No toca la red ni Supabase.

```bash
cd test
npm i          # instala jsdom (única dependencia)
node app.test.js
```

Incluye la **guardia de zona de palidez** (hallazgo de Mary): ningún lienzo de
tema puede ser muy claro + casi sin saturación + amarillo-gris a la vez.
