"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDataset } from "@/data/seed/dataset";
import { applyScenario, type EscenarioId } from "@/features/scenarios/apply";
import { setConnectorRuntime, clearConnectorRuntime } from "@/integrations/adapters/create-adapter";
import { initialDemoState, parseDemoState, type DemoState } from "@/lib/storage/state";
import type { Alerta, Expediente } from "@/types/domain";
import { getSolicitudes, solicitudesDe, type Solicitud } from "@/features/portal/solicitudes";

type Store = DemoState & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setEscenario: (escenario: EscenarioId) => void;
  setRol: (rol: DemoState["rol"]) => void;
  setEmpresaActiva: (empresaId: string) => void;
  updateAlerta: (id: string, patch: { estado: Alerta["estado"]; responsableDemo: string | null }) => void;
  addNota: (expedienteId: string, texto: string) => void;
  addExpediente: (exp: Expediente) => void;
  addSolicitud: (sol: Solicitud) => void;
  updateSolicitud: (id: string, patch: Partial<Solicitud>) => void;
  validarDocumento: (id: string) => void;
  simularConector: (id: string, patch: DemoState["conectores"][string]) => void;
  auditar: (accion: string, detalle: string) => void;
  reset: () => void;
  importState: (raw: unknown) => void;
};

export const useDemoStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialDemoState,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setEscenario: (escenario) => {
        clearConnectorRuntime();
        set({ escenario });
        get().auditar("cambio_escenario", escenario);
      },
      setRol: (rol) => set({ rol }),
      setEmpresaActiva: (empresaActiva) => {
        set({ empresaActiva });
        get().auditar("ingreso_portal", empresaActiva);
      },
      updateAlerta: (id, patch) =>
        set({ alertas: { ...get().alertas, [id]: patch } }),
      addNota: (expedienteId, texto) =>
        set({
          notas: [...get().notas, { id: `nota-${get().notas.length + 1}`, expedienteId, texto, fecha: "2025-10-29T16:00:00-05:00" }],
        }),
      addExpediente: (exp) => set({ expedientesExtra: [exp, ...get().expedientesExtra] }),
      addSolicitud: (sol) => set({ solicitudesExtra: [sol, ...get().solicitudesExtra] }),
      updateSolicitud: (id, patch) => {
        const extra = get().solicitudesExtra;
        if (extra.some((s) => s.id === id)) {
          set({ solicitudesExtra: extra.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
          return;
        }
        const base = getSolicitudes().find((s) => s.id === id);
        if (!base) return;
        set({ solicitudesExtra: [{ ...base, ...patch }, ...extra] });
      },
      validarDocumento: (id) => set({
        documentosEstado: { ...get().documentosEstado, [id]: { validado: true, fecha: "2025-10-29T16:20:00-05:00" } },
      }),
      simularConector: (id, patch) => {
        setConnectorRuntime(id, patch);
        set({ conectores: { ...get().conectores, [id]: { ...get().conectores[id], ...patch } } });
      },
      auditar: (accion, detalle) =>
        set({
          auditoria: [{ id: `local-${get().auditoria.length + 1}`, accion, detalle, fecha: "2025-10-29T16:10:00-05:00" }, ...get().auditoria].slice(0, 40),
        }),
      reset: () => {
        clearConnectorRuntime();
        set({ ...initialDemoState, hydrated: true });
      },
      importState: (raw) => {
        const parsed = parseDemoState(raw);
        clearConnectorRuntime();
        Object.entries(parsed.conectores).forEach(([id, patch]) => setConnectorRuntime(id, patch));
        set({ ...parsed, hydrated: true });
      },
    }),
    {
      name: "conecta360-demo",
      partialize: (state) => ({
        version: 1 as const,
        escenario: state.escenario,
        rol: state.rol,
        empresaActiva: state.empresaActiva,
        alertas: state.alertas,
        notas: state.notas,
        expedientesExtra: state.expedientesExtra,
        solicitudesExtra: state.solicitudesExtra,
        documentosEstado: state.documentosEstado,
        conectores: state.conectores,
        auditoria: state.auditoria,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        try {
          const parsed = parseDemoState(state);
          Object.entries(parsed.conectores).forEach(([id, patch]) => setConnectorRuntime(id, patch));
        } catch {
          state.reset();
        }
        state.setHydrated(true);
      },
    },
  ),
);

export function useView() {
  const escenario = useDemoStore((s) => s.escenario);
  const overrides = useDemoStore((s) => s.alertas);
  const extra = useDemoStore((s) => s.expedientesExtra);
  const connectorOverrides = useDemoStore((s) => s.conectores);
  const base = applyScenario(getDataset(), escenario);
  const alertas = base.alertas.map((a) => (overrides[a.id] ? { ...a, ...overrides[a.id] } : a));
  const conectores = base.conectores.map((c) => {
    const patch = connectorOverrides[c.id];
    return patch?.estado ? { ...c, estadoSimulado: patch.estado } : c;
  });
  return { ...base, alertas, conectores, expedientes: [...extra, ...base.expedientes] };
}

export function useEmpresaSesion() {
  const data = useView();
  const empresaActiva = useDemoStore((s) => s.empresaActiva);
  const extra = useDemoStore((s) => s.solicitudesExtra);
  const documentosEstado = useDemoStore((s) => s.documentosEstado);
  const empresa = data.empresas.find((e) => e.id === empresaActiva) ?? data.empresas[0]!;
  const documentos = data.documentos.filter((d) => d.empresaId === empresa.id);
  const reportes = data.reportes.filter((r) => r.empresaId === empresa.id);
  const expedientes = data.expedientes.filter((e) => e.empresaId === empresa.id);
  const contratos = data.contratos.filter((c) => c.empresaId === empresa.id);
  const procesos = data.procesos.filter((p) => p.empresaId === empresa.id);
  const solicitudes = solicitudesDe(empresa.id, extra);
  return { data, empresa, documentos, reportes, expedientes, contratos, procesos, solicitudes, documentosEstado };
}

export const ROL_HOME: Record<DemoState["rol"], string> = {
  direccion: "/dashboard",
  financiero: "/finanzas",
  juridico: "/expedientes",
  supervisor: "/vigilancia",
  integraciones: "/integraciones",
  datos: "/gobierno-datos",
};
