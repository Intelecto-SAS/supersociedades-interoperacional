"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { Badge } from "@/components/ui/primitives";
import { useEmpresaSesion } from "@/lib/storage/store";

export default function Salida472Page() {
  const { solicitudes, empresa } = useEmpresaSesion();
  const salidas = solicitudes.filter((s) => s.canal === "salida-472" || s.guia472);
  return (
    <div>
      <PageHeader title="Salida por 4-72" description={`Las guías de ${empresa.razonSocial} se crean desde el radicado. Los acuses de envío, entrega y apertura quedan en GEDESS.`} />
      {salidas.length === 0 ? <p className="text-sm text-slate-500">Esta sociedad no tiene salidas 4-72 en la muestra.</p> : (
        <div className="space-y-3">
          {salidas.map((s) => (
            <article key={s.id} className="rounded-xl border border-surface-line bg-white p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-semibold">{s.asunto}</p>
                <Badge tone="info">Guía {s.guia472 ?? "sin guía"}</Badge>
              </div>
              <p className="mt-1 text-slate-500">Radicado {s.radicadoGedess}</p>
              <ol className="mt-3 grid gap-2 sm:grid-cols-3">
                {(["envio", "entrega", "apertura"] as const).map((tipo) => {
                  const acuse = s.acuses.find((a) => a.tipo === tipo);
                  return (
                    <li key={tipo} className="rounded-lg border border-surface-line p-3">
                      <p className="text-xs uppercase text-slate-500">{tipo}</p>
                      <p className="font-semibold">{acuse ? acuse.estado : "pendiente"}</p>
                      <p>{acuse ? acuse.fecha.replace("T", " ") : "—"}</p>
                    </li>
                  );
                })}
              </ol>
              <Link className="mt-3 inline-block font-semibold text-brand-blue" href={`/solicitudes/${s.id}`}>Ver solicitud</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
