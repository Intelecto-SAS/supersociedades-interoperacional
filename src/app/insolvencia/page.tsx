"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { SimpleBars } from "@/components/charts/bars";
import { Card } from "@/components/ui/primitives";
import { formatCOP } from "@/lib/formatting/format";
import { useView } from "@/lib/storage/store";

export default function InsolvenciaPage() {
  const data = useView();
  const empresa = data.empresas.find((e) => e.id === "DEMO-EMP-0002")!;
  const fins = data.reportes.filter((r) => r.empresaId === empresa.id);
  const alertas = data.alertas.filter((a) => a.empresaId === empresa.id);
  const docs = data.documentos.filter((d) => d.empresaId === empresa.id).slice(0, 5);
  const exp = data.expedientes.find((e) => e.empresaId === empresa.id);
  const procs = data.procesos.filter((p) => p.empresaId === empresa.id);
  return (
    <div>
      <PageHeader title="Insolvencia simulada" description="Caso principal: Horizonte Ficticio S.A.S. La recomendación es de revisión humana. No es un concepto jurídico." actions={<Link className="rounded-md bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href="/empresas/DEMO-EMP-0002">Abrir ficha 360</Link>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Ingresos y patrimonio</h2>
          <SimpleBars data={fins.map((f) => ({ periodo: f.periodo, ingresos: Math.round(f.ingresos / 1_000_000), patrimonio: Math.round(f.patrimonio / 1_000_000) }))} x="periodo" y="ingresos" label="Ingresos de Horizonte Ficticio" />
          <ul className="text-sm">{fins.map((f) => <li key={f.id}>{f.periodo}: activos/pasivos {(f.activos / f.pasivos).toFixed(2)} · utilidad {formatCOP(f.utilidad)}</li>)}</ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Expediente y señales</h2>
          <p className="text-sm">{exp ? `${exp.id} · ${exp.estado} · ${exp.resumen}` : "Sin expediente."}</p>
          <ol className="mt-2 list-decimal pl-4 text-sm">{fins.map((f) => <li key={f.id}>Corte {f.fechaCorte} desde {f.fuente}</li>)}{alertas.map((a) => <li key={a.id}>{a.reglaAplicada}: {a.descripcion}</li>)}</ol>
          <h3 className="mt-3 font-semibold">Procesos</h3>
          {procs.map((p) => <p key={p.id} className="text-sm">{p.radicadoFicticio} · {p.etapa}</p>)}
          <h3 className="mt-3 font-semibold">Documentos</h3>
          {docs.map((d) => <p key={d.id} className="text-sm">{d.nombre}</p>)}
          <p className="mt-3 text-sm font-semibold text-brand-burgundy">Recomendación: revisión humana antes de cualquier actuación.</p>
        </Card>
      </div>
    </div>
  );
}
