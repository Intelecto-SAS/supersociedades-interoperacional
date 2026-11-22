"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page";
import { Button, TextInput } from "@/components/ui/primitives";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function EmpresasPage() {
  const data = useView();
  const router = useRouter();
  const setEmpresa = useDemoStore((s) => s.setEmpresaActiva);
  const [q, setQ] = useState("");
  const rows = useMemo(() => data.empresas.filter((e) => `${e.razonSocial} ${e.id} ${e.nitDemo}`.toLowerCase().includes(q.toLowerCase())), [data.empresas, q]);
  return (
    <div>
      <PageHeader title="Cambiar de sociedad" description="Elija la sociedad con la que desea trabajar en el portal. Cada una tiene su documentación y sus solicitudes." />
      <TextInput aria-label="Filtrar empresas" className="mb-3" placeholder="Nombre o NIT" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto rounded-xl border border-surface-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500"><tr>{["Razón social", "Identificador", "Municipio", ""].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {rows.slice(0, 40).map((e) => (
              <tr key={e.id} className="border-t border-surface-line">
                <td className="px-3 py-2 font-semibold">{e.razonSocial}</td>
                <td className="px-3 py-2">{e.id}</td>
                <td className="px-3 py-2">{e.municipio}</td>
                <td className="px-3 py-2"><Button onClick={() => { setEmpresa(e.id); router.push("/dashboard"); }}>Entrar</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
