"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput } from "@/components/ui/primitives";
import { getDataset } from "@/data/seed/dataset";
import { useDemoStore } from "@/lib/storage/store";

export default function EntrarPage() {
  const router = useRouter();
  const setEmpresa = useDemoStore((s) => s.setEmpresaActiva);
  const [q, setQ] = useState("");
  const empresas = useMemo(() => getDataset().empresas, []);
  const rows = empresas.filter((e) => `${e.razonSocial} ${e.nitDemo} ${e.id}`.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
  const entrar = (id: string) => {
    setEmpresa(id);
    router.push("/dashboard");
  };
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-burgundy">Superintendencia de Sociedades</p>
      <h1 className="mt-2 text-3xl font-bold text-brand-blue">Portal de empresas CONECTA 360</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">Cada sociedad entra con su propio espacio. Desde ahí consulta documentos validados y hace seguimiento a las solicitudes enviadas por correo, FURT, ventanilla, 4-72 u otras entidades.</p>
      <label className="mt-6 text-sm font-semibold">Buscar su sociedad
        <TextInput className="mt-1" aria-label="Buscar sociedad para entrar" placeholder="Razón social, NIT o identificador" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <ul className="mt-4 divide-y divide-surface-line overflow-hidden rounded-2xl border border-surface-line bg-white">
        {rows.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-semibold">{e.razonSocial}</p>
              <p className="text-xs text-slate-500">{e.nitDemo} · {e.municipio}</p>
            </div>
            <Button onClick={() => entrar(e.id)}>Entrar</Button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-slate-500">Esta entrada identifica a la sociedad en el navegador. No es un inicio de sesión de producción.</p>
    </div>
  );
}
