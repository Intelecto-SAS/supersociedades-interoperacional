"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { SimpleBars } from "@/components/charts/bars";
import { Button, Card } from "@/components/ui/primitives";
import { toCsv } from "@/lib/export/csv";
import { useView } from "@/lib/storage/store";

export default function TerritorioPage() {
  const data = useView();
  const [depto, setDepto] = useState("");
  const [sector, setSector] = useState("");
  const empresas = useMemo(() => data.empresas.filter((e) => (!depto || e.departamento === depto) && (!sector || e.sector === sector)), [data.empresas, depto, sector]);
  const riesgos = empresas.filter((e) => e.nivelRiesgo === "alta" || e.nivelRiesgo === "critica").length;
  const ficha = data.territorio.find((t) => t.departamento === depto);
  return (
    <div>
      <PageHeader title="Analítica territorial" description="Grilla departamental construida con los nombres de los departamentos del universo ficticio. No usa un mapa externo ni geometría oficial." actions={<Button variant="secondary" onClick={() => { const blob = new Blob([toCsv(empresas.map((e) => ({ id: e.id, departamento: e.departamento, sector: e.sector, riesgo: e.nivelRiesgo })))], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "territorio-demo.csv"; a.click(); }}>Exportar</Button>} />
      <div className="mb-3 flex gap-2">
        <select aria-label="Departamento" className="rounded border px-2 py-1" value={depto} onChange={(e) => setDepto(e.target.value)}><option value="">Todos</option>{data.territorio.map((t) => <option key={t.departamento}>{t.departamento}</option>)}</select>
        <select aria-label="Sector territorial" className="rounded border px-2 py-1" value={sector} onChange={(e) => setSector(e.target.value)}><option value="">Sector</option>{[...new Set(data.empresas.map((e) => e.sector))].map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Empresas por departamento</h2>
          <SimpleBars data={data.territorio.map((t) => ({ departamento: t.departamento, empresas: t.empresas }))} x="departamento" y="empresas" label="Empresas por departamento" />
        </Card>
        <Card>
          <h2 className="font-semibold">Lectura</h2>
          <p className="text-sm">{empresas.length} empresas en el filtro. {riesgos} con riesgo alto o crítico.</p>
          {ficha ? <p className="mt-2 text-sm">Índice de actividad ficticio de {ficha.departamento}: {ficha.indiceActividadFicticio}. Sector principal: {ficha.sectorPrincipal}. Riesgo alto: {ficha.riesgoAlto}.</p> : <p className="mt-2 text-sm">Seleccione un departamento para comparar el índice ficticio.</p>}
          <p className="mt-2 text-xs">Fuentes simuladas: DANE y DNP del catálogo. Las cifras no provienen de esas entidades.</p>
        </Card>
      </div>
    </div>
  );
}
