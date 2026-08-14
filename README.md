# Tesorería Multiorganizacional

Aplicación HTML + IndexedDB + PWA.

## Datos JSON
- `tesoreria_5B_2026_importacion.json`: respaldo maestro portable.
- `personas.json`: 37 participantes.
- `aportes.json`: 190 aportes, incluyendo extraordinarios.
- `movimientos.json`: 24 movimientos.
- `tesorero.json`: datos del tesorero.
- `organizacion.json`: datos de la organización.

## Importar / exportar
En **Configuración** están los botones:
- ⬆️ Importar JSON
- ⬇️ Exportar JSON

También están disponibles en la barra superior.

La importación usa coincidencias naturales (RUT/nombre para personas y fecha+detalle+monto+responsable para movimientos) para evitar duplicados.

## Publicar en GitHub Pages
Sube todos los archivos del directorio al repositorio y activa GitHub Pages desde Settings → Pages → Deploy from a branch.
