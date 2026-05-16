# React Native — Teoría

---

## 1. React Native vs app nativa

### Qué es React Native

React Native es un framework creado por Meta que permite escribir aplicaciones móviles usando JavaScript y React, produciendo una app que se ejecuta de forma nativa en iOS y Android. No genera una WebView ni una app híbrida: los componentes que escribes (`<View>`, `<Text>`, `<FlatList>`) se traducen a widgets nativos reales (`UIView` en iOS, `android.view.View` en Android).

### Cómo funciona el bridge JS ↔ UI nativo

La arquitectura clásica de React Native tiene tres hilos principales:

| Hilo | Qué hace |
|------|----------|
| **JS Thread** | Ejecuta tu código JavaScript (lógica de negocio, estado, React) |
| **Native/UI Thread** | Renderiza los componentes nativos del sistema operativo |
| **Shadow Thread** | Calcula el layout con Yoga (motor de Flexbox en C++) |

La comunicación entre el JS Thread y el UI Thread ocurre a través del **Bridge**: un canal asíncrono y serializado (JSON) que envía mensajes en ambas direcciones. Cuando React decide que un componente cambió, serializa esa instrucción, la pasa por el Bridge, y el lado nativo aplica el cambio en el UI Thread.

**Limitación del Bridge:** como es asíncrono y serializado, operaciones que requieren sincronía estricta (p. ej., gestos complejos, animaciones a 60 fps) pueden sufrir jank si el JS Thread está ocupado.

**Nueva arquitectura (JSI):** A partir de React Native 0.68+ se introdujo JSI (JavaScript Interface), que reemplaza el Bridge por una referencia directa en C++ entre el motor JS (Hermes) y el código nativo. Elimina la serialización JSON y permite llamadas síncronas. Expo SDK 50+ lo activa por defecto.

### Por qué el resultado tiene aspecto y rendimiento nativo

Porque los componentes finales **son** widgets nativos del SO, no simulaciones web. El SO gestiona el scroll, la accesibilidad, las animaciones del sistema y el theming exactamente igual que en una app escrita en Swift o Kotlin. El desarrollador solo escribe en JavaScript; React Native se encarga de traducirlo.

---

## 2. Metro Bundler

### Qué es

Metro es el empaquetador (bundler) de JavaScript diseñado específicamente para React Native y mantenido por Meta. Su trabajo es tomar todos los archivos `.js`, `.ts`, `.tsx`, assets e imágenes de tu proyecto y convertirlos en uno o varios bundles que la app nativa puede cargar.

### Qué hace

1. **Resolución de módulos** — sigue los `import`/`require` desde el punto de entrada y construye el grafo de dependencias.
2. **Transformación** — aplica Babel para transpilar TypeScript, JSX y sintaxis moderna a JS compatible con Hermes.
3. **Serialización** — concatena los módulos en un bundle optimizado.
4. **Servidor de desarrollo** — expone el bundle en `http://localhost:8081` y sirve los assets en caliente.

### Por qué es diferente a webpack

| | **Metro** | **webpack** |
|-|-----------|-------------|
| Diseñado para | React Native (móvil) | Web |
| Árbol de módulos | Sin code splitting (un solo bundle por plataforma) | Code splitting nativo |
| Fast Refresh | Integrado y optimizado para RN | Requiere plugins y es más genérico |
| Configuración | Mínima, convencional | Muy flexible, más verbosa |
| Assets | Gestiona `@2x`, `@3x` automáticamente | Requiere loaders específicos |

Metro sacrifica flexibilidad a cambio de simplicidad y velocidad para el caso de uso móvil.

### Cómo gestiona el Hot Reload

Metro implementa **Fast Refresh** (desde RN 0.61):

1. Detecta qué archivo cambió.
2. Recalcula solo el subgrafo afectado del bundle (no reprocesa todo).
3. Envía el parche al cliente (la app en el dispositivo/simulador) vía WebSocket.
4. El runtime de React Native aplica el módulo nuevo y React reconcilia el árbol de componentes, **preservando el estado** de los componentes que no cambiaron.

