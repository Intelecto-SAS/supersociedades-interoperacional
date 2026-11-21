import { describe, expect, it } from "vitest";
import { buildCromaRequest, normalizeCroma } from "@/integrations/live/croma";

describe("croma", () => {
  it("solo arma URLs de api.croma.run y fuerza persona jurídica", () => {
    const rama = buildCromaRequest("rama-entity", "Andina Alimentos", 1);
    expect(rama.url.hostname).toBe("api.croma.run");
    expect(rama.url.pathname).toBe("/co/rama-judicial/cases-by-entity/v1");
    expect(rama.body).toMatchObject({ entity_type: "juridical" });
    const rues = buildCromaRequest("rues-nit", "900249127", 1);
    expect(rues.url.pathname).toBe("/co/rues/entity-by-nit/v1");
    expect(rues.body).toEqual({ document_number: "900249127" });
  });

  it("no asocia el registro a una sociedad generada", () => {
    const record = normalizeCroma("ss-companies", { data: { results: [{ name: "Sociedad Publicada S.A.S.", document_number: "900111222" }] } }, "2026-01-01T00:00:00.000Z");
    expect(record.empresaId).toBeNull();
    expect(record.evidence.simulated).toBe(false);
    expect(record.evidence.sourceId).toBe("sirem");
    expect(record.title).toBe("Sociedad Publicada S.A.S.");
  });
});
