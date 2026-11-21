"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card } from "@/components/ui/primitives";
import { clasificarTexto } from "@/features/documents/classify";
import { useDemoStore, useView } from "@/lib/storage/store";

const PASOS = ["Documento", "Extracción", "Clasificación", "Empresa", "Trámite", "Validaciones", "Confirmación", "Radicado", "Expediente", "Auditoría"];

export default function RadicacionPage() {
  const docs = useView().documentos.slice(0, 3);
  const add = useDemoStore((s) => s.addExpediente);
  const auditar = useDemoStore((s) => s.auditar);
  const [paso, setPaso] = useState(0);
  const [docId, setDocId] = useState(docs[0]?.id ?? "");
  const [texto, setTexto] = useState(docs[0]?.contenidoFicticio ?? "");
  const [radicado, setRadicado] = useState("");
  const clas = clasificarTexto(texto);
  const doc = docs.find((d) => d.id === docId);
  const confirmar = () => {
    const id = `DEMO-RAD-LOCAL-${docId}`;
    setRadicado(id);
    add({ id: `DEMO-EXP-${id}`, empresaId: clas.empresaId ?? "DEMO-EMP-0002", tipo: clas.tramite, estado: "abierto", responsableDemo: "Equipo documental", resumen: clas.texto.slice(0, 180), fechaApertura: "2025-10-29" });
    auditar("radicacion", id);
    setPaso(9);
  };
  return (
    <div>
      <PageHeader title="Radicación asistida" description="Lectura del documento, clasificación, identificación de la sociedad y creación del radicado." />
      <ol className="mb-4 flex flex-wrap gap-2 text-xs">{PASOS.map((p, i) => <li key={p} className={`rounded-full px-2 py-1 ${i === paso ? "bg-brand-burgundy text-white" : "bg-white"}`}>{i + 1}. {p}</li>)}</ol>
      <Card>
        {paso === 0 && <label className="text-sm">Documento<select className="mt-1 w-full rounded border px-2 py-1" value={docId} onChange={(e) => { setDocId(e.target.value); setTexto(docs.find((d) => d.id === e.target.value)?.contenidoFicticio ?? ""); }}>{docs.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></label>}
        {paso === 1 && <p className="text-sm">Texto leído en el navegador: {texto}</p>}
        {paso === 2 && <p className="text-sm">Clasificación sugerida: {clas.clasificacion}. Confianza {clas.confianza}. Motor {clas.motor}.</p>}
        {paso === 3 && <p className="text-sm">Sociedad: {clas.empresaId ?? "sin identificar"}.</p>}
        {paso === 4 && <p className="text-sm">Trámite sugerido: {clas.tramite}.</p>}
        {paso === 5 && <ul className="text-sm">{clas.validaciones.map((v) => <li key={v.mensaje}>{v.ok ? "Cumple" : "Revisar"}: {v.mensaje}</li>)}</ul>}
        {paso === 6 && <p className="text-sm">Confirme antes de crear el radicado.</p>}
        {paso === 7 && <p className="text-sm">Al confirmar se creará un radicado con prefijo DEMO-RAD-LOCAL.</p>}
        {paso === 8 && <p className="text-sm">Se asociará al expediente de {clas.empresaId ?? doc?.empresaId}.</p>}
        {paso === 9 && <p role="status" className="text-sm">Radicado {radicado} creado en este navegador y anotado en la auditoría local. Documento de origen: {doc?.nombre}.</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" disabled={paso === 0} onClick={() => setPaso((p) => Math.max(0, p - 1))}>Atrás</Button>
          {paso < 8 ? <Button onClick={() => setPaso((p) => p + 1)}>Continuar</Button> : null}
          {paso === 8 ? <Button onClick={confirmar}>Confirmar y radicar</Button> : null}
        </div>
      </Card>
    </div>
  );
}
