
## Objetivo

Reorganizar el encabezado en tres secciones: **Dirección de Alianzas y Relaciones Corporativas**, **Dirección de Investigación, Innovación y Emprendimiento**, y **Usuarios**. Cada dirección gestiona su propia lista independiente de aliados.

## Cambios de datos

- Agregar columna `direction` a `allies` con valores `alianzas` | `investigacion`, default `alianzas`. Backfill: todos los registros existentes quedan en `alianzas`.
- `ally_activities` y `ally_discounts` siguen ligados por `ally_id`, así que quedan naturalmente aislados por dirección.
- Descuentos solo aplica a la dirección de Alianzas (no se muestra en I+D+i).

## Navegación

El header pasa a un menú con dos grupos + Usuarios:

```text
[Alianzas ▾]   [Investigación ▾]   [Usuarios]
   ├ Aliados      └ Aliados
   └ Descuentos
```

Rutas nuevas (usando layouts anidados):

- `/alianzas/aliados` (mueve la actual `/aliados`)
- `/alianzas/aliados/$id`
- `/alianzas/descuentos`
- `/investigacion/aliados`
- `/investigacion/aliados/$id`
- `/` redirige a `/alianzas/aliados`

Las rutas viejas (`/aliados`, `/aliados/$id`, `/descuentos`) redirigen a las nuevas para no romper links.

## UI compartida

- La ficha del aliado (`$id`) se reusa tal cual entre ambas direcciones: mismos campos, mismas actividades (con las áreas actuales sin cambios), mismo semáforo.
- En I+D+i **no se muestra** la tarjeta de Descuentos ni el prompt de descuentos al promover a Activo.
- Los diálogos de crear/editar aliado incluyen la `direction` según el contexto de la ruta (transparente para el usuario).

## Detalles técnicos

- Nuevo enum `ally_direction` en Postgres; columna en `allies` con default y check.
- Hooks: `useAllies(direction)` acepta filtro; se pasa desde cada ruta. `useSaveAlly` incluye `direction` al insertar.
- Layout route `/_authenticated/alianzas/route.tsx` y `/_authenticated/investigacion/route.tsx` establecen el contexto de dirección para sus hijos vía `Route.useRouteContext()`.
- Se conservan `AllyCard`, `AllyDialog`, `DiscountDialog`, `discounts-api`, `allies-api` con ajustes mínimos.
- `descuentos.tsx` filtra allies por `direction = 'alianzas'`.

## Archivos afectados

- Migración SQL (nueva).
- `src/lib/allies-api.ts`: aceptar `direction`.
- `src/routes/_authenticated/route.tsx`: nuevo header con dos grupos.
- Nuevos archivos de ruta en `alianzas/` e `investigacion/`.
- Archivos de ruta viejos (`aliados/*`, `descuentos.tsx`) → redirects.
- `src/routes/_authenticated/aliados/$id.tsx`: extraer a componente compartido; ocultar Descuentos cuando `direction = 'investigacion'`.
- `src/integrations/supabase/types.ts` se regenera tras la migración.
