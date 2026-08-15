# Tesorería Multiorganizacional v11

HTML + IndexedDB + PWA, preparada para GitHub Pages.

## Publicación en GitHub Pages
1. Sube `index.html`, `manifest.webmanifest`, `sw.js`, `icons/` y los JSON de respaldo al repositorio.
2. En **Settings → Pages**, selecciona **Deploy from a branch**, rama `main` y carpeta `/root`.
3. Abre la URL HTTPS de GitHub Pages.
4. En Android Chrome/Brave usa **Instalar aplicación** o **Añadir a pantalla de inicio**.

> Una PWA **no puede instalarse** si el HTML se abre desde `content://` o `file://`. Necesita HTTPS (GitHub Pages) o localhost.

## Datos base verificados
- 37 participantes.
- 190 aportes, incluidos 97 aportes extraordinarios.
- 24 movimientos.
- Ingresos Tesorería: $404.000.
- Ingresos Presidenta: $106.000.
- Egresos Tesorería: $200.970.
- Egresos Presidenta: $74.692.
- Saldo real Tesorería: $203.030.
- Saldo real Presidenta/otros: $31.308.
- Saldo teórico consolidado: $234.338.

La v11 utiliza una base IndexedDB nueva (`tesoreria_multi_v11_clean`) para evitar que datos duplicados de versiones anteriores alteren el resumen. El respaldo JSON permite importar/restaurar la información.

## Mejoras v11
- PWA corregida: manifest enlazado + Service Worker registrado + scope/start URL correctos.
- Botones **Guardar PDF** en los informes; se abre el diálogo de impresión del dispositivo para elegir **Guardar como PDF**.
- Documentos con diseño A4, saltos de página y bloque inferior único con organización, transferencia y Tesorero.
- Tesorero precargado: **Mario H. Valdés González · +56967567970**.
- Bancos de Chile en selector.
- RUT con formato automático `12.345.678-9`.
- Teléfonos normalizados a `+569XXXXXXXX`.
- Teléfono, correo y WhatsApp representados por iconos.
- Aportes extraordinarios separados de la cuota anual.
- Base limpia para que el resumen llegue a $234.338 y no a cifras infladas por migraciones anteriores.
