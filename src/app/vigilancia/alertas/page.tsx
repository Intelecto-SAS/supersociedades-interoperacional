"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { toCsv } from "@/lib/export/csv";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function AlertasPage() {
  const data = useView();
  const update = useDemoStore((s) => s.updateAlerta);
  const addExp = useDemoStore((s) => s.addExpediente);
  const [estado, setEstado] = useState("");
  const [sev, setSev] = useState("");
  const [msg, setMsg] = useState("");
  const rows = useMemo(() => data.alertas.filter((a) => (!estado || a.estado === estado) && (!sev || a.severidad === sev)), [data.alertas, estado, sev]);
  const exportar = () => {
    const blob = new Blob([toCsv(rows.map((a) => ({ id: a.id, empresa: a.empresaId, regla: a.reglaAplicada, estado: a.estado })))], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "alertas.csv"; a.click();
  };
  return (
    <div>
      <PageHeader title="Alertas" description="Asigne un responsable, cambie el estado o abra un expediente a partir de la señal." actions={<Button variant="secondary" onClick={exportar}>Exportar CSV</Button>} />
      <div className="mb-3 flex gap-2">
        <select aria-label="Estado" className="rounded border px-2 py-1" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Estado</option><option value="abierta">abierta</option><option value="en_revision">en revisión</option><option value="cerrada">cerrada</option></select>
        <select aria-label="Severidad" className="rounded border px-2 py-1" value={sev} onChange={(e) => setSev(e.target.value)}><option value="">Severidad</option><option>baja</option><option>media</option><option>alta</option><option>critica</option></select>
      </div>
      {msg ? <p role="status" className="mb-2 text-sm text-emerald-800">{msg}</p> : null}
      <div className="space-y-2">
        {rows.slice(0, 40).map((a) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{a.descripcion}</p>
                <p className="text-xs text-slate-500">{a.id} · {a.reglaAplicada} · <Link className="text-brand-blue" href={`/empresas/${a.empresaId}?alerta=${a.id}`}>{a.empresaId}</Link></p>
              </div>
              <Badge tone={a.severidad === "critica" ? "risk" : "warn"}>{a.estado}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => { update(a.id, { estado: "en_revision", responsableDemo: "Equipo de supervisión" }); setMsg(`Alerta ${a.id} asignada.`); }}>Asignar y revisar</Button>
              <Button variant="secondary" onClick={() => { update(a.id, { estado: "cerrada", responsableDemo: a.responsableDemo }); setMsg(`Alerta ${a.id} cerrada en la demo.`); }}>Cerrar</Button>
              <Button variant="secondary" onClick={() => { addExp({ id: `DEMO-EXP-${a.id}`, empresaId: a.empresaId, tipo: "Alerta", estado: "abierto", responsableDemo: "Equipo de supervisión", resumen: a.descripcion, fechaApertura: "2025-10-29" }); setMsg("Expediente creado desde la alerta."); }}>Crear expediente</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
