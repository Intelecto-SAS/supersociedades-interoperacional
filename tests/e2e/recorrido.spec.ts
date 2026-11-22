import { expect, test } from "@playwright/test";

test("recorrido del portal de empresas", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Portal de empresas CONECTA 360" })).toBeVisible();
  await page.getByLabel("Buscar sociedad para entrar").fill("Andina Alimentos");
  await page.getByRole("button", { name: "Entrar" }).first().click();
  await expect(page.getByRole("heading", { name: "Portal de Andina Alimentos S.A.S." })).toBeVisible();
  await page.goto("/solicitudes");
  await expect(page.getByText("Presentación de estados financieros 2024")).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Nueva solicitud FURT" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Asunto de la solicitud").fill("Actualización de información de Andina Alimentos");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Confirmar y radicar" }).click();
  await expect(page.getByText("GEDESS-LOCAL")).toBeVisible();
  await page.goto("/canales");
  await expect(page.getByRole("heading", { name: "Correo" })).toBeVisible();
  await expect(page.getByText("Las tutelas se priorizan solas")).toBeVisible();
});
