"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CANALES, type CanalId } from "@/features/portal/canales";
import { PageHeader } from "@/components/shared/page";
import { useEmpresaSesion } from "@/lib/storage/store";

export default function SolicitudesPage() {
  const { solicitudes, empresa } = useEmpresaSesion();
  const [canal, setCanal] = useState<CanalId | "">("");
  const rows = useMemo(() => solicitudes.filter((s) => !canal || s.canal === canal), [solicitudes, canal]);
  return (
    <div>
      <PageHeader title="Solicitudes de la sociedad" description={`Trámites de ${empresa.razonSocial} enviados por correo, portal FURT, ventanilla, 4-72 u otras entidades.`} actions={<Link className="rounded-md bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href="/solicitudes/nueva">Nueva solicitud FURT</Link>} />
      <div className="mb-3 flex flex-wrap gap-2">
        <button className={`rounded-lg border px-3 py-1 text-sm ${canal === "" ? "border-brand-blue font-semibold" : "border-surface-line"}`} onClick={() => setCanal("")}>Todos</button>
        {CANALES.map((c) => (
          <button key={c.id} className={`rounded-lg border px-3 py-1 text-sm ${canal === c.id ? "border-brand-blue font-semibold" : "border-surface-line"}`} onClick={() => setCanal(c.id)}>{c.nombre}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr>{["Canal", "Asunto", "Radicado", "Estado", "Llegada", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-surface-line hover:bg-slate-50">
                <td className="px-3 py-3">{CANALES.find((c) => c.id === s.canal)?.nombre}</td>
                <td className="px-3 py-3 font-semibold">{s.asunto}{s.prioridad === "tutela" ? " · tutela" : ""}</td>
                <td className="px-3 py-3">{s.radicadoGedess ?? "Sin radicar"}</td>
                <td className="px-3 py-3">{s.estado.replace("_", " ")}</td>
                <td className="px-3 py-3 tabular-nums">{s.fechaLlegada.slice(0, 16).replace("T", " ")}</td>
                <td className="px-3 py-3"><Link className="font-semibold text-brand-blue" href={`/solicitudes/${s.id}`}>Seguimiento</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
