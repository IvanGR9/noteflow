# Uso de IA en NoteFlow

Este documento describe cómo se han utilizado las herramientas de inteligencia artificial durante el desarrollo de NoteFlow, qué papel han tenido y cuál ha sido el criterio del desarrollador en las decisiones del proyecto.

---

## Herramientas utilizadas

**Cursor** ha sido el editor principal durante todo el desarrollo. Su integración de IA aporta autocompletado inteligente que tiene en cuenta el archivo abierto, los archivos del workspace y las reglas definidas en `.cursorrules`. Esto hace que las sugerencias de código sean coherentes con el stack y las convenciones del proyecto en lugar de ser sugerencias genéricas de React Native.

**Claude (claude.ai)** se ha usado como herramienta de consulta puntual: resolver dudas de sintaxis, entender el funcionamiento de una API concreta, o aclarar conceptos que aparecen en la documentación oficial. No ha participado en las decisiones de diseño del proyecto.

---

## Configuración de Cursor: `.cursorrules`

Cursor permite definir un archivo `.cursorrules` en la raíz del proyecto. Su contenido se inyecta como contexto del sistema en cada petición al modelo, de forma que el autocompletado ya conoce las reglas del proyecto antes de generar cualquier sugerencia.

### Qué contiene el `.cursorrules` de NoteFlow

**`## Stack`** — declara las versiones exactas de las dependencias principales:

```
- Expo SDK 55 (managed workflow)
- React Native 0.83
- TypeScript (strict mode, no `any`)
- Expo Router v4 (file-based routing)
- Zustand (global state — no Context API for state)
- FlashList from @shopify/flash-list (no FlatList ever)
- Zod (runtime validation)
- AsyncStorage via @react-native-async-storage/async-storage
```

Sin esta sección el autocompletado podría sugerir APIs de versiones distintas o alternativas que no están instaladas en el proyecto.

**`## Project structure`** — mapea cada carpeta con su responsabilidad:

```
app/            → screens de Expo Router
store/          → solo stores de Zustand, uno por dominio
components/
  items/        → NoteCard, ChecklistCard, IdeaCard
  ui/           → primitivos reutilizables
types/index.ts  → todos los tipos compartidos
constants/theme.ts → tokens de diseño
lib/utils.ts    → funciones puras sin side effects
hooks/          → custom hooks
```

Esto evita que el autocompletado proponga crear tipos en el mismo archivo que un componente, o colocar lógica de negocio dentro de una screen.

**`## Naming conventions`** — define los patrones de nombrado para cada tipo de archivo:

- Componentes: PascalCase (`NoteCard.tsx`)
- Hooks: camelCase con prefijo `use` (`useNotes.ts`)
- Stores: camelCase con sufijo `Store` (`notesStore.ts`)
- Tipos e interfaces: PascalCase (`AnyNote`, `ChecklistItem`)
- Constantes primitivas: SCREAMING_SNAKE_CASE; objetos de constantes: PascalCase (`Colors`, `MAX_TITLE_LENGTH`)

**`## Architecture rules`** — las restricciones más importantes, escritas como mandatos explícitos:

- `NEVER use FlatList or ScrollView for long lists — always FlashList`
- `NEVER use React Context API for global or cross-screen state — use Zustand`
- `ALWAYS type everything with TypeScript strict. No implicit any, no type assertions without comment`
- `ALWAYS validate data at boundaries (user input, AsyncStorage reads) with Zod`
- `Screens are thin: they read from store + call store actions. No local state for persisted data`
- `Design tokens come exclusively from constants/theme.ts — no hardcoded hex values in components`

Estas reglas están escritas como prohibiciones absolutas porque las preferencias graduadas dejan margen de interpretación. `NEVER use FlatList` no admite excepciones que el autocompletado pueda considerar razonables.

**`## Code style`** — convenciones de escritura:

- Solo componentes funcionales, sin class components
- Named exports en todo salvo screens de Expo Router (que requieren default export)
- Componentes de máximo ~150 líneas; si se supera, extraer sub-componente
- `StyleSheet.create` para estilos estáticos; inline solo para valores dinámicos dependientes del tema

