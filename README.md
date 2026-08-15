# Tesorería · Instalación como PWA en GitHub Pages

## 1. Estructura de archivos (ya lista en esta carpeta)
```
/
├── index.html
├── manifest.webmanifest
├── sw.js
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-512-maskable.png
```
Sube estos 5 archivos manteniendo exactamente esta estructura de carpetas (la carpeta `icons/` debe existir con ese nombre).

## 2. Subir a GitHub
1. Entra a github.com y crea un repositorio nuevo (público), por ejemplo `tesoreria-app`.
2. Click en "Add file" → "Upload files".
3. Arrastra `index.html`, `manifest.webmanifest` y `sw.js` a la raíz.
4. Crea la carpeta `icons` arrastrando los 3 PNG dentro de una subcarpeta llamada `icons` (al arrastrar un archivo con el path `icons/icon-192.png`, GitHub crea la carpeta sola; si no, crea primero un archivo cualquiera dentro de `icons/` y luego sube las imágenes ahí).
5. Click en "Commit changes".

## 3. Activar GitHub Pages
1. En el repositorio, ve a **Settings → Pages**.
2. En "Source" elige la rama `main` y la carpeta `/ (root)`.
3. Guarda. GitHub te dará una URL tipo `https://tu-usuario.github.io/tesoreria-app/`.
4. Espera 1-2 minutos y abre esa URL.

## 4. Instalar la app
- **Android (Chrome):** abre la URL, toca el menú (⋮) → "Instalar aplicación" o "Añadir a pantalla de inicio". También puede aparecer el botón "📲 Instalar app" dentro de la propia app.
- **iPhone/iPad (Safari):** abre la URL, toca el botón compartir (□↑) → "Añadir a pantalla de inicio".
- **Windows/Mac/Linux (Chrome/Edge):** abre la URL, aparecerá un ícono de instalación (⊕) en la barra de direcciones, o Menú → "Instalar Tesorería".

## Importante
- La app **no funciona como PWA instalable abriendo el archivo `.html` directamente** (doble clic / `file://`). Debe servirse desde `https://` (GitHub Pages cumple esto).
- Una vez instalada, funciona offline gracias al Service Worker (`sw.js`), que cachea los archivos base la primera vez que se abre con internet.
- Los datos (integrantes, cobros, caja, fotos, comprobantes) se guardan en el navegador (IndexedDB), no en GitHub. Recuerda respaldar periódicamente con el botón de exportar JSON/Excel dentro de la app.
- Si actualizas `index.html` más adelante, sube el archivo nuevo a GitHub y sube también la versión del `CACHE_NAME` dentro de `sw.js` (por ejemplo de `tesoreria-cache-v1` a `v2`) para que los usuarios reciban la actualización.
