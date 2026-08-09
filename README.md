# LUMO Gestión Financiera — Paquete completo para GitHub Pages

Esta carpeta trae **todo lo necesario** para publicar la app como una PWA
instalable en cualquier dispositivo (Android, iPhone, Windows, Linux, Mac),
con manifest, Service Worker e íconos como archivos reales — la forma más
confiable de que el botón "Instalar" aparezca en todos los navegadores.

## Archivos incluidos (7 en total)

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa (ya renombrada, lista para GitHub Pages) |
| `manifest.json` | Nombre, colores e íconos de la app instalada |
| `sw.js` | Service Worker: guarda el shell en caché para que funcione offline |
| `icon-192.png` | Ícono LGF 192×192 |
| `icon-512.png` | Ícono LGF 512×512 |
| `apple-touch-icon.png` | Ícono para "Agregar a inicio" en iPhone/iPad |
| `favicon.png` | Ícono de la pestaña del navegador |

---

## Guía paso a paso — Crear el repositorio en GitHub

### 1. Crear la cuenta (si no tienes una)
Ve a [github.com](https://github.com) → **Sign up** → sigue los pasos (es
gratis).

### 2. Crear el repositorio
1. Ya con sesión iniciada, click en el **+** arriba a la derecha → **New repository**.
2. **Repository name**: escribe algo como `lumo-gestion-financiera` (sin espacios).
3. Marca **Public** (para que GitHub Pages funcione gratis).
4. NO marques "Add a README file" (para evitar conflictos, lo subimos nosotros).
5. Click **Create repository**.

### 3. Subir los 7 archivos
1. En la página del repositorio recién creado, verás un botón **"uploading an
   existing file"** (o ve a **Add file → Upload files** si ya tiene contenido).
2. Arrastra **los 7 archivos de esta carpeta a la vez** directo a la ventana del
   navegador (selecciona todos con Ctrl+A / Cmd+A en tu explorador de archivos
   y arrástralos juntos). Importante: arrastra los **archivos**, no la carpeta
   que los contiene — deben quedar sueltos en la raíz del repositorio.
3. Abajo, en "Commit changes", puedes dejar el mensaje por defecto.
4. Click **Commit changes** (botón verde).
5. Verifica que los 7 archivos aparezcan listados en la página principal del
   repositorio.

### 4. Activar GitHub Pages
1. Arriba en el repositorio, click en la pestaña **Settings**.
2. En el menú de la izquierda, click **Pages**.
3. En "Build and deployment" → **Source**, elige **Deploy from a branch**.
4. En **Branch**, selecciona `main` (o `master`, según cómo se haya creado) y
   la carpeta `/ (root)`. Click **Save**.
5. Espera 1-2 minutos y recarga la página. GitHub te mostrará un mensaje
   verde con tu URL:
   ```
   https://tu-usuario.github.io/lumo-gestion-financiera/
   ```
   Esa es la dirección definitiva de tu app.

---

## Instalarla como PWA en cada dispositivo

Abre esa URL **desde el navegador** del dispositivo (nunca un archivo local):

- **Android (Chrome)**: aparece un banner automático "Agregar a pantalla de
  inicio", o toca el botón 📲 dentro de la app, o el menú ⋮ → "Instalar aplicación".
- **iPhone / iPad (Safari)**: Safari no muestra el instalador automático —
  toca el botón compartir (cuadrado con flecha hacia arriba, abajo de la
  pantalla) → **"Agregar a pantalla de inicio"**.
- **Windows / Linux (Chrome o Edge)**: aparece un ícono de instalación
  (pantalla con flecha ⊕) al lado derecho de la barra de direcciones, o usa
  el botón 📲 dentro de la app.
- **Mac (Chrome, Edge o Safari)**: igual que Windows/Linux en Chrome/Edge;
  en Safari, menú Archivo → "Agregar al Dock".

Una vez instalada, la app abre en su propia ventana, con su ícono, sin las
barras del navegador — y sigue funcionando sin internet gracias al `sw.js`.

---

## Actualizar la app más adelante

Cuando tengas una nueva versión de `index.html` (por ejemplo, te doy una
mejora en el chat):
1. Ve al repositorio → click sobre `index.html` → ícono de lápiz (Edit) o
   bórralo y usa **Add file → Upload files** con el nuevo archivo (incluso
   con el mismo nombre, GitHub te pregunta si quieres reemplazarlo).
2. Confirma el cambio (**Commit changes**).
3. No hace falta volver a subir los íconos, el manifest ni el `sw.js` si no
   cambiaron.

**Los datos guardados en cada dispositivo no se pierden ni se resetean al
actualizar** — el `index.html` nuevo sigue usando la misma base de datos
local (IndexedDB) del dispositivo, solo cambia el código de la app. Eso sí,
como el `sw.js` cachea el shell, a veces el dispositivo tarda un rato en
"darse cuenta" de la actualización — si no ves los cambios, cierra del todo
la app instalada y vuelve a abrirla.

---

## Problemas comunes

- **No me aparece el botón de instalar**: revisa que estés entrando por la
  URL de `https://tu-usuario.github.io/...`, no abriendo el archivo local.
  También revisa que los 7 archivos hayan quedado en la raíz del repo (no
  dentro de una subcarpeta).
- **La app se ve sin estilos (fea, sin colores)**: probablemente la primera
  carga fue sin internet antes de que el Service Worker alcanzara a guardar
  Tailwind en caché. Abre la app una vez con buena conexión y espera unos
  segundos antes de cerrarla.
- **Subí una actualización y no se refleja**: cierra la app instalada del
  todo (no solo minimizarla) y ábrela de nuevo; el Service Worker revisa
  cambios en cada apertura.
