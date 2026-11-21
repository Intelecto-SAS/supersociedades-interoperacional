"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page";
import { DataTable } from "@/components/tables/data-table";
import { Badge, TextInput } from "@/components/ui/primitives";
import { useView } from "@/lib/storage/store";
import type { ConnectorDefinition } from "@/integrations/types";

export default function IntegracionesPage() {
  const data = useView();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [canal, setCanal] = useState("");
  const cats = [...new Set(data.conectores.map((c) => c.categoria))];
  const enVivo = data.conectores.filter((c) => c.modoActual === "LIVE").length;
  const rows = useMemo(() => data.conectores.filter((c) => (!q || `${c.nombre} ${c.entidadProveedora} ${c.id}`.toLowerCase().includes(q.toLowerCase())) && (!cat || c.categoria === cat) && (!canal || c.modoActual === canal)).sort((a, b) => Number(b.modoActual === "LIVE") - Number(a.modoActual === "LIVE")), [data.conectores, q, cat, canal]);
  const columns: ColumnDef<ConnectorDefinition>[] = [
    { accessorKey: "nombre", header: "Conector", cell: ({ row }) => <Link className="font-semibold text-brand-blue" href={`/integraciones/${row.original.id}`}>{row.original.nombre}</Link> },
    { id: "canal", header: "Canal", cell: ({ row }) => row.original.modoActual === "LIVE" ? <Badge tone="ok">Real</Badge> : <Badge tone="warn">Simulada</Badge> },
    { accessorKey: "categoria", header: "Categoría" },
    { accessorKey: "entidadProveedora", header: "Entidad" },
    { accessorKey: "estadoSimulado", header: "Estado", cell: ({ getValue }) => <Badge tone={getValue() === "operativo" ? "ok" : getValue() === "caido" ? "risk" : "warn"}>{String(getValue())}</Badge> },
  ];
  return (
    <div>
      <PageHeader title="Catálogo de integraciones" description={`${enVivo} fuentes consultan un registro real. ${data.conectores.length - enVivo} siguen con datos de la plataforma.`} />
      <div className="mb-3 grid gap-2 md:grid-cols-3">
        <TextInput aria-label="Buscar conector" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o entidad" />
        <select aria-label="Canal" className="rounded-md border px-2" value={canal} onChange={(e) => setCanal(e.target.value)}>
          <option value="">Canal: todos</option>
          <option value="LIVE">Reales</option>
          <option value="MOCK">Simuladas</option>
        </select>
        <select aria-label="Categoría" className="rounded-md border px-2" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={rows} pageSize={12} />
    </div>
  );
}
