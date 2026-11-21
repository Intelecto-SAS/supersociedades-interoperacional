import { envelope } from "@/lib/validation/query";

export function GET() {
  return Response.json(envelope({ status: "ok", modo: "en_linea" }));
}
