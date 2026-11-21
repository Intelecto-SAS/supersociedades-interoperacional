import { testConnector } from "@/lib/api/handlers";

export function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  return context.params.then(({ id }) => testConnector(id));
}
