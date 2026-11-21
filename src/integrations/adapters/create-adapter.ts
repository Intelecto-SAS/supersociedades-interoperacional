import { getDataset } from "@/data/seed/dataset";
import type { Empresa } from "@/types/domain";
import { empresaFromSource, reporteNormalizado } from "@/integrations/normalization";
import {
  isError,
  unsupported,
  type ConnectorCapability,
  type ConnectorDefinition,
  type ConnectorError,
  type ConnectorSample,
  type IntegrationAdapter,
  type NormalizedRecord,
  type SyncResult,
} from "@/integrations/types";

export type RuntimeStatus = {
  estado: ConnectorDefinition["estadoSimulado"];
  latenciaExtraMs: number;
  invalido: boolean;
  incompleto: boolean;
};

const runtime = new Map<string, RuntimeStatus>();

export function setConnectorRuntime(id: string, patch: Partial<RuntimeStatus>) {
  const current = runtime.get(id) ?? { estado: "operativo" as const, latenciaExtraMs: 0, invalido: false, incompleto: false };
  runtime.set(id, { ...current, ...patch });
}

export function clearConnectorRuntime() {
  runtime.clear();
}

export function getRuntime(def: ConnectorDefinition): RuntimeStatus {
  return runtime.get(def.id) ?? { estado: def.estadoSimulado, latenciaExtraMs: 0, invalido: false, incompleto: false };
}

function guard(def: ConnectorDefinition, op: ConnectorCapability): ConnectorError | null {
  if (!def.operacionesSimuladas.includes(op)) return unsupported(op);
  const status = getRuntime(def);
  if (status.estado === "caido" && op !== "getMetadata" && op !== "healthCheck" && op !== "getSchema") {
    return { code: "FUENTE_NO_DISPONIBLE", message: `${def.nombre} está en falla simulada.`, recoverable: true };
  }
  if (status.invalido && (op === "search" || op === "sync" || op === "getById")) {
    return { code: "RESPUESTA_INVALIDA", message: "La respuesta simulada no cumple el esquema.", recoverable: true };
  }
  return null;
}

function empresas(): Empresa[] {
  return getDataset().empresas;
}

function searchEmpresas(def: ConnectorDefinition, query: string): NormalizedRecord[] {
  const q = query.trim().toLowerCase();
  const status = getRuntime(def);
  let list = empresas().filter((e) => {
    if (!q) return true;
    return [e.razonSocial, e.razonSocialCorta, e.id, e.nitDemo, e.sector, e.municipio].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });
  if (status.incompleto) list = list.slice(0, 1);
  return list.slice(0, 25).map((e) => empresaFromSource(e, def.id));
}

