# Tesorería Multiorganizacional — versión limpia

Aplicación PWA HTML/CSS/JS sin framework, con **IndexedDB** como almacenamiento local.

## Inicio limpio
La aplicación no contiene datos precargados. Los datos se cargan mediante JSON o se crean desde la interfaz.

## Funciones incluidas
- IndexedDB para organizaciones, personas, movimientos, cuotas, tesoreros y comprobantes.
- Importación y exportación JSON.
- Exportación Excel compatible (`tesoreria_GENERAL.xls`) con hoja GENERAL y hojas de apoyo.
- Informe GENERAL horizontal preparado para impresión/Guardar como PDF, con texto oscuro y alto contraste.
- Adjuntos de respaldos/comprobantes guardados como Blob en IndexedDB.
- Cuotas separadas en obligatorias anuales y extraordinarias.
- Monto real en tesorería y detalle de últimos gastos.
- Cuenta bancaria de la organización.
- RUT con guion automático.
- Teléfono y WhatsApp Chile con +569 precargado.
- Personas reutilizables en múltiples organizaciones, con roles, contacto, foto y tutor/apoderado/responsable.
- Tipos de organización ampliados.
- Barra lateral en escritorio y barra inferior en celulares.
- Botón para borrar completamente la suite y comenzar desde cero.

## Publicación
Subir todos los archivos a la raíz del repositorio de GitHub Pages. Abrir la URL HTTPS publicada; no abrir `content://` ni el archivo HTML directamente.
