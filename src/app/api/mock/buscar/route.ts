import { viewFrom } from "@/lib/api/handlers";
import { envelope } from "@/lib/validation/query";

export function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 120).toLowerCase();
  if (!q) return Response.json({ error: "Falta q" }, { status: 400 });
  const data = viewFrom(url);
  return Response.json(envelope({
    empresas: data.empresas.filter((e) => `${e.razonSocial} ${e.id}`.toLowerCase().includes(q)).slice(0, 20),
    conectores: data.conectores.filter((c) => c.nombre.toLowerCase().includes(q)).slice(0, 20),
  }));
}