Si el cambio afecta a un módulo fuera del árbol de React (p. ej., una función de utilidad pura), Fast Refresh recarga solo ese módulo. Si afecta a un componente, lo remonta de forma quirúrgica.

---

## 3. Expo Go vs Development Build

### Expo Go: ideal para aprender, insuficiente para producción

**Expo Go** es una app precompilada disponible en App Store y Google Play que incluye un runtime de Expo con las librerías más comunes ya empaquetadas. Apuntas tu cámara al QR de `npx expo start` y tu código JS se carga en ese runtime.

**Ventajas para aprender:**
- Sin necesidad de Xcode ni Android Studio.
- Sin tiempos de compilación: cambias el código y ves el resultado en segundos.
- Funciona en dispositivo físico o simulador sin configuración adicional.

**Por qué no sirve para producción:**

| Limitación | Detalle |
|------------|---------|
| Runtime fijo | Solo puedes usar las librerías que Meta/Expo ya compiló dentro de Expo Go. |
| Sin módulos nativos personalizados | Si tu app necesita p. ej. `react-native-purchase` o un SDK de terceros con código nativo, Expo Go no lo incluye. |
| Sin control del splash screen / icono real | La app que el usuario instala es Expo Go, no la tuya. |
| Sin notificaciones push propias | Las credenciales de push están ligadas a la app de Expo, no a la tuya. |

### Development Build

Un **Development Build** es una versión de Expo compilada específicamente para tu proyecto. Incluye exactamente los módulos nativos que tu `app.json`/`app.config.js` y tu `package.json` declaran, más las herramientas de desarrollo (DevMenu, Fast Refresh, etc.).

Se crea con **EAS Build** (`eas build --profile development`) o localmente con `npx expo run:ios` / `npx expo run:android`.

### EAS Build y cuándo se necesita

**EAS (Expo Application Services) Build** es el servicio de CI/CD en la nube de Expo para compilar apps iOS y Android sin necesitar Mac ni entorno de Android configurado localmente.

Necesitas EAS Build (o equivalente local) cuando:

- Tu app usa **cualquier librería con código nativo** no incluida en Expo Go (p. ej., Stripe, cámaras avanzadas, BLE, mapas nativos).
- Necesitas generar un `.ipa` o `.apk`/`.aab` para subir a las stores.
- Quieres un **Development Build** compartible con tu equipo sin que cada miembro compile desde cero.
- Usas **EAS Update** para enviar actualizaciones OTA (Over The Air) de JS sin pasar por revisión de la store.

**Flujo típico de madurez de un proyecto Expo:**

```
Expo Go (prototipo / aprendizaje)
    ↓
Development Build (módulos nativos propios)
    ↓
EAS Build preview (QA / testers internos)
    ↓
EAS Build production → App Store / Google Play
```

---

## 4. Sistemas de diseño

### El problema que resuelven

React Native no incluye componentes de alto nivel como `Button`, `Card` o `Modal` con estilos listos para producción. Un sistema de diseño cubre ese hueco: proporciona componentes accesibles, temizables y coherentes para que no partas de cero.

### Gluestack UI vs React Native Paper

| | **Gluestack UI v2** | **React Native Paper** |
|-|---------------------|------------------------|
| Filosofía | Utility-first (props de estilo inline, similar a Tailwind) | Componentes con estilos predefinidos (Material Design 3) |
| Theming | Token-based, 100 % personalizable | Adaptado al sistema de colores de Material You |
| Look por defecto | Neutro, sin opinión visual | Material Design: elevaciones, ripples, tipografía MD |
| Tamaño del bundle | Tree-shakeable, solo lo que importas | Más monolítico |
| TypeScript | Types generados automáticamente desde los tokens | Types manuales, menos granulares |
| Soporte web | Sí (universal) | Limitado |
| Comunidad | Creciente, mantenida por Gluestack | Madura, amplia |

