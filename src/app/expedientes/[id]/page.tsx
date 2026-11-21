"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page";
import { Button, Card, Empty, TextInput } from "@/components/ui/primitives";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function ExpedienteDetalle() {
  const { id } = useParams<{ id: string }>();
  const data = useView();
  const addNota = useDemoStore((s) => s.addNota);
  const notas = useDemoStore((s) => s.notas.filter((n) => n.expedienteId === id));
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("");
  const [responsable, setResponsable] = useState("");
  const exp = data.expedientes.find((e) => e.id === id);
  if (!exp) return <Empty>Expediente no encontrado.</Empty>;
  const docs = data.documentos.filter((d) => d.expedienteId === exp.id);
  const acts = data.actuaciones.filter((a) => a.expedienteId === exp.id);
  return (
    <div>
      <PageHeader crumbs={[{ href: "/expedientes", label: "Expedientes" }, { href: `/expedientes/${exp.id}`, label: exp.id }]} title={exp.tipo} description={`${exp.id} · ${estado || exp.estado}`} actions={<a className="rounded-md bg-brand-burgundy px-3 py-2 text-sm font-semibold text-white" href={`/empresas/${exp.empresaId}`}>Abrir sociedad</a>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm">{exp.resumen}</p>
          <label className="mt-3 block text-sm">Responsable
            <TextInput aria-label="Responsable" value={responsable} placeholder={exp.responsableDemo} onChange={(e) => setResponsable(e.target.value)} />
          </label>
          <label className="mt-2 block text-sm">Estado
            <select aria-label="Cambiar estado" className="mt-1 w-full rounded border px-2 py-1" value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Conservar {exp.estado}</option>
              <option value="abierto">abierto</option>
              <option value="en_seguimiento">en seguimiento</option>
              <option value="cerrado">cerrado</option>
            </select>
          </label>
          <h2 className="mt-4 font-semibold">Actuaciones</h2>
          {acts.slice(0, 8).map((a) => <p key={a.id} className="text-sm">{a.fecha} · {a.descripcion}</p>)}
        </Card>
        <Card>
          <h2 className="font-semibold">Documentos</h2>
          {docs.slice(0, 8).map((d) => <p key={d.id} className="text-sm">{d.nombre} · {d.clasificacion}</p>)}
          <h2 className="mt-4 font-semibold">Nota</h2>
          <TextInput aria-label="Nota" value={texto} onChange={(e) => setTexto(e.target.value)} />
          <Button className="mt-2" onClick={() => { if (texto.trim()) { addNota(exp.id, texto.trim()); setTexto(""); } }}>Agregar nota</Button>
          <ul className="mt-2 text-sm">{notas.map((n) => <li key={n.id}>{n.texto}</li>)}</ul>
          {responsable ? <p className="mt-2 text-xs">Responsable: {responsable}.</p> : null}
        </Card>
      </div>
    </div>
  );
}
