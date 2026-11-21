"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card } from "@/components/ui/primitives";
import { useDemoStore } from "@/lib/storage/store";

export default function ConfiguracionPage() {
  const state = useDemoStore();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const exportar = () => {
    const payload = { version: 1, escenario: state.escenario, rol: state.rol, alertas: state.alertas, notas: state.notas, expedientesExtra: state.expedientesExtra, conectores: state.conectores, auditoria: state.auditoria };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "conecta360-estado.json";
    a.click();
  };
  return (
    <div>
      <PageHeader title="Configuración" description="El rol es simulado y no representa un control de acceso de producción." />
      <Card className="space-y-3">
        <p className="text-sm">Escenario actual: {state.escenario}. Rol simulado: {state.rol}.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportar}>Exportar estado</Button>
          <label className="rounded-md border px-3 py-2 text-sm">Importar estado
            <input className="sr-only" type="file" accept="application/json" aria-label="Importar estado JSON" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                state.importState(JSON.parse(await file.text()));
                setError("");
                setMsg("Estado importado en este navegador.");
              } catch (err) {
                setMsg("");
                setError(err instanceof Error ? err.message : "No se pudo importar.");
              }
            }} />
          </label>
          <Button variant="danger" onClick={() => { if (confirm("¿Borrar las acciones locales de la demostración?")) { state.reset(); setMsg("Demostración restablecida."); } }}>Restablecer</Button>
        </div>
        {msg ? <p role="status" className="text-sm text-emerald-800">{msg}</p> : null}
        {error ? <p role="alert" className="text-sm text-flag-red">{error}</p> : null}
      </Card>
    </div>
  );
}
