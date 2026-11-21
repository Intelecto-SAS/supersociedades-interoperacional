import { getDataset } from "@/data/seed/dataset";
import { createAdapter } from "@/integrations/adapters/create-adapter";
import type { IntegrationAdapter } from "@/integrations/types";

export function listConnectors() {
  return getDataset().conectores;
}

export function getConnector(id: string) {
  return listConnectors().find((c) => c.id === id) ?? null;
}

export function getAdapter(id: string): IntegrationAdapter | null {
  const def = getConnector(id);
  return def ? createAdapter(def) : null;
}

export function specializedAdapters() {
  return listConnectors().filter((c) => c.adaptador === "especializado");
}