const SPECIAL: Record<string, (def: ConnectorDefinition, query: string) => NormalizedRecord[]> = {
  sirem: (def, query) => {
    const ids = new Set(searchEmpresas(def, query).map((r) => r.empresaId));
    return getDataset()
      .reportes.filter((r) => ids.has(r.empresaId) && r.fuente === "sirem")
      .slice(0, 30)
      .map(reporteNormalizado);
  },
  xbrl: (def, query) => {
    const ids = new Set(searchEmpresas(def, query).map((r) => r.empresaId));
    return getDataset()
      .reportes.filter((r) => (query ? ids.has(r.empresaId) : r.fuente === "xbrl"))
      .slice(0, 30)
      .map((r) => ({ ...reporteNormalizado(r), evidence: { ...reporteNormalizado(r).evidence, sourceId: "xbrl" } }));
  },
  "secop-ii": (def, query) => {
    const ids = new Set(searchEmpresas(def, query).map((r) => r.empresaId));
    return getDataset()
      .contratos.filter((c) => !query || ids.has(c.empresaId))
      .slice(0, 30)
      .map((c) => ({
        id: c.id,
        entityType: "contrato",
        empresaId: c.empresaId,
        title: c.objeto,
        attributes: { valorCOP: c.valorCOP, modalidad: c.modalidad, entidad: c.entidadContratanteFicticia, estado: c.estado },
        evidence: {
          sourceId: c.fuente,
          sourceRecordId: c.id,
          retrievedAt: "2025-10-29T12:00:00-05:00",
          simulated: true as const,
          confidence: 0.8,
          dataQuality: 0.84,
          schemaVersion: "1.0.0",
        },
        original: { ...c },
      }));
  },
  "rama-procesos": (def, query) => {
    const ids = new Set(searchEmpresas(def, query).map((r) => r.empresaId));
    return getDataset()
      .procesos.filter((p) => !query || ids.has(p.empresaId))
      .slice(0, 30)
      .map((p) => ({
        id: p.id,
        entityType: "proceso",
        empresaId: p.empresaId,
        title: p.radicadoFicticio,
        attributes: { tipo: p.tipo, etapa: p.etapa, estado: p.estado },
        evidence: {
          sourceId: "rama-procesos",
          sourceRecordId: p.radicadoFicticio,
          retrievedAt: "2025-10-29T12:00:00-05:00",
          simulated: true as const,
          confidence: 0.77,
          dataQuality: 0.8,
          schemaVersion: "1.0.0",
        },
        original: { ...p },
      }));
  },
  dane: () =>
    getDataset().territorio.map((t) => ({
      id: `dane:${t.departamento}`,
      entityType: "territorio",
      empresaId: null,
      title: t.departamento,
      attributes: { empresasObservadas: t.empresas, indice: t.indiceActividadFicticio },
      evidence: {
        sourceId: "dane",
        sourceRecordId: t.departamento,
        retrievedAt: "2025-10-29T12:00:00-05:00",
        simulated: true as const,
        confidence: 0.7,
        dataQuality: 0.74,
        schemaVersion: "1.0.0",
      },
      original: { nota: "Indicador ficticio, no es una cifra del DANE.", ...t },
    })),
  dnp: () =>
    getDataset().territorio.map((t) => ({
      id: `dnp:${t.departamento}`,
      entityType: "territorio",
      empresaId: null,
      title: t.departamento,
      attributes: { riesgoAlto: t.riesgoAlto, sectorPrincipal: t.sectorPrincipal },
      evidence: {
        sourceId: "dnp",
        sourceRecordId: t.departamento,
        retrievedAt: "2025-10-29T12:00:00-05:00",
        simulated: true as const,
        confidence: 0.68,
        dataQuality: 0.7,
        schemaVersion: "1.0.0",
      },
      original: { nota: "Contexto territorial inventado para la demo.", ...t },
    })),
  ocr: () =>
    getDataset()
      .documentos.slice(0, 8)
      .map((d) => ({
        id: d.id,
        entityType: "extraccion",
        empresaId: d.empresaId,
        title: d.nombre,
        attributes: { clasificacionSugerida: d.clasificacion, confianza: d.confianzaSimulada },
        evidence: {
          sourceId: "ocr",
          sourceRecordId: d.id,
          retrievedAt: "2025-10-29T12:00:00-05:00",
          simulated: true as const,
          confidence: d.confianzaSimulada,
          dataQuality: d.confianzaSimulada,
          schemaVersion: "1.0.0",
        },
        original: { texto: d.contenidoFicticio, motor: "simulacion_local" },
      })),
  ofac: () => [
    {
      id: "ofac:sin-coincidencia",
      entityType: "lista",
      empresaId: null,
      title: "Sin coincidencias en el universo ficticio",
      attributes: { coincidencias: 0 },
      evidence: {
        sourceId: "ofac",
        sourceRecordId: "vacio",
        retrievedAt: "2025-10-29T12:00:00-05:00",
        simulated: true as const,
        confidence: 1,
        dataQuality: 1,
        schemaVersion: "1.0.0",
      },
      original: { aviso: "Cruce simulado. No es una consulta a listas OFAC." },
    },
  ],
  "onu-sanciones": () => [
    {
      id: "onu:sin-coincidencia",
      entityType: "lista",
      empresaId: null,
      title: "Sin coincidencias en el universo ficticio",
      attributes: { coincidencias: 0 },
      evidence: {
        sourceId: "onu-sanciones",
        sourceRecordId: "vacio",
        retrievedAt: "2025-10-29T12:00:00-05:00",
        simulated: true as const,
        confidence: 1,
        dataQuality: 1,
        schemaVersion: "1.0.0",
      },
      original: { aviso: "Cruce simulado. No es una consulta a listas de Naciones Unidas." },
    },
  ],
};

