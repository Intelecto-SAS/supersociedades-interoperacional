"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page";
import { Button, TextInput } from "@/components/ui/primitives";
import { clasificarTexto } from "@/features/documents/classify";
import { TRAMITES_FURT } from "@/features/portal/solicitudes";
import { useDemoStore, useEmpresaSesion } from "@/lib/storage/store";

const ETAPAS = ["Trámite", "Datos de la sociedad", "Documento", "Validación", "Confirmación"];

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const { empresa, documentos } = useEmpresaSesion();
  const add = useDemoStore((s) => s.addSolicitud);
  const addExp = useDemoStore((s) => s.addExpediente);
  const auditar = useDemoStore((s) => s.auditar);
  const [paso, setPaso] = useState(0);
  const [tramite, setTramite] = useState(TRAMITES_FURT[0]!);
  const [asunto, setAsunto] = useState("");
  const [docId, setDocId] = useState(documentos[0]?.id ?? "");
  const texto = documentos.find((d) => d.id === docId)?.contenidoFicticio ?? `Solicitud de ${empresa.razonSocial} para ${tramite}.`;
  const clas = clasificarTexto(texto, empresa.id);
  const enviar = () => {
    const id = `SOL-LOCAL-${Date.now()}`;
    add({
      id,
      empresaId: empresa.id,
      canal: "furt",
      asunto: asunto || tramite,
      tramite,
      estado: "radicada",
      fechaLlegada: "2025-10-29T16:30:00-05:00",
      fechaRadicacion: "2025-10-29",
      radicadoGedess: `GEDESS-LOCAL-${id.slice(-6)}`,
      prioridad: /tutela/i.test(asunto) ? "tutela" : "ordinaria",
      remitente: empresa.razonSocial,
      remitenteValidado: true,
      clasificacion: clas.clasificacion,
      repartoSugerido: clas.tramite,
      confirmadoPorPersona: true,
      guia472: null,
      acuses: [],
      fuenteXroad: null,
      documentoIds: docId ? [docId] : [],
      resumen: "Solicitud creada en el portal FURT, validada por la sociedad antes de enviar.",
    });
    addExp({ id: `DEMO-EXP-${id}`, empresaId: empresa.id, tipo: tramite, estado: "abierto", responsableDemo: empresa.razonSocial, resumen: asunto || tramite, fechaApertura: "2025-10-29" });
    auditar("solicitud_furt", id);
    router.push(`/solicitudes/${id}`);
  };
  return (
    <div>
      <PageHeader title="Nueva solicitud en el portal FURT" description="El asistente guía el trámite y pide validación antes de enviar. Queda en la misma entrada única que el correo y la ventanilla." />
      <ol className="mb-4 flex flex-wrap gap-2 text-xs">{ETAPAS.map((p, i) => <li key={p} className={`rounded-full px-2 py-1 ${i === paso ? "bg-brand-burgundy text-white" : "bg-white"}`}>{i + 1}. {p}</li>)}</ol>
      <section className="rounded-xl border border-surface-line bg-white p-4 text-sm">
        {paso === 0 && (
          <label className="block">Trámite
            <select aria-label="Trámite FURT" className="mt-1 w-full rounded-md border px-2 py-2" value={tramite} onChange={(e) => setTramite(e.target.value)}>{TRAMITES_FURT.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
        )}
        {paso === 1 && (
          <div className="space-y-2">
            <p>Sociedad en sesión: <strong>{empresa.razonSocial}</strong></p>
            <p>Identificador {empresa.id}. NIT {empresa.nitDemo}.</p>
            <label>Asunto
              <TextInput aria-label="Asunto de la solicitud" className="mt-1" value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Resuma la solicitud" />
            </label>
          </div>
        )}
        {paso === 2 && (
          <label className="block">Documento de apoyo
            <select aria-label="Documento de la solicitud" className="mt-1 w-full rounded-md border px-2 py-2" value={docId} onChange={(e) => setDocId(e.target.value)}>
              {documentos.length === 0 ? <option value="">Sin documentos</option> : documentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <p className="mt-2 rounded-md bg-slate-50 p-2 text-slate-600">Texto leído en el navegador, no por un servicio de reconocimiento: {texto}</p>
          </label>
        )}
        {paso === 3 && (
          <ul className="space-y-1">
            {clas.validaciones.map((v) => <li key={v.mensaje}>{v.ok ? "Cumple" : "Revisar"}: {v.mensaje}</li>)}
            <li>Clasificación sugerida: {clas.clasificacion}. Confianza {clas.confianza}.</li>
          </ul>
        )}
        {paso === 4 && (
          <div>
            <p>Va a enviar <strong>{asunto || tramite}</strong> a nombre de {empresa.razonSocial}. Se creará un radicado GEDESS en esta sesión.</p>
            <Button className="mt-3" onClick={enviar}>Confirmar y radicar</Button>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" disabled={paso === 0} onClick={() => setPaso((p) => p - 1)}>Atrás</Button>
          {paso < 4 ? <Button onClick={() => setPaso((p) => p + 1)}>Continuar</Button> : null}
        </div>
      </section>
    </div>
  );
}
