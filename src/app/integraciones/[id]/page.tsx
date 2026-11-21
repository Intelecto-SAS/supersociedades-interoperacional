"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page";
import { Badge, Button, Card, Empty } from "@/components/ui/primitives";
import { getAdapter } from "@/integrations/registry";
import { isError } from "@/integrations/types";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function IntegracionDetalle() {
  const { id } = useParams<{ id: string }>();
  const data = useView();
  const auditar = useDemoStore((s) => s.auditar);
  const def = data.conectores.find((c) => c.id === id);
  const [out, setOut] = useState<string>("");
  if (!def) return <Empty>Conector no registrado.</Empty>;
  const adapter = getAdapter(def.id);
  const probar = () => {
    if (!adapter) return;
    const health = adapter.healthCheck();
    const sample = adapter.supports("getSamplePayload") ? adapter.getSamplePayload() : null;
    const search = adapter.supports("search") ? adapter.search("DEMO-EMP-0001") : null;
    setOut(JSON.stringify({ health, sample: isError(sample) ? sample : sample, search: isError(search) ? search : Array.isArray(search) ? search.slice(0, 2) : search }, null, 2));
    auditar("prueba_conector", def.id);
  };
  return (
    <div>
      <PageHeader crumbs={[{ href: "/integraciones", label: "Integraciones" }, { href: `/integraciones/${def.id}`, label: def.nombre }]} title={def.nombre} description={def.descripcion} actions={<Button onClick={probar}>Probar conexión simulada</Button>} />
      <div className="mb-3 flex gap-2"><Badge tone="warn">MODO SIMULADO</Badge><Badge>Acceso real {def.tipoAccesoReal}</Badge><Badge tone={def.estadoSimulado === "operativo" ? "ok" : "risk"}>{def.estadoSimulado}</Badge></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Ficha</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div>Entidad: {def.entidadProveedora}</div>
            <div>Datos: {def.datosQueAporta.join(", ")}</div>
            <div>Operaciones: {def.operacionesSimuladas.join(", ")}</div>
            <div>Consumidores: {def.sistemasConsumidores.join(", ")}</div>
            <div>Latencia simulada: {def.tiempoRespuestaMs} ms</div>
            <div>Calidad simulada: {def.calidadDatos}</div>
            <div>Última sincronización ficticia: {def.ultimaSincronizacionFicticia}</div>
            <div>URL de API real: {def.urlApiReal ?? "null"}</div>
            <div>Autenticación real: {def.metodoAutenticacionReal}</div>
            <div>Documentación oficial: {def.documentacionOficial ?? "no verificada"}</div>
          </dl>
        </Card>
        <Card>
          <h2 className="font-semibold">Riesgos y requisitos</h2>
          <ul className="mt-2 list-disc pl-4 text-sm">{def.riesgosIntegracion.map((r) => <li key={r}>{r}</li>)}</ul>
          <ul className="mt-2 list-disc pl-4 text-sm">{def.requisitosPendientes.map((r) => <li key={r}>{r}</li>)}</ul>
          <h3 className="mt-3 font-semibold">Historial</h3>
          <ul className="text-sm">{data.ejecuciones.filter((e) => e.sourceId === def.id).map((e) => <li key={e.id}>{e.fecha} · {e.estado} · {e.duracionMs} ms</li>)}</ul>
        </Card>
      </div>
      {out ? <Card className="mt-4"><h2 className="font-semibold">Resultado de la prueba</h2><pre className="mt-2 overflow-auto text-xs">{out}</pre></Card> : null}
    </div>
  );
}
