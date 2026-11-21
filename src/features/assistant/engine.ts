import { getDataset } from "@/data/seed/dataset";
import { applyScenario, type EscenarioId } from "@/features/scenarios/apply";
import { formatCOP, formatNumber } from "@/lib/formatting/format";

export type AssistantAnswer = {
  texto: string;
  datos: string[];
  interpretacion: string;
  evidencias: { etiqueta: string; href: string }[];
  suficiente: boolean;
};

export function consultarAsistente(pregunta: string, escenario: EscenarioId = "normal"): AssistantAnswer {
  const data = applyScenario(getDataset(), escenario);
  const q = pregunta.toLowerCase();
  const aviso = "";

  const noInfo = (texto: string): AssistantAnswer => ({
    texto: `${texto} ${aviso}`,
    datos: [],
    interpretacion: "No hay información suficiente para afirmar algo más.",
    evidencias: [],
    suficiente: false,
  });

  if (q.includes("andina")) {
    const e = data.empresas.find((x) => x.id === "DEMO-EMP-0001")!;
    const fins = data.reportes.filter((r) => r.empresaId === e.id);
    return {
      texto: `${e.razonSocial} (${e.id}) es el caso de referencia. Sector ${e.sector}, ${e.municipio}. Riesgo ${e.nivelRiesgo}. ${aviso}`,
      datos: fins.map((f) => `${f.periodo}: ingresos ${formatCOP(f.ingresos)}, fuente ${f.fuente}.`),
      interpretacion: "La serie se mantiene estable frente al caso de dificultad financiera.",
      evidencias: [{ etiqueta: "Abrir ficha", href: `/empresas/${e.id}` }],
      suficiente: true,
    };
  }

  if (q.includes("riesgo") || q.includes("financier")) {
    const top = data.empresas.filter((e) => e.nivelRiesgo === "critica" || e.nivelRiesgo === "alta").slice(0, 5);
    return {
      texto: `Sociedades con riesgo alto o crítico en el contexto actual: ${top.map((e) => e.razonSocial).join(", ")}.`,
      datos: top.map((e) => `${e.id} · ${e.nivelRiesgo} · ${e.sector}`),
      interpretacion: "El nivel sale del generador y del escenario. No es una calificación oficial.",
      evidencias: top.map((e) => ({ etiqueta: e.razonSocial, href: `/empresas/${e.id}` })),
      suficiente: top.length > 0,
    };
  }

  if (q.includes("fuente") || q.includes("perfil")) {
    return {
      texto: `El perfil usa RUES, DIAN — RUT, SIREM, XBRL, SECOP II y Rama Judicial.`,
      datos: data.conectores.filter((c) => ["rues", "dian-rut", "sirem", "xbrl", "secop-ii", "rama-procesos"].includes(c.id)).map((c) => `${c.nombre}: modo ${c.modoActual}, acceso real ${c.tipoAccesoReal}.`),
      interpretacion: "Cada fuente conserva su identificador y la fecha de lectura.",
      evidencias: [{ etiqueta: "Catálogo", href: "/integraciones" }],
      suficiente: true,
    };
  }

  if (q.includes("alerta")) {
    const abiertas = data.alertas.filter((a) => a.estado === "abierta");
    return {
      texto: `Hay ${formatNumber(abiertas.length)} alertas abiertas en el escenario. ${aviso}`,
      datos: abiertas.slice(0, 6).map((a) => `${a.id} · ${a.reglaAplicada} · ${a.empresaId}`),
      interpretacion: "Cada alerta cita la regla y la evidencia. No es una decisión de vigilancia.",
      evidencias: [{ etiqueta: "Ver alertas", href: "/vigilancia/alertas" }],
      suficiente: true,
    };
  }

  if (q.includes("expediente") || q.includes("documento")) {
    const exp = data.expedientes[0]!;
    const docs = data.documentos.filter((d) => d.expedienteId === exp.id).slice(0, 5);
    return {
      texto: `El expediente ${exp.id} de ${exp.empresaId} tiene documentos de ejemplo asociados. ${aviso}`,
      datos: docs.map((d) => `${d.id} · ${d.nombre} · ${d.clasificacion}`),
      interpretacion: "La lista sale del cruce por expedienteId.",
      evidencias: [{ etiqueta: exp.id, href: `/expedientes/${exp.id}` }],
      suficiente: docs.length > 0,
    };
  }

  if (q.includes("fall") || q.includes("integracion")) {
    const down = data.conectores.filter((c) => c.estadoSimulado === "caido" || c.estadoSimulado === "degradado");
    if (!down.length) return noInfo("En este escenario ningún conector está caído o degradado.");
    return {
      texto: `Fuentes con incidencia: ${down.map((c) => c.nombre).join(", ")}.`,
      datos: down.slice(0, 8).map((c) => `${c.id}: ${c.estadoSimulado}`),
      interpretacion: "El estado lo cambia el escenario o el centro de observabilidad. No mide disponibilidad real.",
      evidencias: [{ etiqueta: "Observabilidad", href: "/observabilidad" }],
      suficiente: true,
    };
  }

  if (q.includes("sector")) {
    const counts = new Map<string, number>();
    for (const e of data.empresas) counts.set(e.sector, (counts.get(e.sector) ?? 0) + 1);
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    return {
      texto: `El sector con más sociedades es ${rows[0]?.[0]} (${rows[0]?.[1]}).`,
      datos: rows.map(([s, n]) => `${s}: ${n}`),
      interpretacion: "Conteo directo del catálogo de 200 empresas.",
      evidencias: [{ etiqueta: "Empresas", href: "/empresas" }],
      suficiente: true,
    };
  }

  if (q.includes("resumen") || q.includes("gerencial") || q.includes("horizonte")) {
    const e = data.empresas.find((x) => x.id === "DEMO-EMP-0002")!;
    return {
      texto: `Resumen de ${e.razonSocial}: riesgo ${e.nivelRiesgo}, supervisión ${e.estadoSupervisionSimulado}. Revise ingresos a la baja y pasivos de 2024. ${aviso}`,
      datos: data.reportes.filter((r) => r.empresaId === e.id).map((r) => `${r.periodo} utilidad ${formatCOP(r.utilidad)}`),
      interpretacion: "Recomendación de revisión humana. No es un concepto de insolvencia.",
      evidencias: [{ etiqueta: "Caso", href: "/insolvencia" }, { etiqueta: "Ficha", href: `/empresas/${e.id}` }],
      suficiente: true,
    };
  }

  return noInfo("No reconozco una consulta cubierta por el motor local. Pruebe con riesgo, Andina, alertas, sectores o fuentes.");
}
