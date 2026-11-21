# Integraciones simuladas

El catálogo tiene 72 conectores. SECOP I y SECOP II están en modo `LIVE`: leen Datos Abiertos Colombia (`www.datos.gov.co`) por `/api/live/secop`. El acceso real de esas dos fuentes es `C`. El token `DATOS_GOV_APP_TOKEN` es opcional y no va en el repositorio. El resto permanece en `MOCK`, con acceso `POR_VERIFICAR` y URL real nula.

## Diferencia entre MOCK y REAL

MOCK lee el universo generado de la plataforma. LIVE, hoy, es solo la consulta SECOP de solo lectura. Un registro en vivo trae `simulated: false` y `empresaId: null`: no se une a una sociedad generada. Las demás fuentes siguen exigiendo convenio, URL oficial y secreto fuera del código.

## Operaciones

La interfaz `IntegrationAdapter` expone `getMetadata`, `healthCheck`, `search`, `getById`, `sync`, `getSamplePayload` y `getSchema`. Si el conector no declara la operación, responde `OPERACION_NO_SOPORTADA`.

Hay adaptadores especializados para GeDeSS, SIREM, XBRL, RUES, DIAN, SECOP, DANE, DNP, Rama Judicial, Procuraduría, Contraloría, SIC, OFAC, ONU, Microsoft Graph, SharePoint, OCR, X-Road y el asistente. El resto usa el adaptador declarativo de la categoría.

## Requisitos para una integración futura

Confirmar la interfaz, el responsable del dato, la base legal, la calidad mínima, la retención y el mecanismo de autenticación. No se debe partir de este prototipo como si el acceso ya estuviera concedido.

## Advertencia

SECOP queda clasificado como dato abierto verificable en el portal de Datos Abiertos. El resto de nombres institucionales sigue sin una API comprobada en este repositorio.
