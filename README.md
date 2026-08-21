# Tesorería Super Suite V10

PWA multiinstitucional para gestionar integrantes, cuotas fijas, cuotas extraordinarias, ingresos, egresos, reembolsos, reversas/anulaciones, cajas, comprobantes, planillas e informes.

## Base técnica
- IndexedDB como almacenamiento principal de la información.
- PWA instalable con `manifest.json` y `sw.js`.
- Interfaz offline para la aplicación cacheada.
- Una sola `index.html`, un solo bloque `<style>` y un solo `<script>` de aplicación.
- Sin CDN ni librerías externas para iconos: SVG embebido basado en Font Awesome Free Solid/Regular y composición visual inspirada en Material Design.

## Identificación y aislamiento
- Nombre + RUT como identificación visible e histórica.
- Cada organización trabaja con sus propios movimientos, cuotas, cajas y saldos.
- El cruce con otras organizaciones solo se genera mediante la acción explícita **Informe cruzado**.
- Los comprobantes conservan la identificación histórica de la operación.

## Cuotas
- Cuotas fijas: mensuales, anuales, semestrales, trimestrales y otras.
- Cuotas extraordinarias separadas.
- Cargas masivas a integrantes.
- Estado de cuota con opción en blanco cuando no existe movimiento; AL DÍA, PENDIENTE, CANCELADO, REVERSA, ANULADO, EXIMIDO, NO PARTICIPA, NO APLICA y VENCIDO.
- Al registrar AL DÍA se sincronizan cuota, movimiento, comprobante, saldos, caja e informes.

## Comprobantes y documentos
- Todo ingreso, egreso, reembolso y cuota registrada genera comprobante.
- El comprobante se abre tocando directamente el recuadro del documento; no se usa un botón de ojo redundante.
- Vista previa, PDF, impresión, WhatsApp y correo.
- PDF individual compacto en una página con base institucional: identificación, resumen del integrante, estado de Tesorería, cuotas fijas, extraordinarias, reembolsos, reversas/anulaciones y datos del tesorero/transferencia.
- PDFs de planillas en hoja completa horizontal y con mayor resolución.

## Planillas
- Planilla general tipo Excel con Nombre + RUT.
- Cuotas extraordinarias y cuotas fijas separadas.
- Totales horizontales y verticales dentro de la propia tabla.
- Columnas compactas para facilitar el desplazamiento horizontal en celular y PC.

## Ficha del integrante
- Acciones agrupadas en una cuadrícula limpia y responsive: Ingreso, Egreso, Reembolso, Reversas, Guardar PDF, WhatsApp, Correo y Editar.
- Cerrar queda como icono discreto en el encabezado.
- Datos bancarios del integrante para reembolsos.
- Historial y comprobantes clickeables.
- Informe cruzado separado para otras organizaciones.

## Tema e iconografía
- Tema claro/oscuro mediante botón de icono en la barra superior.
- Icono de Configuración en la barra superior.
- Iconografía vectorial con color funcional por acción, manteniendo el mismo lenguaje visual en la suite y los PDFs.
- Barra inferior móvil con seis módulos e iconos de tamaño uniforme.

## GitHub Pages
1. Sube todos los archivos de esta carpeta al repositorio.
2. En GitHub: **Settings → Pages → Deploy from branch**.
3. Selecciona la rama y la carpeta raíz `/root`.
4. Abre la aplicación mediante la URL HTTPS publicada.

### Importante sobre IndexedDB
Abrir un HTML como `file://` o desde algunos visores de descargas puede restringir IndexedDB y Service Worker. Para probar la versión completa, usa GitHub Pages, un servidor local HTTPS/HTTP o cualquier servidor web.

## Archivos
- `index.html` — aplicación completa.
- `manifest.json` — configuración PWA.
- `sw.js` — caché/offline.
- `favicon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — iconos PWA.
- `README.md` — documentación.
- `.gitignore` — exclusiones de Git.
