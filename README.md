# Tesorería Pro · Super Suite

Aplicación web para la gestión integral de la tesorería de una organización (curso, club, junta de vecinos, etc.): integrantes, cuotas mensuales y extraordinarias, ingresos, egresos, reembolsos, cajas/cuentas, informes en PDF y Excel, y datos de contacto completos de cada integrante y su tutor/apoderado.

Es una **aplicación de un solo archivo** (`index.html`): no necesita build, ni Node, ni servidor con backend. Todo el HTML, CSS y JavaScript están en ese archivo, y los datos se guardan en el navegador con **IndexedDB**, por lo que funcionan sin conexión una vez cargada la primera vez.

## Publicar en GitHub Pages

1. Sube todos los archivos de este repositorio (tal cual, sin modificar nombres) a tu repositorio de GitHub.
2. Ve a **Settings → Pages** del repositorio.
3. En **Source**, elige la rama (por ejemplo `main`) y la carpeta raíz (`/`).
4. Guarda. GitHub te dará una URL del tipo `https://tu-usuario.github.io/tu-repositorio/`.
5. Abre esa URL — la app cargará automáticamente `index.html`.

> Importante: la persistencia completa de datos (IndexedDB) y la posibilidad de "instalar" la app en el celular como PWA **requieren HTTPS**. GitHub Pages ya sirve todo por HTTPS, así que no necesitas hacer nada extra.

## Instalar como app (PWA)

Una vez publicada por HTTPS:
- **Android/Chrome**: menú ⋮ → "Instalar aplicación" o "Añadir a pantalla de inicio".
- **iPhone/Safari**: botón compartir → "Añadir a pantalla de inicio".

Esto crea un ícono propio en el equipo y la app abre en pantalla completa, sin la barra del navegador.

## Estructura de archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La aplicación completa (HTML + CSS + JS + lógica). Es el único archivo que realmente "hace" la app. |
| `manifest.json` | Metadatos de la PWA (nombre, colores, íconos) para que se pueda instalar. |
| `sw.js` | Service worker: cachea la app para que funcione sin internet y se actualice sola cuando hay conexión. |
| `favicon.svg` | Ícono de la pestaña del navegador. |
| `icon-192.png`, `icon-512.png` | Íconos de la app para Android/PWA. |
| `apple-touch-icon.png` | Ícono para "Añadir a pantalla de inicio" en iPhone. |

No hay `package.json` ni proceso de build: no se necesita `npm install` ni compilar nada.

## Publicar una actualización

Cuando subas cambios nuevos a `index.html`:

1. Abre `sw.js` y sube el número de versión en la primera línea útil, por ejemplo:
   ```js
   const CACHE_NAME = 'tesoreria-pro-v2'; // antes v1
   ```
   Esto asegura que los usuarios que ya tenían la app instalada reciban la versión nueva en vez de quedarse con una copia vieja en caché.
2. Sube los cambios a GitHub (commit + push a la rama que usa Pages).
3. GitHub Pages se actualiza solo, normalmente en uno o dos minutos.

## Datos y respaldos

Los datos (integrantes, movimientos, organización, configuración) viven en el navegador de cada persona que usa la app (IndexedDB), **no** se suben a GitHub ni a ningún servidor. Desde **Configuración → Respaldos** dentro de la app puedes:
- Exportar todo a un archivo **JSON** (respaldo completo, para restaurar más adelante o pasar a otro equipo).
- Exportar a **Excel** (organizaciones, integrantes, movimientos, aportes y planillas).
- Importar datos desde JSON, Excel o CSV.

Se recomienda exportar un respaldo JSON periódicamente, sobre todo antes de borrar datos del navegador o cambiar de equipo.

## Compatibilidad

Funciona en cualquier navegador moderno (Chrome, Edge, Safari, Firefox) de escritorio o celular. No requiere cuenta ni conexión a internet para el uso diario — solo la necesita la primera vez que se carga la página.
