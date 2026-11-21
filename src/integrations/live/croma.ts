export const CROMA_OPERATIONS = [
  "rues-name",
  "rues-nit",
  "rama-entity",
  "rama-radicado",
  "ss-companies",
  "ss-financials",
  "ss-insolvency",
] as const;

export type CromaOperation = (typeof CROMA_OPERATIONS)[number];

const HOST = "api.croma.run";

const PATHS: Record<CromaOperation, string> = {
  "rues-name": "/co/rues/entities-by-name/v1",
  "rues-nit": "/co/rues/entity-by-nit/v1",
  "rama-entity": "/co/rama-judicial/cases-by-entity/v1",
  "rama-radicado": "/co/rama-judicial/cases-by-radicado/v1",
  "ss-companies": "/co/supersociedades/companies-search/v1",
  "ss-financials": "/co/supersociedades/financial-statements/v1",
  "ss-insolvency": "/co/supersociedades/insolvency-processes-search/v1",
};

export function buildCromaRequest(operation: CromaOperation, q: string, page: number) {
  const path = PATHS[operation];
  const url = new URL(`https://${HOST}${path}`);
  if (url.hostname !== HOST || url.protocol !== "https:") {
    throw new Error("Host no permitido.");
  }
  const body = requestBody(operation, q, page);
  return { url, body, sourceId: sourceFor(operation) };
}

function requestBody(operation: CromaOperation, q: string, page: number): Record<string, unknown> {
  if (operation === "rues-name") return { name: q, page };
  if (operation === "rues-nit" || operation === "ss-financials") return { document_number: q };
  if (operation === "rama-entity") return { name: q, entity_type: "juridical", page };
  if (operation === "rama-radicado") return { registration_number: q };
  if (operation === "ss-companies") return { query: q, page, per_page: 20 };
  return { query: q, document_number: /^\d{4,15}$/.test(q) ? q : undefined, page, per_page: 20 };
}

function sourceFor(operation: CromaOperation) {
  if (operation.startsWith("rues")) return "rues";
  if (operation.startsWith("rama")) return "rama-procesos";
  return "sirem";
}

function trimValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return null;
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => trimValue(item, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value).slice(0, 24)) {
      if (/representante_legal|cedula|cédula/i.test(key)) continue;
      out[key] = trimValue(item, depth + 1);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 500) return `${value.slice(0, 500)}…`;
  return value;
}

export function normalizeCroma(operation: CromaOperation, payload: unknown, retrievedAt: string) {
  const original = trimValue(payload);
  const root = (original && typeof original === "object" ? original : {}) as Record<string, unknown>;
  const bag = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  const list = [bag.results, bag.entities, bag.cases, bag.statements].find(Array.isArray) as unknown[] | undefined;
  const first = (list?.[0] && typeof list[0] === "object" ? list[0] : bag.company ?? bag.primary_case ?? bag) as Record<string, unknown>;
  const title = String(first?.name ?? first?.company_name ?? first?.registration_number ?? bag.name ?? "Registro");
  return {
    id: `croma:${operation}:${String(first?.document_number ?? first?.registration_number ?? title).slice(0, 40)}`,
    entityType: operation,
    empresaId: null,
    title,
    count: Array.isArray(list) ? list.length : undefined,
    evidence: {
      sourceId: sourceFor(operation),
      sourceRecordId: String(first?.document_number ?? first?.registration_number ?? operation),
      retrievedAt,
      simulated: false,
      confidence: 0.9,
      dataQuality: 0.9,
      schemaVersion: "croma-1",
    },
    original,
  };
}

export async function queryCroma(operation: CromaOperation, q: string, page: number) {
  const key = process.env.CROMA_API_KEY;
  if (!key) return { ok: false as const, status: 503, message: "El canal no está configurado." };
  const { url, body } = buildCromaRequest(operation, q, page);
  const started = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  const text = await response.text();
  if (!response.ok) {
    return { ok: false as const, status: response.status, message: "Croma no completó la consulta." };
  }
  let payload: unknown = {};
  try {
    payload = JSON.parse(text) as unknown;
  } catch {
    return { ok: false as const, status: 502, message: "La respuesta no tiene el formato esperado." };
  }
  return {
    ok: true as const,
    record: normalizeCroma(operation, payload, new Date().toISOString()),
    durationMs: Date.now() - started,
    source: url.origin + url.pathname,
  };
}
