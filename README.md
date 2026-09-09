# Pi Command Center

Aplicación móvil Expo/React Native para monitorear y administrar una Raspberry Pi mediante una API de monitoreo. Este repositorio contiene **solo el cliente móvil**: no configura Raspberry Pi, Docker, Nginx, Cloudflare ni ningún backend.

## Ejecutar la app móvil

```bash
npm install
npm run start
```

## Generar un APK instalable para Android

El perfil `preview` de [eas.json](./eas.json) genera un archivo `.apk` (instalable directamente en el teléfono), no un bundle de Play Store. Requiere una cuenta gratuita de Expo para que el servicio firme y compile la app en la nube:

```bash
npx eas-cli login
npm run build:apk
```

Al finalizar, EAS mostrará una URL de descarga. Ábrela desde el teléfono Android, descarga el APK y permite la instalación desde esa fuente cuando Android lo solicite.

El APK `preview` inicia en modo `mock`, por lo que funciona sin servidor. Para crear un APK que se conecte a tu API LAN, ejecuta el build con `EXPO_PUBLIC_APP_ENV=production` y `EXPO_PUBLIC_API_BASE_URL` definidos en los secretos/variables de EAS; no incluyas tokens ni contraseñas en esas variables públicas.

Copia `.env.example` a `.env` para configurar el modo. Por defecto se usa `mock`, con telemetría simulada y etiquetada como tal.

## Ejecutar una API funcional local

El repositorio incluye una API Node sin dependencias externas en `backend/server.js`. Expone datos reales del host donde se ejecuta (CPU, memoria, uptime, nombre e IP), junto con los contratos de logs, alertas y control remoto.

```bash
npm run api
```

Después copia `.env.example` a `.env` y configura la IP LAN del equipo que ejecuta la API:

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:8787/api
```

Un teléfono físico no puede usar `localhost`: debe usar la IP LAN real del ordenador/Raspberry que ejecuta el proceso. Comprueba la API con `http://<IP>:8787/api/health`.

La API responde de forma funcional a `GET /dashboard`, `/logs`, `/alerts` y `POST /commands`. Los comandos se guardan como `queued` y se auditan en los logs; no ejecutan operaciones de sistema por defecto.

## Conectar la API real

1. Define `EXPO_PUBLIC_APP_ENV=production` y `EXPO_PUBLIC_API_BASE_URL` en `.env`.
2. Ejecuta `npm run api`, o despliega una API compatible que implemente los mismos contratos.
3. Para poder obtener temperatura, disco, potencia, Docker, Nginx y tráfico reales, conecta sus colectores autorizados al backend. Los valores no disponibles se devuelven como `N/A`; no se inventan.
4. Conecta un adaptador de almacenamiento seguro en `src/services/AuthService.ts` y añade el token de sesión como cabecera allí; nunca guardes tokens en texto plano.
5. Conecta el proveedor de push en `src/services/NotificationService.ts`.

Las pantallas hablan con `MonitoringRepository`, por lo que no necesitan cambios al sustituir mock por producción. Los botones de control remoto solo envían comandos a la API autorizada; no realizan SSH ni ejecutan comandos en el teléfono.

## Estructura

- `src/screens`, `src/components`: UI y navegación.
- `src/state`: estado de carga y actualización.
- `src/models`: contratos de dominio.
- `src/repositories`: límite de acceso a datos.
- `src/services`: adaptadores HTTP, mock, autenticación y notificaciones.
- `src/config`: configuración por entorno.
- `backend`: API local ejecutable y contratos HTTP de referencia.
