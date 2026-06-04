# Firebase Auth en Noteflow

## Por qué Firebase Auth en lugar de JWT propio

Cuando una app necesita autenticación, la opción "casera" es construir un sistema de JWT: el servidor genera un token firmado al hacer login, el cliente lo guarda y lo manda en cada petición, y hay que gestionar la expiración, el refresco, el almacenamiento seguro y la revocación.

Ese sistema funciona, pero tiene un coste alto de mantenimiento y superficie de error. Firebase Auth nos da todo eso resuelto:

- **Los tokens se gestionan solos.** Firebase emite y renueva los tokens de sesión automáticamente. El SDK de React Native Firebase mantiene la sesión viva sin que tengamos que escribir lógica de refresco.
- **El almacenamiento seguro está integrado.** La sesión persiste en el dispositivo usando almacenamiento nativo seguro (Keychain en iOS, Keystore en Android), no en AsyncStorage expuesto.
- **La verificación en el backend es trivial.** Si en el futuro necesitamos validar el usuario desde nuestro servidor o desde reglas de Firestore, Firebase genera un ID Token verificable con una sola línea sin gestionar claves de firma propias.
- **Escala sin infraestructura.** No hay un servidor de autenticación que mantener, actualizar o proteger. Firebase gestiona millones de sesiones concurrentes.

En resumen: construir JWT propio tiene sentido cuando hay requisitos muy específicos de control. Para una app como Noteflow, Firebase Auth es la elección correcta porque elimina una categoría entera de trabajo sin sacrificar nada.

---

## Flujo de registro: dos pasos, dos sistemas

Cuando un usuario se registra, ocurren dos cosas distintas y ambas son necesarias.

**Paso 1 — Crear la identidad en Firebase Auth**

```
auth().createUserWithEmailAndPassword(email, password)
```

Esto crea una entrada en el sistema de identidad de Firebase. Firebase genera un UID único (por ejemplo `abc123xyz`) y gestiona la contraseña de forma segura con hashing. Lo que Firebase Auth guarda es mínimo: el UID, el email y los metadatos del proveedor.

Firebase Auth no es una base de datos de perfiles. No sabe qué es un "nombre", una "foto de perfil" o cualquier dato propio de nuestra app. Solo sabe si alguien es quien dice ser.

**Paso 2 — Crear el perfil en Firestore**

```
firestore().collection('users').doc(uid).set({
  name: 'Iván',
  email: 'ivan@ejemplo.com',
  createdAt: firestore.FieldValue.serverTimestamp(),
  avatarUrl: null,
})
```

Aquí creamos el perfil del usuario en nuestra propia base de datos, usando el mismo UID como clave del documento. Así podemos guardar cualquier dato de la app sin limitaciones.

**Por qué los dos pasos son necesarios**

Firebase Auth y Firestore son sistemas separados con responsabilidades distintas. Auth dice "este usuario existe y su contraseña es correcta". Firestore dice "este usuario se llama Iván, se registró el 4 de junio y tiene estas notas". Uno sin el otro estaría incompleto.

El UID actúa de puente: es el mismo en ambos sistemas, lo que permite que cualquier parte de la app pueda obtener la identidad desde Auth y los datos del perfil desde Firestore usando ese mismo identificador.

---

## Qué es Firestore y cómo almacena el perfil

Firestore es la base de datos NoSQL de Firebase. En lugar de tablas y filas, organiza los datos en **colecciones** y **documentos**.

Una colección es como una carpeta. Un documento es como un archivo dentro de esa carpeta, identificado por un ID y que contiene un objeto JSON. Los documentos pueden tener subcolecciones, lo que permite estructuras anidadas.

En Noteflow, el perfil del usuario vive en:

```
users/
  └── {uid}/          ← documento cuyo ID es el UID de Firebase Auth
        name: string
        email: string
        createdAt: Timestamp
        avatarUrl: string | null
```

Algunas cosas relevantes sobre cómo funciona:

