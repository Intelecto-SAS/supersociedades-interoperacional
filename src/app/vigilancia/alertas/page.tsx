"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInspector } from "@/components/layout/inspector";
import { PageHeader } from "@/components/shared/page";
import { Button } from "@/components/ui/primitives";
import { toCsv } from "@/lib/export/csv";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function AlertasPage() {
  const data = useView();
  const router = useRouter();
  const inspector = useInspector();
  const update = useDemoStore((s) => s.updateAlerta);
  const addExp = useDemoStore((s) => s.addExpediente);
  const [estado, setEstado] = useState("");
  const [sev, setSev] = useState("");
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState("");
  const rows = useMemo(() => data.alertas.filter((a) => (!estado || a.estado === estado) && (!sev || a.severidad === sev)), [data.alertas, estado, sev]);
  const nombre = (id: string) => data.empresas.find((e) => e.id === id)?.razonSocial ?? id;
  const exportar = () => {
    const blob = new Blob([toCsv(rows.map((a) => ({ id: a.id, empresa: a.empresaId, regla: a.reglaAplicada, estado: a.estado })))], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "alertas.csv"; a.click();
  };
  return (
    <div>
      <PageHeader title="Alertas" description="Seleccione una fila para leer el motivo, la evidencia y el siguiente paso sin salir del listado." actions={<Button variant="secondary" onClick={exportar}>Exportar CSV</Button>} />
      <div className="mb-3 flex flex-wrap gap-2">
        <select aria-label="Estado" className="h-10 rounded-lg border border-surface-line px-2" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Estado</option><option value="abierta">abierta</option><option value="en_revision">en revisión</option><option value="cerrada">cerrada</option></select>
        <select aria-label="Severidad" className="h-10 rounded-lg border border-surface-line px-2" value={sev} onChange={(e) => setSev(e.target.value)}><option value="">Severidad</option><option>baja</option><option>media</option><option>alta</option><option>critica</option></select>
        <button className="text-sm font-semibold text-brand-blue" onClick={() => { setEstado(""); setSev(""); }}>Limpiar filtros</button>
      </div>
      {msg ? <p role="status" className="mb-2 text-sm text-emerald-800">{msg}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-slate-500"><tr>{["Sociedad", "Situación", "Prioridad", "Estado", "Fecha", "Siguiente paso"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {rows.slice(0, 40).map((a) => (
              <tr key={a.id} className={`border-t border-surface-line ${selected === a.id ? "bg-slate-100" : "hover:bg-slate-50"}`}>
                <td className="px-3 py-3 font-semibold">{nombre(a.empresaId)}</td>
                <td className="px-3 py-3">{a.descripcion}</td>
                <td className="px-3 py-3">{a.severidad}</td>
                <td className="px-3 py-3">{a.estado}</td>
                <td className="px-3 py-3 tabular-nums">{a.fecha}</td>
                <td className="px-3 py-3">
                  <button className="font-semibold text-brand-blue" onClick={(event) => {
                    setSelected(a.id);
                    inspector.open({
                      title: a.descripcion,
                      body: <div className="space-y-2"><p><span className="font-semibold">Sociedad. </span>{nombre(a.empresaId)} ({a.empresaId})</p><p><span className="font-semibold">Regla. </span>{a.reglaAplicada}</p><p><span className="font-semibold">Evidencias. </span>{a.evidencias.join(" · ") || "Sin evidencia adicional."}</p><p><span className="font-semibold">Responsable. </span>{a.responsableDemo ?? "Sin asignar"}</p></div>,
                      actions: <>
                        <Button onClick={() => router.push(`/empresas/${a.empresaId}?alerta=${a.id}`)}>Ver sociedad</Button>
                        <Button variant="secondary" onClick={() => { update(a.id, { estado: "en_revision", responsableDemo: "Equipo de supervisión" }); setMsg(`Alerta ${a.id} asignada.`); }}>Asignar y revisar</Button>
                        <Button variant="secondary" onClick={() => { addExp({ id: `DEMO-EXP-${a.id}`, empresaId: a.empresaId, tipo: "Alerta", estado: "abierto", responsableDemo: "Equipo de supervisión", resumen: a.descripcion, fechaApertura: "2025-10-29" }); setMsg("Expediente creado desde la alerta."); }}>Crear expediente</Button>
                        <Button variant="secondary" onClick={() => { update(a.id, { estado: "cerrada", responsableDemo: a.responsableDemo }); setMsg(`Alerta ${a.id} cerrada en la demo.`); }}>Cerrar</Button>
                      </>,
                    }, event.currentTarget);
                  }}>Revisar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
