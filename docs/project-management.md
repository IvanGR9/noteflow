# Gestión del proyecto NoteFlow

## Metodología

NoteFlow se ha desarrollado siguiendo una metodología ágil personal basada en Kanban. El trabajo se organiza en un tablero con columnas que permiten visualizar el estado de cada funcionalidad en todo momento.

---

## Tablero Kanban

El tablero tiene cinco columnas:

- **Backlog** — funcionalidades identificadas pero no iniciadas
- **Todo** — funcionalidades priorizadas para el sprint actual
- **In Progress** — funcionalidades en desarrollo activo
- **Review** — funcionalidades completadas pendientes de revisión y prueba
- **Done** — funcionalidades terminadas y verificadas

---

## Tarjetas principales

Cada funcionalidad principal tiene su propia tarjeta con subtareas técnicas concretas:

1. **Setup del proyecto** — inicialización con Expo SDK 55, configuración de Expo Router, estructura de carpetas, `.cursorrules`
2. **Sistema de tipos** — definición de `BaseNote`, `Note`, `ChecklistNote`, `IdeaNote`, `AnyNote` y type guards en `types/index.ts`
3. **Store Zustand** — implementación del store con middleware `persist` y patrón `_hasHydrated` para rehidratación
4. **Navegación Expo Router** — layout de tabs, rutas dinámicas `[id].tsx` y modal de creación
5. **Pantallas de tabs** — `notas.tsx`, `checklists.tsx`, `ideas.tsx` con FlashList y estados vacíos
6. **Componentes de tarjeta** — `NoteCard`, `ChecklistCard` e `IdeaCard` visualmente distintos
7. **Formulario nueva nota** — modal adaptativo por tipo con validación Zod y `KeyboardAvoidingView`
8. **Pantallas de detalle** — `[id].tsx` para cada tipo con confirmación de borrado
9. **Haptics y UX** — feedback táctil al eliminar y al completar checklists, estados vacíos
10. **Documentación técnica** — `react-native-teoria.md`, `ai-setup.md` y `project-management.md`
11. **Integración API REST** — conexión con backend externo, eliminación de AsyncStorage, `lib/api.ts`

---

## Orden de desarrollo y decisiones

**El store antes que los componentes** — implementar Zustand con persistencia antes de construir ninguna UI garantiza que los componentes nunca manejen estado que debería ser global. Construir al revés habría generado `useState` locales que luego hay que migrar.

**Las cards antes que las pantallas** — los componentes de tarjeta son la unidad visual más repetida de la app. Tenerlos terminados antes de construir las pantallas permite que FlashList los use directamente sin placeholders provisionales.

**El formulario después de la navegación** — `nueva-nota.tsx` necesita conocer el sistema de rutas y el store para funcionar. Construirlo antes habría requerido mocks que luego hay que eliminar.

**El backend antes de refactorizar el store** — crear y probar la API completa antes de tocar el store garantiza que el contrato entre cliente y servidor está validado. Refactorizar el store contra una API sin probar habría multiplicado los puntos de fallo.

---

## Estado actual

| Funcionalidad | Estado |
|---|---|
| Setup del proyecto | ✅ Done |
| Sistema de tipos | ✅ Done |
| Store Zustand | ✅ Done |
| Navegación Expo Router | ✅ Done |
| Pantallas de tabs | ✅ Done |
| Componentes de tarjeta | ✅ Done |
| Formulario nueva nota | ✅ Done |
| Pantallas de detalle | ✅ Done |
| Haptics y UX | ✅ Done |
| Documentación técnica | ✅ Done |
| Integración API REST | ✅ Done |

---

## Integración con API REST (Fase 7)

En la fase 7 NoteFlow dejó de guardar los datos en el dispositivo para conectarse a un backend real. Se creó un proyecto separado llamado `noteflow-api` con Next.js y PostgreSQL en Neon, desplegado en Vercel.

