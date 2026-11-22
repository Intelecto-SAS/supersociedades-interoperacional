import { getDataset, type Dataset } from "@/data/seed/dataset";
import { mulberry32 } from "@/lib/simulation/rng";
import type { CanalId } from "@/features/portal/canales";

export type Acuse472 = { tipo: "envio" | "entrega" | "apertura"; fecha: string; estado: "registrado" | "pendiente" };
export type EstadoSolicitud = "borrador" | "en_clasificacion" | "por_confirmar" | "radicada" | "en_tramite" | "respondida" | "cerrada";

export type Solicitud = {
  id: string;
  empresaId: string;
  canal: CanalId;
  asunto: string;
  tramite: string;
  estado: EstadoSolicitud;
  fechaLlegada: string;
  fechaRadicacion: string | null;
  radicadoGedess: string | null;
  prioridad: "ordinaria" | "tutela";
  remitente: string;
  remitenteValidado: boolean;
  clasificacion: string;
  repartoSugerido: string;
  confirmadoPorPersona: boolean;
  guia472: string | null;
  acuses: Acuse472[];
  fuenteXroad: { entidad: string; fechaDato: string; campo: string; valor: string } | null;
  documentoIds: string[];
  resumen: string;
};

const DESTINOS = ["Grupo de radicación", "Insolvencia", "Supervisión societaria", "Atención a PQRSD", "Estados financieros"];

function pad(n: number) {
  return String(n).padStart(4, "0");
}

function featured(data: Dataset): Solicitud[] {
  const andina = data.empresas[0]!;
  const horizonte = data.empresas[1]!;
  const caribe = data.empresas[3]!;
  const pacifico = data.empresas[5]!;
  return [
    {
      id: "SOL-0001",
      empresaId: andina.id,
      canal: "furt",
      asunto: "Presentación de estados financieros 2024",
      tramite: "Depósito de estados financieros",
      estado: "en_tramite",
      fechaLlegada: "2025-10-08T09:12:00-05:00",
      fechaRadicacion: "2025-10-08",
      radicadoGedess: "GEDESS-2025-44102",
      prioridad: "ordinaria",
      remitente: andina.razonSocial,
      remitenteValidado: true,
      clasificacion: "Financiero",
      repartoSugerido: "Estados financieros",
      confirmadoPorPersona: true,
      guia472: "472-88412019",
      acuses: [
        { tipo: "envio", fecha: "2025-10-09T08:00:00-05:00", estado: "registrado" },
        { tipo: "entrega", fecha: "2025-10-10T11:22:00-05:00", estado: "registrado" },
        { tipo: "apertura", fecha: "2025-10-10T16:05:00-05:00", estado: "registrado" },
      ],
      fuenteXroad: null,
      documentoIds: data.documentos.filter((d) => d.empresaId === andina.id).slice(0, 2).map((d) => d.id),
      resumen: "Trámite creado en el portal FURT, validado antes de enviar y radicado en GEDESS.",
    },
    {
      id: "SOL-0002",
      empresaId: horizonte.id,
      canal: "correo",
      asunto: "Tutela de protección sobre proceso de reorganización",
      tramite: "Tutela",
      estado: "por_confirmar",
      fechaLlegada: "2025-10-21T07:41:12-05:00",
      fechaRadicacion: null,
      radicadoGedess: null,
      prioridad: "tutela",
      remitente: "notificaciones@horizonteconstrucciones.co",
      remitenteValidado: true,
      clasificacion: "Insolvencia",
      repartoSugerido: "Insolvencia",
      confirmadoPorPersona: false,
      guia472: null,
      acuses: [],
      fuenteXroad: null,
      documentoIds: [],
      resumen: "El correo llegó el 21 de octubre a las 07:41. El remitente coincidió con el registro. La tutela quedó primero en la bandeja. Falta la confirmación de una persona para el reparto.",
    },
    {
      id: "SOL-0003",
      empresaId: caribe.id,
      canal: "ventanilla",
      asunto: "Respuesta a requerimiento contractual",
      tramite: "Revisión contractual",
      estado: "radicada",
      fechaLlegada: "2025-10-12T14:03:00-05:00",
      fechaRadicacion: "2025-10-12",
      radicadoGedess: "GEDESS-2025-44881",
      prioridad: "ordinaria",
      remitente: "Ventanilla principal",
      remitenteValidado: true,
      clasificacion: "Contractual",
      repartoSugerido: "Supervisión societaria",
      confirmadoPorPersona: true,
      guia472: null,
      acuses: [],
      fuenteXroad: null,
      documentoIds: data.documentos.filter((d) => d.empresaId === caribe.id).slice(0, 1).map((d) => d.id),
      resumen: "El paquete se escaneó en ventanilla. La lectura automática lo dejó en la misma entrada que el portal y el correo.",
    },
    {
      id: "SOL-0004",
      empresaId: andina.id,
      canal: "salida-472",
      asunto: "Oficio de respuesta al depósito 2024",
      tramite: "Notificación",
      estado: "respondida",
      fechaLlegada: "2025-10-11T10:00:00-05:00",
      fechaRadicacion: "2025-10-11",
      radicadoGedess: "GEDESS-2025-44102",
      prioridad: "ordinaria",
      remitente: "Superintendencia de Sociedades",
      remitenteValidado: true,
      clasificacion: "Notificación",
      repartoSugerido: "Grupo de radicación",
      confirmadoPorPersona: true,
      guia472: "472-88412019",
      acuses: [
        { tipo: "envio", fecha: "2025-10-11T10:30:00-05:00", estado: "registrado" },
        { tipo: "entrega", fecha: "2025-10-12T09:18:00-05:00", estado: "registrado" },
        { tipo: "apertura", fecha: "2025-10-12T15:44:00-05:00", estado: "registrado" },
      ],
      fuenteXroad: null,
      documentoIds: [],
      resumen: "La guía 4-72 salió del radicado GEDESS-2025-44102. Los tres acuses quedaron en GEDESS.",
    },
    {
      id: "SOL-0005",
      empresaId: pacifico.id,
      canal: "xroad",
      asunto: "Consulta de razón social en RUES y SIREM",
      tramite: "Validación de datos",
      estado: "en_tramite",
      fechaLlegada: "2025-10-18T11:00:00-05:00",
      fechaRadicacion: "2025-10-18",
      radicadoGedess: "GEDESS-2025-45002",
      prioridad: "ordinaria",
      remitente: "X-Road",
      remitenteValidado: true,
      clasificacion: "Calidad de datos",
      repartoSugerido: "Gobierno de datos",
      confirmadoPorPersona: true,
      guia472: null,
      acuses: [],
      fuenteXroad: { entidad: "RUES", fechaDato: "2025-09-12", campo: "Razón social", valor: "PACIF AGRO" },
      documentoIds: [],
      resumen: "La consulta X-Road muestra la fecha de cada dato. RUES entregó el alias el 12 de septiembre; SIREM conserva la razón social completa.",
    },
  ];
}