### Por qué NoteFlow usa Gluestack UI

**1. Identidad visual propia sin pelear contra Material.**
React Native Paper impone el lenguaje visual de Material Design: ripples en los toques, elevaciones con sombra específica, tipografía Roboto. Sobreescribir todo eso para lograr una identidad diferente es más trabajo que empezar desde tokens neutrales.

**2. Filosofía utility-first.**
Gluestack permite escribir:
```tsx
<Box bg="$primary500" p="$4" rounded="$xl" />
```
en lugar de crear un `StyleSheet` por cada variación. El modelo mental es idéntico a Tailwind CSS, lo que reduce la fricción si ya conoces el ecosistema web.

**3. Personalización total desde el tema.**
El archivo `gluestack-ui.config.ts` define todos los tokens (colores, espaciado, tipografía, radios). Cambiar la paleta de NoteFlow es editar un único objeto; los componentes recogen el cambio automáticamente.

**4. Tree-shaking real.**
Solo se incluye en el bundle lo que importas. En una app de notas con superficie de UI moderada, esto impacta directamente en el tamaño del APK/IPA.

---

## 5. Navegación

### Los tres paradigmas en Expo Router

Expo Router usa **file-based routing**: la estructura de carpetas dentro de `app/` define directamente la navegación, igual que Next.js hace con las rutas web.

#### Stack

Un Stack apila pantallas unas sobre otras. Cada pantalla nueva empuja a la pila; el botón "atrás" o el gesto de deslizar la retira.

```
app/
  notas/
    index.tsx      ← lista de notas   (raíz del stack)
    [id].tsx       ← detalle de nota  (apilada sobre index)
```

Expo Router genera automáticamente el header con el botón de retroceso y gestiona la animación de transición nativa (slide en iOS, fade en Android).

#### Tabs

Las Tabs muestran varias secciones al mismo nivel jerárquico, accesibles desde una barra inferior persistente. El estado de cada tab se preserva al cambiar entre ellas.

```
app/
  (tabs)/
    notas.tsx
    checklists.tsx
    ideas.tsx
```

Los paréntesis en `(tabs)` son un **route group** de Expo Router: agrupan rutas sin añadir segmento a la URL.

#### Modal

Un Modal se presenta por encima de la pantalla actual sin destruirla. En Expo Router se declara con `presentation: 'modal'` en el layout:

```tsx
<Stack.Screen name="nueva-nota" options={{ presentation: 'modal' }} />
```

### Arquitectura de navegación en NoteFlow

```
app/
  (tabs)/                  ← Tabs: navegación principal
    notas.tsx              ← Tab 1: lista de notas
    checklists.tsx         ← Tab 2: lista de checklists
    ideas.tsx              ← Tab 3: lista de ideas
  notas/
    [id].tsx               ← Stack: detalle de nota (desde Tab 1)
  checklists/
    [id].tsx               ← Stack: detalle de checklist (desde Tab 2)
  ideas/
    [id].tsx               ← Stack: detalle de idea (desde Tab 3)
  nueva-nota.tsx           ← Modal: creación de nuevo contenido
```

**Por qué Tabs para la navegación principal:**
Las tres colecciones (notas, checklists, ideas) son entidades paralelas sin jerarquía entre ellas. El usuario necesita cambiar entre ellas frecuentemente y con un solo toque. Las Tabs expresan exactamente esa relación de igualdad y permiten que cada sección mantenga su propio estado de scroll y filtros al volver.

**Por qué Stack para el detalle:**
El detalle de una nota es jerárquicamente inferior a la lista: el usuario navega "hacia dentro" y puede volver. El Stack provee esa relación padre-hijo con la animación y el gesto de retroceso nativos que los usuarios esperan.

