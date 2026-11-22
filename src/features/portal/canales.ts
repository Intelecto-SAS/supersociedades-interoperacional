export const CANALES = [
  {
    id: "correo",
    nombre: "Correo",
    edi: "La IA lee el correo, toma la fecha real de llegada, valida al remitente en la fuente, clasifica y sugiere el reparto. Una persona confirma. Las tutelas se priorizan solas.",
  },
  {
    id: "furt",
    nombre: "Portal FURT",
    edi: "Queda dentro del portal único, con un asistente que guía el trámite y validación antes de enviar.",
  },
  {
    id: "ventanilla",
    nombre: "Ventanilla y mensajería",
    edi: "Se escanea con lectura automática y entra por la misma entrada única.",
  },
  {
    id: "salida-472",
    nombre: "Salida por 4-72",
    edi: "La guía se crea desde el radicado y los tres acuses (envío, entrega y apertura) quedan en GEDESS.",
  },
  {
    id: "xroad",
    nombre: "Otras entidades",
    edi: "Se consultan en línea por X-Road, con la fecha de cada dato visible.",
  },
] as const;

export type CanalId = (typeof CANALES)[number]["id"];

export function canalPorId(id: CanalId) {
  return CANALES.find((c) => c.id === id)!;
}
