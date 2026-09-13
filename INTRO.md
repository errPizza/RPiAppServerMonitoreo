# Intro y APK de pruebas

La app Expo/React Native muestra la intro en cada inicio, sin persistir su estado. Se usa Animated junto a react-native-svg 15.8.0 (versión compatible con Expo 52) para los trazos SVG con extremos móviles del estudio.

- Pizza Dev: 3,4 segundos. El desplazamiento dura unos 630 ms con ease-out cúbico (inicio rápido y frenada suave), máscara móvil y logo opaco por delante del texto. Al terminar hay 17 px de separación para evitar tapar la P. La composición permanece aproximadamente 1,6 segundos antes de salir.
- Another Game More: 7,4 segundos. El PNG entra con fade-in y conserva opacidad 100 % después. Una máscara retira progresivamente el dibujo siguiendo 56 recorridos extraídos del dinosaurio, la planta, los cuadros y el aro. La cola de cada trazo gobierna la retirada de su zona; los detalles cortos salen antes y las líneas largas continúan recorriendo la imagen mientras empieza a formarse el nombre. Los trazos y acentos usan blanco/rojo. El destino son letras vectoriales rellenas, gruesas y biseladas, adaptadas a la imagen de branding: ANOTHER / GAME MORE, triángulos rojos en las A, cuadrado rojo en la O de MORE y STUDIO en sans-serif espaciada entre dos líneas finas.
- Monitoring: mínimo 1,8 segundos, ampliable hasta terminar la inicialización real. La esquina inferior muestra sesión, carga de datos y montaje de la app. Un círculo central permanece visible: gira mientras carga y se completa con una marca al terminar. En bypass se informa de datos locales, sin afirmar que conecta a la RPi.

La precarga de los tres logos sucede antes de la secuencia. Con reducción de movimiento se usan fades breves y se eliminan los desplazamientos, giros y escalas. La entrada del dashboard sucede una vez cargados sus datos, o su estado de error si la conexión falla.

## Referencia visual

Se analizó el archivo local `assets/videoplayback (1).mp4` (18 segundos, 1920×1080), proporcionado por el usuario. Se revisaron fotogramas de toda la secuencia y muestras más próximas entre los segundos 2–5 y 11–14. El efecto observado utiliza secciones móviles sobre contornos, esquinas y arcos, puntas cromáticas transitorias y revelación del texto por trazado. La implementación adapta ese mecanismo al emblema y nombre de Another Game More, con el diseño tipográfico de la referencia posterior del usuario.

El patrón del MP4 de referencia está excluido por `.gitignore` de los archivos enviados a EAS. El archivo no está presente en el entorno restaurado actual.

## Bypass temporal

`EXPO_PUBLIC_BYPASS_AUTH=true` en el perfil EAS `preview` activa la sesión local. `AuthContext` utiliza `restoreStartupSession`, que comprueba el bypass antes de tocar SecureStore o la red. `MonitoringRepository` carga datos simulados y el dashboard los identifica como tales. El backend conserva su autenticación.

Para restaurar el login: `EXPO_PUBLIC_BYPASS_AUTH=false` y `EXPO_PUBLIC_APP_ENV=production`, tanto en `.env` como en el perfil usado para compilar. Reiniciar Expo o recompilar el APK. El perfil EAS `production` desactiva expresamente el bypass. Una sesión válida sigue restaurándose como antes.

## Validación

- `npm run typecheck`.
- `npm test`: sesión con/sin bypass, límites de los tramos móviles, retirada del PNG ligada a cada cola, participación de todos los recorridos extraídos, título completo durante la pausa, salida y reducción de movimiento.
- Exportación Android de Expo.
- Navegador a 320 y 390 px: fade del PNG, tramos en movimiento, título completo, dashboard con peticiones a RPi bloqueadas y cero errores JavaScript.
- Navegador a 320 px con reducción de movimiento: entrada al dashboard.
- Verificación de login con bypass desactivado.

La configuración del próximo APK usa `android.versionCode=2` para distinguirlo de la primera compilación. La exportación Android valida el bundle; todavía no se ha generado el APK actualizado.

La comprobación del 13 de septiembre de 2026 pasó en navegador a 320 y 390 px, además de reducción de movimiento: acceso al dashboard, cero peticiones a RPi y cero errores JavaScript. También pasaron las pruebas, TypeScript y la exportación Android. La grabación está en `artifacts/intro-emblema-completo.mp4` (excluida del código enviado a EAS).

## Extracción de los trazos del emblema

`studioEmblemContours.json` contiene 56 recorridos precalculados, 1190 puntos y el ancho de máscara de cada recorrido. Se obtiene del PNG original con `scripts/trace-studio-emblem.py` y OpenCV instalado únicamente como herramienta de desarrollo. No se añade OpenCV a la app ni se procesa el PNG durante el inicio. El análisis a 384 px mide una cobertura del 99,995 % del primer plano por encima del umbral de brillo; no equivale a una vectorización exacta de cada píxel antialias del PNG de 1254 px. La imagen original se mantiene para conservar su aspecto durante el consumo.
