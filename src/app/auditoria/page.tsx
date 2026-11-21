"use client";

import { PageHeader } from "@/components/shared/page";
import { Card } from "@/components/ui/primitives";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function AuditoriaPage() {
  const base = useView().auditoria;
  const local = useDemoStore((s) => s.auditoria);
  return (
    <div>
      <PageHeader title="Auditoría" description="Acciones sobre sociedades, fuentes y expedientes." />
      <div className="space-y-2">{[...local.map((e) => ({ ...e, usuarioDemo: "usuario", recurso: "sesion" })), ...base].map((e) => <Card key={e.id}><p className="font-semibold">{e.accion}</p><p className="text-sm">{e.fecha} · {e.detalle}</p></Card>)}</div>
    </div>
  );
}