**Por qué Modal para la creación:**
Crear contenido nuevo es una tarea temporal que interrumpe el flujo principal. El Modal comunica visualmente que es una acción transitoria: aparece desde abajo, la pantalla anterior sigue visible detrás, y descartarlo (swipe down) es el gesto natural. No tiene sentido "apilar" la creación como si fuera un nivel más profundo.

---

## 6. TypeScript y type guards

### El tipo union `AnyNote`

NoteFlow maneja tres tipos de notas distintos que comparten campos base pero tienen campos propios:

```ts
// Nota de texto libre
type Note = {
  id: string;
  title: string;
  content: string;        // campo exclusivo
  createdAt: string;
  updatedAt: string;
};

// Nota con lista de tareas
type ChecklistNote = {
  id: string;
  title: string;
  items: { text: string; checked: boolean }[];  // campo exclusivo
  createdAt: string;
  updatedAt: string;
};

// Nota de idea con etiquetas
type IdeaNote = {
  id: string;
  title: string;
  body: string;           // campo exclusivo
  tags: string[];         // campo exclusivo
  createdAt: string;
  updatedAt: string;
};

// Union type que representa cualquier nota posible
type AnyNote = Note | ChecklistNote | IdeaNote;
```

El tipo `AnyNote` permite escribir funciones genéricas que aceptan cualquier variante sin perder seguridad de tipos:

```ts
function getTitle(note: AnyNote): string {
  return note.title; // seguro: title existe en las tres variantes
}
```

### El problema: TypeScript solo existe en tiempo de compilación

Los tipos desaparecen al transpilar a JavaScript. Cuando lees datos de AsyncStorage, de una API o de cualquier fuente externa, TypeScript no puede garantizar en tiempo de ejecución que el objeto sea un `Note` y no un `ChecklistNote`. Necesitas comprobarlo tú.

### Type guards con el operador `in`

Un **type guard** es una función que devuelve un predicado de tipo (`valor is Tipo`). Cuando la función retorna `true`, TypeScript estrecha el tipo dentro de ese bloque.

El operador `in` comprueba si una propiedad existe en un objeto en tiempo de ejecución, lo que lo hace perfecto para discriminar variantes de un union type por sus campos exclusivos:

```ts
// Comprueba si el objeto es una Note de texto libre
function isNote(note: AnyNote): note is Note {
  return 'content' in note;
}

// Comprueba si el objeto es una ChecklistNote
function isChecklistNote(note: AnyNote): note is ChecklistNote {
  return 'items' in note;
}

// Comprueba si el objeto es una IdeaNote
function isIdeaNote(note: AnyNote): note is IdeaNote {
  return 'body' in note && 'tags' in note;
}
```

### Uso en un componente real

```tsx
function NoteCard({ note }: { note: AnyNote }) {
  if (isNote(note)) {
    // TypeScript sabe que note es Note → acceso seguro a note.content
    return <Text>{note.content}</Text>;
  }

  if (isChecklistNote(note)) {
    // TypeScript sabe que note es ChecklistNote → acceso seguro a note.items
    return (
      <View>
        {note.items.map((item, i) => (
          <Text key={i}>{item.checked ? '✓' : '○'} {item.text}</Text>
        ))}
      </View>
    );
  }

  if (isIdeaNote(note)) {
    // TypeScript sabe que note es IdeaNote → acceso seguro a note.body y note.tags
    return (
      <View>
        <Text>{note.body}</Text>
        <Text>{note.tags.join(', ')}</Text>
      </View>
    );
  }
}
```

### Uso al cargar datos externos

```ts
async function loadNote(id: string): Promise<AnyNote | null> {
  const raw = await AsyncStorage.getItem(`note_${id}`);
  if (!raw) return null;

  const parsed = JSON.parse(raw);

  // Sin type guard aquí estaríamos haciendo un cast ciego (as AnyNote),
  // lo que deja pasar datos corruptos sin error.
  if (isNote(parsed) || isChecklistNote(parsed) || isIdeaNote(parsed)) {
    return parsed;
  }

  return null; // dato inválido o de versión anterior, se descarta de forma segura
}
```

