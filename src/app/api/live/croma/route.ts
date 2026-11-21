import { CROMA_OPERATIONS, queryCroma, type CromaOperation } from "@/integrations/live/croma";
import { z } from "zod";

const bodySchema = z.object({
  operation: z.enum(CROMA_OPERATIONS),
  q: z.string().trim().min(3).max(200),
  page: z.number().int().min(1).max(20).default(1),
}).superRefine((value, ctx) => {
  if ((value.operation === "rues-nit" || value.operation === "ss-financials") && !/^\d{4,15}$/.test(value.q)) {
    ctx.addIssue({ code: "custom", message: "El NIT debe tener entre 4 y 15 dígitos, sin puntos ni dígito de verificación." });
  }
  if (value.operation === "rama-radicado" && !/^\d{20,25}$/.test(value.q)) {
    ctx.addIssue({ code: "custom", message: "El radicado debe tener entre 20 y 25 dígitos." });
  }
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Consulta no válida." }, { status: 400 });
  }
  try {
    const result = await queryCroma(parsed.data.operation as CromaOperation, parsed.data.q, parsed.data.page);
    if (!result.ok) {
      const status = result.status === 503 ? 503 : 502;
      return Response.json({ error: result.message }, { status });
    }
    return Response.json({
      simulated: false,
      persistedOnServer: false,
      empresaId: null,
      source: result.source,
      durationMs: result.durationMs,
      record: result.record,
    });
  } catch {
    return Response.json({ error: "No fue posible consultar el registro." }, { status: 502 });
  }
}
