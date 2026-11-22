"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { canalPorId } from "@/features/portal/canales";
import { PageHeader } from "@/components/shared/page";
import { Badge, Button, Empty } from "@/components/ui/primitives";
import { useDemoStore, useEmpresaSesion } from "@/lib/storage/store";

export default function SolicitudDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { solicitudes, documentos, empresa } = useEmpresaSesion();
  const update = useDemoStore((s) => s.updateSolicitud);
  const auditar = useDemoStore((s) => s.auditar);
  const sol = solicitudes.find((s) => s.id === id);
  if (!sol) return <Empty>No hay una solicitud {id} para {empresa.razonSocial}.</Empty>;
  const canal = canalPorId(sol.canal);
  const docs = documentos.filter((d) => sol.documentoIds.includes(d.id));
  return (
    <div>
      <PageHeader crumbs={[{ href: "/solicitudes", label: "Solicitudes" }, { href: `/solicitudes/${sol.id}`, label: sol.id }]} title={sol.asunto} description={`${canal.nombre} · ${sol.tramite}`} />
      <p className="mb-4 max-w-3xl text-sm text-slate-600">{canal.edi}</p>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <section className="rounded-xl border border-surface-line bg-white p-4 text-sm">
          <p>{sol.resumen}</p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">Fecha real de llegada</dt><dd>{sol.fechaLlegada.replace("T", " ")}</dd></div>
            <div><dt className="text-xs text-slate-500">Radicado GEDESS</dt><dd>{sol.radicadoGedess ?? "Pendiente"}</dd></div>
            <div><dt className="text-xs text-slate-500">Remitente</dt><dd>{sol.remitente} {sol.remitenteValidado ? <Badge tone="ok">Validado en la fuente</Badge> : <Badge tone="warn">Sin validar</Badge>}</dd></div>
            <div><dt className="text-xs text-slate-500">Clasificación y reparto</dt><dd>{sol.clasificacion} → {sol.repartoSugerido}</dd></div>
          </dl>
          {sol.prioridad === "tutela" ? <p className="mt-3"><Badge tone="risk">Tutela</Badge> Quedó priorizada de forma automática.</p> : null}
          {sol.canal === "correo" && !sol.confirmadoPorPersona ? (
            <Button className="mt-4" onClick={() => { update(sol.id, { confirmadoPorPersona: true, estado: "radicada", fechaRadicacion: "2025-10-29", radicadoGedess: `GEDESS-${sol.id}` }); auditar("confirma_reparto", sol.id); }}>Confirmar reparto</Button>
          ) : null}
          {sol.acuses.length ? (
            <div className="mt-4">
              <h2 className="font-semibold">Acuses 4-72 en GEDESS</h2>
              <ul className="mt-2 space-y-1">{sol.acuses.map((a) => <li key={a.tipo}>{a.tipo}: {a.fecha.replace("T", " ")} · {a.estado}</li>)}</ul>
            </div>
          ) : null}
          {sol.fuenteXroad ? (
            <div className="mt-4">
              <h2 className="font-semibold">Dato consultado por X-Road</h2>
              <p>{sol.fuenteXroad.entidad} · {sol.fuenteXroad.campo}: {sol.fuenteXroad.valor} · fecha del dato {sol.fuenteXroad.fechaDato}</p>
            </div>
          ) : null}
          {docs.length ? <ul className="mt-4">{docs.map((d) => <li key={d.id}>{d.nombre}</li>)}</ul> : null}
        </section>
        <aside className="rounded-xl border border-surface-line bg-white p-4 text-sm">
          <p>Estado: <strong>{sol.estado.replace("_", " ")}</strong></p>
          <p className="mt-2">Confirmado por una persona: {sol.confirmadoPorPersona ? "sí" : "no"}</p>
          <Link className="mt-4 block font-semibold text-brand-blue" href="/correspondencia">Ver correspondencia</Link>
          {sol.guia472 ? <Link className="mt-2 block font-semibold text-brand-blue" href="/salida-472">Seguir guía {sol.guia472}</Link> : null}
        </aside>
      </div>
    </div>
  );
}
