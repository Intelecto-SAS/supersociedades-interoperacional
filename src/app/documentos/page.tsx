"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Card, TextInput } from "@/components/ui/primitives";
import { useView } from "@/lib/storage/store";

export default function DocumentosPage() {
  const data = useView();
  const [q, setQ] = useState("");
  const rows = data.documentos.filter((d) => `${d.nombre} ${d.clasificacion} ${d.empresaId}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Gestión documental" description="Documentos ficticios precargados. La búsqueda no sale del laboratorio." />
      <TextInput aria-label="Buscar documentos" className="mb-3" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, clasificación o empresa" />
      <div className="grid gap-2">{rows.slice(0, 25).map((d) => <Card key={d.id}><p className="font-semibold">{d.nombre}</p><p className="text-sm">{d.clasificacion} · {d.empresaId} · confianza simulada {d.confianzaSimulada}</p><p className="text-sm text-slate-600">{d.contenidoFicticio}</p></Card>)}</div>
    </div>
  );
}
