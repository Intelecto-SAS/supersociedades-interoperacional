import { viewFrom } from "@/lib/api/handlers";
import { envelope } from "@/lib/validation/query";

export function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => {
    const url = new URL(request.url);
    const data = viewFrom(url);
    const empresa = data.empresas.find((e) => e.id === id);
    if (!empresa) return Response.json({ error: "No encontrada" }, { status: 404 });
    return Response.json(envelope({
      empresa,
      reportes: data.reportes.filter((r) => r.empresaId === id),
      contratos: data.contratos.filter((c) => c.empresaId === id).slice(0, 20),
      alertas: data.alertas.filter((a) => a.empresaId === id),
    }));
  });
}
