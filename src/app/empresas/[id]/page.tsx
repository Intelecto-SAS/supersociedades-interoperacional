"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useInspector } from "@/components/layout/inspector";
import { PageHeader } from "@/components/shared/page";
import { SimpleBars } from "@/components/charts/bars";
import { Badge, Button, Card, Empty } from "@/components/ui/primitives";
import { evaluarEmpresa } from "@/features/risk/engine";
import { formatCOP, formatDate } from "@/lib/formatting/format";
import { useDemoStore, useView } from "@/lib/storage/store";
import { empresaFromSource, reporteNormalizado } from "@/integrations/normalization";

const TABS = ["Resumen", "Empresarial", "Financiera", "Contratación", "Jurídico", "Insolvencia", "Documentos", "Relaciones", "Alertas", "Trazabilidad"] as const;
const GRUPOS = [
  { nombre: "Resumen", tabs: ["Resumen"] },
  { nombre: "Situación", tabs: ["Empresarial", "Financiera", "Insolvencia"] },
  { nombre: "Procesos", tabs: ["Contratación", "Jurídico", "Documentos", "Alertas"] },
  { nombre: "Relaciones", tabs: ["Relaciones"] },
  { nombre: "Fuentes", tabs: ["Trazabilidad"] },
] as const;

export default function EmpresaPage() {
  const { id } = useParams<{ id: string }>();
  const alertaId = useSearchParams().get("alerta");
  const inspector = useInspector();
  const data = useView();
  const addExpediente = useDemoStore((s) => s.addExpediente);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");
  const [compare, setCompare] = useState("DEMO-EMP-0010");
  const [notice, setNotice] = useState("");
  const [raw, setRaw] = useState(false);
  const empresa = data.empresas.find((e) => e.id === id);
  const reportes = data.reportes.filter((r) => r.empresaId === id);
  const contratos = data.contratos.filter((c) => c.empresaId === id);
  const procesos = data.procesos.filter((p) => p.empresaId === id);
  const docs = data.documentos.filter((d) => d.empresaId === id);
  const alertas = data.alertas.filter((a) => a.empresaId === id);
  const relaciones = data.relaciones.filter((r) => r.origen === id || r.destino === id);
  const expedientes = data.expedientes.filter((e) => e.empresaId === id);
  const evaluacion = useMemo(() => empresa ? evaluarEmpresa(data, empresa.id) : [], [data, empresa]);
      useEffect(() => {
    if (!empresa) return;
    const key = "conecta360-recientes";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as { id: string; label: string; href: string }[];
    const next = [{ id: empresa.id, label: empresa.razonSocial, href: `/empresas/${empresa.id}` }, ...prev.filter((r) => r.id !== empresa.id)].slice(0, 6);
    localStorage.setItem(key, JSON.stringify(next));
  }, [empresa]);
  if (!empresa) return <Empty>No hay una sociedad con el identificador {id}.</Empty>;
  const original = empresaFromSource(empresa, "rues");
  const normalizado = reporteNormalizado(reportes[0] ?? {
    id: "na", empresaId: empresa.id, periodo: "2024", ingresos: 0, activos: 0, pasivos: 0, patrimonio: 0, utilidad: 0, fuente: "sirem", fechaCorte: "2024-12-31", calidadDato: empresa.calidadRegistro,
  });

  const exportar = () => {
    const blob = new Blob([JSON.stringify({ empresa, reportes, contratos, procesos, alertas, simulated: true }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${empresa.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/empresas", label: "Empresas" }, { href: `/empresas/${empresa.id}`, label: empresa.id }]}
        title={empresa.razonSocial}
        description={`${empresa.id} · ${empresa.nitDemo} · ${empresa.sector} · ${empresa.municipio}, ${empresa.departamento}`}
        actions={
          <>
            <Button onClick={() => { addExpediente({ id: `DEMO-EXP-LOCAL-${empresa.id}`, empresaId: empresa.id, tipo: "Seguimiento", estado: "abierto", responsableDemo: "Equipo jurídico", resumen: alertaId ? `Seguimiento de ${alertaId}.` : "Expediente abierto desde la ficha.", fechaApertura: "2025-10-29" }); setNotice("Expediente creado."); }}>Abrir expediente</Button>
            <Button variant="secondary" onClick={() => setNotice(`Alerta de revisión creada en esta sesión para ${empresa.id}.`)}>Crear alerta</Button>
            <Button variant="secondary" onClick={() => { setNotice("Informe listo en la vista de impresión."); window.print(); }}>Generar informe</Button>
            <Button variant="secondary" onClick={(event) => inspector.open({ title: "Evidencia del registro", body: <div className="space-y-2"><p>Fuente de la ficha: plataforma. Identificador {empresa.id}.</p><p>Fecha de corte visible: 29 oct 2025.</p><p className="font-semibold">Original</p><pre className="overflow-auto text-xs">{JSON.stringify(original, null, 2)}</pre><p className="font-semibold">Normalizado</p><pre className="overflow-auto text-xs">{JSON.stringify(normalizado, null, 2)}</pre></div> }, event.currentTarget)}>Ver evidencia</Button>
            <Button variant="secondary" onClick={exportar}>Exportar ficha</Button>
          </>
        }
      />
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone="info">{empresa.estadoMatriculaSimulado}</Badge>
        <Badge tone={empresa.nivelRiesgo === "critica" || empresa.nivelRiesgo === "alta" ? "risk" : "ok"}>Riesgo {empresa.nivelRiesgo}</Badge>
        <Badge>Actualizado el 29 oct 2025</Badge>
      </div>
      {alertaId ? <p className="mb-3 text-sm">Llegó desde la alerta {alertaId}. La actuación principal abre el expediente con esa referencia.</p> : null}
      {notice ? <p role="status" className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{notice}</p> : null}
      <div className="mb-2 flex flex-wrap gap-2">{GRUPOS.map((g) => <button key={g.nombre} className="rounded-md border border-surface-line bg-white px-2 py-1 text-xs font-semibold" onClick={() => setTab(g.tabs[0])}>{g.nombre}</button>)}</div>
      <div className="mb-4 flex gap-1 overflow-x-auto" role="tablist">
        {TABS.map((item) => <button key={item} role="tab" aria-selected={tab === item} className={`rounded-full px-3 py-1 text-sm ${tab === item ? "bg-brand-blue text-white" : "bg-white"}`} onClick={() => setTab(item)}>{item}</button>)}
      </div>
      {tab === "Resumen" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="font-semibold">Línea de tiempo</h2>
            <ol className="mt-2 space-y-2 text-sm">{[{ f: empresa.fechaConstitucionFicticia, t: "Constitución" }, ...reportes.map((r) => ({ f: r.fechaCorte, t: `Corte ${r.periodo}` })), ...alertas.slice(0, 3).map((a) => ({ f: a.fecha, t: a.descripcion }))].map((e) => <li key={e.t}><span className="text-slate-500">{formatDate(e.f)}</span> · {e.t}</li>)}</ol>
          </Card>
          <Card>
            <h2 className="font-semibold">Ingresos</h2>
            <SimpleBars data={reportes.map((r) => ({ periodo: r.periodo, ingresos: Math.round(r.ingresos / 1_000_000) }))} x="periodo" y="ingresos" label="Ingresos en millones de pesos" />
            <p className="text-xs text-slate-500">Valores en millones de pesos colombianos.</p>
          </Card>
        </div>
      )}
      {tab === "Empresarial" && <Card><p>Tipo {empresa.tipoSocietario}. CIIU {empresa.actividadCiiu || "sin dato"}. Tamaño {empresa.tamanoEmpresarial}. Supervisión {empresa.estadoSupervisionSimulado}.</p>{empresa.razonSocialCorta ? <p className="mt-2">Alias en la fuente tributaria: {empresa.razonSocialCorta}.</p> : null}</Card>}
      {tab === "Financiera" && <Card><table className="w-full text-sm"><thead><tr>{["Periodo", "Ingresos", "Activos", "Pasivos", "Patrimonio", "Utilidad", "Fuente"].map((h) => <th key={h} className="text-left">{h}</th>)}</tr></thead><tbody>{reportes.map((r) => <tr key={r.id}><td>{r.periodo}</td><td>{formatCOP(r.ingresos)}</td><td>{formatCOP(r.activos)}</td><td>{formatCOP(r.pasivos)}</td><td>{formatCOP(r.patrimonio)}</td><td>{formatCOP(r.utilidad)}</td><td>{r.fuente}</td></tr>)}</tbody></table></Card>}
      {tab === "Contratación" && <Card>{contratos.length ? contratos.slice(0, 12).map((c) => <p key={c.id} className="text-sm">{c.id} · {formatCOP(c.valorCOP)} · {c.entidadContratanteFicticia}</p>) : <Empty>Sin contratos en la muestra.</Empty>}</Card>}
      {tab === "Jurídico" && <Card>{procesos.length ? procesos.map((p) => <p key={p.id} className="text-sm">{p.radicadoFicticio} · {p.tipo} · {p.estado}</p>) : <Empty>Sin procesos asociados.</Empty>}</Card>}
      {tab === "Insolvencia" && <Card><p>{empresa.etiquetas.includes("insolvencia") ? "Esta sociedad concentra las señales de dificultad financiera." : "No es el caso principal de insolvencia."}</p><Link className="text-brand-blue underline" href="/insolvencia">Abrir módulo</Link><ul className="mt-2 text-sm">{expedientes.map((e) => <li key={e.id}><Link href={`/expedientes/${e.id}`}>{e.id}</Link> · {e.estado}</li>)}</ul></Card>}
      {tab === "Documentos" && <Card>{docs.slice(0, 8).map((d) => <p key={d.id} className="text-sm">{d.nombre} · {d.clasificacion}</p>)}</Card>}
      {tab === "Relaciones" && (
        <Card>
          <p className="mb-2 text-sm">Gráfico textual de vínculos. Cada arista conserva su fuente.</p>
          <svg viewBox="0 0 360 160" className="w-full max-w-xl" role="img" aria-label="Relaciones de la empresa">
            <circle cx="180" cy="80" r="28" fill="#962D46" />
            <text x="180" y="84" textAnchor="middle" fontSize="10" fill="white">Empresa</text>
            {relaciones.slice(0, 6).map((r, i) => {
              const angle = (Math.PI * 2 * i) / Math.max(relaciones.length, 1);
              const x = 180 + Math.cos(angle) * 120;
              const y = 80 + Math.sin(angle) * 50;
              const otro = r.origen === id ? r.destino : r.origen;
              return <g key={r.id}><line x1="180" y1="80" x2={x} y2={y} stroke="#2A477A" /><text x={x} y={y} fontSize="9">{otro}</text></g>;
            })}
          </svg>
          {relaciones.map((r) => <p key={r.id} className="text-sm">{r.tipoRelacion}: {r.origen} → {r.destino} · {r.fuente} <Link className="text-brand-blue" href={`/empresas/${r.origen === id ? r.destino : r.origen}`}>abrir</Link></p>)}
        </Card>
      )}
      {tab === "Alertas" && <Card>{alertas.map((a) => <p key={a.id} className="mb-2 text-sm"><strong>{a.reglaAplicada}</strong> · {a.descripcion}</p>)}<p className="text-xs">Evaluación en vivo: {evaluacion.length} reglas disparadas. El resultado queda para revisión del equipo responsable.</p></Card>}
      {tab === "Trazabilidad" && (
        <Card>
          <div className="mb-2 flex gap-2">
            <Button variant="secondary" onClick={() => setRaw(true)}>Ver respuesta original</Button>
            <Button variant="secondary" onClick={() => setRaw(false)}>Ver datos normalizados</Button>
          </div>
          <pre className="overflow-auto rounded bg-slate-50 p-3 text-xs">{JSON.stringify(raw ? original.original : normalizado.attributes, null, 2)}</pre>
          <p className="mt-2 text-xs">Fuente {original.evidence.sourceId}. simulated: true. Confianza {original.evidence.confidence}.</p>
        </Card>
      )}
      <Card className="mt-4">
        <label className="text-sm">Comparar con
          <select className="ml-2 rounded border px-2 py-1" value={compare} onChange={(e) => setCompare(e.target.value)}>
            {data.empresas.slice(0, 10).filter((e) => e.id !== empresa.id).map((e) => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}
          </select>
        </label>
        <p className="mt-2 text-sm">Último ingreso de esta ficha: {formatCOP(reportes.at(-1)?.ingresos ?? 0)}. Comparada: {formatCOP(data.reportes.filter((r) => r.empresaId === compare).at(-1)?.ingresos ?? 0)}.</p>
      </Card>
    </div>
  );
}
