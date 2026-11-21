import { describe, expect, it } from "vitest";
import { createDataset } from "@/data/seed/dataset";
import { specializedAdapters } from "@/integrations/registry";
import { casoCalidadPacifico } from "@/integrations/normalization";
import { evaluarEmpresa } from "@/features/risk/engine";
import { clasificarTexto } from "@/features/documents/classify";
import { ejecutarFlujo } from "@/features/flows/engine";
import { getFlow } from "@/features/flows/definitions";
import { parseDemoState } from "@/lib/storage/state";
import { toCsv } from "@/lib/export/csv";
import { applyScenario } from "@/features/scenarios/apply";
import { setConnectorRuntime, clearConnectorRuntime } from "@/integrations/adapters/create-adapter";
import { getAdapter } from "@/integrations/registry";
import { isError } from "@/integrations/types";

describe("laboratorio", () => {
  it("genera datos deterministas y relacionados", () => {
    const a = createDataset();
    const b = createDataset();
    expect(a.empresas).toHaveLength(200);
    expect(a.reportes).toHaveLength(600);
    expect(a.contratos).toHaveLength(350);
    expect(a.procesos).toHaveLength(150);
    expect(a.documentos).toHaveLength(300);
    expect(a.actuaciones).toHaveLength(200);
    expect(a.alertas).toHaveLength(150);
    expect(a.expedientes).toHaveLength(100);
    expect(a.conectores).toHaveLength(72);
    expect(a.empresas[0]?.id).toBe(b.empresas[0]?.id);
    expect(a.empresas[0]?.razonSocial).toBe(b.empresas[0]?.razonSocial);
    const ids = new Set(a.empresas.map((e) => e.id));
    expect(a.reportes.every((r) => ids.has(r.empresaId))).toBe(true);
    expect(a.contratos.every((r) => ids.has(r.empresaId))).toBe(true);
    expect(new Set(a.empresas.map((e) => e.sector)).size).toBeGreaterThanOrEqual(12);
  });

  it("registra adaptadores especializados y rechaza operaciones no declaradas", () => {
    expect(specializedAdapters().length).toBeGreaterThanOrEqual(18);
    const policia = getAdapter("policia");
    expect(policia?.supports("search")).toBe(false);
    const search = policia?.search("x");
    expect(isError(search)).toBe(true);
  });

  it("normaliza sin ocultar la fuente original", () => {
    const data = createDataset();
    const empresa = data.empresas.find((e) => e.id === "DEMO-EMP-0006")!;
    const caso = casoCalidadPacifico(empresa, data.reportes);
    expect(caso.consolidado.title).toBe(empresa.razonSocial);
    expect(caso.registrosOriginales.some((r) => r.title === "PACIF SIMULADO")).toBe(true);
  });

  it("dispara reglas del caso de insolvencia", () => {
    const data = createDataset();
    const alertas = evaluarEmpresa(data, "DEMO-EMP-0002");
    expect(alertas.some((a) => a.reglaAplicada === "R-PASIVOS-ACTIVOS")).toBe(true);
    expect(alertas.some((a) => a.reglaAplicada === "R-CAIDA-INGRESOS")).toBe(true);
  });

  it("clasifica texto local", () => {
    const result = clasificarTexto("Solicitud de reorganización de Horizonte Ficticio S.A.S. por pasivos.");
    expect(result.clasificacion).toBe("Insolvencia");
    expect(result.empresaId).toBe("DEMO-EMP-0002");
    expect(result.motor).toBe("reglas_locales");
  });

  it("ejecuta un flujo y refleja una fuente caída", () => {
    clearConnectorRuntime();
    const flow = getFlow("flujo-perfil")!;
    const ok = ejecutarFlujo(flow);
    expect(ok.pasos.some((p) => p.estado === "ok")).toBe(true);
    setConnectorRuntime("rues", { estado: "caido" });
    const failed = ejecutarFlujo(flow);
    expect(failed.pasos[0]?.estado).toBe("error");
    expect(failed.pasos.some((p) => p.estado === "omitido")).toBe(true);
    clearConnectorRuntime();
  });

  it("valida el estado local y exporta csv", () => {
    expect(() => parseDemoState({ version: 1, escenario: "falla", rol: "datos" })).not.toThrow();
    expect(() => parseDemoState({ version: 2 })).toThrow();
    const csv = toCsv([{ id: "DEMO-EMP-0001", nombre: "Andina \"Ejemplo\"" }]);
    expect(csv).toContain("DEMO-EMP-0001");
    const falla = applyScenario(createDataset(), "falla");
    expect(falla.conectores.find((c) => c.id === "rues")?.estadoSimulado).toBe("caido");
  });
});
