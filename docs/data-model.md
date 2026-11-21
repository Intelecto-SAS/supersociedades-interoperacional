# Modelo de datos

Identificadores estables con prefijo `DEMO-`: empresas `DEMO-EMP-0001`, NIT `DEMO-NIT-0001`, contratos `DEMO-CON-0001`, procesos `DEMO-PRC-0001`, expedientes `DEMO-EXP-0001`, documentos `DEMO-DOC-0001`, alertas `DEMO-ALR-0001`.

La empresa conserva el mismo `id` en reportes, contratos, procesos, expedientes, documentos, alertas y relaciones. Hay casos intencionales de nombre abreviado, fecha de corte distinta, reportes incompletos y registros sin CIIU.

Moneda COP, idioma es-CO, corte fijo 2025-10-29, zona America/Bogota. Cada evidencia lleva `sourceId`, `sourceRecordId`, `retrievedAt`, `simulated: true`, `confidence`, `dataQuality` y `schemaVersion`.
