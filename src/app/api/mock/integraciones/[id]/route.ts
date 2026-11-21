import { getAdapter } from "@/integrations/registry";
import { envelope } from "@/lib/validation/query";

export function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => {
    const adapter = getAdapter(id);
    if (!adapter) return Response.json({ error: "No encontrada" }, { status: 404 });
    return Response.json(envelope({ metadata: adapter.getMetadata(), health: adapter.healthCheck(), schema: adapter.getSchema() }));
  });
}
