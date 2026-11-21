"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page";
import { Button, Card, TextInput } from "@/components/ui/primitives";
import { consultarAsistente, type AssistantAnswer } from "@/features/assistant/engine";
import { useDemoStore } from "@/lib/storage/store";

const EJEMPLOS = [
  "¿Qué empresas ficticias presentan mayor riesgo financiero?",
  "Resume la situación de Andina Ejemplo S.A.S.",
  "¿Qué fuentes aportan datos al perfil empresarial?",
  "¿Qué alertas están pendientes?",
  "¿Qué documentos están relacionados con este expediente?",
  "¿Qué integraciones fallaron durante la simulación?",
  "¿Cuáles son los sectores con más empresas?",
  "Genera un resumen gerencial de este caso.",
];

export default function AsistentePage() {
  const escenario = useDemoStore((s) => s.escenario);
  const [q, setQ] = useState(EJEMPLOS[0]);
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null);
  return (
    <div>
      <PageHeader title="Asistente de análisis" description="Asistente demostrativo. Respuestas generadas a partir de datos ficticios. El proveedor externo de IA está desactivado." />
      <Card>
        <label className="text-sm" htmlFor="pregunta">Pregunta</label>
        <TextInput id="pregunta" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-2 flex flex-wrap gap-2">{EJEMPLOS.map((e) => <button key={e} className="rounded-full bg-slate-100 px-2 py-1 text-xs" onClick={() => setQ(e)}>{e}</button>)}</div>
        <Button className="mt-3" onClick={() => setAnswer(consultarAsistente(q, escenario))}>Consultar</Button>
        <p className="mt-2 text-xs">Proveedor externo: desactivado. Motor: reglas locales.</p>
      </Card>
      {answer ? (
        <Card className="mt-4">
          <p className="text-sm">{answer.texto}</p>
          <h2 className="mt-3 font-semibold">Datos</h2>
          <ul className="text-sm">{answer.datos.map((d) => <li key={d}>{d}</li>)}</ul>
          <h2 className="mt-3 font-semibold">Interpretación</h2>
          <p className="text-sm">{answer.interpretacion}</p>
          <div className="mt-2 flex flex-wrap gap-2">{answer.evidencias.map((e) => <Link key={e.href} className="text-sm text-brand-blue underline" href={e.href}>{e.etiqueta}</Link>)}</div>
        </Card>
      ) : null}
    </div>
  );
}
