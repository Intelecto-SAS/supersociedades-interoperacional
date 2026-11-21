"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card, TextInput } from "@/components/ui/primitives";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function ExpedientesPage() {
  const data = useView();
  const add = useDemoStore((s) => s.addExpediente);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [msg, setMsg] = useState("");
  const rows = data.expedientes.filter((e) => (!q || `${e.id} ${e.empresaId} ${e.tipo}`.toLowerCase().includes(q.toLowerCase())) && (!estado || e.estado === estado));
  return (
    <div>
      <PageHeader title="Expedientes" description="Seguimiento de actuaciones, documentos y responsables." actions={<Button onClick={() => { add({ id: `DEMO-EXP-NUEVO-${data.expedientes.length}`, empresaId: "DEMO-EMP-0001", tipo: "Documental", estado: "abierto", responsableDemo: "Equipo jurídico", resumen: "Expediente creado en la sesión.", fechaApertura: "2025-10-29" }); setMsg("Expediente creado."); }}>Crear expediente</Button>} />
      {msg ? <p role="status" className="mb-2 text-sm">{msg}</p> : null}
      <div className="mb-3 flex gap-2"><TextInput aria-label="Buscar expediente" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Identificador" /><select aria-label="Estado del expediente" className="rounded border px-2" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Estado</option><option value="abierto">abierto</option><option value="en_seguimiento">en seguimiento</option><option value="cerrado">cerrado</option></select></div>
      <div className="grid gap-2">{rows.slice(0, 30).map((e) => <Card key={e.id}><Link className="font-semibold text-brand-blue" href={`/expedientes/${e.id}`}>{e.id}</Link> · {e.tipo} · {e.estado} · {e.empresaId}<p className="text-sm text-slate-600">{e.resumen}</p></Card>)}</div>
    </div>
  );
}
