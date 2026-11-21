import { getDataset } from "@/data/seed/dataset";
import { applyScenario, type EscenarioId } from "@/features/scenarios/apply";
import { getAdapter } from "@/integrations/registry";
import { isError } from "@/integrations/types";
import { consultarAsistente } from "@/features/assistant/engine";
import { clasificarTexto } from "@/features/documents/classify";
import { evaluarEmpresa } from "@/features/risk/engine";
import { ejecutarFlujo } from "@/features/flows/engine";
import { getFlow } from "@/features/flows/definitions";
import { envelope, pageQuery, paginate } from "@/lib/validation/query";
import { z } from "zod";

export function readScenario(url: URL): EscenarioId {
  const parsed = pageQuery.safeParse(Object.fromEntries(url.searchParams.entries()));
  return parsed.success ? parsed.data.escenario : "normal";
}

export function listResponse(url: URL, items: unknown[]) {
  const parsed = pageQuery.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return Response.json({ error: "Parámetros no válidos", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  const q = parsed.data.q?.toLowerCase();
  const filtered = q ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(q)) : items;
  return Response.json(envelope(paginate(filtered, parsed.data.page, parsed.data.pageSize)));
}

export function viewFrom(url: URL) {
  return applyScenario(getDataset(), readScenario(url));
}

export const preguntaSchema = z.object({ pregunta: z.string().min(3).max(400), escenario: z.string().max(40).optional() });
export const clasificarSchema = z.object({ texto: z.string().min(1).max(4000) });
export const flujoSchema = z.object({ flujoId: z.string().max(80), forzarError: z.boolean().optional() });
export const riesgoSchema = z.object({ empresaId: z.string().regex(/^DEMO-EMP-\d{4}$/) });

export function testConnector(id: string) {
  const adapter = getAdapter(id);
  if (!adapter) return Response.json({ error: "Conector no encontrado" }, { status: 404 });
  const health = adapter.healthCheck();
  const sync = adapter.supports("sync") ? adapter.sync() : null;
  return Response.json(envelope({ health, sync: isError(sync) ? sync : sync, persistedOnServer: false }));
}

export function ejecutar(body: unknown) {
  const parsed = flujoSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Solicitud no válida" }, { status: 400 });
  const flow = getFlow(parsed.data.flujoId);
  if (!flow) return Response.json({ error: "Flujo no encontrado" }, { status: 404 });
  return Response.json(envelope(ejecutarFlujo(flow, { forzarError: parsed.data.forzarError })));
}

export function evaluar(body: unknown, url: URL) {
  const parsed = riesgoSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Identificador no válido" }, { status: 400 });
  const data = viewFrom(url);
  return Response.json(envelope({ aviso: "Evaluación simulada; no constituye decisión administrativa ni conclusión jurídica.", alertas: evaluarEmpresa(data, parsed.data.empresaId) }));
}

export function clasificar(body: unknown) {
  const parsed = clasificarSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Texto no válido" }, { status: 400 });
  return Response.json(envelope(clasificarTexto(parsed.data.texto)));
}

export function asistente(body: unknown) {
  const parsed = preguntaSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Pregunta no válida" }, { status: 400 });
  const escenario = (parsed.data.escenario as EscenarioId) || "normal";
  return Response.json(envelope(consultarAsistente(parsed.data.pregunta, escenario)));
}
