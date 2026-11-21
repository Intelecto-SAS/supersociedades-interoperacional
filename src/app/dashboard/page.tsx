"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Badge, Card } from "@/components/ui/primitives";
import { dashboardMetrics } from "@/features/dashboard/metrics";
import { formatNumber } from "@/lib/formatting/format";
import { useDemoStore, useView } from "@/lib/storage/store";

const ROL_LABEL = {
  direccion: "Dirección",
  financiero: "Analista financiero",
  juridico: "Analista jurídico",
  supervisor: "Supervisor",
  integraciones: "Integraciones",
  datos: "Gobierno de datos",
} as const;

export default function DashboardPage() {
  const data = useView();
  const rol = useDemoStore((s) => s.rol);
  const [recientes, setRecientes] = useState<{ id: string; label: string; href: string }[]>([]);
  const metrics = useMemo(() => dashboardMetrics(data), [data]);
  useEffect(() => {
    const raw = localStorage.getItem("conecta360-recientes");
    if (raw) setRecientes(JSON.parse(raw) as typeof recientes);
  }, []);
  const alertas = data.alertas.filter((a) => a.estado !== "cerrada").slice(0, 5);
  const expedientes = data.expedientes.slice(0, 4);
  const foco = rol === "integraciones" ? "fuentes" : rol === "datos" ? "calidad" : rol === "juridico" ? "expedientes" : "alertas";

  return (
    <div>
      <PageHeader title="Mi espacio de trabajo" description={`${ROL_LABEL[rol]}. Corte del 29 de octubre de 2025. Lo primero es lo que está pendiente.`} />
      <Card className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Siguiente paso</p>
        {alertas[0] ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{alertas[0].descripcion}</p>
              <p className="text-sm text-slate-600">{alertas[0].empresaId} · {alertas[0].estado}</p>
            </div>
            <Link className="rounded-md bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href={`/empresas/${alertas[0].empresaId}?alerta=${alertas[0].id}`}>Abrir la sociedad</Link>
          </div>
        ) : <p className="mt-2 text-sm">No hay alertas abiertas en este contexto.</p>}
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section>
          <h2 className="mb-2 text-sm font-bold">Requiere atención</h2>
          <ul className="divide-y divide-surface-line overflow-hidden rounded-xl border border-surface-line bg-white">
            {(foco === "expedientes" ? [] : alertas).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{a.descripcion}</p>
                  <p className="text-slate-500">{a.fecha} · prioridad {a.severidad}</p>
                </div>
                <Link className="font-semibold text-brand-blue" href={`/vigilancia/alertas`}>Revisar</Link>
              </li>
            ))}
            {expedientes.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">{e.tipo}</p>
                  <p className="text-slate-500">{e.id} · {e.estado} · {e.fechaApertura}</p>
                </div>
                <Link className="font-semibold text-brand-blue" href={`/expedientes/${e.id}`}>Abrir</Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-2 text-sm font-bold">Continuar</h2>
          <ul className="rounded-xl border border-surface-line bg-white">
            {recientes.length === 0 ? <li className="px-4 py-3 text-sm text-slate-500">Las sociedades que abra quedan aquí, en este navegador.</li> : recientes.map((r) => (
              <li key={r.href} className="border-b border-surface-line px-4 py-3 text-sm last:border-0"><Link className="font-semibold text-brand-blue" href={r.href}>{r.label}</Link></li>
            ))}
          </ul>
        </section>
      </div>
      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold">Panorama</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/empresas" className="rounded-xl border border-surface-line bg-white px-4 py-3"><p className="text-xs text-slate-500">Sociedades</p><p className="text-xl font-bold">{formatNumber(metrics.empresas)}</p></Link>
          <Link href="/vigilancia/alertas" className="rounded-xl border border-surface-line bg-white px-4 py-3"><p className="text-xs text-slate-500">Alertas abiertas</p><p className="text-xl font-bold">{formatNumber(metrics.alertasAbiertas)}</p></Link>
          <Link href="/observabilidad" className="rounded-xl border border-surface-line bg-white px-4 py-3"><p className="text-xs text-slate-500">Fuentes en línea</p><p className="text-xl font-bold">{formatNumber(metrics.conectoresActivos)}</p></Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {metrics.revision.slice(0, 4).map((e) => <Link key={e.id} href={`/empresas/${e.id}`} className="rounded-md border border-surface-line bg-white px-3 py-2">{e.razonSocial} <Badge tone={e.nivelRiesgo === "critica" ? "risk" : "warn"}>{e.nivelRiesgo}</Badge></Link>)}
        </div>
      </section>
    </div>
  );
}
