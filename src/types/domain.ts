import { z } from "zod";

export const severidadSchema = z.enum(["baja", "media", "alta", "critica"]);
export const accesoRealSchema = z.enum(["A", "B", "C", "D", "E", "POR_VERIFICAR"]);

export const empresaSchema = z.object({
  id: z.string(),
  identificadorDemo: z.string(),
  nitDemo: z.string(),
  razonSocial: z.string(),
  razonSocialCorta: z.string().optional(),
  tipoSocietario: z.string(),
  actividadCiiu: z.string(),
  sector: z.string(),
  departamento: z.string(),
  municipio: z.string(),
  estadoMatriculaSimulado: z.string(),
  estadoSupervisionSimulado: z.string(),
  fechaConstitucionFicticia: z.string(),
  tamanoEmpresarial: z.enum(["micro", "pequena", "mediana", "grande"]),
  nivelRiesgo: severidadSchema,
  etiquetas: z.array(z.string()),
  calidadRegistro: z.number(),
});

export type Empresa = z.infer<typeof empresaSchema>;

export const reporteSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  periodo: z.string(),
  ingresos: z.number(),
  activos: z.number(),
  pasivos: z.number(),
  patrimonio: z.number(),
  utilidad: z.number(),
  fuente: z.string(),
  fechaCorte: z.string(),
  calidadDato: z.number(),
  incompleto: z.boolean().optional(),
});
export type ReporteFinanciero = z.infer<typeof reporteSchema>;

export const contratoSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  entidadContratanteFicticia: z.string(),
  objeto: z.string(),
  valorCOP: z.number(),
  fecha: z.string(),
  modalidad: z.string(),
  estado: z.string(),
  fuente: z.string(),
  sector: z.string(),
});
export type Contrato = z.infer<typeof contratoSchema>;

export const procesoSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  radicadoFicticio: z.string(),
  tipo: z.string(),
  etapa: z.string(),
  fechaInicio: z.string(),
  estado: z.string(),
  fuente: z.string(),
});
export type ProcesoJuridico = z.infer<typeof procesoSchema>;

export const documentoSchema = z.object({
  id: z.string(),
  expedienteId: z.string().nullable(),
  empresaId: z.string(),
  nombre: z.string(),
  tipo: z.string(),
  fecha: z.string(),
  clasificacion: z.string(),
  contenidoFicticio: z.string(),
  confianzaSimulada: z.number(),
});
export type Documento = z.infer<typeof documentoSchema>;

export const actuacionSchema = z.object({
  id: z.string(),
  expedienteId: z.string().nullable(),
  empresaId: z.string(),
  descripcion: z.string(),
  fecha: z.string(),
  tipo: z.string(),
});
export type Actuacion = z.infer<typeof actuacionSchema>;

export const alertaSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  tipo: z.string(),
  severidad: severidadSchema,
  descripcion: z.string(),
  reglaAplicada: z.string(),
  evidencias: z.array(z.string()),
  estado: z.enum(["abierta", "en_revision", "cerrada"]),
  fecha: z.string(),
  responsableDemo: z.string().nullable(),
});
export type Alerta = z.infer<typeof alertaSchema>;

export const expedienteSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  tipo: z.string(),
  estado: z.string(),
  responsableDemo: z.string(),
  resumen: z.string(),
  fechaApertura: z.string(),
});
export type Expediente = z.infer<typeof expedienteSchema>;

export const relacionSchema = z.object({
  id: z.string(),
  origen: z.string(),
  destino: z.string(),
  tipoRelacion: z.string(),
  fuente: z.string(),
  esSimulada: z.literal(true),
});
export type RelacionEmpresarial = z.infer<typeof relacionSchema>;

export const eventoSchema = z.object({
  id: z.string(),
  accion: z.string(),
  usuarioDemo: z.string(),
  recurso: z.string(),
  fecha: z.string(),
  detalle: z.string(),
});
export type EventoAuditoria = z.infer<typeof eventoSchema>;

export type TerritorioIndicador = {
  departamento: string;
  empresas: number;
  riesgoAlto: number;
  indiceActividadFicticio: number;
  sectorPrincipal: string;
};

export const metaSimulacion = {
  simulated: true as const,
  schemaVersion: "1.0.0",
  fechaCorte: "2025-10-29",
  zonaHoraria: "America/Bogota",
  aviso:
    "Evaluación simulada; no constituye decisión administrativa ni conclusión jurídica.",
};
