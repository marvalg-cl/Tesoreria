# Tesorería Pro V23 · FUTURE FINAL

Suite PWA multiorganizacional para gestión de integrantes, cuotas, ingresos, egresos, reembolsos, cajas, planillas, informes y comprobantes.

## Arquitectura
- IndexedDB como persistencia principal.
- Persona independiente de la pertenencia organizacional.
- Relaciones múltiples entre personas.
- Segundo paso de autorización antes de confirmar cambios sensibles.
- Movimientos masivos convertidos en movimientos individuales.
- Comprobante único asociado a cada movimiento válido.
- PDF vectorial, sin rasterizar la documentación.
- Aplicación limpia; los datos reales permanecen en `DATOS_REALES_IMPORTACION/`.

## GitHub
Subir el contenido de esta carpeta como raíz del repositorio y publicar como sitio estático/PWA.
