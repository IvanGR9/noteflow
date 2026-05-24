# NoteFlow 📝

App de productividad móvil construida con Expo y React Native. Permite organizar el contenido en tres tipos distintos: notas de texto, listas de tareas e ideas con etiquetas.

## Capturas

| Notas | Tareas | Ideas |
|-------|--------|-------|
| Lista de notas con búsqueda y ordenación | Checklists con barra de progreso | Ideas con color por estado |

## Stack tecnológico

- **Expo SDK 55** — framework de React Native
- **React Native** + **TypeScript** — desarrollo móvil con tipado estricto
- **Expo Router v4** — navegación basada en sistema de archivos
- **Zustand** + **AsyncStorage** — estado global con persistencia local
- **FlashList** (Shopify) — listas de alto rendimiento
- **Zod** — validación de formularios
- **React Native Paper** — librería de componentes UI
- **expo-haptics** — feedback táctil

## Funcionalidades

- ✅ Tres tipos de contenido: notas, tareas e ideas
- ✅ Búsqueda en tiempo real en cada pestaña
- ✅ Archivar y desarchivar contenido
- ✅ Ordenación por fecha o alfabéticamente
- ✅ Modo oscuro y claro con toggle
- ✅ Formularios con validación Zod
- ✅ Persistencia local con AsyncStorage
- ✅ Feedback táctil con expo-haptics
- ✅ Menú contextual con long press
- ✅ Edición de notas existentes
- ✅ Estados vacíos en cada pestaña
- ✅ Grid de 2 columnas con cards uniformes

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/IvanGR9/noteflow.git
cd noteflow

# Instalar dependencias
npm install

# Arrancar el servidor de desarrollo
npx expo start
```

Escanea el QR con Expo Go en tu dispositivo Android o iOS.

## Estructura del proyecto
noteflow/
├── app/                    # Rutas y pantallas (Expo Router)
│   ├── (tabs)/             # Navegación principal por pestañas
│   │   ├── notas/          # Pestaña de notas + detalle [id]
│   │   ├── checklists/     # Pestaña de tareas + detalle [id]
│   │   └── ideas/          # Pestaña de ideas + detalle [id]
│   ├── nueva-nota.tsx      # Modal de creación/edición
│   ├── archivados.tsx      # Pantalla de archivados
│   └── ajustes.tsx         # Pantalla de ajustes
├── components/
│   ├── items/              # Cards: NoteCard, ChecklistCard, IdeaCard
│   └── ContextMenu.tsx     # Menú contextual reutilizable
├── store/
│   └── notesStore.ts       # Store Zustand con persistencia
├── types/
│   └── index.ts            # Interfaces TypeScript y type guards
├── constants/
│   └── theme.ts            # Tokens de diseño (colores, tipografía, espaciado)
├── hooks/
│   └── useTheme.ts         # Hook para modo oscuro/claro
├── lib/
│   └── utils.ts            # Utilidades puras
└── docs/                   # Documentación técnica
├── idea.md
├── react-native-teoria.md
├── ai-setup.md
└── project-management.md

## Documentación técnica

- [Idea y definición del producto](docs/idea.md)
- [Fundamentos de React Native](docs/react-native-teoria.md)
- [Configuración de herramientas IA](docs/ai-setup.md)
- [Gestión del proyecto](docs/project-management.md)