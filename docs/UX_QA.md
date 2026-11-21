# Verificación

## Ejecutado

- `tsc --noEmit`
- `vitest run` (12 pruebas)
- `eslint` sobre el shell y las pantallas tocadas
- `next build`
- Playwright `tests/e2e/recorrido.spec.ts`: inicio, RUES, ficha de Andina Alimentos, alerta, flujo financiero, casos de uso e informes

## Recorrido cubierto por la prueba

Inicio con el título Mi espacio de trabajo, catálogo de integraciones, ficha 360, creación de alerta en sesión, ejecución de flujo e incidencia, y el encabezado de informes.

## Pendiente de una pasada visual manual

No se recorrió con zoom 200 % ni en 360 px el panel contextual, el riel fijo y el menú móvil. Esos estados existen en el shell, pero esta corrida no los fotografió.
