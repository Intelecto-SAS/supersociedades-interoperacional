"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Badge, Button, TextInput } from "@/components/ui/primitives";
import { useDemoStore, useEmpresaSesion } from "@/lib/storage/store";

export default function DocumentosPage() {
  const { documentos, documentosEstado, empresa } = useEmpresaSesion();
  const validar = useDemoStore((s) => s.validarDocumento);
  const auditar = useDemoStore((s) => s.auditar);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const rows = documentos.filter((d) => `${d.nombre} ${d.clasificacion}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Documentos de la sociedad" description={`Archivo de ${empresa.razonSocial}. Cada documento puede validarse en esta sesión. La lectura automática de ventanilla no se presenta como un servicio de reconocimiento real.`} />
      <TextInput aria-label="Buscar documentos" className="mb-3" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o clasificación" />
      {msg ? <p role="status" className="mb-2 text-sm text-emerald-800">{msg}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr>{["Documento", "Clasificación", "Fecha", "Estado", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((d) => {
              const ok = documentosEstado[d.id]?.validado;
              return (
                <tr key={d.id} className="border-t border-surface-line">
                  <td className="px-3 py-3 font-semibold">{d.nombre}</td>
                  <td className="px-3 py-3">{d.clasificacion}</td>
                  <td className="px-3 py-3">{d.fecha}</td>
                  <td className="px-3 py-3"><Badge tone={ok ? "ok" : "warn"}>{ok ? "Validado" : "Por validar"}</Badge></td>
                  <td className="px-3 py-3">{ok ? null : <Button variant="secondary" onClick={() => { validar(d.id); auditar("validacion_documento", d.id); setMsg(`${d.nombre} quedó validado en esta sesión.`); }}>Validar</Button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
