"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RadicacionRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/solicitudes/nueva"); }, [router]);
  return <p>El trámite ahora se presenta en el asistente FURT…</p>;
}