### Por qué `in` y no `typeof` ni casting directo

- **`typeof`** solo discrimina primitivos (`string`, `number`, `boolean`). No sirve para distinguir variantes de objetos.
- **`as Note`** (casting) le dice a TypeScript "confía en mí", pero no comprueba nada en runtime. Si el dato está mal formado, el error aparece mucho más tarde y es difícil de rastrear.
- **`in`** es una comprobación real en runtime: si la propiedad no existe, el guard falla y TypeScript no estrecha el tipo, forzándote a manejar el caso.

---

## 7. Gestión de estado

### Tres herramientas, tres filosofías

#### `useState` — estado local

`useState` vive dentro de un componente y solo es visible por él y sus hijos via props. Es la herramienta correcta para estado efímero y puramente local: el texto de un input, si un modal está abierto, el ítem seleccionado en una lista local.

```tsx
function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder="Buscar notas..."
    />
  );
}
```

Problema: cuando el estado necesita compartirse entre componentes no relacionados, hay que "elevarlo" (lift state up) y pasarlo por props a través de todos los niveles intermedios — el problema conocido como **prop drilling**.

#### Context API — estado global sin dependencias externas

Context permite que cualquier componente del árbol acceda a un valor sin pasar props manualmente. Se crea un Provider que envuelve la app y un hook que consumen los componentes hijos.

```tsx
// context/NotesContext.tsx
type NotesContextValue = {
  notes: Note[];
  addNote: (note: Note) => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  function addNote(note: Note) {
    setNotes(prev => [note, ...prev]);
  }

  return (
    <NotesContext.Provider value={{ notes, addNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used inside NotesProvider');
  return ctx;
}
```

**El problema crítico: re-renders innecesarios.**

Cada vez que el valor del Provider cambia, **todos** los componentes suscritos con `useContext` se re-renderizan, aunque solo les importe una parte del valor. Si el contexto guarda `{ notes, addNote, filter, searchQuery }` y `searchQuery` cambia, un componente que solo usa `notes` también se re-renderiza.

```tsx
// Este componente se re-renderiza cuando searchQuery cambia,
// aunque no lo use en absoluto.
function NoteCount() {
  const { notes } = useNotes(); // suscrito a TODO el contexto
  return <Text>{notes.length} notas</Text>;
}
```

La única solución dentro de Context es dividirlo en múltiples contextos más pequeños, lo que añade complejidad estructural.

#### Zustand — estado global con selectores granulares

Zustand es una librería minimalista (~1 kB) que almacena el estado en un store externo al árbol de React. Los componentes se suscriben mediante **selectores**: funciones que extraen exactamente la porción de estado que necesitan. Zustand compara la salida del selector con `Object.is` después de cada cambio; si no difiere, el componente no se re-renderiza.

```ts
// store/useNotesStore.ts
import { create } from 'zustand';

type NotesStore = {
  notes: Note[];
  searchQuery: string;
  addNote: (note: Note) => void;
  setSearchQuery: (q: string) => void;
};

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  searchQuery: '',
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
```

```tsx
// Solo se re-renderiza cuando notes.length cambia, no cuando searchQuery cambia.
function NoteCount() {
  const count = useNotesStore((state) => state.notes.length);
  return <Text>{count} notas</Text>;
}

// Solo se re-renderiza cuando searchQuery cambia.
function SearchBar() {
  const query = useNotesStore((state) => state.searchQuery);
  const setQuery = useNotesStore((state) => state.setSearchQuery);
  return <TextInput value={query} onChangeText={setQuery} />;
}
```

### Comparativa de las tres opciones

