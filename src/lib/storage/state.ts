import { z } from "zod";

export const demoStateSchema = z.object({
  version: z.literal(1),
  escenario: z.enum(["normal", "riesgo", "insolvencia", "contratos", "expedientes", "calidad", "falla", "recuperacion"]),
  rol: z.enum(["direccion", "financiero", "juridico", "supervisor", "integraciones", "datos"]),
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
  alertas: {},
  notas: [],
  expedientesExtra: [],
  conectores: {},
  auditoria: [],
};

export function parseDemoState(input: unknown): DemoState {
  const parsed = demoStateSchema.safeParse(input);
  if (!parsed.success) throw new Error("El archivo no tiene un estado de demostración válido.");
  return parsed.data;
}
