# Tesorería Pro V23 · FUTURE FINAL — REBUILT

Esta entrega reconstruye el paquete para que `index.html` pueda abrirse tanto desde GitHub Pages como directamente desde un explorador Android que entregue el archivo mediante `file://` o `content://`.

## Cambios de arranque
- `index.html` es autosuficiente para estilos y runtime: no depende de cargar CSS/JS externos para iniciar.
- Un único runtime JavaScript; no existe script correctivo sobre script.
- Acceso a `localStorage` protegido para entornos `content://` donde el navegador puede bloquearlo.
- Service Worker sólo se registra en HTTP/HTTPS.
- IndexedDB continúa siendo la persistencia principal.
- Los datos reales permanecen separados en `DATOS_REALES_IMPORTACION/`.
- Los PDF continúan usando el contexto vectorial de la suite.

## GitHub Pages
Subir el contenido de este ZIP al repositorio dejando `index.html` en la raíz.
