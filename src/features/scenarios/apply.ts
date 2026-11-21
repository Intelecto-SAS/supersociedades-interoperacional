import type { Dataset } from "@/data/seed/dataset";
import type { Alerta, Empresa } from "@/types/domain";
import type { ConnectorDefinition } from "@/integrations/types";

export const ESCENARIOS = [
  { id: "normal", nombre: "Operación normal" },
  { id: "riesgo", nombre: "Riesgo financiero elevado" },
  { id: "insolvencia", nombre: "Crisis de insolvencia" },
  { id: "contratos", nombre: "Alta actividad contractual" },
  { id: "expedientes", nombre: "Acumulación de expedientes" },
  { id: "calidad", nombre: "Problemas de calidad de datos" },
  { id: "falla", nombre: "Falla de integraciones" },
  { id: "recuperacion", nombre: "Recuperación operativa" },
] as const;

export type EscenarioId = (typeof ESCENARIOS)[number]["id"];

export function applyScenario(base: Dataset, escenario: EscenarioId): Dataset {
  const conectores = base.conectores.map((c) => ({ ...c }));
  const alertas = base.alertas.map((a) => ({ ...a }));
  const empresas = base.empresas.map((e) => ({ ...e, etiquetas: [...e.etiquetas] }));
  const expedientes = base.expedientes.map((e) => ({ ...e }));
  const touch = (id: string, patch: Partial<ConnectorDefinition>) => {
    const c = conectores.find((x) => x.id === id);
    if (c) Object.assign(c, patch);
  };

  if (escenario === "riesgo") {
    for (const a of alertas) {
      if (a.tipo === "Financiero" && a.estado === "cerrada") a.estado = "abierta";
      if (a.tipo === "Financiero" && a.severidad === "media") a.severidad = "alta";
    }
    for (const e of empresas) {
      if (e.nivelRiesgo === "alta") e.nivelRiesgo = "critica";
    }
  }
  if (escenario === "insolvencia") {
    const h = empresas.find((e) => e.id === "DEMO-EMP-0002");
    if (h) h.etiquetas = [...new Set([...h.etiquetas, "prioridad-demo"])];
    for (const a of alertas) {
      if (a.empresaId === "DEMO-EMP-0002") a.estado = "abierta";
    }
    for (const exp of expedientes) {
      if (exp.empresaId === "DEMO-EMP-0002") exp.estado = "en_seguimiento";
    }
    touch("sirem", { estadoSimulado: "degradado" });
  }
  if (escenario === "contratos") {
    touch("secop-ii", { estadoSimulado: "operativo", calidadDatos: 92 });
    for (const a of alertas) if (a.tipo === "Contratación" && a.estado === "cerrada") a.estado = "abierta";
  }
  if (escenario === "expedientes") {
    for (const exp of expedientes) if (exp.estado === "cerrado") exp.estado = "abierto";
  }
  if (escenario === "calidad") {
    for (const e of empresas) if (e.calidadRegistro < 0.6) e.etiquetas.push("revision-calidad");
    touch("rues", { calidadDatos: 48, estadoSimulado: "degradado" });
    touch("dian-rut", { calidadDatos: 44, estadoSimulado: "incompleto" });
    for (const a of alertas) if (a.tipo === "Calidad") a.estado = "abierta";
  }
  if (escenario === "falla") {
    for (const id of ["rues", "dian-rut", "sirem"]) touch(id, { estadoSimulado: "caido" });
    touch("secop-ii", { estadoSimulado: "degradado" });
  }
  if (escenario === "recuperacion") {
    for (const c of conectores) {
      if (c.estadoSimulado !== "operativo") c.estadoSimulado = "operativo";
      c.calidadDatos = Math.max(c.calidadDatos, 80);
    }
    for (const a of alertas) if (a.severidad === "baja") a.estado = "cerrada";
  }

  return { ...base, conectores, alertas, empresas, expedientes };
}

export function calidadMedia(empresas: Empresa[], alertas: Alerta[]) {
  const base = empresas.reduce((s, e) => s + e.calidadRegistro, 0) / empresas.length;
  const abiertas = alertas.filter((a) => a.estado === "abierta" && a.tipo === "Calidad").length;
  return Math.max(0.35, Math.round((base - abiertas / 1000) * 100) / 100);
}
