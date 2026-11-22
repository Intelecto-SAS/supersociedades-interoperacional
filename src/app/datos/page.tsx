"use client";

import { PageHeader } from "@/components/shared/page";
import { useEmpresaSesion } from "@/lib/storage/store";

export default function DatosPage() {
  const { empresa, reportes, solicitudes } = useEmpresaSesion();
  const xroad = solicitudes.filter((s) => s.canal === "xroad" || s.fuenteXroad);
  const filas = [
    { entidad: "RUES", campo: "Razón social", valor: empresa.razonSocialCorta ?? empresa.razonSocial, fecha: "2025-09-12" },
    { entidad: "SIREM", campo: "Razón social", valor: empresa.razonSocial, fecha: reportes[0]?.fechaCorte ?? "2024-12-31" },
    { entidad: "DIAN", campo: "NIT de trabajo", valor: empresa.nitDemo, fecha: "2025-08-20" },
    { entidad: "SIREM", campo: "Ingresos 2024", valor: String(reportes.find((r) => r.periodo === "2024")?.ingresos ?? "—"), fecha: "2024-12-31" },
  ];
  return (
    <div>
      <PageHeader title="Datos validados" description="Consultas en línea por X-Road. Cada dato muestra la entidad y la fecha en que se obtuvo. No se mezcla con un identificador distinto de esta sociedad." />
      <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr>{["Entidad", "Campo", "Valor", "Fecha del dato"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={`${f.entidad}-${f.campo}`} className="border-t border-surface-line">
                <td className="px-3 py-3">{f.entidad}</td>
                <td className="px-3 py-3">{f.campo}</td>
                <td className="px-3 py-3 font-semibold">{f.valor}</td>
                <td className="px-3 py-3">{f.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {xroad.map((s) => (
        <p key={s.id} className="mt-3 text-sm">{s.resumen}</p>
      ))}
    </div>
  );
}