- **`serverTimestamp()`** no es la hora del dispositivo. Es la hora del servidor de Firebase en el momento en que escribe el documento. Esto evita inconsistencias entre dispositivos con el reloj mal configurado.
- **Los documentos son independientes entre sí.** No hay esquema forzado: si mañana queremos añadir un campo `bio` o `plan`, simplemente lo añadimos en los documentos nuevos sin necesidad de migrations.
- **Las reglas de Firestore controlan quién puede leer qué.** Más adelante se pueden configurar para que cada usuario solo pueda leer y escribir su propio documento: `request.auth.uid == resource.id`.

---

## Cómo funciona `onAuthStateChanged` para proteger las rutas

`onAuthStateChanged` es una suscripción que Firebase mantiene activa durante toda la vida de la app. Cada vez que el estado de autenticación cambia (login, logout, o simplemente al arrancar y restaurar la sesión del dispositivo), llama a nuestra función con el usuario actual o con `null`.

En `_layout.tsx` lo usamos así:

```typescript
const [user, setUser] = useState<FirebaseAuthTypes.User | null | undefined>(undefined);

useEffect(() => {
  const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
    setUser(firebaseUser);
  });
  return unsubscribe; // limpia la suscripción al desmontar
}, []);
```

El estado `user` tiene tres valores posibles con significados distintos:

| Valor | Significado |
|-------|-------------|
| `undefined` | Firebase aún no ha respondido; no sabemos si hay sesión |
| `null` | No hay sesión activa; el usuario no está autenticado |
| `User` | Hay una sesión activa con ese usuario |

La distinción entre `undefined` y `null` es clave. Al arrancar la app, Firebase necesita un instante para comprobar si hay una sesión guardada en el dispositivo. Durante ese instante, si redirigiéramos inmediatamente a `/login`, haríamos un flash incorrecto cada vez que un usuario autenticado abre la app.

La solución es mantener el SplashScreen visible mientras `user === undefined`. Solo cuando Firebase resuelve el estado (ya sea `null` o un `User`) tomamos la decisión de ruta:

- Si no hay usuario → `router.replace('/login')` y ocultamos el splash.
- Si hay usuario y está en `/login` (acaba de hacer login) → cargamos las notas, redirigimos a las tabs y ocultamos el splash.
- Si hay usuario y ya está en las tabs (sesión restaurada) → cargamos las notas y ocultamos el splash sin redirigir.

Este patrón garantiza que ninguna pantalla protegida sea accesible sin sesión y que no haya flashes visuales al arrancar.

---

## Por qué necesitamos un Development Build para `@react-native-firebase`

Expo ofrece dos formas de ejecutar una app:

**Expo Go** es una app genérica instalada en el dispositivo que puede cargar cualquier proyecto de Expo. Es rápida para prototipar porque no requiere compilar nada. Pero tiene una limitación fundamental: solo puede usar el código nativo que ya viene incluido en Expo Go. No puede cargar código nativo personalizado en tiempo de ejecución.

**Development Build** es una versión compilada de nuestra propia app, con exactamente el código nativo que necesitamos y nada más. Es como una versión de desarrollo de la app real.

`@react-native-firebase` es una librería que necesita código nativo. Internamente, el SDK de Firebase para iOS y Android está escrito en Swift/Objective-C y Kotlin/Java. Esta librería actúa de puente entre JavaScript y ese SDK nativo. Al arrancar la app, el código nativo de Firebase se inicializa automáticamente leyendo `google-services.json` (Android) o `GoogleService-Info.plist` (iOS).

Todo ese código nativo necesita estar compilado dentro de la app. Expo Go no lo incluye porque no forma parte del conjunto de módulos que viene de serie.

Para generar el Development Build con EAS:

```bash
eas build --profile development --platform android
```

O localmente si se tienen las herramientas de Android Studio instaladas:

```bash
npx expo run:android
```

Una vez instalado el Development Build en el dispositivo o emulador, se usa exactamente igual que Expo Go: el servidor de Metro sirve el JavaScript en tiempo real, pero el código nativo de Firebase ya está compilado y disponible.