**`## DO NOT`** — lista de sugerencias que el modelo nunca debe hacer:

- Instalar `expo-navigation` (el proyecto usa Expo Router)
- Usar `require()` para imágenes en código de producción
- Commitear secretos o API keys
- Añadir comentarios que solo reescriben lo que el código ya dice

---

## Uso de Claude: consultas puntuales

Claude se ha usado para resolver dudas concretas que surgían durante el desarrollo, siempre contrastando las respuestas con la documentación oficial antes de aplicarlas.

Algunos ejemplos reales de consultas:

**Diferencia entre FlashList y FlatList** — antes de elegir FlashList se consultó cómo funciona el reciclaje de componentes frente al montaje/desmontaje de FlatList, qué es `estimatedItemSize` y por qué importa para el rendimiento. La decisión de usar FlashList fue posterior a entender la diferencia, no al revés.

**Funcionamiento del middleware `persist` de Zustand** — cómo se serializa el estado en AsyncStorage, en qué momento ocurre la rehidratación al arrancar la app y qué implicaciones tiene para el primer render. Esto llevó a implementar el patrón `_hasHydrated` documentado en `react-native-teoria.md`.

**Diferencias entre Stack, Tabs y Modal en Expo Router** — qué estructura de carpetas genera cada patrón, cómo se declara un modal en el layout y cuándo tiene sentido usar uno frente al otro. La decisión de la arquitectura de navegación de NoteFlow fue del desarrollador; la consulta fue para entender las herramientas disponibles.

**Conceptos de TypeScript** — cómo funcionan los type guards con el operador `in` en tiempo de ejecución, por qué `typeof` no sirve para discriminar variantes de un union type, y la diferencia entre un type guard y un casting directo.

En todos los casos el flujo ha sido: duda durante el desarrollo → consulta a Claude → contraste con documentación oficial → aplicación con criterio propio.

---

## Criterio propio del desarrollador

Todas las decisiones de diseño del proyecto han sido tomadas por el desarrollador:

**Arquitectura de navegación** — la elección de Tabs para la navegación principal, Stack para el detalle de cada nota y Modal para la creación de contenido nuevo responde a la lógica de uso de la app, no a una sugerencia de ninguna herramienta.

**Elección de librerías** — Zustand frente a Context API, FlashList frente a FlatList, Gluestack UI frente a React Native Paper. Cada elección tiene una justificación técnica documentada en `react-native-teoria.md` que parte de entender los trade-offs, no de aceptar una recomendación sin criterio.

**Diseño del sistema de tipos** — la definición de `Note`, `ChecklistNote`, `IdeaNote` y el union type `AnyNote`, así como los type guards `isNote`, `isChecklistNote` e `isIdeaNote`, son decisiones de diseño que afectan a cómo fluyen los datos por toda la app.

**Estructura de carpetas y convenciones** — la separación entre `store/`, `components/items/`, `components/ui/`, `lib/utils.ts` y `types/index.ts` refleja una decisión deliberada sobre dónde debe vivir cada tipo de código.

**Reglas del `.cursorrules`** — el propio archivo que configura Cursor es una decisión del desarrollador. El autocompletado respeta esas reglas porque el desarrollador las ha definido, no al contrario.

---

## Conclusión

Las herramientas de IA son útiles para acortar el tiempo entre no entender algo y entenderlo. Claude puede explicar en dos minutos cómo funciona el reciclaje de FlashList o qué ocurre durante la rehidratación de Zustand; leer la documentación completa llevaría más tiempo. Cursor puede completar el cuerpo de un componente que sigue un patrón ya establecido sin escribirlo desde cero.

Lo que no hacen estas herramientas es reemplazar el criterio técnico. Un modelo de lenguaje no sabe si FlashList es la elección correcta para NoteFlow — solo sabe cómo se usa FlashList. La decisión de que es la elección correcta, y por qué, es del desarrollador. Lo mismo aplica a cada regla del `.cursorrules`: el modelo las respeta, pero quien decidió que son las reglas correctas fue una persona.

En este proyecto la IA ha acelerado la curva de aprendizaje. Las decisiones de arquitectura han sido propias.
