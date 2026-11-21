import type { Dataset } from "@/data/seed/dataset";
import type { Alerta, ReporteFinanciero } from "@/types/domain";
import { metaSimulacion } from "@/types/domain";

export type Regla = {
  id: string;
  nombre: string;
  descripcion: string;
  condicion: string;
  variables: string[];
  severidad: Alerta["severidad"];
};

export const REGLAS: Regla[] = [
  { id: "R-PASIVOS-ACTIVOS", nombre: "Pasivos superiores a activos", descripcion: "El último ejercicio muestra pasivos por encima de los activos.", condicion: "pasivos > activos", variables: ["pasivos", "activos"], severidad: "critica" },
  { id: "R-CAIDA-INGRESOS", nombre: "Caída significativa de ingresos", descripcion: "Los ingresos caen 30% o más frente al ejercicio anterior.", condicion: "(anterior - actual) / anterior >= 0.3", variables: ["ingresos"], severidad: "alta" },
  { id: "R-PERDIDAS", nombre: "Pérdidas recurrentes", descripcion: "Utilidad negativa en dos ejercicios consecutivos.", condicion: "utilidad < 0 en t y t-1", variables: ["utilidad"], severidad: "alta" },
  { id: "R-VARIACION", nombre: "Variación financiera atípica", descripcion: "El patrimonio cambia más de 40% en un año.", condicion: "abs(delta patrimonio) >= 0.4", variables: ["patrimonio"], severidad: "media" },
  { id: "R-INCOMPLETA", nombre: "Información incompleta", descripcion: "Falta CIIU o el reporte está marcado como incompleto.", condicion: "ciiu vacío o reporte.incompleto", variables: ["actividadCiiu", "incompleto"], severidad: "media" },
  { id: "R-DIFERENCIA-FUENTES", nombre: "Diferencias entre fuentes", descripcion: "Hay alias o fechas de corte distintas para la misma empresa.", condicion: "alias o fechaCorte distinta", variables: ["razonSocial", "fechaCorte"], severidad: "media" },
  { id: "R-PROCESOS", nombre: "Procesos jurídicos asociados", descripcion: "Existe al menos un proceso activo.", condicion: "procesos activos >= 1", variables: ["procesos"], severidad: "media" },
  { id: "R-REPORTE-TARDIO", nombre: "Retraso en reporte", descripcion: "El corte del último ejercicio no es 31 de diciembre.", condicion: "fechaCorte no termina en 12-31", variables: ["fechaCorte"], severidad: "baja" },
  { id: "R-CONCENTRACION", nombre: "Concentración de contratos", descripcion: "60% o más del valor contractual está en una sola entidad.", condicion: "max(entidad) / total >= 0.6 y contratos >= 3", variables: ["valorCOP"], severidad: "alta" },
  { id: "R-RELACIONES", nombre: "Relaciones que requieren revisión", descripcion: "La empresa tiene tres o más vínculos.", condicion: "relaciones >= 3", variables: ["relaciones"], severidad: "baja" },
];

function latest(reportes: ReporteFinanciero[]) {
  return [...reportes].sort((a, b) => a.periodo.localeCompare(b.periodo));
}

