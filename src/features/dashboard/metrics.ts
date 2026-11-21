import type { Dataset } from "@/data/seed/dataset";
import { calidadMedia } from "@/features/scenarios/apply";

export function dashboardMetrics(data: Dataset) {
  const sectores = new Map<string, number>();
  const riesgos = new Map<string, number>();
  for (const e of data.empresas) {
    sectores.set(e.sector, (sectores.get(e.sector) ?? 0) + 1);
    riesgos.set(e.nivelRiesgo, (riesgos.get(e.nivelRiesgo) ?? 0) + 1);
  }
  const alertasPorMes = new Map<string, number>();
  for (const a of data.alertas) {
    const mes = a.fecha.slice(0, 7);
    alertasPorMes.set(mes, (alertasPorMes.get(mes) ?? 0) + 1);
  }
  const porFuente = new Map<string, { n: number; q: number }>();
  for (const r of data.reportes) {
    const row = porFuente.get(r.fuente) ?? { n: 0, q: 0 };
    row.n += 1;
    row.q += r.calidadDato;
    porFuente.set(r.fuente, row);
  }
  return {
    empresas: data.empresas.length,
    fuentes: data.conectores.length,
    conectoresActivos: data.conectores.filter((c) => c.estadoSimulado === "operativo").length,
    alertasAbiertas: data.alertas.filter((a) => a.estado === "abierta").length,
    expedientes: data.expedientes.filter((e) => e.estado !== "cerrado").length,
    flujos: 8,
    calidad: calidadMedia(data.empresas, data.alertas),
    sectores: [...sectores.entries()].map(([sector, total]) => ({ sector, total })).sort((a, b) => b.total - a.total),
    riesgos: [...riesgos.entries()].map(([nivel, total]) => ({ nivel, total })),
    alertasSerie: [...alertasPorMes.entries()].map(([mes, total]) => ({ mes, total })).sort((a, b) => a.mes.localeCompare(b.mes)),
    integraciones: data.conectores.reduce<Record<string, number>>((acc, c) => {
      acc[c.estadoSimulado] = (acc[c.estadoSimulado] ?? 0) + 1;
      return acc;
    }, {}),
    revision: data.empresas.filter((e) => e.nivelRiesgo === "critica" || e.nivelRiesgo === "alta").slice(0, 6),
    calidadFuente: [...porFuente.entries()].map(([fuente, row]) => ({ fuente, calidad: Math.round((row.q / row.n) * 100) })),
  };
}
