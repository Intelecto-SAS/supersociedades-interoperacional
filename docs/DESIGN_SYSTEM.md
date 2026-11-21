# Sistema visual

## Color y tipo

- Vinotinto `#962D46` para la acción principal.
- Azul `#2A477A` para navegación y enlaces.
- Nunito Sans.
- Superficies blancas sobre fondo `#F4F6F8`. Borde `#E2E6EE`. Sombra corta solo en el riel, la cabecera y el inspector.

## Espaciado

- Margen del riel: 16 px.
- Riel compacto: 72 px. Menú expandido: 288 px. Inspector: 400 px.
- Transiciones de 180–220 ms. Se anulan con `prefers-reduced-motion`.

## Componentes

- `FloatingNavigation`: iconos con nombre accesible, grupos plegables, Escape y clic fuera.
- `FloatingTopbar`: ubicación, búsqueda y menú de sesión.
- `ContextInspector`: un solo panel, cierre con botón y Escape, foco devuelto al control que lo abrió.
- Tablas y filtros frecuentes permanecen sobre el listado. El inspector no sustituye los filtros.

## Estados

Botones con hover, foco visible, deshabilitado y mensaje de estado con `role="status"`. El riesgo se indica con texto, no solo con color.
