# NoteFlow — Idea de producto

## Problema que resuelve

La mayoría de apps de notas son genéricas: tratan igual un pensamiento fugaz, una lista de la compra y un proyecto estructurado. El resultado es que todo acaba en un solo cajón desastre donde las ideas se pierden y las listas se mezclan con el texto.

NoteFlow separa el contenido por **intención**: tomar nota rápida, gestionar una lista de tareas o capturar una idea que puede evolucionar. Cada tipo tiene su propio flujo de creación, visualización y gestión.

## Usuario objetivo

Persona que usa el móvil para pensar: estudiantes, freelancers, creadores de contenido y cualquiera que necesite capturar ideas rápido y organizarlas sin fricción. No es una herramienta de productividad corporativa; es un bloc de notas inteligente para uso personal.

**Pain points del usuario:**
- Mezcla notas de texto, listas y borradores de ideas en la misma app
- Las apps complejas (Notion, Obsidian) tienen demasiada fricción para uso móvil rápido
- Las apps simples (Apple Notes) no diferencian tipos de contenido ni permiten filtrar

## Funcionalidades principales (MVP)

### Notas (type: `note`)
- Crear nota con título y cuerpo de texto libre
- Editar y eliminar
- Fijar nota (pinned) para que aparezca arriba

### Checklists (type: `checklist`)
- Crear lista con ítems marcables
- Marcar/desmarcar ítems individualmente
- Añadir y reordenar ítems
- Indicador visual de progreso (X/Y completados)

### Ideas (type: `idea`)
- Crear idea con título, descripción libre y estado (`raw → developing → ready → discarded`)
- Flujo de maduración: la idea pasa de borrador a lista para usar
- Filtrar por estado en la pestaña de ideas

### Global
- Tab bar con tres secciones: Notas, Checklists, Ideas
- Pantalla de nueva nota con selector de tipo antes de crear
- Búsqueda por título en cada sección
- Persistencia local con AsyncStorage
- Soporte modo oscuro / claro (sigue el sistema)

## Funcionalidades opcionales (post-MVP)

- **Tags**: etiquetar notas y filtrar por tag cross-type
- **Exportar**: compartir nota como texto plano o PDF
- **Recordatorios**: notificación local asociada a una nota o checklist
- **Sincronización**: backup en la nube (Supabase o iCloud)
- **Widget**: widget de iOS/Android con las notas fijadas
- **IA**: resumir nota, completar idea, sugerir ítems de checklist
- **Archivado**: mover notas antiguas a archivo sin eliminar

## Diferenciadores clave

1. **Tipos de nota con UI propia** — no es un campo de texto con etiqueta, es una experiencia diferente por tipo
2. **Flujo de ideas con estados** — convierte pensamientos crudos en algo accionable
3. **Cero fricción** — nueva nota en menos de 2 taps desde cualquier pestaña
4. **Dark-first, mobile-first** — diseñada para usarse de noche y con el pulgar
