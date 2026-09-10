# AGM Server Monitoring

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

El perfil `preview` se conecta al API móvil de Another Game More. No incorpora credenciales: cada teléfono inicia sesión y necesita aprobación administrativa la primera vez.

Copia `.env.example` a `.env` para configurar la URL. El modo `mock` sigue disponible para desarrollo visual, pero no usa datos del servidor.

## Integración con Discord-RobloxPurchsAlerts

La aplicación está acoplada al contrato móvil autenticado del repositorio `errPizza/Discord-RobloxPurchsAlerts`, bajo `/api/mobile/*`.

El primer login crea una sesión de dispositivo `pending`. Un administrador/owner debe aprobarla en el panel web, desde **Dashboard → Mobile Sessions**, antes de que el teléfono reciba tokens. Después, la app almacena access/refresh tokens exclusivamente mediante `expo-secure-store`, los rota automáticamente y los revoca al cerrar sesión.

La API entrega sistema, potencia, requests, errores, logs, Docker, Nginx, estadísticas, alertas, eventos y controles remotos. Las métricas que el servidor no proporciona aparecen como `N/A`, no como valores inventados.

Las pantallas hablan con `MonitoringRepository`, por lo que no necesitan cambios al sustituir mock por producción. Los botones de control remoto solo envían comandos a la API autorizada; no realizan SSH ni ejecutan comandos en el teléfono.

## Estructura

- `src/screens`, `src/components`: UI y navegación.
- `src/state`: estado de carga y actualización.
- `src/models`: contratos de dominio.
- `src/repositories`: límite de acceso a datos.
- `src/services`: adaptadores HTTP del API móvil, mock, autenticación segura y notificaciones.
- `src/config`: configuración por entorno.
- `src/state/AuthContext.tsx`: sesión por dispositivo y flujo de aprobación.