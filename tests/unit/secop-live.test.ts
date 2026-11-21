import { describe, expect, it } from "vitest";
import { buildCatalog } from "@/integrations/catalog";
import { buildSecopUrl, normalizeSecopRow } from "@/integrations/live/secop";

describe("secop en vivo", () => {
  it("solo arma URLs de datos.gov.co", () => {
    const url = buildSecopUrl("contratos", "alimentos", 2);
    expect(url.hostname).toBe("www.datos.gov.co");
    expect(url.pathname).toBe("/resource/jbjy-vk9h.json");
    expect(url.searchParams.get("$q")).toBe("alimentos");
    expect(url.searchParams.get("$offset")).toBe("20");
    expect(url.protocol).toBe("https:");
  });

  it("normaliza sin asociar una sociedad generada y omite datos de representantes", () => {
    const record = normalizeSecopRow("contratos", {
      id_contrato: "CO1.PCCNTR.1",
      proveedor_adjudicado: "Proveedor Publicado S.A.S.",
      valor_del_contrato: "1000",
      nombre_representante_legal: "No debe salir",
    }, "2026-01-01T00:00:00.000Z");
    expect(record.empresaId).toBeNull();
    expect(record.evidence.simulated).toBe(false);
    expect(record.evidence.sourceId).toBe("secop-ii");
    expect(record.original).not.toHaveProperty("nombre_representante_legal");
    expect(record.title).toBe("Proveedor Publicado S.A.S.");
  });

  it("marca solo SECOP como canal en vivo", () => {
    const live = buildCatalog().filter((item) => item.modoActual === "LIVE");
    expect(live.map((item) => item.id).sort()).toEqual(["secop-i", "secop-ii"]);
    expect(live.every((item) => item.urlApiReal?.startsWith("https://www.datos.gov.co/"))).toBe(true);
  });
});