| | `useState` | Context API | Zustand |
|-|------------|-------------|---------|
| Alcance | Local al componente | Árbol entero | Global |
| Re-renders | Solo el componente | Todos los suscritos al contexto | Solo los suscritos al selector que cambia |
| Persistencia | No | No | Sí (con middleware `persist`) |
| DevTools | No | No | Sí (Zustand DevTools) |
| Boilerplate | Mínimo | Medio (Provider + hook) | Mínimo (un `create`) |
| Cuándo usarlo | Estado efímero local | Config global poco cambiante (tema, idioma) | Estado de negocio compartido y frecuentemente actualizable |

---

## 8. Rendimiento en listas

### El problema de FlatList con listas largas

`FlatList` es el componente estándar de React Native para listas. Implementa **windowing** (o virtualización): solo renderiza los ítems visibles en pantalla más un margen configurable (`windowSize`). Los ítems fuera de la ventana se desmontan para liberar memoria.

El problema aparece cuando el usuario hace scroll rápido: React Native necesita montar y medir nuevos ítems en el JS Thread antes de que el UI Thread pueda mostrarlos. Si el JS Thread está ocupado o el layout de cada ítem es complejo, el gap entre lo que el usuario ya scrolló y lo que está renderizado produce **pantallas en blanco** (white flashes o blank areas).

La causa raíz es que `FlatList` mide el tamaño de cada ítem de forma diferida (después de renderizarlo), así que no puede precalcular dónde deben estar los ítems fuera de pantalla. Cada ítem que entra en la ventana es una medición nueva.

### FlashList: reciclaje de componentes

`FlashList` (de Shopify) resuelve el problema con una estrategia diferente: **recycling**, la misma técnica que usan `RecyclerView` en Android y `UICollectionView` en iOS.

En lugar de montar y desmontar componentes al hacer scroll, FlashList **reutiliza** los componentes que salen de la ventana visible. Cuando un ítem sale por arriba, su instancia de componente no se destruye: se mueve a un pool de reciclaje. Cuando un nuevo ítem entra por abajo, FlashList toma un componente del pool y actualiza sus props. No hay montaje, no hay layout desde cero.

```
FlatList:   scroll → desmontar ítem viejo → montar ítem nuevo → medir → pintar
FlashList:  scroll → reciclar ítem viejo → actualizar props → pintar
```

El salto de montaje a actualización de props es órdenes de magnitud más barato en el JS Thread.

### `estimatedItemSize` y por qué importa

Para poder precalcular las posiciones de todos los ítems sin renderizarlos, FlashList necesita una estimación del tamaño de cada ítem. Ese es el rol de `estimatedItemSize`:

```tsx
<FlashList
  data={notes}
  renderItem={({ item }) => <NoteCard note={item} />}
  estimatedItemSize={88}  // altura estimada en dp de cada ítem
/>
```

Con este valor, FlashList puede:
1. Calcular la altura total del scroll view antes de renderizar nada.
2. Saber qué ítems entrarán en pantalla antes de que lo hagan y prepararlos.
3. Posicionar el scrollbar correctamente desde el primer frame.

Si el valor es muy impreciso (p. ej., `estimatedItemSize={200}` para ítems que miden 80 dp), el scrollbar saltará al corregirse y el rendimiento mejorará menos de lo esperado. En NoteFlow medimos los ítems reales y usamos la mediana.

### Comparativa FlatList vs FlashList

| | **FlatList** | **FlashList** |
|-|-------------|---------------|
| Estrategia | Montar/desmontar | Reciclar instancias |
| `estimatedItemSize` | No requerido | Requerido |
| Pantallas en blanco | Frecuentes en listas largas | Casi eliminadas |
| Configuración | Lista de componentes heterogéneos automática | Requiere `getItemType` para ítems heterogéneos |
| Parte de RN core | Sí | No (dependencia externa) |
| Caso de uso ideal | Listas cortas o con ítems muy variables | Listas largas con ítems de tamaño similar |

---

## 9. Persistencia

### Qué es AsyncStorage

