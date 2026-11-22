"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { Badge, Button } from "@/components/ui/primitives";
import { useDemoStore, useEmpresaSesion } from "@/lib/storage/store";

export default function CorrespondenciaPage() {
  const { solicitudes, empresa } = useEmpresaSesion();
  const update = useDemoStore((s) => s.updateSolicitud);
  const auditar = useDemoStore((s) => s.auditar);
  const correos = solicitudes.filter((s) => s.canal === "correo");
  const ventanilla = solicitudes.filter((s) => s.canal === "ventanilla");
  return (
    <div>
      <PageHeader title="Correspondencia" description={`Entrada única de ${empresa.razonSocial}. El correo conserva la hora real de llegada y valida al remitente. La ventanilla entra por el mismo canal después del escaneo.`} />
      <h2 className="mb-2 text-base font-bold">Correo</h2>
      <p className="mb-3 max-w-3xl text-sm text-slate-600">La clasificación y el reparto se sugieren en el navegador. Una persona confirma. Las tutelas se priorizan solas.</p>
      <div className="space-y-2">
        {correos.length === 0 ? <p className="text-sm text-slate-500">Esta sociedad no tiene correos en la muestra.</p> : correos.map((s) => (
          <article key={s.id} className="rounded-xl border border-surface-line bg-white p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{s.asunto}</p>
                <p className="text-slate-500">Llegó {s.fechaLlegada.replace("T", " ")} · remitente {s.remitente}</p>
              </div>
              {s.prioridad === "tutela" ? <Badge tone="risk">Tutela priorizada</Badge> : <Badge>Ordinaria</Badge>}
            </div>
            <p className="mt-2">Clasificación: {s.clasificacion}. Reparto sugerido: {s.repartoSugerido}.</p>
            <p>Remitente {s.remitenteValidado ? "validado en la fuente" : "sin validar"}.</p>
            <div className="mt-3 flex gap-2">
              <Link className="font-semibold text-brand-blue" href={`/solicitudes/${s.id}`}>Abrir solicitud</Link>
              {!s.confirmadoPorPersona ? <Button variant="secondary" onClick={() => { update(s.id, { confirmadoPorPersona: true, estado: "radicada", radicadoGedess: `GEDESS-${s.id}`, fechaRadicacion: "2025-10-29" }); auditar("confirma_reparto", s.id); }}>Confirmar reparto</Button> : <Badge tone="ok">Confirmado</Badge>}
            </div>
          </article>
        ))}
      </div>
      <h2 className="mb-2 mt-8 text-base font-bold">Ventanilla y mensajería</h2>
      <ul className="divide-y divide-surface-line rounded-xl border border-surface-line bg-white text-sm">
        {ventanilla.slice(0, 8).map((s) => (
          <li key={s.id} className="flex justify-between gap-3 px-4 py-3">
            <span>{s.asunto}</span>
            <Link className="font-semibold text-brand-blue" href={`/solicitudes/${s.id}`}>{s.radicadoGedess}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
