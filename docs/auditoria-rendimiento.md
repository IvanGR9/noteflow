# Auditoría de Rendimiento — NoteFlow

## Objetivo

Verificar que FlashList mantiene un rendimiento fluido con 50+ items en cada lista, sin caídas de FPS ni pantallas en blanco al hacer scroll rápido.

## Metodología

Se implementó una función `seedTestData()` en `lib/seedData.ts` que genera y añade al store:

- **50 notas** con títulos y contenidos variados
- **50 tareas** con entre 3 y 8 items cada una, algunos marcados como completados
- **50 ideas** con estados, tags y colores variados

La función es accesible desde la pantalla de Ajustes mediante el botón "Generar datos de prueba", visible únicamente en modo desarrollo (`__DEV__ === true`).

## Resultados

| Lista | Items generados | Resultado |
|-------|----------------|-----------|
| Notas | 50 | ✅ Scroll fluido, sin pantallas en blanco |
| Tareas | 50 | ✅ Scroll fluido, sin pantallas en blanco |
| Ideas | 50 | ✅ Scroll fluido, sin pantallas en blanco |

## Análisis técnico

FlashList de Shopify resuelve el problema de rendimiento de FlatList mediante reciclaje agresivo de componentes. En lugar de montar y desmontar componentes al hacer scroll, reutiliza las instancias existentes actualizando solo sus datos.

Las propiedades clave que garantizan el rendimiento en NoteFlow:

- `estimatedItemSize={200}` — permite a FlashList precalcular el layout sin medir cada item individualmente
- `overrideItemLayout` — fuerza una altura uniforme en el grid de 2 columnas, eliminando el recálculo dinámico
- `numColumns={2}` — el grid reduce el número de items visibles en pantalla a la mitad

## Conclusión

La elección de FlashList frente a FlatList queda validada. Con 50+ items en cada lista el rendimiento es fluido en dispositivo real Android, cumpliendo el requisito de auditoría de la fase 6.