Los cambios principales en la app móvil fueron:

- Se creó `lib/api.ts` con funciones tipadas para cada endpoint de la API
- Se refactorizó el store de Zustand eliminando la persistencia con AsyncStorage
- La fuente de verdad ahora es el servidor — al arrancar la app se llama a `fetchNotes()` que carga todas las notas desde la API
- Se añadieron `isLoading` y `error` al store para gestionar los estados de carga y error

La API en producción está en `https://noteflow-api-three.vercel.app` y el repositorio del backend en `https://github.com/IvanGR9/noteflow-api`.



# Fase 8 — Autenticación, perfiles y almacenamiento de imágenes

## Objetivos de la fase

La fase 8 introduce tres capas que convierten NoteFlow de una app monousuario conectada a una API en una aplicación multiusuario completa con identidad propia y contenido personalizado:

1. **Autenticación real** mediante Firebase Auth (correo/contraseña y Google).
2. **Perfil de usuario** persistido en Firestore, con nombre, email y foto de perfil.
3. **Almacenamiento de imágenes** en AWS S3 mediante Presigned URLs, manteniendo las credenciales fuera del cliente.

El resultado es una app que cada usuario abre y ve únicamente sus propias notas, con su propia identidad y foto, sin que el backend tenga que gestionar contraseñas, sesiones o archivos binarios.

---

## Decisiones técnicas

### Firebase Auth en lugar de JWT propio

En la fase 7 se implementó autenticación con JWT firmados por el backend (`bcryptjs` + `jsonwebtoken`). En la fase 8 se sustituye por Firebase Auth por tres motivos:

- **Gestión automática de sesiones**: Firebase emite y renueva tokens sin código adicional. El SDK mantiene la sesión persistente en almacenamiento nativo seguro (Keystore en Android).
- **Soporte multi-proveedor sin coste añadido**: añadir Google Sign-In es una llamada extra, no un sistema OAuth desde cero.
- **Menor superficie de error en el backend**: el servidor ya no almacena contraseñas ni firma tokens; solo verifica los que emite Firebase.

### Firestore para perfiles de usuario

Los datos de perfil (nombre, email, avatarUrl, fecha de registro) viven en Firestore en la colección `users/{uid}`, donde `uid` es el identificador de Firebase Auth. Se eligió Firestore en lugar de añadir una tabla `users` en PostgreSQL porque:

- El UID de Firebase es la fuente de verdad de la identidad; tenerlo replicado en dos bases obligaría a sincronizar.
- El perfil es un documento simple sin relaciones complejas; Firestore es óptimo para este patrón.
- El listener `onSnapshot` permite que cambios desde otros dispositivos se reflejen en tiempo real sin polling.

### AWS S3 con Presigned URLs

Las imágenes no se guardan en Firestore (los documentos están limitados a 1 MB y la conversión a Base64 infla un 33 %) ni viajan a través del backend. El flujo es:

1. La app pide al backend una URL firmada (`POST /api/upload/presigned-url`).
2. El backend genera un Presigned PUT URL con el AWS SDK, válida 60 segundos.
3. La app sube el archivo directamente a S3 con un `PUT`.
4. La URL pública resultante se guarda en `users/{uid}.avatarUrl` en Firestore.

Esto mantiene las credenciales de AWS exclusivamente en el servidor y evita que las imágenes pasen por la red dos veces.

### Development Build con EAS

`@react-native-firebase` incluye código nativo (Kotlin/Swift) que Expo Go no puede ejecutar. Para esta fase se generó un **Development Build** con EAS Build: un APK personalizado que incluye los módulos nativos y se conecta al servidor de Metro como Expo Go, pero compilado a medida del proyecto.

### Backend validando tokens de Firebase

El middleware `verifyAuth` del backend se reescribió para usar `firebase-admin`. Recibe el `Authorization: Bearer <token>`, lo verifica criptográficamente con la clave pública de Google, y si es válido devuelve `{ uid, email }`. Si falta o es inválido, responde 401.

