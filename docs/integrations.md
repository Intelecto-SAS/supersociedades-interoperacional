# Integraciones simuladas

El catálogo tiene 72 conectores. Todos están en modo `MOCK`. El acceso real queda en `POR_VERIFICAR`. La URL de API real es `null` y la autenticación real es `no_verificado`. Las conexiones reales activas son 0.

## Diferencia entre MOCK y REAL

MOCK significa que el adaptador lee el universo ficticio del laboratorio. REAL exigiría una interfaz confirmada, un acuerdo, credenciales fuera del código y una revisión jurídica. Esta versión no implementa ese camino.

## Operaciones

La interfaz `IntegrationAdapter` expone `getMetadata`, `healthCheck`, `search`, `getById`, `sync`, `getSamplePayload` y `getSchema`. Si el conector no declara la operación, responde `OPERACION_NO_SOPORTADA`.

Hay adaptadores especializados para GeDeSS, SIREM, XBRL, RUES, DIAN, SECOP, DANE, DNP, Rama Judicial, Procuraduría, Contraloría, SIC, OFAC, ONU, Microsoft Graph, SharePoint, OCR, X-Road y el asistente. El resto usa el adaptador declarativo de la categoría.

## Requisitos para una integración futura

Confirmar la interfaz, el responsable del dato, la base legal, la calidad mínima, la retención y el mecanismo de autenticación. No se debe partir de este prototipo como si el acceso ya estuviera concedido.

## Advertencia

No hay evidencia suficiente en este repositorio para clasificar una fuente como API pública verificada. Los nombres de sistemas institucionales son referencias conceptuales.
