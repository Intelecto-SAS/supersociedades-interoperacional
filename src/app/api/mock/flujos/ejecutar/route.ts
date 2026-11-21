import { ejecutar } from "@/lib/api/handlers";
export async function POST(request: Request) { return ejecutar(await request.json().catch(() => null)); }
