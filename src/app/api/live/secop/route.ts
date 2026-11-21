import { querySecop, type SecopDataset } from "@/integrations/live/secop";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80).regex(/^[\p{L}\p{N} .,&/-]+$/u),
  dataset: z.enum(["contratos", "procesos"]).default("contratos"),
  page: z.coerce.number().int().min(1).max(10).default(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q") ?? "",
    dataset: url.searchParams.get("dataset") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return Response.json({ error: "La consulta debe tener entre 2 y 80 caracteres, sin símbolos de filtro." }, { status: 400 });
  }
  try {
    const result = await querySecop(parsed.data.dataset as SecopDataset, parsed.data.q, parsed.data.page);
    if (!result.ok) return Response.json({ error: result.message, status: result.status }, { status: 502 });
    return Response.json({
      simulated: false,
      persistedOnServer: false,
      dataset: parsed.data.dataset,
      page: parsed.data.page,
      source: result.source,
      durationMs: result.durationMs,
      tokenConfigured: result.tokenConfigured,
      empresaId: null,
      records: result.records,
    });
  } catch {
    return Response.json({ error: "No fue posible consultar Datos Abiertos Colombia." }, { status: 502 });
  }
}
