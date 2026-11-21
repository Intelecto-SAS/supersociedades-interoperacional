import { listResponse, viewFrom } from "@/lib/api/handlers";
export function GET(request: Request) { const url = new URL(request.url); return listResponse(url, viewFrom(url).alertas); }