---

## Dependencias añadidas

### App móvil (`noteflow`)

- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `@react-native-google-signin/google-signin`
- `expo-image-picker`
- `expo-dev-client`
- `react-native-reanimated` (actualizado a la versión compatible con SDK 55)
- `react-native-worklets` (instalado como peer obligatorio de Reanimated 4)

### Backend (`noteflow-api`)

- `firebase-admin`
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

---

## Servicios externos configurados

### Firebase

- Proyecto: `noteflow-903d9`
- Authentication: Email/Password + Google habilitados
- Firestore: región `eur3` (Europa), modo de prueba
- App Android registrada con `package_name: com.ivangr9.noteflow` y huella digital SHA-1 del keystore de EAS para Google Sign-In

### AWS

- Bucket S3: `noteflow-avatars-dam` en `eu-central-1` (Frankfurt)
- Política de bucket pública para `s3:GetObject` (las imágenes se sirven directamente desde S3)
- IAM user: `noteflow-s3-user` con política `AmazonS3FullAccess`
- Credenciales (access key + secret) almacenadas como variables de entorno

---

## Variables de entorno

### `.env.local` y Vercel (`noteflow-api`)

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `FIREBASE_SERVICE_ACCOUNT` (JSON de credenciales del Admin SDK como string)

### App móvil

- `EXPO_PUBLIC_API_URL` apuntando al despliegue de Vercel
- `google-services.json` en la raíz del proyecto (incluido en el repositorio, contiene únicamente identificadores públicos)

---

## Problemas encontrados y soluciones

### Configuración de `google-services.json` en EAS

Inicialmente el archivo estaba en `.gitignore` y EAS Build fallaba al no encontrarlo. Se probaron variables de entorno tipo file en EAS, pero la solución más limpia fue añadir el archivo al repositorio: a diferencia del Service Account del Admin SDK, este JSON solo contiene identificadores del proyecto sin credenciales sensibles, por lo que es seguro commitearlo.

### Versiones incompatibles de Reanimated y Worklets

Los primeros builds fallaban con `[Reanimated] React Native 0.83.6 version is not compatible with Reanimated 4.1.7` y luego con un error análogo para `react-native-worklets`. Las versiones se habían instalado con `npm install` sin pasar por el resolver de Expo. La solución fue reinstalar con `npx expo install`, que selecciona automáticamente las versiones marcadas como compatibles con el SDK 55, y ejecutar `npx expo install --check` para alinear el resto de paquetes desactualizados.

### "Unmatched Route" al arrancar la app

Tras el primer Development Build funcional, la app abría con un error de ruta no encontrada en `noteflow:///`. El layout raíz tenía la lógica de redirección dentro de un `useEffect`, pero expo-router intentaba renderizar la ruta vacía antes de que el effect se ejecutara. Se resolvió creando `app/index.tsx` con un `<Redirect href="/login" />` como punto de entrada, dejando que el `_layout.tsx` decida después si llevar al usuario a `/login` o a `/(tabs)` según el estado de auth.

### Backend rechazando peticiones de la app

Una vez integrada Firebase Auth en la app, las peticiones a `/api/notes` empezaron a fallar con 401. El middleware seguía validando JWTs emitidos por el propio backend (fase 7), pero la app ya enviaba tokens de Firebase. Se migró el middleware a `firebase-admin.auth().verifyIdToken()` y se eliminaron los endpoints `/api/auth/register` y `/api/auth/login`, que quedaron obsoletos.

### Error "Must specify an idToken" en Google Sign-In

El primer intento de login con Google devolvía un error de Firebase indicando que el `idToken` era nulo. La causa era la estructura del resultado en la versión actual de `@react-native-google-signin/google-signin`: el token no está en `result.idToken` sino en `result.data.idToken`. Se ajustó la desestructuración y el flujo funcionó al primer intento.