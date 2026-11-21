export type FlowNodeKind =
  | "origen"
  | "consulta"
  | "transformacion"
  | "validacion"
  | "normalizacion"
  | "regla"
  | "condicion"
  | "alerta"
  | "documento"
  | "notificacion"
  | "destino"
  | "revision";

export type FlowNode = {
  id: string;
  tipo: FlowNodeKind;
  titulo: string;
  detalle: string;
  sourceId?: string;
};

export type FlowEdge = { id: string; source: string; target: string };

export type FlowDefinition = {
  id: string;
  nombre: string;
  objetivo: string;
  nodos: FlowNode[];
  aristas: FlowEdge[];
};

function chain(id: string, nombre: string, objetivo: string, steps: FlowNode[]): FlowDefinition {
  return {
    id,
    nombre,
    objetivo,
    nodos: steps,
    aristas: steps.slice(0, -1).map((step, i) => ({ id: `${id}-e${i}`, source: step.id, target: steps[i + 1]!.id })),
  };
}

export const FLOWS: FlowDefinition[] = [
  chain("flujo-perfil", "Perfil empresarial", "RUES simulado, DIAN simulado, normalización y perfil.", [
    { id: "p1", tipo: "origen", titulo: "RUES simulado", detalle: "Identificación empresarial ficticia.", sourceId: "rues" },
    { id: "p2", tipo: "consulta", titulo: "DIAN simulada", detalle: "Alias tributario de demostración.", sourceId: "dian-rut" },
    { id: "p3", tipo: "normalizacion", titulo: "Normalizar", detalle: "Unifica identificador DEMO." },
    { id: "p4", tipo: "destino", titulo: "Perfil 360", detalle: "Publica la ficha en el laboratorio." },
  ]),
  chain("flujo-financiero", "Alerta financiera", "SIREM simulado, reglas y alerta.", [
    { id: "f1", tipo: "origen", titulo: "SIREM simulado", detalle: "Ejercicios financieros.", sourceId: "sirem" },
    { id: "f2", tipo: "transformacion", titulo: "Indicadores", detalle: "Calcula variación y leverage." },
    { id: "f3", tipo: "regla", titulo: "Reglas", detalle: "Evalúa el motor determinista." },
    { id: "f4", tipo: "alerta", titulo: "Alerta", detalle: "Registra una señal explicable." },
  ]),
  chain("flujo-secop", "Contratación", "SECOP simulado, RUP simulado e informe.", [
    { id: "c1", tipo: "origen", titulo: "SECOP II simulado", detalle: "Contratos ficticios.", sourceId: "secop-ii" },
    { id: "c2", tipo: "consulta", titulo: "RUP simulado", detalle: "Clasificación de proponente.", sourceId: "rup" },
    { id: "c3", tipo: "regla", titulo: "Concentración", detalle: "Mide participación por entidad." },
    { id: "c4", tipo: "destino", titulo: "Informe", detalle: "Arma el resumen contractual." },
  ]),
  chain("flujo-gedess", "Radicación documental", "Documento, extracción simulada y GeDeSS.", [
    { id: "d1", tipo: "documento", titulo: "Documento de ejemplo", detalle: "Texto precargado." },
    { id: "d2", tipo: "transformacion", titulo: "OCR simulado", detalle: "Lee el texto local. No hay motor OCR.", sourceId: "ocr" },
    { id: "d3", tipo: "validacion", titulo: "Clasificar", detalle: "Sugiere materia y empresa." },
    { id: "d4", tipo: "destino", titulo: "GeDeSS simulado", detalle: "Asocia el radicado ficticio.", sourceId: "gedess" },
  ]),
  chain("flujo-justicia", "Cruce judicial", "Procesos simulados y expediente.", [
    { id: "j1", tipo: "origen", titulo: "Rama Judicial simulada", detalle: "Radicados DEMO.", sourceId: "rama-procesos" },
    { id: "j2", tipo: "consulta", titulo: "Cruce empresarial", detalle: "Busca el identificador ficticio." },
    { id: "j3", tipo: "revision", titulo: "Revisión humana", detalle: "La demo pide confirmación antes de abrir expediente." },
    { id: "j4", tipo: "destino", titulo: "Expediente", detalle: "Vincula el proceso." },
  ]),
  chain("flujo-territorio", "Indicadores territoriales", "DANE simulado y DNP simulado.", [
    { id: "t1", tipo: "origen", titulo: "DANE simulado", detalle: "Conteos del laboratorio.", sourceId: "dane" },
    { id: "t2", tipo: "consulta", titulo: "DNP simulado", detalle: "Contexto regional inventado.", sourceId: "dnp" },
    { id: "t3", tipo: "normalizacion", titulo: "Ficha", detalle: "Une departamento, sector y riesgo." },
    { id: "t4", tipo: "destino", titulo: "Analítica territorial", detalle: "Entrega la grilla departamental." },
  ]),
  chain("flujo-sharepoint", "Biblioteca documental", "SharePoint simulado y clasificación.", [
    { id: "s1", tipo: "origen", titulo: "SharePoint simulado", detalle: "Archivos de ejemplo.", sourceId: "sharepoint" },
    { id: "s2", tipo: "transformacion", titulo: "Extracción", detalle: "Toma el texto precargado.", sourceId: "ocr" },
    { id: "s3", tipo: "validacion", titulo: "Clasificación", detalle: "Asigna materia." },
    { id: "s4", tipo: "destino", titulo: "Búsqueda", detalle: "Deja el documento consultable." },
  ]),
  chain("flujo-360", "Vista 360", "Fuentes empresariales hacia una ficha.", [
    { id: "v1", tipo: "origen", titulo: "Registro", detalle: "RUES simulado.", sourceId: "rues" },
    { id: "v2", tipo: "consulta", titulo: "Finanzas y contratos", detalle: "SIREM y SECOP simulados.", sourceId: "sirem" },
    { id: "v3", tipo: "normalizacion", titulo: "Normalizar", detalle: "Conserva la evidencia de cada fuente." },
    { id: "v4", tipo: "destino", titulo: "Vista 360", detalle: "Ficha lista para revisión humana." },
  ]),
];

export function getFlow(id: string) {
  return FLOWS.find((f) => f.id === id) ?? null;
}
