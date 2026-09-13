# AGM Server Monitoring

Aplicación móvil Expo/React Native para monitorear y administrar una Raspberry Pi mediante una API de monitoreo. Este repositorio contiene el cliente móvil y un servidor de desarrollo para comprobar el contrato. La API de producción se mantiene en `errPizza/Discord-RobloxPurchsAlerts`.

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

El perfil `preview` tiene activado temporalmente el bypass: entra sin login y usa datos y archivos simulados. Para conectar con la RPi, desactiva `EXPO_PUBLIC_BYPASS_AUTH` en el perfil de compilación. En producción, cada teléfono inicia sesión y necesita aprobación administrativa la primera vez.

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

## Menú, pantalla completa y Storage

La navegación está en el menú superior, con secciones y subsecciones desplegables. El diseño usa fondos negros y gris carbón, sin la barra inferior ni su espacio reservado. Android se configura en pantalla completa. Storage muestra discos y volúmenes independientes, capacidad, uso y exploración de archivos de solo lectura.

Consulta [STORAGE.md](STORAGE.md) para aplicar el cambio del backend real, habilitar sus volúmenes y conocer los formatos de vista previa admitidos. Los cambios del servidor están preparados como parche; no se han desplegado.
