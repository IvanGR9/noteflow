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

---

## Orden de desarrollo y decisiones

**El store antes que los componentes** — implementar Zustand con persistencia antes de construir ninguna UI garantiza que los componentes nunca manejen estado que debería ser global. Construir al revés habría generado `useState` locales que luego hay que migrar.

**Las cards antes que las pantallas** — los componentes de tarjeta son la unidad visual más repetida de la app. Tenerlos terminados antes de construir las pantallas permite que FlashList los use directamente sin placeholders provisionales.

**El formulario después de la navegación** — `nueva-nota.tsx` necesita conocer el sistema de rutas y el store para funcionar. Construirlo antes habría requerido mocks que luego hay que eliminar.

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