"use client";

import Link from "next/link";
import { CANALES } from "@/features/portal/canales";
import { Badge } from "@/components/ui/primitives";
import { useEmpresaSesion } from "@/lib/storage/store";

export default function DashboardPage() {
  const { empresa, solicitudes, documentos, documentosEstado } = useEmpresaSesion();
  const abiertas = solicitudes.filter((s) => s.estado !== "cerrada" && s.estado !== "respondida");
  const tutelas = solicitudes.filter((s) => s.prioridad === "tutela");
  const porConfirmar = solicitudes.filter((s) => s.canal === "correo" && !s.confirmadoPorPersona);
  const pendientesDoc = documentos.filter((d) => !documentosEstado[d.id]?.validado).slice(0, 4);
  const salida = solicitudes.filter((s) => s.canal === "salida-472");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-brand-blue">Portal de {empresa.razonSocial}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">Consulta las solicitudes enviadas a la Superintendencia, los documentos validados y el estado de cada canal de entrada.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-lg bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href="/solicitudes/nueva">Nueva solicitud FURT</Link>
          <Link className="rounded-lg border border-surface-line bg-white px-3 py-2 text-sm font-semibold text-brand-blue" href="/documentos">Ver documentos</Link>
        </div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <h2 className="mb-2 text-base font-bold">Requieren seguimiento</h2>
          <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>{["Canal", "Asunto", "Estado", "Fecha de llegada", ""].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {abiertas.slice(0, 8).map((s) => (
                  <tr key={s.id} className="border-t border-surface-line hover:bg-slate-50">
                    <td className="px-3 py-3">{CANALES.find((c) => c.id === s.canal)?.nombre}</td>
                    <td className="px-3 py-3 font-semibold">{s.asunto}{s.prioridad === "tutela" ? " · tutela" : ""}</td>
                    <td className="px-3 py-3">{s.estado.replace("_", " ")}</td>
                    <td className="px-3 py-3 tabular-nums">{s.fechaLlegada.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-3 py-3"><Link className="font-semibold text-brand-blue" href={`/solicitudes/${s.id}`}>Abrir</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {porConfirmar.length ? <p className="mt-3 text-sm">Hay {porConfirmar.length} correo{porConfirmar.length === 1 ? "" : "s"} con clasificación lista. Una persona debe confirmar el reparto.</p> : null}
        </section>
        <aside className="space-y-5">
          <section>
            <h2 className="mb-2 text-base font-bold">Esta sociedad</h2>
            <div className="rounded-xl border border-surface-line bg-white p-3 text-sm">
              <p className="font-semibold">{empresa.razonSocial}</p>
              <p className="text-slate-500">{empresa.nitDemo}</p>
              <p className="mt-2">{empresa.municipio}, {empresa.departamento}</p>
              <p>Matrícula {empresa.estadoMatriculaSimulado}</p>
              <Link className="mt-2 inline-block font-semibold text-brand-blue" href="/empresa">Ver información validada</Link>
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-base font-bold">Documentos por validar</h2>
            <ul className="divide-y divide-surface-line rounded-xl border border-surface-line bg-white text-sm">
              {pendientesDoc.length === 0 ? <li className="px-3 py-3 text-slate-500">No hay documentos pendientes.</li> : pendientesDoc.map((d) => (
                <li key={d.id} className="px-3 py-2"><Link href="/documentos">{d.nombre}</Link></li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-2 text-base font-bold">Avisos</h2>
            <ul className="space-y-2 text-sm">
              {tutelas.map((s) => <li key={s.id}><Badge tone="risk">Tutela</Badge> {s.asunto}</li>)}
              {salida.slice(0, 2).map((s) => <li key={s.id}><Badge tone="info">4-72</Badge> Guía {s.guia472}</li>)}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
