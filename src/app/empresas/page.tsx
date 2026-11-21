"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page";
import { DataTable } from "@/components/tables/data-table";
import { Badge, TextInput } from "@/components/ui/primitives";
import { useView } from "@/lib/storage/store";
import type { Empresa } from "@/types/domain";

function EmpresasInner() {
  const data = useView();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState(params.get("sector") ?? "");
  const [riesgo, setRiesgo] = useState("");
  const sectores = [...new Set(data.empresas.map((e) => e.sector))];
  const rows = useMemo(() => data.empresas.filter((e) => {
    const text = `${e.razonSocial} ${e.id} ${e.nitDemo}`.toLowerCase();
    return (!q || text.includes(q.toLowerCase())) && (!sector || e.sector === sector) && (!riesgo || e.nivelRiesgo === riesgo);
  }), [data.empresas, q, sector, riesgo]);
  const columns: ColumnDef<Empresa>[] = [
    { accessorKey: "razonSocial", header: "Razón social", cell: ({ row }) => <Link className="font-semibold text-brand-blue" href={`/empresas/${row.original.id}`}>{row.original.razonSocial}</Link> },
    { accessorKey: "id", header: "Identificador" },
    { accessorKey: "sector", header: "Sector" },
    { accessorKey: "departamento", header: "Departamento" },
    { accessorKey: "nivelRiesgo", header: "Riesgo", cell: ({ getValue }) => <Badge tone={getValue() === "critica" ? "risk" : getValue() === "alta" ? "warn" : "info"}>{String(getValue())}</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Sociedades" description="Doscientas sociedades con el mismo identificador en finanzas, contratos, procesos, expedientes y alertas." />
      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <TextInput aria-label="Filtrar empresas" placeholder="Nombre o DEMO-EMP" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Sector" className="rounded-md border px-2" value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">Todos los sectores</option>
          {sectores.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Riesgo" className="rounded-md border px-2" value={riesgo} onChange={(e) => setRiesgo(e.target.value)}>
          <option value="">Todo riesgo</option>
          <option value="baja">baja</option><option value="media">media</option><option value="alta">alta</option><option value="critica">crítica</option>
        </select>
      </div>
      <DataTable columns={columns} data={rows} />
    </div>
  );
}

export default function EmpresasPage() {
  return <Suspense><EmpresasInner /></Suspense>;
}
