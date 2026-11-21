# Diagnóstico y rediseño de CONECTA 360

## Qué se conserva

Rutas públicas, dataset de sociedades, reglas de riesgo, expedientes, documentos, radicación, informes, ocho flujos, catálogo de 72 conectores, consultas SECOP y Croma, gobierno de datos, asistente, casos de uso, auditoría, exportaciones y el estado local `conecta360-demo`.

## Problemas

- El menú listaba más de veinte destinos con el mismo peso en una columna fija de 272 px.
- La cabecera mezclaba búsqueda, contexto de operación y perfil.
- El inicio abría con siete indicadores del mismo tamaño.
- La ficha 360 mostraba diez pestañas planas y cinco acciones equivalentes.
- No había un panel de evidencia ni un historial de sociedades visitadas.
- La búsqueda global solo devolvía sociedades.

## Decisiones

- El inicio sigue en `/dashboard` y se organiza como bandeja: pendientes, recientes y panorama.
- La navegación es un riel flotante compacto; el menú completo se abre a demanda y recuerda la preferencia.
- El panel derecho solo se abre con una acción explícita.
- Los perfiles reordenan la bandeja y el destino inicial. No ocultan el menú.
- Los datos de la plataforma y las consultas externas siguen diferenciados con las insignias ya existentes.
