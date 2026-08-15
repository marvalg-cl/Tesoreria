TESORERÍA MULTIORGANIZACIONAL — LIMPIA V2

Esta versión fue reconstruida desde cero para evitar el bloqueo de arranque de la versión anterior.

CARACTERÍSTICAS
- Sin datos iniciales.
- IndexedDB como almacenamiento local.
- La interfaz se muestra aunque IndexedDB falle o tarde demasiado.
- No existe una pantalla de carga que pueda bloquear indefinidamente.
- Importación y exportación JSON.
- Botón "Borrar toda la suite".
- PWA / Service Worker con caché nueva.
- Sin librerías externas.

ARCHIVOS
index.html
app.js
styles.css
manifest.webmanifest
sw.js
icons/icon.svg

IMPORTANTE PARA GITHUB PAGES
Subir estos archivos a la raíz del repositorio.
Después de publicar, abrir la URL de GitHub Pages.
Esta versión utiliza una caché nueva: tesoreria-clean-v2-20260815.

Si el navegador ya tenía una versión anterior instalada, se debe cerrar la pestaña anterior y volver a abrir la URL de GitHub Pages. El nuevo Service Worker elimina las cachés anteriores de la aplicación.

FORMATO JSON
{
  "organizations": [],
  "members": [],
  "incomes": [],
  "expenses": [],
  "cashboxes": [],
  "audit": []
}

No hay ningún dato incorporado en esta distribución.
