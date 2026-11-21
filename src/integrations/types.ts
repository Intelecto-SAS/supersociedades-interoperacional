import { z } from "zod";
import { accesoRealSchema } from "@/types/domain";

export const connectorAccess = accesoRealSchema;
export type ConnectorAccessLevel = z.infer<typeof accesoRealSchema>;

export type ConnectorCapability =
  | "getMetadata"
  | "healthCheck"
  | "search"
  | "getById"
  | "sync"
  | "getSamplePayload"
  | "getSchema";

export type ConnectorDefinition = {
  id: string;
  nombre: string;
  entidadProveedora: string;
  categoria: string;
  descripcion: string;
  operacionesSimuladas: ConnectorCapability[];
  datosQueAporta: string[];
  sistemasConsumidores: string[];
  tipoAccesoReal: ConnectorAccessLevel;
  documentacionOficial: string | null;
  urlApiReal: string | null;
  metodoAutenticacionReal: "no_verificado" | "app_token_opcional";
  modoActual: "MOCK" | "LIVE";
  estadoSimulado: "operativo" | "degradado" | "caido" | "incompleto";
  ultimaSincronizacionFicticia: string;
  tiempoRespuestaMs: number;
  calidadDatos: number;
  dependencias: string[];
  riesgosIntegracion: string[];
  requisitosPendientes: string[];
  adaptador: "especializado" | "declarativo";
  grupo: string;
};

export type ConnectorHealth = {
  sourceId: string;
  modo: "MOCK" | "LIVE";
  conexionesRealesActivas: number;
  estado: ConnectorDefinition["estadoSimulado"];
  latenciaMs: number;
  disponible: boolean;
  verificadoEn: string;
};

export type ConnectorError = {
  code: string;
  message: string;
  recoverable: boolean;
};

export type SourceEvidence = {
  sourceId: string;
  sourceRecordId: string;
  retrievedAt: string;
  simulated: boolean;
  confidence: number;
  dataQuality: number;
  schemaVersion: string;
};

export type NormalizedRecord = {
  id: string;
  entityType: string;
  empresaId: string | null;
  title: string;
  attributes: Record<string, string | number | boolean | null>;
  evidence: SourceEvidence;
  original: Record<string, unknown>;
};

export type ConnectorSample = {
  request: Record<string, unknown>;
  response: Record<string, unknown>;
};

export type SyncResult = {
  sourceId: string;
  simulated: boolean;
  persistedOnServer: false;
  records: number;
  durationMs: number;
  status: "ok" | "partial" | "error";
  message: string;
};

export type ConnectorExecution = {
  id: string;
  sourceId: string;
  operacion: string;
  estado: "ok" | "error" | "parcial";
  fecha: string;
  duracionMs: number;
  detalle: string;
};

export interface IntegrationAdapter {
  getMetadata(): ConnectorDefinition;
  supports(op: ConnectorCapability): boolean;
  healthCheck(): ConnectorHealth;
  search(query: string): NormalizedRecord[] | ConnectorError;
  getById(id: string): NormalizedRecord | ConnectorError | null;
  sync(): SyncResult | ConnectorError;
  getSamplePayload(): ConnectorSample | ConnectorError;
  getSchema(): Record<string, unknown> | ConnectorError;
}

export function unsupported(op: string): ConnectorError {
  return {
    code: "OPERACION_NO_SOPORTADA",
    message: `La operación ${op} no está declarada para este conector simulado.`,
    recoverable: false,
  };
}

export function isError(value: unknown): value is ConnectorError {
  return Boolean(value && typeof value === "object" && "code" in value && "recoverable" in value);
}