export function evaluarEmpresa(dataset: Pick<Dataset, "empresas" | "reportes" | "contratos" | "procesos" | "relaciones">, empresaId: string): Alerta[] {
  const empresa = dataset.empresas.find((e) => e.id === empresaId);
  if (!empresa) return [];
  const series = latest(dataset.reportes.filter((r) => r.empresaId === empresaId));
  const ultimo = series.at(-1);
  const previo = series.at(-2);
  const out: Alerta[] = [];
  const base = {
    empresaId,
    estado: "abierta" as const,
    fecha: metaSimulacion.fechaCorte,
    responsableDemo: null,
  };

  if (ultimo && ultimo.pasivos > ultimo.activos) {
    out.push({ ...base, id: `${empresaId}-R-PASIVOS-ACTIVOS`, tipo: "Financiero", severidad: "critica", descripcion: "Pasivos superiores a activos en el último ejercicio.", reglaAplicada: "R-PASIVOS-ACTIVOS", evidencias: [ultimo.id] });
  }
  if (ultimo && previo && previo.ingresos > 0 && (previo.ingresos - ultimo.ingresos) / previo.ingresos >= 0.3) {
    out.push({ ...base, id: `${empresaId}-R-CAIDA-INGRESOS`, tipo: "Financiero", severidad: "alta", descripcion: "Caída de ingresos igual o superior al 30%.", reglaAplicada: "R-CAIDA-INGRESOS", evidencias: [previo.id, ultimo.id] });
  }
  if (ultimo && previo && ultimo.utilidad < 0 && previo.utilidad < 0) {
    out.push({ ...base, id: `${empresaId}-R-PERDIDAS`, tipo: "Financiero", severidad: "alta", descripcion: "Pérdidas en dos ejercicios consecutivos.", reglaAplicada: "R-PERDIDAS", evidencias: [previo.id, ultimo.id] });
  }
  if (!empresa.actividadCiiu || series.some((r) => r.incompleto)) {
    out.push({ ...base, id: `${empresaId}-R-INCOMPLETA`, tipo: "Calidad", severidad: "media", descripcion: "Información incompleta en el registro o en un reporte.", reglaAplicada: "R-INCOMPLETA", evidencias: [empresa.id] });
  }
  if (empresa.razonSocialCorta) {
    out.push({ ...base, id: `${empresaId}-R-DIFERENCIA-FUENTES`, tipo: "Calidad", severidad: "media", descripcion: "Una fuente usa un nombre abreviado.", reglaAplicada: "R-DIFERENCIA-FUENTES", evidencias: ["rues", "dian-rut"] });
  }
  if (dataset.procesos.some((p) => p.empresaId === empresaId && p.estado === "activo")) {
    out.push({ ...base, id: `${empresaId}-R-PROCESOS`, tipo: "Jurídico", severidad: "media", descripcion: "Hay procesos jurídicos activos asociados.", reglaAplicada: "R-PROCESOS", evidencias: dataset.procesos.filter((p) => p.empresaId === empresaId).slice(0, 3).map((p) => p.id) });
  }
  if (ultimo && !ultimo.fechaCorte.endsWith("12-31")) {
    out.push({ ...base, id: `${empresaId}-R-REPORTE-TARDIO`, tipo: "Calidad", severidad: "baja", descripcion: "El último corte no corresponde al cierre anual.", reglaAplicada: "R-REPORTE-TARDIO", evidencias: [ultimo.id] });
  }
  const contratos = dataset.contratos.filter((c) => c.empresaId === empresaId);
  if (contratos.length >= 3) {
    const total = contratos.reduce((s, c) => s + c.valorCOP, 0);
    const by = new Map<string, number>();
    for (const c of contratos) by.set(c.entidadContratanteFicticia, (by.get(c.entidadContratanteFicticia) ?? 0) + c.valorCOP);
    const max = Math.max(...by.values());
    if (total > 0 && max / total >= 0.6) {
      out.push({ ...base, id: `${empresaId}-R-CONCENTRACION`, tipo: "Contratación", severidad: "alta", descripcion: "Concentración contractual en una sola entidad.", reglaAplicada: "R-CONCENTRACION", evidencias: contratos.slice(0, 3).map((c) => c.id) });
    }
  }
  const relaciones = dataset.relaciones.filter((r) => r.origen === empresaId || r.destino === empresaId).length;
  if (relaciones >= 3) {
    out.push({ ...base, id: `${empresaId}-R-RELACIONES`, tipo: "Relaciones", severidad: "baja", descripcion: "Varios vínculos empresariales requieren lectura conjunta.", reglaAplicada: "R-RELACIONES", evidencias: [empresaId] });
  }
  return out;
}

export function evaluarTodas(dataset: Dataset) {
  return dataset.empresas.flatMap((e) => evaluarEmpresa(dataset, e.id));
}
