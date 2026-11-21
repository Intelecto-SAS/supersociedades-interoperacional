import { asistente } from "@/lib/api/handlers";
export async function POST(request: Request) { return asistente(await request.json().catch(() => null)); }
