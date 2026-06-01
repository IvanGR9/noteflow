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