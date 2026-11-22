"use client";

import Link from "next/link";
import { CANALES } from "@/features/portal/canales";
import { PageHeader } from "@/components/shared/page";
import { useEmpresaSesion } from "@/lib/storage/store";

const HREF: Record<string, string> = {
  correo: "/correspondencia",
  furt: "/solicitudes/nueva",
  ventanilla: "/correspondencia",
  "salida-472": "/salida-472",
  xroad: "/datos",
};

export default function CanalesPage() {
  const { solicitudes } = useEmpresaSesion();
  return (
    <div>
      <PageHeader title="Canales del EDI" description="Todas las solicitudes de la sociedad entran por la misma bandeja, cualquiera sea el canal de origen." />
      <div className="space-y-3">
        {CANALES.map((c) => {
          const n = solicitudes.filter((s) => s.canal === c.id).length;
          return (
            <article key={c.id} className="rounded-xl border border-surface-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-base font-bold">{c.nombre}</h2>
                <Link className="text-sm font-semibold text-brand-blue" href={HREF[c.id] ?? "/solicitudes"}>{n} solicitudes</Link>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{c.edi}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
