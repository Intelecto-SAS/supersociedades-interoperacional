import { evaluar } from "@/lib/api/handlers";
export async function POST(request: Request) { return evaluar(await request.json().catch(() => null), new URL(request.url)); }
