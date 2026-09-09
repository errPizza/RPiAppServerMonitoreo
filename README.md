# Pi Command Center

Aplicación móvil Expo/React Native para monitorear y administrar una Raspberry Pi mediante una API de monitoreo. Este repositorio contiene **solo el cliente móvil**: no configura Raspberry Pi, Docker, Nginx, Cloudflare ni ningún backend.

## Ejecutar

```bash
npm install
npm run start
```

Copia `.env.example` a `.env` para configurar el modo. Por defecto se usa `mock`, con telemetría simulada y etiquetada como tal.

## Conectar la API real

1. Define `EXPO_PUBLIC_APP_ENV=production` y `EXPO_PUBLIC_API_BASE_URL` en `.env`.
2. Implementa los endpoints y contratos reales en `src/services/HttpMonitoringService.ts`.
3. Conecta un adaptador de almacenamiento seguro en `src/services/AuthService.ts` y añade el token de sesión como cabecera allí; nunca guardes tokens en texto plano.
4. Conecta el proveedor de push en `src/services/NotificationService.ts`.

Las pantallas hablan con `MonitoringRepository`, por lo que no necesitan cambios al sustituir mock por producción. Los botones de control remoto solo envían comandos a la API autorizada; no realizan SSH ni ejecutan comandos en el teléfono.

## Estructura

- `src/screens`, `src/components`: UI y navegación.
- `src/state`: estado de carga y actualización.
- `src/models`: contratos de dominio.
- `src/repositories`: límite de acceso a datos.
- `src/services`: adaptadores HTTP, mock, autenticación y notificaciones.
- `src/config`: configuración por entorno.
