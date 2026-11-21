"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card } from "@/components/ui/primitives";
import { REGLAS, evaluarEmpresa } from "@/features/risk/engine";
import { useView } from "@/lib/storage/store";

export default function VigilanciaPage() {
  const data = useView();
  const [empresaId, setEmpresaId] = useState("DEMO-EMP-0002");
  const [result, setResult] = useState<ReturnType<typeof evaluarEmpresa>>([]);
  return (
    <div>
      <PageHeader title="Vigilancia y riesgos" description="Reglas de seguimiento sobre estados financieros, contratos, procesos y calidad de la información." actions={<Link href="/vigilancia/alertas" className="rounded-full bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white">Ver alertas</Link>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Reglas</h2>
          <ul className="mt-2 space-y-2 text-sm">{REGLAS.map((r) => <li key={r.id}><strong>{r.id}</strong> · {r.nombre}. {r.condicion}</li>)}</ul>
        </Card>
        <Card>
          <label className="text-sm">Empresa
            <select className="mt-1 w-full rounded border px-2 py-1" value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
              {data.empresas.slice(0, 20).map((e) => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}
            </select>
          </label>
          <Button className="mt-3" onClick={() => setResult(evaluarEmpresa(data, empresaId))}>Ejecutar evaluación</Button>
          <ul className="mt-3 space-y-2 text-sm">{result.map((a) => <li key={a.id}><strong>{a.severidad}</strong> · {a.descripcion} Evidencia: {a.evidencias.join(", ")}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
