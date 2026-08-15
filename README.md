# Tesorería Multiorganizacional v2

Versión reconstruida desde cero, sin datos precargados.

## Principios
- IndexedDB como persistencia de datos.
- Sin localStorage para datos de la suite.
- Multi-organización.
- Personas maestras reutilizables entre organizaciones.
- Fotografía y múltiples datos de contacto.
- Roles múltiples y tipos de organización.
- Tutor/apoderado/responsable ampliado.
- Ingresos efectivos y egresos efectivos separados.
- Receptores: Tesorería, Secretaría, Presidencia, Responsable, Apoderado/a, Comisión, Encargado/a y Otro.
- Importación JSON que reemplaza la base actual.
- Exportación JSON completa.
- Borrado total confirmado mediante la palabra BORRAR.
- Navegación inferior optimizada para celulares.
- Iconografía SVG propia, sin emojis ni fuentes de iconos.
- Informes preparados con HTML de impresión independiente del CSS de pantalla.
- PWA con service worker y caché de archivos locales.

## Instalación
Subir todos los archivos y carpetas manteniendo la estructura. GitHub Pages debe publicar la carpeta raíz del repositorio.


## Respaldo JSON
La opción Exportar JSON genera un respaldo completo de IndexedDB: organizaciones, personas, vínculos, movimientos, cuotas, cuentas, configuración y auditoría. La importación acepta este formato y restaura todos los registros.
