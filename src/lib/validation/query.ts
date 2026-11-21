import { z } from "zod";

export const pageQuery = z.object({
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  sector: z.string().max(80).optional(),
  estado: z.string().max(40).optional(),
  escenario: z.enum(["normal", "riesgo", "insolvencia", "contratos", "expedientes", "calidad", "falla", "recuperacion"]).default("normal"),
});

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export const envelope = <T>(data: T) => ({
  simulated: true as const,
  persistedOnServer: false as const,
  fechaCorte: "2025-10-29",
  data,
});
