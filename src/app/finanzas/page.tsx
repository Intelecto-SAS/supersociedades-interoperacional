"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { SimpleBars } from "@/components/charts/bars";
import { Card } from "@/components/ui/primitives";
import { formatCOP } from "@/lib/formatting/format";
import { useView } from "@/lib/storage/store";

export default function FinanzasPage() {
  const data = useView();
  const destacadas = data.empresas.filter((e) => e.etiquetas.includes("destacada")).slice(0, 5);
  const [id, setId] = useState(destacadas[1]?.id ?? destacadas[0]!.id);
  const serie = data.reportes.filter((r) => r.empresaId === id);
  const alertas = data.alertas.filter((a) => a.empresaId === id && a.tipo === "Financiero");
  const ultimo = serie.at(-1);
  const previo = serie.at(-2);
  const tendencia = ultimo && previo && previo.ingresos ? (ultimo.ingresos - previo.ingresos) / previo.ingresos : 0;
  return (
    <div>
      <PageHeader title="Analítica financiera" description="Cálculos sobre los tres ejercicios ficticios de cada empresa." />
      <label className="mb-3 block text-sm">Empresa
        <select className="ml-2 rounded border px-2 py-1" value={id} onChange={(e) => setId(e.target.value)}>{destacadas.map((e) => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}</select>
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Ingresos</h2>
          <SimpleBars data={serie.map((r) => ({ periodo: r.periodo, ingresos: Math.round(r.ingresos / 1_000_000) }))} x="periodo" y="ingresos" label="Serie de ingresos" />
          <p className="text-sm">Tendencia del último año: {(tendencia * 100).toFixed(1)} %.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Balance</h2>
          {ultimo ? <ul className="text-sm"><li>Activos {formatCOP(ultimo.activos)}</li><li>Pasivos {formatCOP(ultimo.pasivos)}</li><li>Patrimonio {formatCOP(ultimo.patrimonio)}</li><li>Utilidad {formatCOP(ultimo.utilidad)}</li></ul> : null}
          <h3 className="mt-3 font-semibold">Alertas financieras</h3>
          {alertas.map((a) => <p key={a.id} className="text-sm">{a.descripcion}</p>)}
        </Card>
      </div>
    </div>
  );
}
