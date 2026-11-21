import Link from "next/link";
import { FLOWS } from "@/features/flows/definitions";
import { PageHeader } from "@/components/shared/page";
import { Card } from "@/components/ui/primitives";

export default function FlujosPage() {
  return (
    <div>
      <PageHeader title="Flujos de interoperabilidad" description="Ocho flujos listos para consultar, transformar y entregar un resultado." />
      <div className="grid gap-3 md:grid-cols-2">{FLOWS.map((f) => <Card key={f.id}><h2 className="font-semibold">{f.nombre}</h2><p className="text-sm text-slate-600">{f.objetivo}</p><Link className="mt-2 inline-block text-sm font-semibold text-brand-burgundy" href={`/flujos/${f.id}`}>Abrir flujo</Link></Card>)}</div>
    </div>
  );
}