`AsyncStorage` es la solución de almacenamiento clave-valor incluida en el ecosistema de React Native (vía `@react-native-async-storage/async-storage`). Funciona de forma asíncrona (de ahí el nombre) y almacena strings. Para guardar objetos hay que serializarlos con `JSON.stringify` y deserializarlos con `JSON.parse`.

```ts
// Guardar
await AsyncStorage.setItem('notes', JSON.stringify(notes));

// Leer
const raw = await AsyncStorage.getItem('notes');
const notes = raw ? (JSON.parse(raw) as Note[]) : [];

// Borrar
await AsyncStorage.removeItem('notes');
```

### Limitaciones de AsyncStorage

| Limitación | Detalle |
|------------|---------|
| **Sin cifrado** | Los datos se guardan en texto plano en el sistema de archivos del dispositivo. No apto para tokens de sesión, contraseñas ni datos sensibles del usuario. Para eso se usa `expo-secure-store`, que usa el Keychain (iOS) y Keystore (Android). |
| **Límite de tamaño** | En Android el límite por defecto es 6 MB. Superar ese límite lanza una excepción silenciosa en algunos dispositivos. Para datos grandes (imágenes, archivos) se usa el sistema de archivos con `expo-file-system`. |
| **Solo local** | No hay sincronización entre dispositivos. Si el usuario reinstala la app o cambia de teléfono, los datos se pierden. Para sincronización se necesita un backend propio o servicios como Supabase o Firebase. |
| **API de bajo nivel** | No tiene observadores, no notifica cambios, no tiene tipado. Se usa casi siempre a través de una capa de abstracción (el middleware `persist` de Zustand). |

### Rehidratación del store con Zustand `persist`

El middleware `persist` de Zustand intercepta cada cambio de estado y lo serializa automáticamente en AsyncStorage. Al arrancar la app, lee el valor guardado y lo "rehidrata" (restaura) en el store.

```ts
// store/useNotesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NotesStore = {
  notes: AnyNote[];
  addNote: (note: AnyNote) => void;
  deleteNote: (id: string) => void;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      _hasHydrated: false,

      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      deleteNote: (id) =>
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Se ejecuta cuando la rehidratación termina (con éxito o con error)
        state?.setHasHydrated(true);
      },
    }
  )
);
```

### Qué ocurre durante la rehidratación

La rehidratación ocurre de forma asíncrona al iniciar la app. Durante ese tiempo el store tiene su estado inicial (array vacío de notas), no el estado persistido. Si un componente se renderiza antes de que termine la rehidratación, mostrará brevemente una lista vacía — un flash de contenido incorrecto.

La secuencia exacta es:

```
App arranca
    ↓
Store se inicializa con estado por defecto (_hasHydrated = false)
    ↓
persist lee AsyncStorage (operación async)
    ↓
Store se actualiza con los datos guardados
    ↓
onRehydrateStorage se ejecuta → _hasHydrated = true
    ↓
Componentes suscritos a _hasHydrated se re-renderizan
```

### Indicador de carga mientras se rehidrata

El campo `_hasHydrated` (el prefijo `_` marca que es estado interno de infraestructura, no de negocio) permite bloquear el render hasta que la rehidratación termina:

```tsx
// app/(tabs)/notas.tsx
export default function NotasScreen() {
  const hasHydrated = useNotesStore((state) => state._hasHydrated);
  const notes = useNotesStore((state) => state.notes);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <NotesList notes={notes} />;
}
```

Gracias al selector, solo este componente se re-renderiza cuando `_hasHydrated` pasa de `false` a `true`. El resto de la app no se ve afectado.

### Qué no persistir

No todo el estado del store debe guardarse. El middleware `persist` acepta una lista `partialize` para excluir campos:

```ts
persist(
  (set) => ({ ... }),
  {
    name: 'noteflow-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      notes: state.notes,
      // _hasHydrated y setHasHydrated se excluyen automáticamente
      // porque son estado de infraestructura, no datos del usuario
    }),
  }
)
```
