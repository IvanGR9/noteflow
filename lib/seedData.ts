import { useNotesStore } from '../store/notesStore';
import type { Note, ChecklistNote, IdeaNote } from '../types';

const NOTE_TITLES = [
  'Reunión de equipo', 'Ideas para el proyecto', 'Lista de compras', 'Recordatorio médico',
  'Plan de ejercicio', 'Resumen del libro', 'Notas de la clase', 'Presupuesto mensual',
  'Receta favorita', 'Contactos importantes', 'Objetivos del trimestre', 'Diario de viaje',
  'Reflexiones del día', 'Plan de ahorro', 'Notas de la conferencia', 'Feedback del cliente',
  'Tareas pendientes', 'Ideas de regalo', 'Plan de estudios', 'Decisiones importantes',
  'Análisis de mercado', 'Notas técnicas', 'Guía de instalación', 'Proceso de onboarding',
  'Estrategia de producto', 'Retrospectiva del sprint', 'Documentación API', 'Notas de diseño',
  'Plan de marketing', 'Investigación de usuario', 'Accesos y contraseñas', 'Flujo de trabajo',
  'Criterios de aceptación', 'Notas de arquitectura', 'Plan de lanzamiento', 'Análisis DAFO',
  'Hipótesis a validar', 'Métricas clave', 'Roadmap Q3', 'Errores conocidos',
  'Deuda técnica', 'Changelog', 'Glosario del proyecto', 'Dependencias externas',
  'Reglas de negocio', 'SLA definidos', 'Procedimiento de despliegue', 'Plan de contingencia',
  'Checklist de revisión', 'Acta de reunión',
];

const NOTE_CONTENTS = [
  'Revisar los puntos pendientes antes de la próxima sesión y asegurarse de que todos estén alineados.',
  'Explorar nuevas posibilidades para mejorar la experiencia del usuario en los flujos principales.',
  'Leche, pan, huevos, frutas de temporada, yogur griego y café molido.',
  'Cita el jueves a las 10:00. Llevar análisis recientes y lista de síntomas.',
  'Lunes: cardio 30min. Miércoles: fuerza. Viernes: yoga. Fin de semana: descanso activo.',
  'El autor argumenta que los hábitos se forman en tres fases: señal, rutina y recompensa.',
  'Tema 4: complejidad algorítmica. O(n log n) para mergesort. Repasar antes del examen.',
  'Ingresos: 2.800€. Fijos: 1.200€. Variables: 400€. Ahorro objetivo: 300€.',
  'Sofrito base, arroz bomba, caldo caliente poco a poco, azafrán al final.',
  'Ana García – diseño: 612 345 678. Pedro Ruiz – backend: pedro@email.com.',
  'Q3: lanzar feature de exportación, reducir churn un 15%, alcanzar 1.000 usuarios activos.',
  'Día 1: llegada a Lisboa. Barrio de Alfama al atardecer. Fado en vivo.',
  'Jornada productiva. Completé los tres bloques de trabajo sin distracciones significativas.',
  'Regla 50/30/20: necesidades, deseos y ahorro. Automatizar transferencia el día 1 de cada mes.',
  'Keynote principal: el futuro del diseño conversacional y los modelos multimodales.',
  'El cliente valora la velocidad pero quiere más opciones de personalización en el dashboard.',
  'Revisar PR #234, actualizar dependencias, escribir tests para el módulo de pagos.',
  'Para mamá: libro de recetas. Para Juan: auriculares inalámbricos. Para Sara: clase de cerámica.',
  'Repasar temas 1-6 esta semana. Simulacro el domingo. Descanso dos días antes del examen.',
  'Priorizar simplicidad sobre completitud. Mejor entregar algo pequeño que funciona.',
  '',
  'Implementar caché en el endpoint de listado. Reducir latencia de 800ms a menos de 100ms.',
  'Prerrequisitos: Node 18+, PostgreSQL 15, Redis. Variables de entorno en .env.example.',
  'Día 1: presentación de la empresa. Día 2: setup del entorno. Día 3: primera tarea real.',
  'Problema: alta tasa de abandono en el onboarding. Hipótesis: demasiados pasos obligatorios.',
  'Velocidad del sprint: 42 puntos. Blockers: integración con terceros más lenta de lo esperado.',
  'GET /api/notes — devuelve lista paginada. POST /api/notes — crea nueva nota. Auth: Bearer.',
  'Usar sistema de 8pt grid. Tipografía: Inter. Paleta limitada a 5 colores base.',
  'Canal principal: SEO orgánico + comunidad. Secundario: partnerships con influencers nicho.',
  'Entrevistas realizadas: 12. Patrón común: los usuarios no encuentran la función de búsqueda.',
];

