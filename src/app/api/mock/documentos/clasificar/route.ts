import { clasificar } from "@/lib/api/handlers";
export async function POST(request: Request) { return clasificar(await request.json().catch(() => null)); }
