# Tesorería Multiorganizacional — PWA

Aplicación HTML + IndexedDB preparada para GitHub Pages.

## IMPORTANTE: repositorio ≠ aplicación

La página `github.com/.../repository` solamente muestra los archivos. Para que sea una PWA debes abrir el sitio publicado por GitHub Pages, bajo HTTPS.

### Opción recomendada

1. Sube **el contenido de esta carpeta a la raíz del repositorio** en `main`.
2. GitHub ejecutará `.github/workflows/pages.yml`.
3. En el repositorio entra a **Settings → Pages** y, si aparece la opción, selecciona **GitHub Actions** como fuente.
4. Espera a que termine el workflow `Publicar Tesorería en GitHub Pages`.
5. Abre la URL que aparece en el workflow, con formato `https://USUARIO.github.io/REPOSITORIO/`.
6. Abre esa URL en Chrome/Brave Android. No abras el archivo desde `github.com` ni desde una descarga `content://`.
7. Después de cargar la aplicación, usa el menú del navegador y selecciona **Instalar aplicación** cuando esté disponible.

## PWA

- manifest.webmanifest
- sw.js
- iconos 192/512
- display standalone
- HTTPS mediante GitHub Pages
- Service Worker con fetch

## Datos

IndexedDB local. Los JSON son respaldos/importación y no sustituyen a la base local.
