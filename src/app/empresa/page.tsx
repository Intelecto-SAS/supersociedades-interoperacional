"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { Badge } from "@/components/ui/primitives";
import { formatCOP } from "@/lib/formatting/format";
import { useEmpresaSesion } from "@/lib/storage/store";

export default function EmpresaPortalPage() {
  const { empresa, reportes, documentos, documentosEstado } = useEmpresaSesion();
  const ultimo = reportes.find((r) => r.periodo === "2024") ?? reportes[0];
  const validados = documentos.filter((d) => documentosEstado[d.id]?.validado).length;
  return (
    <div>
      <PageHeader title={empresa.razonSocial} description={`${empresa.id} · ${empresa.nitDemo} · ${empresa.tipoSocietario} · ${empresa.municipio}, ${empresa.departamento}`} actions={<Link className="rounded-md bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href="/solicitudes/nueva">Nueva solicitud</Link>} />
      <p className="mb-4 text-sm">Esta es la ficha de la sociedad en sesión. Los datos de registro, financieros y documentales se muestran con la fecha en que cada fuente los entregó.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-xl border border-surface-line bg-white p-4">
          <h2 className="text-sm font-bold">Situación registral</h2>
          <p className="mt-2 text-sm">Matrícula {empresa.estadoMatriculaSimulado}. Tamaño {empresa.tamanoEmpresarial}. Supervisión {empresa.estadoSupervisionSimulado}.</p>
          <p className="mt-2 text-xs text-slate-500">Fuente RUES · dato del 12 sep 2025</p>
        </section>
        <section className="rounded-xl border border-surface-line bg-white p-4">
          <h2 className="text-sm font-bold">Último ejercicio</h2>
          {ultimo ? <p className="mt-2 text-sm">Ingresos {formatCOP(ultimo.ingresos)}. Utilidad {formatCOP(ultimo.utilidad)}.</p> : <p className="mt-2 text-sm">Sin reporte.</p>}
          <p className="mt-2 text-xs text-slate-500">Fuente SIREM · corte {ultimo?.fechaCorte ?? "—"}</p>
        </section>
        <section className="rounded-xl border border-surface-line bg-white p-4">
          <h2 className="text-sm font-bold">Documentos</h2>
          <p className="mt-2 text-sm">{validados} validados de {documentos.length} en el expediente de la sociedad.</p>
          <Link className="mt-2 inline-block text-sm font-semibold text-brand-blue" href="/documentos">Abrir documentos</Link>
        </section>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-surface-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr>{["Periodo", "Ingresos", "Activos", "Pasivos", "Fuente", "Fecha del dato"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {reportes.map((r) => (
              <tr key={r.id} className="border-t border-surface-line">
                <td className="px-3 py-2">{r.periodo}</td>
                <td className="px-3 py-2 tabular-nums">{formatCOP(r.ingresos)}</td>
                <td className="px-3 py-2 tabular-nums">{formatCOP(r.activos)}</td>
                <td className="px-3 py-2 tabular-nums">{formatCOP(r.pasivos)}</td>
                <td className="px-3 py-2">{r.fuente}</td>
                <td className="px-3 py-2">{r.fechaCorte}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {empresa.razonSocialCorta ? <p className="mt-3 text-sm">Una fuente externa usa el alias <Badge>{empresa.razonSocialCorta}</Badge>. El consolidado conserva {empresa.razonSocial}.</p> : null}
    </div>
  );
}
