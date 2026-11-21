import { expect, test } from "@playwright/test";

test("recorrido principal de la demostración", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Panel ejecutivo" })).toBeVisible();
  await page.goto("/integraciones");
  await page.getByLabel("Buscar conector").fill("RUES");
  await expect(page.getByRole("link", { name: "RUES" })).toBeVisible();
  await page.getByRole("link", { name: "RUES" }).click();
  await expect(page.getByRole("button", { name: "Probar conexión" })).toBeVisible();
  await page.goto("/empresas");
  await page.getByLabel("Filtrar empresas").fill("Andina Alimentos");
  await page.getByRole("link", { name: "Andina Alimentos S.A.S." }).click();
  await expect(page.getByRole("heading", { name: "Andina Alimentos S.A.S." })).toBeVisible();
  await page.getByRole("button", { name: "Crear alerta" }).click();
  await expect(page.getByRole("status")).toContainText("Alerta");
  await page.goto("/flujos/flujo-financiero");
  await page.getByRole("button", { name: "Ejecutar" }).click();
  await expect(page.getByText("Flujo terminado.")).toBeVisible();
  await page.getByRole("button", { name: "Forzar incidencia" }).click();
  await expect(page.getByText("Incidencia en la regla")).toBeVisible();
  await page.goto("/demo");
  await page.getByRole("button", { name: "Reiniciar escenario" }).click();
  await page.goto("/informes");
  await expect(page.getByRole("heading", { name: "Informes gerenciales" })).toBeVisible();
});