export function buildSolicitudes(data: Dataset = getDataset()): Solicitud[] {
  const items = featured(data);
  const seen = new Set(items.map((s) => s.id));
  let n = items.length;
  data.expedientes.slice(0, 40).forEach((exp, i) => {
    const id = `SOL-${pad(n + 1)}`;
    if (seen.has(id)) return;
    n += 1;
    items.push({
      id,
      empresaId: exp.empresaId,
      canal: "furt",
      asunto: exp.tipo,
      tramite: exp.tipo,
      estado: exp.estado === "cerrado" ? "cerrada" : "en_tramite",
      fechaLlegada: `${exp.fechaApertura}T08:30:00-05:00`,
      fechaRadicacion: exp.fechaApertura,
      radicadoGedess: `GEDESS-${exp.id.replace("DEMO-EXP-", "2025-")}`,
      prioridad: "ordinaria",
      remitente: data.empresas.find((e) => e.id === exp.empresaId)?.razonSocial ?? exp.empresaId,
      remitenteValidado: true,
      clasificacion: "Societario",
      repartoSugerido: DESTINOS[i % DESTINOS.length]!,
      confirmadoPorPersona: true,
      guia472: null,
      acuses: [],
      fuenteXroad: null,
      documentoIds: data.documentos.filter((d) => d.expedienteId === exp.id).slice(0, 1).map((d) => d.id),
      resumen: exp.resumen,
    });
  });
  data.documentos.slice(0, 25).forEach((doc, i) => {
    n += 1;
    const rng = mulberry32(3602025 + i);
    items.push({
      id: `SOL-${pad(n)}`,
      empresaId: doc.empresaId,
      canal: "ventanilla",
      asunto: doc.nombre,
      tramite: doc.clasificacion,
      estado: rng() > 0.5 ? "radicada" : "en_tramite",
      fechaLlegada: `${doc.fecha}T13:10:00-05:00`,
      fechaRadicacion: doc.fecha,
      radicadoGedess: `GEDESS-DOC-${doc.id.slice(-4)}`,
      prioridad: "ordinaria",
      remitente: "Ventanilla y mensajería",
      remitenteValidado: true,
      clasificacion: doc.clasificacion,
      repartoSugerido: "Grupo de radicación",
      confirmadoPorPersona: true,
      guia472: null,
      acuses: [],
      fuenteXroad: null,
      documentoIds: [doc.id],
      resumen: "Ingreso por ventanilla con lectura automática del documento.",
    });
  });
  return items;
}

let cache: Solicitud[] | null = null;
export function getSolicitudes() {
  if (!cache) cache = buildSolicitudes();
  return cache;
}

export function solicitudesDe(empresaId: string, extra: Solicitud[] = []) {
  return [...extra, ...getSolicitudes().filter((s) => s.empresaId === empresaId)];
}

export const TRAMITES_FURT = [
  "Depósito de estados financieros",
  "Actualización de información societaria",
  "Solicitud de certificados",
  "Respuesta a requerimiento",
  "PQRSD",
  "Seguimiento de insolvencia",
];
