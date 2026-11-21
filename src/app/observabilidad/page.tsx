"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { getAdapter } from "@/integrations/registry";
import { isError } from "@/integrations/types";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function ObservabilidadPage() {
  const data = useView();
  const simular = useDemoStore((s) => s.simularConector);
  const [msg, setMsg] = useState("");
  const [id, setId] = useState("rues");
  const connector = data.conectores.find((c) => c.id === id)!;
  const reintentar = () => {
    const adapter = getAdapter(id);
    const result = adapter?.sync();
    setMsg(isError(result) ? result.message : result ? `${result.message} (${result.durationMs} ms)` : "Sin adaptador");
  };
  return (
    <div>
      <PageHeader title="Observabilidad" description="Los estados son simulados. No hay acuerdos de nivel de servicio ni disponibilidad real." />
      <Card className="mb-4">
        <label className="text-sm">Conector
          <select className="ml-2 rounded border px-2 py-1" value={id} onChange={(e) => setId(e.target.value)}>{data.conectores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
        </label>
        <p className="mt-2 text-sm">Estado {connector.estadoSimulado}. Latencia base {connector.tiempoRespuestaMs} ms. Ejecuciones de catálogo: {data.ejecuciones.filter((e) => e.sourceId === id).length}.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="danger" onClick={() => { simular(id, { estado: "caido" }); setMsg("Caída simulada. Los flujos que lean esta fuente deben detenerse de forma controlada."); }}>Simular caída</Button>
          <Button variant="secondary" onClick={() => simular(id, { estado: "degradado", latenciaExtraMs: 1800 })}>Latencia alta</Button>
          <Button variant="secondary" onClick={() => simular(id, { invalido: true, estado: "degradado" })}>Respuesta inválida</Button>
          <Button variant="secondary" onClick={() => simular(id, { incompleto: true, estado: "incompleto" })}>Datos incompletos</Button>
          <Button onClick={() => { simular(id, { estado: "operativo", latenciaExtraMs: 0, invalido: false, incompleto: false }); setMsg("Servicio simulado recuperado."); }}>Recuperar</Button>
          <Button variant="secondary" onClick={reintentar}>Reintentar sincronización</Button>
        </div>
        {msg ? <p role="status" className="mt-3 text-sm">{msg}</p> : null}
      </Card>
      <div className="grid gap-2 md:grid-cols-2">{data.conectores.slice(0, 12).map((c) => <Card key={c.id}><div className="flex justify-between"><strong>{c.nombre}</strong><Badge tone={c.estadoSimulado === "operativo" ? "ok" : "warn"}>{c.estadoSimulado}</Badge></div><p className="text-xs">{c.tiempoRespuestaMs} ms · calidad {c.calidadDatos}</p></Card>)}</div>
    </div>
  );
}
