export type Clasificacion = {
  texto: string;
  clasificacion: string;
  empresaId: string | null;
  tramite: string;
  confianza: number;
  validaciones: { ok: boolean; mensaje: string }[];
  simulated: true;
  motor: "reglas_locales";
};

const REGLAS: Array<{ test: RegExp; clasificacion: string; tramite: string }> = [
  { test: /reorganiz|insolv|pasivo/i, clasificacion: "Insolvencia", tramite: "Seguimiento de insolvencia" },
  { test: /contrat|suministro|secop/i, clasificacion: "Contractual", tramite: "Revisión contractual" },
  { test: /ingreso|financier|balance/i, clasificacion: "Financiero", tramite: "Revisión de estados financieros" },
  { test: /petici|queja|pqrs/i, clasificacion: "Atención", tramite: "PQRSD" },
];

export function clasificarTexto(texto: string, empresaHint?: string | null): Clasificacion {
  const regla = REGLAS.find((r) => r.test.test(texto)) ?? { clasificacion: "Societario", tramite: "Actuación societaria de ejemplo" };
  const match = texto.match(/DEMO-EMP-\d{4}/);
  const nombre = /Horizonte/i.test(texto) ? "DEMO-EMP-0002" : /Andina/i.test(texto) ? "DEMO-EMP-0001" : null;
  const empresaId = empresaHint || match?.[0] || nombre;
  const validaciones = [
    { ok: texto.trim().length > 20, mensaje: texto.trim().length > 20 ? "Hay texto suficiente para una sugerencia." : "El texto es demasiado corto." },
    { ok: Boolean(empresaId), mensaje: empresaId ? `Sociedad identificada ${empresaId}.` : "No se identificó la sociedad." },
    { ok: true, mensaje: "Texto leído del documento." },
  ];
  return {
    texto,
    clasificacion: regla.clasificacion,
    empresaId,
    tramite: regla.tramite,
    confianza: empresaId ? 0.86 : 0.58,
    validaciones,
    simulated: true,
    motor: "reglas_locales",
  };
}
