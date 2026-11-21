"use client";

import { PageHeader } from "@/components/shared/page";
import { Card } from "@/components/ui/primitives";
import { casoCalidadPacifico } from "@/integrations/normalization";
import { useView } from "@/lib/storage/store";

export default function GobiernoPage() {
  const data = useView();
  const empresa = data.empresas.find((e) => e.id === "DEMO-EMP-0006")!;
  const caso = casoCalidadPacifico(empresa, data.reportes);
  const duplicados = data.empresas.filter((e) => e.razonSocialCorta || e.etiquetas.includes("incompleta")).length;
  return (
    <div>
      <PageHeader title="Gobierno de datos" description="Las fuentes originales se conservan. El consolidado no las reemplaza." />
      <div className="grid gap-3 md:grid-cols-3">
        <Card><p className="text-xs">Calidad media</p><p className="text-2xl font-bold">{Math.round((data.empresas.reduce((s, e) => s + e.calidadRegistro, 0) / data.empresas.length) * 100)} %</p></Card>
        <Card><p className="text-xs">Registros con calidad baja o incompletos</p><p className="text-2xl font-bold">{duplicados}</p></Card>
        <Card><p className="text-xs">Fuentes del catálogo</p><p className="text-2xl font-bold">{data.conectores.length}</p></Card>
      </div>
      <Card className="mt-4">
        <h2 className="font-semibold">Pacífico Agroindustrial S.A.</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm">
          <li>Registros originales: {caso.registrosOriginales.map((r) => `${r.evidence.sourceId} = ${r.title}`).join(" · ")}</li>
          <li>Coincidencia: {caso.coincidencia}</li>
          <li>Conflicto: {caso.conflicto}</li>
          <li>Regla: {caso.regla}</li>
          <li>Consolidado: {caso.consolidado.title}</li>
          <li>Evidencias conservadas. Calidad {caso.consolidado.evidence.dataQuality}.</li>
        </ol>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div><p className="mb-1 text-xs font-semibold">Valor original por fuente</p><pre className="overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(caso.registrosOriginales.map((r) => r.original), null, 2)}</pre></div>
          <div><p className="mb-1 text-xs font-semibold">Resultado consolidado</p><pre className="overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(caso.consolidado.attributes, null, 2)}</pre></div>
        </div>
      </Card>
    </div>
  );
}
