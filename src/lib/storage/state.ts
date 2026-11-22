import { z } from "zod";

export const solicitudLocalSchema = z.object({
  id: z.string(),
  empresaId: z.string(),
  canal: z.enum(["correo", "furt", "ventanilla", "salida-472", "xroad"]),
  asunto: z.string(),
  tramite: z.string(),
  estado: z.enum(["borrador", "en_clasificacion", "por_confirmar", "radicada", "en_tramite", "respondida", "cerrada"]),
  fechaLlegada: z.string(),
  fechaRadicacion: z.string().nullable(),
  radicadoGedess: z.string().nullable(),
  prioridad: z.enum(["ordinaria", "tutela"]),
  remitente: z.string(),
  remitenteValidado: z.boolean(),
  clasificacion: z.string(),
  repartoSugerido: z.string(),
  confirmadoPorPersona: z.boolean(),
  guia472: z.string().nullable(),
  acuses: z.array(z.object({ tipo: z.enum(["envio", "entrega", "apertura"]), fecha: z.string(), estado: z.enum(["registrado", "pendiente"]) })),
  fuenteXroad: z.object({ entidad: z.string(), fechaDato: z.string(), campo: z.string(), valor: z.string() }).nullable(),
  documentoIds: z.array(z.string()),
  resumen: z.string(),
});

export const demoStateSchema = z.object({
  version: z.literal(1),
  escenario: z.enum(["normal", "riesgo", "insolvencia", "contratos", "expedientes", "calidad", "falla", "recuperacion"]),
  rol: z.enum(["direccion", "financiero", "juridico", "supervisor", "integraciones", "datos"]),
  empresaActiva: z.string().default("DEMO-EMP-0001"),
  alertas: z.record(z.object({ estado: z.enum(["abierta", "en_revision", "cerrada"]), responsableDemo: z.string().max(80).nullable() })).default({}),
  notas: z.array(z.object({ id: z.string(), expedienteId: z.string(), texto: z.string().max(500), fecha: z.string() })).default([]),
  expedientesExtra: z.array(z.object({
    id: z.string(),
    empresaId: z.string(),
    tipo: z.string(),
    estado: z.string(),
    responsableDemo: z.string(),
    resumen: z.string(),
    fechaApertura: z.string(),
  })).default([]),
  solicitudesExtra: z.array(solicitudLocalSchema).default([]),
  documentosEstado: z.record(z.object({ validado: z.boolean(), fecha: z.string() })).default({}),
  conectores: z.record(z.object({
    estado: z.enum(["operativo", "degradado", "caido", "incompleto"]).optional(),
    latenciaExtraMs: z.number().optional(),
    invalido: z.boolean().optional(),
    incompleto: z.boolean().optional(),
  })).default({}),
  auditoria: z.array(z.object({ id: z.string(), accion: z.string(), detalle: z.string(), fecha: z.string() })).default([]),
});

export type DemoState = z.infer<typeof demoStateSchema>;

export const initialDemoState: DemoState = {
  version: 1,
  escenario: "normal",
  rol: "direccion",
  empresaActiva: "DEMO-EMP-0001",
  alertas: {},
  notas: [],
  expedientesExtra: [],
  solicitudesExtra: [],
  documentosEstado: {},
  conectores: {},
  auditoria: [],
};

export function parseDemoState(input: unknown): DemoState {
  const parsed = demoStateSchema.safeParse(input);
  if (!parsed.success) throw new Error("El archivo no tiene un estado válido.");
  return parsed.data;
}
