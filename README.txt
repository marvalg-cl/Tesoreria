TESORERÍA MULTIORGANIZACIONAL — VERSIÓN LIMPIA

Esta carpeta contiene una aplicación nueva, sin datos precargados.

IMPORTANTE PARA ANDROID
- No abras index.html directamente desde el administrador de archivos para probar la PWA.
- Súbela a GitHub Pages (HTTPS) o a otro servidor HTTPS.
- Una URL https://... permitirá que el service worker y la instalación PWA funcionen.
- La aplicación puede mostrar la interfaz desde archivo local, pero IndexedDB/PWA pueden estar limitados por el entorno content://.

DATOS
- No hay organizaciones, personas, movimientos, cuentas ni datos personales incorporados.
- IndexedDB es la única base de datos de la suite.
- La importación de datos se realiza desde JSON.
- La exportación genera un respaldo JSON.
- "Borrar toda la suite" elimina la base de datos IndexedDB completa.

ARCHIVOS
- index.html
- styles.css
- app.js
- manifest.webmanifest
- sw.js
- icons/icon.svg

FLUJO INICIAL
1. Abrir en HTTPS.
2. La aplicación crea una IndexedDB nueva y vacía.
3. Ir a Respaldos > Importar JSON para cargar datos.
4. Si se desea empezar nuevamente, usar "Borrar toda la suite".
