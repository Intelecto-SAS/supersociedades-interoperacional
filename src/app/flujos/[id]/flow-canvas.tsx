"use client";

import { useMemo, useState } from "react";
import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Card } from "@/components/ui/primitives";
import { ejecutarFlujo, type FlowRun } from "@/features/flows/engine";
import type { FlowDefinition } from "@/features/flows/definitions";
import { useDemoStore } from "@/lib/storage/store";

export function FlowCanvas({ flow }: { flow: FlowDefinition }) {
  const auditar = useDemoStore((s) => s.auditar);
  const [run, setRun] = useState<FlowRun | null>(null);
  const [selected, setSelected] = useState(flow.nodos[0]?.id ?? "");
  const [custom, setCustom] = useState<string | null>(null);
  const nodes: Node[] = useMemo(() => flow.nodos.map((n, i) => ({
    id: n.id,
    position: { x: 40 + (i % 4) * 220, y: 40 + Math.floor(i / 4) * 140 },
    data: { label: `${n.titulo}` },
    style: { border: selected === n.id ? "2px solid #962D46" : "1px solid #E2E6EC", borderRadius: 12, fontSize: 12, width: 180 },
  })), [flow.nodos, selected]);
  const edges: Edge[] = flow.aristas.map((e) => ({ id: e.id, source: e.source, target: e.target }));
  const step = run?.pasos.find((p) => p.nodeId === selected);
  const ejecutar = (forzarError = false) => {
    const result = ejecutarFlujo(flow, { forzarError });
    setRun(result);
    auditar(forzarError ? "flujo_con_incidencia" : "flujo_ejecutado", flow.id);
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="h-[480px]">
        <ReactFlow nodes={custom ? nodes.map((n) => ({ ...n, data: { label: `${String(n.data.label)} · local` } })) : nodes} edges={edges} fitView onNodeClick={(_, node) => setSelected(node.id)}>
          <Background />
          <Controls />
        </ReactFlow>
      </Card>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => ejecutar(false)}>Ejecutar</Button>
          <Button variant="secondary" onClick={() => ejecutar(true)}>Forzar incidencia</Button>
          <Button variant="secondary" onClick={() => ejecutar(false)}>Reintentar</Button>
          <Button variant="secondary" onClick={() => setCustom("guardado")}>Guardar cambios locales</Button>
          <Button variant="secondary" onClick={() => setCustom(null)}>Restaurar flujo</Button>
        </div>
        {custom ? <p className="text-xs">Hay una marca local de edición. No se escribe en el servidor.</p> : null}
        {run ? <Card><p className="text-sm font-semibold">{run.estado} · {run.duracionSimulada} ms</p><p className="text-sm">{run.resultado}</p><ol className="mt-2 space-y-1 text-xs">{run.pasos.map((p) => <li key={p.nodeId}><button className="text-left" onClick={() => setSelected(p.nodeId)}>{p.titulo}: {p.estado}. {p.mensaje}</button></li>)}</ol></Card> : null}
        {step ? <Card><h2 className="font-semibold">Inspección</h2><p className="text-xs">Entrada</p><pre className="overflow-auto text-xs">{JSON.stringify(step.entrada, null, 2)}</pre><p className="text-xs">Salida</p><pre className="overflow-auto text-xs">{JSON.stringify(step.salida, null, 2)}</pre></Card> : <p className="text-sm">Seleccione un nodo para inspeccionarlo después de ejecutar.</p>}
      </div>
    </div>
  );
}
