TESORERÍA MULTIORGANIZACIONAL — VERSIÓN REPARADA v4

Esta versión corrige la lógica financiera, la navegación de integrantes, los formularios, los informes, el respaldo JSON y la generación/compartición de PDF.

ARCHIVOS
- index.html: aplicación completa
- manifest.webmanifest: PWA
- sw.js: service worker v4
- icon-192.png / icon-512.png / icon.svg: iconos
- CPA_5B_2026_IMPORTAR.json: JSON CANÓNICO de la base maestra Excel
- Tesoreria_5B_2026_BASE_MAESTRA.xlsx: Excel fuente

IMPORTACIÓN
1. Sube TODOS los archivos a la raíz de GitHub Pages.
2. Abre la nueva versión.
3. Ve a Más > Importar JSON.
4. Selecciona CPA_5B_2026_IMPORTAR.json.
5. La importación reemplaza los datos de esa organización, evitando duplicados.

DATOS CANÓNICOS DE CONTROL
- Organización: CPA 5°B 2026 · Escuela Palestina
- Integrantes: 37
- Movimientos: 214
- Cuotas obligatorias: $279.000
- Cuotas extraordinarias: $155.500
- Otros ingresos: $75.500
- Ingresos efectivos totales: $510.000
- Egresos efectivos totales: $275.662
- Monto real en Tesorería: $203.030
- Saldo en poder de Presidenta: $31.308
- Fondos totales del curso: $234.338

REGLA FINANCIERA IMPORTANTE
El panel principal muestra como “Saldo real en Tesorería” los $203.030 que quedan en la caja Tesorería. Los $31.308 están en poder de la Presidenta. El consolidado de ambas cajas es $234.338 y no debe presentarse como dinero disponible dentro de la caja Tesorería.

INFORMES
- Informe general
- Informe de integrantes, orden alfabético
- Informe individual por integrante
- Informe de cuotas obligatorias mensuales
- Informe de cuotas extraordinarias
- Planilla GENERAL

Los informes individuales se nombran “Informe_Nombre_Integrante.pdf”.
Los PDFs se generan directamente, se pueden guardar en Descargas y se pueden compartir mediante la hoja de compartir de Android (WhatsApp, correo, etc.) cuando el navegador lo permite.

JSON BIDIRECCIONAL
El formato canónico mantiene organizaciones, integrantes, movimientos, fondos, tipos de aporte, RUT, tutores, responsables, comprobantes, respaldos, estados y datos bancarios. Exportar JSON genera un respaldo que el mismo importador puede volver a cargar.
