"use client";

import { useState } from "react";
import { Button, Card, TextInput } from "@/components/ui/primitives";
import { formatCOP } from "@/lib/formatting/format";
import type { NormalizedRecord } from "@/integrations/types";

type LiveResponse = {
  records: NormalizedRecord[];
  durationMs: number;
  source: string;
  tokenConfigured: boolean;
  error?: string;
};

export function SecopLiveSearch({ initialDataset = "contratos" }: { initialDataset?: "contratos" | "procesos" }) {
  const [q, setQ] = useState("");
  const [dataset, setDataset] = useState(initialDataset);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<LiveResponse | null>(null);
  const [raw, setRaw] = useState<string | null>(null);

  const buscar = async (nextPage = 1) => {
    setLoading(true);
    setError("");
    setRaw(null);
    try {
      const response = await fetch(`/api/live/secop?q=${encodeURIComponent(q)}&dataset=${dataset}&page=${nextPage}`);
      const body = (await response.json()) as LiveResponse;
      if (!response.ok) {
        setData(null);
        setError(body.error ?? "No fue posible consultar la fuente.");
        return;
      }
      setPage(nextPage);
      setData(body);
    } catch {
      setError("No fue posible consultar la fuente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-blue">Consulta SECOP en vivo</h2>
          <p className="text-sm text-slate-600">Datos Abiertos Colombia. Estos registros no se asocian a las sociedades de la plataforma.</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">Fuente abierta</span>
      </div>
      <form className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_auto]" onSubmit={(event) => { event.preventDefault(); void buscar(1); }}>
        <TextInput aria-label="Buscar en SECOP" placeholder="Nombre del proveedor o NIT" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Conjunto SECOP" className="rounded-md border border-surface-line px-2" value={dataset} onChange={(e) => setDataset(e.target.value as typeof dataset)}>
          <option value="contratos">Contratos SECOP II</option>
          <option value="procesos">Procesos SECOP II</option>
        </select>
        <Button type="submit" disabled={loading || q.trim().length < 2}>{loading ? "Consultando…" : "Consultar"}</Button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-flag-red">{error}</p> : null}
      {data ? (
        <div className="mt-4">
          <p className="text-xs text-slate-500">{data.source} · {data.durationMs} ms · {data.records.length} registros · token {data.tokenConfigured ? "configurado" : "no configurado"}</p>
          {data.records.length === 0 ? <p className="mt-2 text-sm">La fuente no devolvió registros para ese criterio.</p> : (
            <ul className="mt-2 divide-y divide-surface-line">
              {data.records.map((record) => {
                const valor = record.attributes.valor_del_contrato;
                return (
                  <li key={record.id} className="py-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{record.title}</p>
                      <button className="text-xs font-semibold text-brand-blue" onClick={() => setRaw(raw === record.id ? null : record.id)}>Ver respuesta original</button>
                    </div>
                    <p className="text-slate-600">{record.evidence.sourceRecordId}{typeof valor === "string" || typeof valor === "number" ? ` · ${formatCOP(Number(valor) || 0)}` : ""}</p>
                    {raw === record.id ? <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">{JSON.stringify(record.original, null, 2)}</pre> : null}
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => void buscar(page - 1)}>Anterior</Button>
            <Button variant="secondary" disabled={loading || (data.records.length < 20)} onClick={() => void buscar(page + 1)}>Siguiente</Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
