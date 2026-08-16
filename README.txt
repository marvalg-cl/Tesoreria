TESORERÍA MULTIORGANIZACIONAL — VERSIÓN REPARADA v3

Esta versión usa una base IndexedDB NUEVA (v3), por lo que NO reutiliza los datos erróneos de versiones anteriores.

ARCHIVOS
- index.html: aplicación reparada
- manifest.webmanifest: PWA
- sw.js: service worker
- icon-192.png / icon-512.png / icon.svg: iconos en la raíz
- CPA_5B_2026_IMPORTAR.json: JSON CANÓNICO de la base maestra Excel
- Tesoreria_5B_2026_BASE_MAESTRA.xlsx: Excel fuente

IMPORTACIÓN CORRECTA
1. Sube todos los archivos del ZIP a la raíz de GitHub Pages.
2. Actualiza/abre la PWA nueva. Esta versión parte de una base local nueva.
3. Ve a Más > Importar JSON.
4. Selecciona CPA_5B_2026_IMPORTAR.json.
5. La importación reemplaza los datos de esa organización para evitar duplicados.

DATOS CANÓNICOS QUE DEBE MOSTRAR LA APP
- Organización: CPA 5°B 2026 · Escuela Palestina
- Integrantes: 37
- Movimientos maestros: 214
- Cuotas obligatorias/anuales: $279.000
- Cuotas extraordinarias: $155.500
- Otros ingresos (TIPO = Ingreso): $75.500
- Ingresos efectivos totales: $510.000
- Egresos efectivos: $275.662
- Saldo disponible: $234.338
- Monto real Tesorería: $203.030
- Saldo en poder de Presidenta: $31.308

IMPORTANTE
Los $75.500 de movimientos cuyo TIPO es "Ingreso" NO son cuotas obligatorias. La versión anterior los mezclaba con las cuotas y por eso aparecía $354.500 como cuotas obligatorias y $0 en ingresos efectivos. Esta versión conserva la separación correcta.

PLANILLA GENERAL E INFORMES
- Integrantes ordenados alfabéticamente.
- Informe de integrantes.
- Ficha individual con detalle asociado.
- Informe general con ingresos, egresos, saldo y detalle.
- Planilla GENERAL por integrante, marzo-diciembre, extraordinarias y totales.
- Imprimir / Guardar PDF funciona en la misma pantalla, sin ventanas emergentes.
- CSV de la planilla GENERAL.

RESPALDO
Más > Exportar JSON genera un JSON canónico reutilizable. Los movimientos conservan tipo, fondo, medio, monto, persona, RUT, responsable, comprobante, respaldo, estado y observaciones.
