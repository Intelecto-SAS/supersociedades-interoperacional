"use client";

import { useState } from "react";
import { Button, Card, TextInput } from "@/components/ui/primitives";
import type { CromaOperation } from "@/integrations/live/croma";

const OPTIONS: Record<string, { id: CromaOperation; label: string; placeholder: string }[]> = {
  rues: [
    { id: "rues-name", label: "Buscar por nombre", placeholder: "Razón social" },
    { id: "rues-nit", label: "Consultar NIT", placeholder: "NIT sin dígito de verificación" },
  ],
  "rama-procesos": [
    { id: "rama-entity", label: "Procesos de una sociedad", placeholder: "Razón social" },
    { id: "rama-radicado", label: "Radicado", placeholder: "23 dígitos" },
  ],
  sirem: [
    { id: "ss-companies", label: "Sociedades", placeholder: "Razón social" },
    { id: "ss-financials", label: "Estados financieros", placeholder: "NIT sin dígito de verificación" },
    { id: "ss-insolvency", label: "Insolvencia", placeholder: "Razón social o NIT" },
  ],
};

type Payload = {
  durationMs?: number;
  source?: string;
  record?: { title: string; count?: number; original: unknown; evidence: { simulated: boolean; sourceRecordId: string } };
  error?: string;
};

export function CromaLiveSearch({ connectorId }: { connectorId: keyof typeof OPTIONS }) {
  const options = OPTIONS[connectorId];
  const [operation, setOperation] = useState(options[0]!.id);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const current = options.find((item) => item.id === operation) ?? options[0]!;

  const buscar = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/live/croma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, q }),
      });
      const body = (await response.json()) as Payload;
      if (!response.ok) {
        setData(null);
        setError(body.error ?? "No fue posible consultar el registro.");
        return;
      }
      setData(body);
    } catch {
      setError("No fue posible consultar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="font-semibold text-brand-blue">Consulta de registros</h2>
      <p className="text-sm text-slate-600">El resultado no se asocia a las sociedades de la plataforma.</p>
      <form className="mt-3 grid gap-2 md:grid-cols-[200px_1fr_auto]" onSubmit={(event) => { event.preventDefault(); void buscar(); }}>
        <select aria-label="Tipo de consulta" className="rounded-md border border-surface-line px-2" value={operation} onChange={(e) => setOperation(e.target.value as CromaOperation)}>
          {options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <TextInput aria-label="Criterio" placeholder={current.placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" disabled={loading || q.trim().length < 3}>{loading ? "Consultando…" : "Consultar"}</Button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-flag-red">{error}</p> : null}
      {data?.record ? (
        <div className="mt-4 text-sm">
          <p className="font-semibold">{data.record.title}</p>
          <p className="text-xs text-slate-500">{data.source} · {data.durationMs} ms · referencia {data.record.evidence.sourceRecordId}{data.record.count != null ? ` · ${data.record.count} en la página` : ""}</p>
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-slate-50 p-3 text-xs">{JSON.stringify(data.record.original, null, 2)}</pre>
        </div>
      ) : null}
    </Card>
  );
}
