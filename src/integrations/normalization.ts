import type { Empresa, ReporteFinanciero } from "@/types/domain";
import type { NormalizedRecord, SourceEvidence } from "@/integrations/types";
import { metaSimulacion } from "@/types/domain";

export function evidence(sourceId: string, sourceRecordId: string, quality: number, confidence = quality): SourceEvidence {
  return {
    sourceId,
    sourceRecordId,
    retrievedAt: `${metaSimulacion.fechaCorte}T12:00:00-05:00`,
    simulated: true,
    confidence,
    dataQuality: quality,
    schemaVersion: metaSimulacion.schemaVersion,
  };
}

export function empresaFromSource(empresa: Empresa, sourceId: string): NormalizedRecord {
  const abbreviated = sourceId === "dian-rut" && empresa.razonSocialCorta;
  return {
    id: `${sourceId}:${empresa.id}`,
    entityType: "empresa",
    empresaId: empresa.id,
    title: abbreviated ? empresa.razonSocialCorta! : empresa.razonSocial,
    attributes: {
      nitDemo: empresa.nitDemo,
      sector: empresa.sector,
      departamento: empresa.departamento,
      municipio: empresa.municipio,
      matricula: empresa.estadoMatriculaSimulado,
      ciiu: empresa.actividadCiiu || null,
    },
    evidence: evidence(sourceId, empresa.id, empresa.calidadRegistro, abbreviated ? 0.62 : empresa.calidadRegistro),
    original: abbreviated
      ? { razon_social_reportada: empresa.razonSocialCorta, nit_demo: empresa.nitDemo, nota: "Nombre abreviado de la fuente simulada." }
      : { razon_social: empresa.razonSocial, nit_demo: empresa.nitDemo, departamento: empresa.departamento },
  };
}

export function reporteNormalizado(reporte: ReporteFinanciero): NormalizedRecord {
  return {
    id: reporte.id,
    entityType: "reporte_financiero",
    empresaId: reporte.empresaId,
    title: `Ejercicio ${reporte.periodo}`,
    attributes: {
      ingresos: reporte.ingresos,
      activos: reporte.activos,
      pasivos: reporte.pasivos,
      patrimonio: reporte.patrimonio,
      utilidad: reporte.utilidad,
      fechaCorte: reporte.fechaCorte,
    },
    evidence: evidence(reporte.fuente, reporte.id, reporte.calidadDato),
    original: { ...reporte },
  };
}

export type ConflictCase = {
  empresaId: string;
  registrosOriginales: NormalizedRecord[];
  coincidencia: string;
  conflicto: string;
  regla: string;
  consolidado: NormalizedRecord;
};

export function casoCalidadPacifico(empresa: Empresa, reportes: ReporteFinanciero[]): ConflictCase {
  const rues = empresaFromSource(empresa, "rues");
  const dian = empresaFromSource(empresa, "dian-rut");
  const fin = reportes.find((r) => r.empresaId === empresa.id && r.periodo === "2023");
  const financiero = fin ? reporteNormalizado(fin) : rues;
  const consolidado: NormalizedRecord = {
    ...rues,
    id: `consolidado:${empresa.id}`,
    title: empresa.razonSocial,
    attributes: { ...rues.attributes, fechaCortePreferida: "2023-12-31" },
    evidence: evidence("gobierno-datos", empresa.id, 0.88, 0.8),
    original: {
      regla: "Preferir razón social del registro empresarial simulado y conservar el alias tributario como evidencia.",
    },
  };
  return {
    empresaId: empresa.id,
    registrosOriginales: [rues, dian, financiero],
    coincidencia: "Mismo identificador DEMO-EMP-0006 y DEMO-NIT-0006 en las tres fuentes.",
    conflicto: "La fuente tributaria usa un nombre abreviado y el ejercicio 2023 trae una fecha de corte distinta al cierre anual.",
    regla: "No sobrescribir la fuente. El registro consolidado muestra la razón social completa y conserva alias y fechas originales como evidencia.",
    consolidado,
  };
}
