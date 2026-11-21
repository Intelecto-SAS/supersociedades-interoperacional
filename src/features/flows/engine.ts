import { getAdapter } from "@/integrations/registry";
import { isError } from "@/integrations/types";
import type { FlowDefinition } from "@/features/flows/definitions";

export type StepResult = {
  nodeId: string;
  titulo: string;
  estado: "ok" | "error" | "omitido";
  duracionMs: number;
  entrada: unknown;
  salida: unknown;
  mensaje: string;
};

export type FlowRun = {
  flujoId: string;
  estado: "completado" | "completado_con_avisos" | "error";
  pasos: StepResult[];
  duracionSimulada: number;
  resultado: string;
  fecha: string;
  persistedOnServer: false;
};

export function ejecutarFlujo(flow: FlowDefinition, options?: { forzarError?: boolean }): FlowRun {
  const pasos: StepResult[] = [];
  let failed = false;
  for (const node of flow.nodos) {
    if (options?.forzarError && node.tipo === "regla") {
      pasos.push({
        nodeId: node.id,
        titulo: node.titulo,
        estado: "error",
        duracionMs: 40,
        entrada: { modo: "falla_forzada" },
        salida: null,
        mensaje: "Error simulado en la regla. Puede reintentarse.",
      });
      failed = true;
      break;
    }
    let mensaje = node.detalle;
    let estado: StepResult["estado"] = "ok";
    let salida: unknown = { ok: true, detalle: node.detalle };
    if (node.sourceId) {
      const adapter = getAdapter(node.sourceId);
      if (!adapter) {
        estado = "error";
        mensaje = "Conector no registrado.";
        failed = true;
      } else if (!adapter.supports("search")) {
        salida = adapter.getMetadata();
        mensaje = "El conector no ofrece búsqueda. Se usó solo su metadato.";
      } else {
        const health = adapter.healthCheck();
        const result = adapter.search("DEMO-EMP-0002");
        if (isError(result) || !health.disponible) {
          estado = "error";
          mensaje = isError(result) ? result.message : "Fuente no disponible.";
          salida = { sourceId: node.sourceId, continuacion: "controlada" };
          failed = true;
        } else {
          salida = { sourceId: node.sourceId, registros: result.length, latenciaMs: health.latenciaMs, muestra: result[0]?.title ?? null };
          mensaje = `Lectura simulada de ${node.sourceId}: ${result.length} registros.`;
        }
      }
    }
    pasos.push({
      nodeId: node.id,
      titulo: node.titulo,
      estado,
      duracionMs: 35 + pasos.length * 15,
      entrada: { nodo: node.tipo, sourceId: node.sourceId ?? null },
      salida,
      mensaje,
    });
    if (failed && node.sourceId) {
      const restantes = flow.nodos.slice(pasos.length);
      for (const rest of restantes) {
        pasos.push({
          nodeId: rest.id,
          titulo: rest.titulo,
          estado: "omitido",
          duracionMs: 0,
          entrada: null,
          salida: null,
          mensaje: "Paso no ejecutado porque una fuente previa falló. El flujo se detuvo de forma controlada.",
        });
      }
      break;
    }
  }
  const avisos = pasos.some((p) => p.estado === "error");
  return {
    flujoId: flow.id,
    estado: failed && pasos.every((p) => p.estado !== "ok") ? "error" : avisos ? "completado_con_avisos" : "completado",
    pasos,
    duracionSimulada: pasos.reduce((s, p) => s + p.duracionMs, 0),
    resultado: avisos ? "El flujo registró una falla simulada y conservó el detalle por paso." : "Flujo simulado terminado.",
    fecha: "2025-10-29T15:00:00-05:00",
    persistedOnServer: false,
  };
}
