import { describe, expect, it } from "vitest";
import { buildSolicitudes } from "@/features/portal/solicitudes";
import { CANALES } from "@/features/portal/canales";
import { parseDemoState } from "@/lib/storage/state";

describe("portal de empresas", () => {
  it("construye solicitudes por los cinco canales", () => {
    const sols = buildSolicitudes();
    const canales = new Set(sols.map((s) => s.canal));
    expect(CANALES).toHaveLength(5);
    expect(canales.has("correo")).toBe(true);
    expect(canales.has("furt")).toBe(true);
    expect(canales.has("ventanilla")).toBe(true);
    expect(canales.has("salida-472")).toBe(true);
    expect(canales.has("xroad")).toBe(true);
    const tutela = sols.find((s) => s.id === "SOL-0002");
    expect(tutela?.prioridad).toBe("tutela");
    expect(tutela?.fechaLlegada).toContain("2025-10-21T07:41:12");
    expect(tutela?.remitenteValidado).toBe(true);
    const salida = sols.find((s) => s.id === "SOL-0004");
    expect(salida?.acuses.map((a) => a.tipo)).toEqual(["envio", "entrega", "apertura"]);
  });

  it("acepta el estado local con sociedad activa", () => {
    const parsed = parseDemoState({ version: 1, escenario: "normal", rol: "direccion" });
    expect(parsed.empresaActiva).toBe("DEMO-EMP-0001");
    expect(parsed.solicitudesExtra).toEqual([]);
  });
});
