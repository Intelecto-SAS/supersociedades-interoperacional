# Arquitectura

CONECTA 360 separa seis capas:

1. Datos originales simulados en `src/data/seed`.
2. Adaptadores en `src/integrations`.
3. Normalización en `src/integrations/normalization.ts`.
4. Modelo de negocio en `src/types` y servicios de riesgo, flujos y documentos.
5. API de demostración en `src/app/api/mock`.
6. Interfaz en `src/app` y `src/components`.

La semilla `3602025` hace reproducible el universo. Las acciones de una sesión se guardan con Zustand en `localStorage` y se validan con Zod antes de reutilizarlas. Los POST de la API calculan un resultado y declaran `persistedOnServer: false`.

No hay llamadas a URLs aportadas por el usuario.
