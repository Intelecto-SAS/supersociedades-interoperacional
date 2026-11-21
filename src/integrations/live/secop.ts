import type { NormalizedRecord } from "@/integrations/types";

const HOST = "www.datos.gov.co";
const DATASETS = {
  contratos: "jbjy-vk9h",
  procesos: "p6dx-8zbt",
} as const;

export type SecopDataset = keyof typeof DATASETS;

const PAGE_SIZE = 20;
const PERSONAL = /representante|c[eé]dula|g[eé]nero|documento_representante/i;

export function buildSecopUrl(dataset: SecopDataset, q: string, page: number) {
  const url = new URL(`https://${HOST}/resource/${DATASETS[dataset]}.json`);
  if (url.hostname !== HOST || url.protocol !== "https:") {
    throw new Error("Host no permitido.");
  }
  url.searchParams.set("$q", q);
  url.searchParams.set("$limit", String(PAGE_SIZE));
  url.searchParams.set("$offset", String((page - 1) * PAGE_SIZE));
  return url;
}

function pickFields(row: Record<string, unknown>) {
  const attributes: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(row)) {
    if (PERSONAL.test(key)) continue;
    if (Object.keys(attributes).length >= 14) break;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      attributes[key] = value;
    }
  }
  return attributes;
}

export function normalizeSecopRow(dataset: SecopDataset, row: Record<string, unknown>, retrievedAt: string): NormalizedRecord {
  const attributes = pickFields(row);
  const sourceRecordId = String(row.id_contrato ?? row.id_del_proceso ?? row.referencia_del_proceso ?? row.id ?? attributes.id_contrato ?? "sin-id");
  const title = String(row.proveedor_adjudicado ?? row.nombre_del_proveedor ?? row.nombre_entidad ?? row.entidad ?? sourceRecordId);
  return {
    id: `secop:${dataset}:${sourceRecordId}`,
    entityType: dataset === "contratos" ? "contrato_secop" : "proceso_secop",
    empresaId: null,
    title,
    attributes,
    evidence: {
      sourceId: dataset === "contratos" ? "secop-ii" : "secop-i",
      sourceRecordId,
      retrievedAt,
      simulated: false,
      confidence: 0.9,
      dataQuality: 0.85,
      schemaVersion: "soda-1",
    },
    original: attributes,
  };
}

export async function querySecop(dataset: SecopDataset, q: string, page: number) {
  const url = buildSecopUrl(dataset, q, page);
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = process.env.DATOS_GOV_APP_TOKEN;
  if (token) headers["X-App-Token"] = token;
  const started = Date.now();
  const response = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(12_000) });
  if (!response.ok) {
    return { ok: false as const, status: response.status, message: "Datos Abiertos Colombia no respondió la consulta." };
  }
  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    return { ok: false as const, status: 502, message: "La respuesta no tiene el formato esperado." };
  }
  const retrievedAt = new Date().toISOString();
  const records = body.slice(0, PAGE_SIZE).map((row) => normalizeSecopRow(dataset, (row ?? {}) as Record<string, unknown>, retrievedAt));
  return {
    ok: true as const,
    records,
    durationMs: Date.now() - started,
    source: url.origin + url.pathname,
    tokenConfigured: Boolean(token),
  };
}
