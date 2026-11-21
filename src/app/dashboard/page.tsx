"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { SimpleBars } from "@/components/charts/bars";
import { Badge, Card } from "@/components/ui/primitives";
import { dashboardMetrics } from "@/features/dashboard/metrics";
import { formatNumber, formatPercent } from "@/lib/formatting/format";
import { useView } from "@/lib/storage/store";

export default function DashboardPage() {
  const data = useView();
  const [periodo, setPeriodo] = useState("2024");
  const metrics = useMemo(() => dashboardMetrics(data), [data]);
  const kpis = [
    ["Empresas analizadas", formatNumber(metrics.empresas), "/empresas"],
    ["Fuentes en catálogo", formatNumber(metrics.fuentes), "/integraciones"],
    ["Fuentes en línea", formatNumber(metrics.conectoresActivos), "/observabilidad"],
    ["Alertas abiertas", formatNumber(metrics.alertasAbiertas), "/vigilancia/alertas"],
    ["Expedientes en seguimiento", formatNumber(metrics.expedientes), "/expedientes"],
    ["Procesos automatizados", String(metrics.flujos), "/flujos"],
    ["Calidad media de datos", formatPercent(metrics.calidad), "/gobierno-datos"],
  ];
  return (
    <div>
      <PageHeader title="Panel ejecutivo" description={`Corte del 29 de octubre de 2025. Periodo financiero ${periodo}. Los indicadores salen de las sociedades, alertas y fuentes cargadas.`} actions={<label className="text-sm font-semibold text-slate-600">Periodo <select aria-label="Periodo" className="ml-2 h-10 rounded-full border px-3" value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option>2022</option><option>2023</option><option>2024</option></select></label>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(([label, value, href]) => (
          <Link key={label} href={href}><Card><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-brand-burgundy">{value}</p></Card></Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold">Empresas por sector</h2>
          <SimpleBars data={metrics.sectores} x="sector" y="total" label="Empresas por sector" />
          <div className="mt-2 flex flex-wrap gap-2">{metrics.sectores.slice(0, 6).map((s) => <Link key={s.sector} className="text-xs text-brand-blue underline" href={`/empresas?sector=${encodeURIComponent(s.sector)}`}>{s.sector}</Link>)}</div>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Distribución de riesgos</h2>
          <SimpleBars data={metrics.riesgos} x="nivel" y="total" label="Empresas por nivel de riesgo" />
          <Link className="text-sm text-brand-blue underline" href="/vigilancia">Abrir vigilancia</Link>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Evolución de alertas</h2>
          <SimpleBars data={metrics.alertasSerie} x="mes" y="total" label="Alertas por mes" />
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Estado de las fuentes</h2>
          <ul className="space-y-1 text-sm">{Object.entries(metrics.integraciones).map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><strong>{v}</strong></li>)}</ul>
          <p className="mt-3 text-xs text-slate-500">El estado cambia con el contexto de operación seleccionado.</p>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-2 font-semibold">Empresas que requieren revisión</h2>
          <ul className="space-y-2 text-sm">{metrics.revision.map((e) => <li key={e.id}><Link className="font-semibold text-brand-blue" href={`/empresas/${e.id}`}>{e.razonSocial}</Link> <Badge tone={e.nivelRiesgo === "critica" ? "risk" : "warn"}>{e.nivelRiesgo}</Badge></li>)}</ul>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Actividad reciente</h2>
          <ul className="space-y-2 text-sm">{data.auditoria.slice(0, 4).map((a) => <li key={a.id}>{a.detalle}</li>)}{data.alertas.slice(0, 3).map((a) => <li key={a.id}>{a.fecha}: {a.descripcion}</li>)}</ul>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Flujos y calidad</h2>
          <p className="text-sm">Ocho flujos precargados listos para ejecutarse.</p>
          <ul className="mt-2 text-sm">{metrics.calidadFuente.map((f) => <li key={f.fuente} className="flex justify-between"><span>{f.fuente}</span><span>{f.calidad} %</span></li>)}</ul>
          <div className="mt-3 flex flex-col gap-1 text-sm">
            <Link className="text-brand-burgundy font-semibold" href="/demo">Casos de uso</Link>
            <Link href="/insolvencia">Caso de insolvencia</Link>
            <Link href="/empresas/DEMO-EMP-0001">Empresa en 360°</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