export function createAdapter(def: ConnectorDefinition): IntegrationAdapter {
  const run = (op: ConnectorCapability, fn: () => unknown) => {
    const error = guard(def, op);
    if (error) return error;
    return fn();
  };

  return {
    getMetadata: () => def,
    supports: (op) => def.operacionesSimuladas.includes(op),
    healthCheck: () => {
      const status = getRuntime(def);
      return {
        sourceId: def.id,
        modo: "MOCK",
        conexionesRealesActivas: 0,
        estado: status.estado,
        latenciaMs: def.tiempoRespuestaMs + status.latenciaExtraMs,
        disponible: status.estado !== "caido",
        verificadoEn: "2025-10-29T12:00:00-05:00",
      };
    },
    search: (query) =>
      run("search", () => {
        const special = SPECIAL[def.id];
        if (special) return special(def, query);
        if (def.categoria === "Justicia" || def.id === "procuraduria" || def.id === "contraloria") {
          return [
            {
              id: `${def.id}:verificacion-demo`,
              entityType: "verificacion",
              empresaId: null,
              title: "Verificación no realizada",
              attributes: { resultado: "simulado" },
              evidence: {
                sourceId: def.id,
                sourceRecordId: "aviso",
                retrievedAt: "2025-10-29T12:00:00-05:00",
                simulated: true as const,
                confidence: 0.4,
                dataQuality: 0.4,
                schemaVersion: "1.0.0",
              },
              original: { aviso: "No se consultan antecedentes ni listas reales." },
            },
          ];
        }
        return searchEmpresas(def, query);
      }) as NormalizedRecord[] | ConnectorError,
    getById: (id) =>
      run("getById", () => {
        const found = (SPECIAL[def.id]?.(def, "") ?? searchEmpresas(def, "")).find((r) => r.id === id || r.empresaId === id || r.evidence.sourceRecordId === id);
        return found ?? null;
      }) as NormalizedRecord | ConnectorError | null,
    sync: () =>
      run("sync", () => {
        const status = getRuntime(def);
        const result: SyncResult = {
          sourceId: def.id,
          simulated: true,
          persistedOnServer: false,
          records: status.incompleto ? 1 : 12,
          durationMs: def.tiempoRespuestaMs + status.latenciaExtraMs,
          status: status.estado === "degradado" || status.incompleto ? "partial" : "ok",
          message: "Sincronización simulada. El servidor no conserva el resultado.",
        };
        return result;
      }) as SyncResult | ConnectorError,
    getSamplePayload: () =>
      run("getSamplePayload", () => {
        const sample: ConnectorSample = {
          request: { op: "search", q: "DEMO-EMP-0001", modo: "MOCK" },
          response: { simulated: true, sourceId: def.id, ejemplo: def.datosQueAporta },
        };
        return sample;
      }) as ConnectorSample | ConnectorError,
    getSchema: () =>
      run("getSchema", () => ({
        sourceId: def.id,
        campos: def.datosQueAporta,
        accesoReal: def.tipoAccesoReal,
        modo: "MOCK",
      })) as Record<string, unknown> | ConnectorError,
  };
}

export { isError };