const CHECKLIST_TITLES = [
  'Preparar presentación', 'Configurar entorno dev', 'Revisión de código', 'Deploy a producción',
  'Compras de la semana', 'Preparar viaje', 'Rutina matutina', 'Cierre mensual',
  'Auditoría de seguridad', 'Onboarding nuevo miembro', 'Preparar entrevista', 'Mantenimiento servidor',
  'Revisión de UI', 'Migración de base de datos', 'Preparar demo', 'Gestión de dependencias',
  'Backup semanal', 'Revisión de métricas', 'Plan de sprint', 'Cierre de proyecto',
  'Checklist de lanzamiento', 'Revisión accesibilidad', 'Test de regresión', 'Preparar informe',
  'Actualización de docs', 'Revisión de contratos', 'Configurar CI/CD', 'Preparar taller',
  'Revisión de diseño', 'Gestión de incidencias', 'Preparar keynote', 'Revisión SEO',
  'Configurar analytics', 'Plan de contingencia', 'Revisión de privacidad', 'Preparar release notes',
  'Checklist de QA', 'Revisión de accesos', 'Preparar retrospectiva', 'Limpieza de código',
  'Revisión de errores', 'Preparar roadmap', 'Configurar alertas', 'Revisión de KPIs',
  'Preparar newsletter', 'Gestión de backlog', 'Revisión de UX', 'Preparar caso de uso',
  'Configurar staging', 'Revisión de performance',
];

const CHECKLIST_ITEMS_POOL = [
  'Revisar requisitos', 'Actualizar documentación', 'Notificar al equipo', 'Crear rama en git',
  'Ejecutar tests unitarios', 'Revisar pull request', 'Hacer backup', 'Actualizar dependencias',
  'Verificar logs de error', 'Confirmar con stakeholders', 'Preparar entorno de staging',
  'Revisar métricas de rendimiento', 'Actualizar changelog', 'Comunicar al cliente',
  'Validar con diseño', 'Revisar accesibilidad', 'Comprobar en móvil', 'Verificar en tablet',
  'Actualizar variables de entorno', 'Limpiar datos de prueba', 'Revisar permisos',
  'Confirmar fecha de entrega', 'Preparar presentación', 'Revisar presupuesto',
];

const IDEA_TITLES = [
  'App de meditación guiada', 'Plataforma de cursos P2P', 'Marketplace de servicios locales',
  'Sistema de mentoría online', 'Herramienta de feedback anónimo', 'Red social para makers',
  'App de hábitos gamificada', 'Asistente de escritura con IA', 'Plataforma de freelance nicho',
  'Sistema de notas colaborativas', 'App de finanzas para autónomos', 'Comunidad de lectura digital',
  'Herramienta de retrospectivas', 'Plataforma de microcursos', 'App de recetas personalizadas',
  'Sistema de gestión de tareas por voz', 'Marketplace de templates', 'App de diario estructurado',
  'Plataforma de portfolios interactivos', 'Sistema de mentoring entre pares',
  'App de tracking de proyectos side', 'Herramienta de diseño colaborativo ligero',
  'Plataforma de recursos para startups', 'App de networking por intereses',
  'Sistema de revisión de código en equipo', 'Herramienta de documentación automática',
  'App de seguimiento de lecturas', 'Plataforma de challenges técnicos',
  'Sistema de gestión de conocimiento', 'App de productividad para ADHD',
  'Herramienta de análisis de feedback', 'Plataforma de microtareas remuneradas',
  'App de aprendizaje de idiomas contextual', 'Sistema de onboarding interactivo',
  'Herramienta de estimación de proyectos', 'App de journaling con IA',
  'Plataforma de open source sostenible', 'Sistema de gestión de OKRs',
  'App de seguimiento de inversiones', 'Herramienta de pruebas de usabilidad remota',
  'Plataforma de coworking virtual', 'App de mindmapping colaborativo',
  'Sistema de automatización sin código', 'Herramienta de análisis de competidores',
  'App de gestión de contraseñas local', 'Plataforma de testing A/B simplificado',
  'Sistema de alertas de tendencias', 'App de seguimiento de salud integral',
  'Herramienta de pitch deck con IA', 'Plataforma de comunidades de práctica',
];

