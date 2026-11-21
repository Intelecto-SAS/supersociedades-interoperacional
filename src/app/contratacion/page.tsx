"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { SimpleBars } from "@/components/charts/bars";
import { SecopLiveSearch } from "@/components/integrations/secop-live";
import { Card, TextInput } from "@/components/ui/primitives";
import { formatCOP } from "@/lib/formatting/format";
import { useView } from "@/lib/storage/store";

export default function ContratacionPage() {
  const data = useView();
  const [empresa, setEmpresa] = useState("");
  const [entidad, setEntidad] = useState("");
  const [sector, setSector] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [min, setMin] = useState("");
  const rows = useMemo(() => data.contratos.filter((c) => {
    return (!empresa || c.empresaId === empresa) && (!entidad || c.entidadContratanteFicticia === entidad) && (!sector || c.sector === sector) && (!modalidad || c.modalidad === modalidad) && (!min || c.valorCOP >= Number(min));
  }), [data.contratos, empresa, entidad, sector, modalidad, min]);
  const total = rows.reduce((s, c) => s + c.valorCOP, 0);
  const bySector = new Map<string, number>();
  const byEmpresa = new Map<string, number>();
  for (const c of rows) {
    bySector.set(c.sector, (bySector.get(c.sector) ?? 0) + c.valorCOP);
    byEmpresa.set(c.empresaId, (byEmpresa.get(c.empresaId) ?? 0) + c.valorCOP);
  }
  const top = [...byEmpresa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div>
      <PageHeader title="Contratación y relaciones" description="Contratos de la plataforma y, aparte, la consulta en vivo de SECOP publicada en Datos Abiertos." />
      <div className="mb-4"><SecopLiveSearch /></div>
      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <TextInput aria-label="Empresa" placeholder="DEMO-EMP-0004" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
        <select aria-label="Entidad" className="rounded border px-2" value={entidad} onChange={(e) => setEntidad(e.target.value)}><option value="">Entidad contratante</option>{[...new Set(data.contratos.map((c) => c.entidadContratanteFicticia))].map((e) => <option key={e}>{e}</option>)}</select>
        <select aria-label="Sector" className="rounded border px-2" value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Sector</option>{[...new Set(data.contratos.map((c) => c.sector))].map((e) => <option key={e}>{e}</option>)}</select>
        <select aria-label="Modalidad" className="rounded border px-2" value={modalidad} onChange={(e) => setModalidad(e.target.value)}><option value="">Modalidad</option>{[...new Set(data.contratos.map((c) => c.modalidad))].map((e) => <option key={e}>{e}</option>)}</select>
        <TextInput aria-label="Valor mínimo" placeholder="Valor mínimo COP" value={min} onChange={(e) => setMin(e.target.value)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Valor filtrado: {formatCOP(total)}</h2>
          <SimpleBars data={[...bySector.entries()].slice(0, 8).map(([sector, valor]) => ({ sector, valor: Math.round(valor / 1_000_000) }))} x="sector" y="valor" label="Valor contractual por sector en millones" />
        </Card>
        <Card>
          <h2 className="font-semibold">Mayor participación</h2>
          {top.map(([id, valor]) => <p key={id} className="text-sm"><Link className="text-brand-blue" href={`/empresas/${id}`}>{id}</Link> · {formatCOP(valor)}</p>)}
          <h3 className="mt-3 font-semibold">Relaciones entre contratistas</h3>
          {data.relaciones.filter((r) => r.fuente === "secop-ii").map((r) => <p key={r.id} className="text-sm">{r.origen} → {r.destino} · {r.tipoRelacion}</p>)}
          <p className="mt-3 text-xs">Listas OFAC y de Naciones Unidas: sin coincidencias para las sociedades consultadas.</p>
          <h3 className="mt-3 font-semibold">Línea reciente</h3>
          {rows.slice(0, 5).map((c) => <p key={c.id} className="text-sm">{c.fecha} · {c.id} · {c.estado}</p>)}
        </Card>
      </div>
    </div>
  );
}
