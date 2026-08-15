# Tesorería Multiorganizacional — versión limpia

## Instalación PWA
1. Sube **todos** los archivos de esta carpeta al repositorio de GitHub Pages.
2. En GitHub Pages selecciona `main` y `/ (root)`.
3. Abre la URL de Pages en Chrome/Brave/Edge.
4. Usa el menú del navegador → **Instalar aplicación** cuando aparezca la opción.

> La aplicación no usa `localStorage`; la persistencia de datos se realiza con **IndexedDB**.

## Archivos
- `index.html`: entrada.
- `app.js`: aplicación completa.
- `styles.css`: interfaz responsive.
- `manifest.webmanifest`: configuración PWA.
- `sw.js`: caché/offline del shell.
- `icon.svg`: icono.
- `import-template.json`: plantilla de importación limpia.

## Funciones incluidas
- Múltiples organizaciones y tipos de organización.
- Personas reutilizables en múltiples organizaciones.
- Datos ampliados de integrante, tutor/apoderado/responsable.
- RUT con formato automático.
- Teléfonos +569 precargados.
- Movimientos de ingreso/gasto.
- Cuotas obligatorias anuales separadas de extraordinarias.
- Medio efectivo/digital/transferencia y otros.
- Responsable, autorización, receptor/proveedor.
- Adjuntos de imágenes/PDF como respaldo.
- Monto real en tesorería = ingresos registrados − gastos registrados.
- Planilla maestra horizontal.
- Exportación Excel compatible (`.xls`) con hoja `GENERAL`.
- Exportación/importación de respaldo JSON.
- Informes imprimibles en formato A4 horizontal y opción del navegador de Guardar como PDF.
- Datos del tesorero al pie de los informes.
- Botón de borrado total de la suite.
- Diseño responsive para celular y PC.
- Navegación inferior en celular y lateral en PC.