const IDEA_TAGS = [
  ['productividad', 'mobile'], ['educacion', 'saas'], ['marketplace', 'local'],
  ['mentoria', 'comunidad'], ['feedback', 'anonimo'], ['maker', 'red-social'],
  ['habitos', 'gamificacion'], ['ia', 'escritura'], ['freelance', 'nicho'],
  ['colaboracion', 'notas'], ['finanzas', 'autonomos'], ['lectura', 'comunidad'],
  ['retrospectiva', 'equipos'], ['educacion', 'micro'], ['recetas', 'ia'],
  ['voz', 'productividad'], ['templates', 'diseno'], ['diario', 'reflexion'],
  ['portfolio', 'creadores'], ['mentoring', 'pares'], ['side-project', 'tracking'],
  ['diseno', 'colaboracion'], ['startups', 'recursos'], ['networking', 'intereses'],
  ['codigo', 'revision'], ['docs', 'automatizacion'], ['libros', 'tracking'],
  ['challenges', 'tecnico'], ['conocimiento', 'gestion'], ['adhd', 'productividad'],
];

const IDEA_STATUSES: Array<IdeaNote['status']> = ['raw', 'developing', 'ready', 'discarded'];
const IDEA_CONTENTS = [
  'Usuarios objetivo: profesionales remotos que buscan estructurar mejor su tiempo.',
  'Diferenciador clave: sin suscripción, modelo de pago único por proyecto.',
  'Validar primero con 20 usuarios antes de construir la versión completa.',
  'Integrar con las herramientas existentes vía webhook para reducir fricción.',
  'El modelo de negocio se basa en comisión del 5% por transacción completada.',
  'Prototipo en Figma listo. Siguiente paso: entrevistas con usuarios potenciales.',
  'Inspirado en el método Zettelkasten adaptado para equipos distribuidos.',
  'Tecnología: React Native + Supabase. Estimación: 3 meses para MVP.',
  '',
  'Validación inicial positiva. 8 de 10 personas pagarían por esta solución.',
];

export function seedTestData(): void {
  const store = useNotesStore.getState();
  const base = Date.now();

  for (let i = 0; i < 50; i++) {
    const ts = new Date(base - i * 60_000).toISOString();
    const note: Note = {
      id: `seed-note-${base}-${i}`,
      type: 'note',
      title: NOTE_TITLES[i % NOTE_TITLES.length],
      content: NOTE_CONTENTS[i % NOTE_CONTENTS.length],
      pinned: i % 7 === 0,
      tags: [],
      archived: false,
      createdAt: ts,
      updatedAt: ts,
    };
    store.addNote(note);
  }

  for (let i = 0; i < 50; i++) {
    const ts = new Date(base - i * 60_000 - 3_600_000).toISOString();
    const itemCount = 3 + (i % 6);
    const items = Array.from({ length: itemCount }, (_, j) => ({
      id: `seed-item-${base}-${i}-${j}`,
      text: CHECKLIST_ITEMS_POOL[(i + j) % CHECKLIST_ITEMS_POOL.length],
      checked: j % 3 === 0,
    }));
    const checklist: ChecklistNote = {
      id: `seed-checklist-${base}-${i}`,
      type: 'checklist',
      title: CHECKLIST_TITLES[i % CHECKLIST_TITLES.length],
      items,
      pinned: i % 10 === 0,
      tags: [],
      archived: false,
      createdAt: ts,
      updatedAt: ts,
    };
    store.addNote(checklist);
  }

  for (let i = 0; i < 50; i++) {
    const ts = new Date(base - i * 60_000 - 7_200_000).toISOString();
    const idea: IdeaNote = {
      id: `seed-idea-${base}-${i}`,
      type: 'idea',
      title: IDEA_TITLES[i % IDEA_TITLES.length],
      content: IDEA_CONTENTS[i % IDEA_CONTENTS.length],
      status: IDEA_STATUSES[i % IDEA_STATUSES.length],
      pinned: i % 12 === 0,
      tags: IDEA_TAGS[i % IDEA_TAGS.length],
      archived: false,
      createdAt: ts,
      updatedAt: ts,
    };
    store.addNote(idea);
  }
}
