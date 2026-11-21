"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card } from "@/components/ui/primitives";
import { dashboardMetrics } from "@/features/dashboard/metrics";
import { formatNumber } from "@/lib/formatting/format";
import { toCsv } from "@/lib/export/csv";
import { useDemoStore, useView } from "@/lib/storage/store";

const TIPOS = ["Perfil empresarial", "Riesgo financiero", "Insolvencia", "Contratación", "Estado de integraciones", "Calidad de datos", "Resumen ejecutivo"];

export default function InformesPage() {
  const data = useView();
  const escenario = useDemoStore((s) => s.escenario);
  const [tipo, setTipo] = useState(TIPOS[6]);
  const [empresa, setEmpresa] = useState("DEMO-EMP-0002");
  const [periodo, setPeriodo] = useState("2024");
  const [secciones, setSecciones] = useState<string[]>(["Indicadores", "Hallazgos", "Fuentes"]);
  const metrics = dashboardMetrics(data);
  const emp = data.empresas.find((e) => e.id === empresa);
  const json = { titulo: tipo, generado: "2025-10-29", escenario, empresa: emp?.razonSocial, periodo, secciones, indicadores: { empresas: metrics.empresas, alertas: metrics.alertasAbiertas }, simulated: true };
  const toggle = (s: string) => setSecciones((cur) => cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  return (
    <div className="print:bg-white">
      <PageHeader title="Informes gerenciales" description="La acción de PDF abre la vista de impresión del navegador. También puede descargar JSON o CSV." actions={<><Button variant="secondary" onClick={() => window.print()}>Imprimir o guardar como PDF</Button><Button variant="secondary" onClick={() => { const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "informe-demo.json"; a.click(); }}>Descargar JSON</Button><Button variant="secondary" onClick={() => { const blob = new Blob([toCsv([{ tipo, empresas: metrics.empresas, alertas: metrics.alertasAbiertas }])], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "informe-demo.csv"; a.click(); }}>Descargar CSV</Button></>} />
      <div className="no-print mb-4 grid gap-2 md:grid-cols-2">
        <select aria-label="Tipo de informe" className="rounded border px-2 py-1" value={tipo} onChange={(e) => setTipo(e.target.value)}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select>
        <select aria-label="Empresa del informe" className="rounded border px-2 py-1" value={empresa} onChange={(e) => setEmpresa(e.target.value)}>{data.empresas.slice(0, 10).map((e) => <option key={e.id} value={e.id}>{e.razonSocial}</option>)}</select>
        <select aria-label="Periodo del informe" className="rounded border px-2 py-1" value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option>2022</option><option>2023</option><option>2024</option></select>
        <div className="flex flex-wrap gap-2 text-sm">{["Indicadores", "Hallazgos", "Fuentes", "Advertencias"].map((s) => <label key={s}><input type="checkbox" checked={secciones.includes(s)} onChange={() => toggle(s)} /> {s}</label>)}</div>
      </div>
      <Card>
        <p className="text-xs uppercase text-brand-burgundy">DEMO · DATOS SIMULADOS</p>
        <h2 className="text-xl font-bold">{tipo}</h2>
        <p className="text-sm">Generado el 29 de octubre de 2025 · Escenario {escenario} · Periodo {periodo}</p>
        <p className="mt-3 text-sm">Resumen: el laboratorio observa {formatNumber(metrics.empresas)} empresas ficticias y {formatNumber(metrics.alertasAbiertas)} alertas abiertas. {emp?.razonSocial} está en riesgo {emp?.nivelRiesgo}.</p>
        {secciones.includes("Indicadores") ? <p className="mt-2 text-sm">Calidad media {metrics.calidad}. Conectores operativos {metrics.conectoresActivos}.</p> : null}
        {secciones.includes("Hallazgos") ? <p className="mt-2 text-sm">Horizonte Ficticio S.A.S. concentra las señales de insolvencia diseñadas para la presentación.</p> : null}
        {secciones.includes("Fuentes") ? <p className="mt-2 text-sm">Fuentes ficticias: RUES, SIREM, SECOP II, Rama Judicial. Acceso real: por verificar.</p> : null}
        <p className="mt-4 text-xs">Advertencia: prototipo independiente. No está conectado a sistemas oficiales. Pie de página de demostración.</p>
      </Card>
    </div>
  );
}
