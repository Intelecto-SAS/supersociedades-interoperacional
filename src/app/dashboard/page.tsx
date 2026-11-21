"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInspector } from "@/components/layout/inspector";
import { Button } from "@/components/ui/primitives";
import { dashboardMetrics } from "@/features/dashboard/metrics";
import { formatNumber, formatPercent } from "@/lib/formatting/format";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function DashboardPage() {
  const data = useView();
  const router = useRouter();
  const inspector = useInspector();
  const update = useDemoStore((s) => s.updateAlerta);
  const addExp = useDemoStore((s) => s.addExpediente);
  const [recientes, setRecientes] = useState<{ id: string; label: string; href: string }[]>([]);
  const [nota, setNota] = useState("");
  const metrics = useMemo(() => dashboardMetrics(data), [data]);
  useEffect(() => {
    const raw = localStorage.getItem("conecta360-recientes");
    if (raw) setRecientes(JSON.parse(raw) as typeof recientes);
  }, []);
  const nombre = (id: string) => data.empresas.find((e) => e.id === id)?.razonSocial ?? id;
  const tareas = data.alertas.filter((a) => a.estado !== "cerrada").slice(0, 8);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-brand-blue">Mi espacio de trabajo</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">Consulta las situaciones que requieren atención y continúa tus procesos.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-lg bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href="/empresas">Buscar sociedad</Link>
          <Link className="rounded-lg border border-surface-line bg-white px-3 py-2 text-sm font-semibold text-brand-blue" href="/vigilancia/alertas">Ver todas las tareas</Link>
        </div>
      </div>
      {nota ? <p role="status" className="mb-3 text-sm text-emerald-800">{nota}</p> : null}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <h2 className="mb-2 text-base font-bold">Requiere mi atención</h2>
          <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {["Prioridad", "Sociedad", "Situación", "Tipo", "Estado", "Fecha", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {tareas.map((a) => (
                  <tr key={a.id} className="border-t border-surface-line hover:bg-slate-50">
                    <td className="px-3 py-3">{a.severidad}</td>
                    <td className="px-3 py-3 font-semibold">{nombre(a.empresaId)}</td>
                    <td className="px-3 py-3">{a.descripcion}</td>
                    <td className="px-3 py-3">{a.tipo}</td>
                    <td className="px-3 py-3">{a.estado}</td>
                    <td className="px-3 py-3 tabular-nums">{a.fecha}</td>
                    <td className="px-3 py-3">
                      <button className="font-semibold text-brand-blue" onClick={(event) => inspector.open({
                        title: a.descripcion,
                        body: (
                          <div className="space-y-2">
                            <p><span className="font-semibold">Sociedad. </span>{nombre(a.empresaId)}</p>
                            <p><span className="font-semibold">Prioridad. </span>{a.severidad}</p>
                            <p><span className="font-semibold">Fecha. </span>{a.fecha}</p>
                            <p><span className="font-semibold">Regla. </span>{a.reglaAplicada}</p>
                            <p><span className="font-semibold">Evidencias. </span>{a.evidencias.join(" · ") || "Sin evidencia adicional."}</p>
                            <p className="text-slate-500">Registro de la plataforma. No es una consulta externa.</p>
                          </div>
                        ),
                        actions: (
                          <>
                            <Button onClick={() => router.push(`/empresas/${a.empresaId}?alerta=${a.id}`)}>Ver sociedad</Button>
                            <Button variant="secondary" onClick={() => { addExp({ id: `DEMO-EXP-${a.id}`, empresaId: a.empresaId, tipo: "Alerta", estado: "abierto", responsableDemo: "Equipo de supervisión", resumen: a.descripcion, fechaApertura: "2025-10-29" }); setNota(`Expediente creado para ${a.id}.`); }}>Abrir expediente</Button>
                            <Button variant="secondary" onClick={() => { update(a.id, { estado: "en_revision", responsableDemo: "Equipo de supervisión" }); setNota(`Alerta ${a.id} en revisión.`); }}>Registrar revisión</Button>
                          </>
                        ),
                      }, event.currentTarget)}>Revisar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="mb-2 mt-6 text-base font-bold">Actividad reciente</h2>
          <ol className="space-y-2 text-sm">
            {data.auditoria.slice(0, 4).map((a) => <li key={a.id} className="border-l-2 border-brand-burgundy pl-3"><span className="text-slate-500">{a.fecha.slice(0, 10)}</span> · {a.detalle}</li>)}
            {data.alertas.slice(0, 3).map((a) => <li key={a.id} className="border-l-2 border-slate-200 pl-3"><span className="text-slate-500">{a.fecha}</span> · {a.descripcion}</li>)}
          </ol>
        </section>
        <aside className="space-y-6">
          <section>
            <h2 className="mb-2 text-base font-bold">Continuar trabajando</h2>
            <ul className="divide-y divide-surface-line rounded-xl border border-surface-line bg-white">
              {recientes.length === 0 ? <li className="px-3 py-3 text-sm text-slate-500">Las sociedades que abra quedan en este navegador.</li> : recientes.map((r) => <li key={r.href} className="px-3 py-2 text-sm"><Link className="font-semibold text-brand-blue" href={r.href}>{r.label}</Link></li>)}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-base font-bold">Panorama</h2>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl border border-surface-line bg-white p-3 text-sm">
              <div><dt className="text-xs text-slate-500">Sociedades</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.empresas)}</dd></div>
              <div><dt className="text-xs text-slate-500">Alertas</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.alertasAbiertas)}</dd></div>
              <div><dt className="text-xs text-slate-500">Expedientes</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.expedientes)}</dd></div>
              <div><dt className="text-xs text-slate-500">Fuentes</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.conectoresActivos)}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-slate-500">Calidad de datos</dt><dd className="font-bold">{formatPercent(metrics.calidad)}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
