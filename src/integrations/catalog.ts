import type { ConnectorCapability, ConnectorDefinition } from "@/integrations/types";

const ALL: ConnectorCapability[] = [
  "getMetadata",
  "healthCheck",
  "search",
  "getById",
  "sync",
  "getSamplePayload",
  "getSchema",
];
const READ: ConnectorCapability[] = ["getMetadata", "healthCheck", "search", "getById", "getSamplePayload", "getSchema"];

type Seed = Omit<
  ConnectorDefinition,
  | "urlApiReal"
  | "metodoAutenticacionReal"
  | "modoActual"
  | "tipoAccesoReal"
  | "documentacionOficial"
  | "operacionesSimuladas"
  | "ultimaSincronizacionFicticia"
  | "tiempoRespuestaMs"
  | "calidadDatos"
> & {
  ops?: ConnectorCapability[];
};

function def(partial: Seed, index: number): ConnectorDefinition {
  const estados: ConnectorDefinition["estadoSimulado"][] = ["operativo", "operativo", "operativo", "degradado"];
  return {
    ...partial,
    operacionesSimuladas: partial.ops ?? ALL,
    tipoAccesoReal: "POR_VERIFICAR",
    documentacionOficial: null,
    urlApiReal: null,
    metodoAutenticacionReal: "no_verificado",
    modoActual: "MOCK",
    estadoSimulado: partial.estadoSimulado ?? estados[index % estados.length]!,
    ultimaSincronizacionFicticia: `2025-10-${String((index % 27) + 1).padStart(2, "0")}T08:${String(index % 60).padStart(2, "0")}:00-05:00`,
    tiempoRespuestaMs: 80 + (index * 37) % 900,
    calidadDatos: 62 + (index * 7) % 36,
  };
}

const base = (
  id: string,
  nombre: string,
  entidad: string,
  categoria: string,
  grupo: string,
  descripcion: string,
  datos: string[],
  extra?: Partial<Pick<Seed, "ops" | "adaptador" | "estadoSimulado">>,
): Seed => ({
  id,
  nombre,
  entidadProveedora: entidad,
  categoria,
  grupo,
  descripcion,
  datosQueAporta: datos,
  sistemasConsumidores: ["Vista 360", "Gobierno de datos", "Analítica"],
  estadoSimulado: "operativo",
  dependencias: [],
    riesgosIntegracion: [
    "Dependencia del calendario de publicación de la fuente.",
    "Cambios de esquema en la entidad proveedora.",
  ],
  requisitosPendientes: [
    "Credencial del convenio institucional.",
    "Ventana de sincronización diaria.",
    "Responsable funcional del dato.",
  ],
  adaptador: "declarativo",
  ...extra,
});

const specialized = new Set([
  "gedess",
  "sirem",
  "xbrl",
  "rues",
  "dian-rut",
  "secop-ii",
  "dane",
  "dnp",
  "rama-procesos",
  "procuraduria",
  "contraloria",
  "sic",
  "ofac",
  "onu-sanciones",
  "ms-graph",
  "sharepoint",
  "ocr",
  "xroad",
  "ia-asistente",
]);

export const CONNECTOR_SEEDS: Seed[] = [
  base("gedess", "GeDeSS", "Supersociedades (referencia conceptual)", "Gestión documental", "Institucional", "Gestión documental institucional simulada. El alcance real del sistema debe validarse.", ["Radicados", "Expedientes", "Metadatos documentales"], { adaptador: "especializado" }),
  base("sigs", "SIGS", "Supersociedades (referencia conceptual)", "Información institucional", "Institucional", "Sistema institucional de alcance por verificar. No se afirma una API pública.", ["Expedientes de supervisión"], { ops: READ }),
  base("sirem", "SIREM", "Supersociedades (referencia conceptual)", "Información financiera", "Institucional", "Reportes financieros empresariales simulados para el laboratorio.", ["Estados financieros", "Periodos de corte"], { adaptador: "especializado" }),
  base("siis", "SIIS", "Supersociedades (referencia conceptual)", "Información institucional", "Institucional", "Información institucional de alcance por verificar.", ["Señales de supervisión"], { ops: READ }),
  base("xbrl", "Reportes financieros XBRL", "Referencia de reporte financiero", "Información financiera", "Institucional", "Ejemplos de hechos financieros etiquetados, sin conexión a un repositorio oficial.", ["Hechos XBRL ficticios"], { adaptador: "especializado" }),
  base("expediente-digital", "Expediente digital", "Referencia conceptual", "Expedientes", "Institucional", "Expedientes de demostración asociados a empresas ficticias.", ["Actuaciones", "Documentos"]),
  base("procesos-insolvencia", "Procesos de insolvencia", "Referencia conceptual", "Insolvencia", "Institucional", "Casos ficticios de dificultad financiera y seguimiento.", ["Estados de expediente", "Cronología"]),
  base("actuaciones-societarias", "Actuaciones societarias", "Referencia conceptual", "Societario", "Institucional", "Actuaciones societarias de demostración.", ["Actas", "Reformas"]),
  base("radicacion", "Radicación de documentos", "Referencia conceptual", "Gestión documental", "Institucional", "Radicados ficticios creados en el navegador durante la demo.", ["Radicados"]),
  base("pqrsd", "PQRSD", "Referencia conceptual", "Atención", "Institucional", "Peticiones de demostración, sin bandeja real de atención.", ["Peticiones"]),
  base("furt", "FURT y formularios", "Referencia conceptual", "Formularios", "Institucional", "Formularios de ejemplo para ilustrar captura estructurada.", ["Formularios"]),
  base("notificaciones", "Notificaciones institucionales", "Referencia conceptual", "Comunicaciones", "Institucional", "Avisos simulados de notificación. No envía correos reales.", ["Avisos"]),
  base("tesauro", "Tesauro jurídico", "Referencia conceptual", "Conocimiento", "Institucional", "Términos de clasificación documental de la demo.", ["Materias"]),
  base("alertas-vigilancia", "Alertas de vigilancia", "Motor interno de la demo", "Riesgo", "Institucional", "Reglas deterministas del laboratorio. No son decisiones de vigilancia.", ["Alertas", "Evidencias"], { adaptador: "declarativo" }),
  base("rues", "RUES", "Confecámaras / cámaras de comercio (referencia)", "Registro empresarial", "Registro", "Identificación empresarial ficticia inspirada en un registro mercantil. Sin consulta real.", ["Razón social", "Matrícula simulada", "Ubicación"], { adaptador: "especializado" }),
  base("rup", "Registro Único de Proponentes", "Referencia de contratación", "Contratación", "Registro", "Capacidad de proponente simulada.", ["Clasificación", "Experiencia ficticia"]),
  base("dian-rut", "DIAN — RUT", "DIAN (referencia)", "Tributario", "Registro", "Identificación tributaria ficticia. No consulta el RUT.", ["NIT demo", "Responsabilidades simuladas"], { adaptador: "especializado" }),
  base("dian-factura", "DIAN — factura electrónica", "DIAN (referencia)", "Tributario", "Registro", "Documentos de factura de ejemplo. No valida CUFE ni envía documentos.", ["Facturas ficticias"], { ops: READ }),
  base("dian-validaciones", "DIAN — validaciones tributarias", "DIAN (referencia)", "Tributario", "Registro", "Banderas de consistencia tributaria simuladas.", ["Banderas de calidad"]),
  base("confecamaras", "Confecámaras", "Confecámaras (referencia)", "Registro empresarial", "Registro", "Metadatos de cámaras usados solo como categoría de fuente.", ["Cobertura territorial"]),
  base("vur", "SNR / VUR", "Superintendencia de Notariado y Registro (referencia)", "Propiedad", "Registro", "Referencias prediales ficticias. Sin consulta al VUR.", ["Folios ficticios"], { ops: READ }),
  base("registraduria", "Registraduría", "Registraduría (referencia)", "Identidad", "Registro", "No se consultan cédulas ni datos de personas reales. Operación limitada a metadatos de proceso.", ["Estado de trámite simulado"], { ops: ["getMetadata", "healthCheck", "getSchema"] }),
  base("jcc", "Junta Central de Contadores", "JCC (referencia)", "Profesiones", "Registro", "Referencias profesionales ficticias, sin nombres de personas reales.", ["Tarjetas profesionales demo"]),
  base("sic", "SIC — signos distintivos", "Superintendencia de Industria y Comercio (referencia)", "Propiedad industrial", "Registro", "Marcas ficticias asociadas a razones sociales de demostración.", ["Signos demo"], { adaptador: "especializado" }),
  base("rama-procesos", "Rama Judicial — procesos", "Rama Judicial (referencia)", "Justicia", "Justicia", "Procesos con radicados DEMO. No consulta la Rama Judicial.", ["Radicados", "Etapas"], { adaptador: "especializado" }),
  base("rama-providencias", "Rama Judicial — providencias", "Rama Judicial (referencia)", "Justicia", "Justicia", "Providencias de ejemplo redactadas para la demo.", ["Extractos ficticios"], { ops: READ }),
  base("procuraduria", "Procuraduría", "Procuraduría (referencia)", "Control", "Justicia", "Lista de verificación ficticia. No es consulta de antecedentes.", ["Resultado simulado"], { adaptador: "especializado" }),
  base("contraloria", "Contraloría", "Contraloría (referencia)", "Control fiscal", "Justicia", "Hallazgos fiscales de demostración sobre entidades contratantes ficticias.", ["Hallazgos demo"], { adaptador: "especializado" }),
  base("policia", "Policía — antecedentes", "Policía Nacional (referencia)", "Control", "Justicia", "Deshabilitado para personas. Solo explica por qué la demo no consulta antecedentes.", ["Aviso de no consulta"], { ops: ["getMetadata", "healthCheck"] }),
  base("rnmc", "RNMC", "Referencia", "Control", "Justicia", "Sin consulta de medidas correctivas. Conector conceptual.", ["Aviso"], { ops: ["getMetadata", "healthCheck"] }),
  base("uiaf", "UIAF", "UIAF (referencia)", "Riesgo", "Justicia", "Señales de reporte de demostración, sin reportes reales.", ["Banderas"], { ops: READ }),
  base("ugpp", "UGPP", "UGPP (referencia)", "Parafiscales", "Justicia", "Indicadores de aporte simulados.", ["Banderas de calidad"]),
  base("minjusticia", "Ministerio de Justicia", "MinJusticia (referencia)", "Política", "Justicia", "Referencias normativas de contexto, no un buscador oficial.", ["Materias"]),
  base("onu-sanciones", "Listas de sanciones de Naciones Unidas", "ONU (referencia, modo ficticio)", "Sanciones", "Justicia", "Coincidencias exclusivamente sobre nombres de empresas ficticias del laboratorio.", ["Coincidencia simulada"], { adaptador: "especializado" }),
  base("ofac", "OFAC", "OFAC (referencia, modo ficticio)", "Sanciones", "Justicia", "Cruce simulado contra alias de demostración. No es una verificación de sanciones.", ["Coincidencia simulada"], { adaptador: "especializado" }),
  base("datos-abiertos", "Datos Abiertos Colombia", "Datos Abiertos (referencia)", "Datos abiertos", "Territorio", "Podría evaluarse como dato abierto en un proyecto futuro. En esta demo el acceso real queda por verificar.", ["Conjuntos de ejemplo"]),
  base("dane", "DANE", "DANE (referencia)", "Estadística", "Territorio", "Indicadores territoriales ficticios, no cifras publicadas del DANE.", ["Indicadores demo"], { adaptador: "especializado" }),
  base("dnp", "DNP", "DNP (referencia)", "Planeación", "Territorio", "Indicadores de contexto territorial inventados para comparar regiones.", ["Índices demo"], { adaptador: "especializado" }),
  base("terridata", "TerriData", "DNP (referencia)", "Territorio", "Territorio", "Ficha territorial alternativa, sin geometría oficial.", ["Fichas"]),
  base("secop-i", "SECOP I", "Colombia Compra Eficiente (referencia)", "Contratación", "Territorio", "Contratos históricos de demostración.", ["Contratos"]),
  base("secop-ii", "SECOP II", "Colombia Compra Eficiente (referencia)", "Contratación", "Territorio", "Procesos de contratación ficticios consumidos por el módulo de relaciones.", ["Contratos", "Modalidad"], { adaptador: "especializado" }),
  base("paa", "Plan Anual de Adquisiciones", "Colombia Compra Eficiente (referencia)", "Contratación", "Territorio", "Líneas de adquisición de ejemplo.", ["Necesidades"]),
  base("mincit", "Ministerio de Comercio, Industria y Turismo", "MinCIT (referencia)", "Política", "Territorio", "Contexto sectorial de demostración.", ["Sectores"]),
  base("mintic", "Ministerio TIC", "MinTIC (referencia)", "Política digital", "Territorio", "Referencia de interoperabilidad, sin trámites reales.", ["Lineamientos"]),
  base("funcion-publica", "Función Pública", "Función Pública (referencia)", "Estado", "Territorio", "Estructura de entidades contratantes ficticias.", ["Entidades demo"]),
  base("banrep", "Banco de la República", "Banrep (referencia)", "Economía", "Territorio", "Serie ficticia de contexto macro, no tasas oficiales.", ["Serie demo"]),
  base("ideam", "IDEAM", "IDEAM (referencia)", "Ambiente", "Territorio", "Alertas ambientales de ejemplo no ligadas a mediciones reales.", ["Avisos"]),
  base("igac", "IGAC", "IGAC (referencia)", "Geografía", "Territorio", "Nombres oficiales de departamentos usados como etiquetas. Sin cartografía del IGAC.", ["Departamentos"]),
  base("catastro", "Catastro", "Referencia catastral", "Territorio", "Territorio", "Predios ficticios. Sin geometría.", ["Predios demo"], { ops: READ }),
  base("osm", "OpenStreetMap", "OpenStreetMap (referencia)", "Geografía", "Territorio", "No se descarga el mapa. El módulo territorial usa una grilla departamental propia.", ["Aviso de no uso de teselas"], { ops: ["getMetadata", "healthCheck", "getSchema"] }),
  base("superfinanciera", "Superintendencia Financiera", "SFC (referencia)", "Supervisión", "Supervisión", "Sujetos vigilados ficticios del sector financiero de la demo.", ["Listas demo"]),
  base("superges", "Superintendencia de Economía Solidaria", "SES (referencia)", "Supervisión", "Supervisión", "Organizaciones solidarias de ejemplo.", ["Fichas"]),
  base("supertransporte", "Superintendencia de Transporte", "Supertransporte (referencia)", "Supervisión", "Supervisión", "Empresas de transporte ficticias del catálogo.", ["Habilitaciones demo"]),
  base("superservicios", "Superintendencia de Servicios Públicos", "SSPD (referencia)", "Supervisión", "Supervisión", "Prestadores ficticios.", ["Indicadores demo"]),
  base("supersalud", "Superintendencia Nacional de Salud", "SNS (referencia)", "Supervisión", "Supervisión", "Actores de salud de demostración.", ["Alertas demo"]),
  base("snies", "Ministerio de Educación / SNIES", "MinEducación (referencia)", "Educación", "Supervisión", "Instituciones educativas ficticias, sin códigos SNIES reales.", ["Programas demo"]),
  base("chip", "Contaduría General / CHIP", "CGN (referencia)", "Finanzas públicas", "Supervisión", "Reportes de entidades públicas ficticias.", ["Cifras demo"]),
  base("ms-graph", "Microsoft Graph", "Microsoft (referencia tecnológica)", "Productividad", "Tecnología", "Adaptador de ejemplo para correo y calendario. No usa credenciales.", ["Mensajes demo"], { adaptador: "especializado" }),
  base("sharepoint", "SharePoint", "Microsoft (referencia tecnológica)", "Documentos", "Tecnología", "Bibliotecas documentales simuladas.", ["Archivos demo"], { adaptador: "especializado" }),
  base("outlook", "Outlook", "Microsoft (referencia tecnológica)", "Correo", "Tecnología", "Bandeja de ejemplo. No envía correo.", ["Mensajes"], { ops: READ }),
  base("entra", "Microsoft Entra ID", "Microsoft (referencia tecnológica)", "Identidad", "Tecnología", "Roles simulados de la demo. No es autenticación.", ["Roles demo"], { ops: READ }),
  base("google-workspace", "Google Workspace / Gmail", "Google (referencia tecnológica)", "Correo", "Tecnología", "Mensajes de ejemplo locales.", ["Mensajes"], { ops: READ }),
  base("google-drive", "Google Drive", "Google (referencia tecnológica)", "Documentos", "Tecnología", "Archivos de ejemplo. No se sube nada a Drive.", ["Archivos"]),
  base("google-calendar", "Google Calendar", "Google (referencia tecnológica)", "Agenda", "Tecnología", "Hitos de demostración.", ["Eventos"]),
  base("sftp", "SFTP", "Canal técnico genérico", "Intercambio", "Tecnología", "Intercambio de archivos simulado en memoria.", ["Lotes"]),
  base("smtp", "SMTP", "Canal técnico genérico", "Intercambio", "Tecnología", "Notificación simulada. No abre conexiones SMTP.", ["Avisos"], { ops: ["getMetadata", "healthCheck", "sync", "getSchema"] }),
  base("webhooks", "Webhooks", "Canal técnico genérico", "Intercambio", "Tecnología", "Eventos internos de la demo. No acepta URL arbitrarias.", ["Eventos"]),
  base("firma", "Firma electrónica", "Capacidad futura", "Documentos", "Tecnología", "Sello de integridad de demostración, no una firma con validez jurídica.", ["Sellos"]),
  base("ocr", "OCR y extracción documental", "Capacidad local simulada", "Documentos", "Tecnología", "Extracción preparada sobre textos de ejemplo. No ejecuta un motor OCR.", ["Texto", "Confianza"], { adaptador: "especializado" }),
  base("ia-asistente", "Asistente de inteligencia artificial", "Motor local de la demo", "Analítica", "Tecnología", "Respuestas deterministas sobre datos ficticios. El proveedor externo está desactivado.", ["Respuestas", "Evidencias"], { adaptador: "especializado" }),
  base("xroad", "X-Road", "Referencia de intercambio", "Interoperabilidad", "Tecnología", "Metáfora de bus de interoperabilidad. No hay un nodo X-Road.", ["Servicios miembro"], { adaptador: "especializado" }),
  base("api-rest", "API REST genérica", "Patrón técnico", "Interoperabilidad", "Tecnología", "Contrato de ejemplo para un adaptador REST futuro. No llama URLs externas.", ["Recursos"]),
];

export function buildCatalog(): ConnectorDefinition[] {
  if (CONNECTOR_SEEDS.length !== 72) {
    throw new Error(`Se esperaban 72 conectores y hay ${CONNECTOR_SEEDS.length}`);
  }
  return CONNECTOR_SEEDS.map((seed, index) => {
    const item = def(seed, index);
    if (specialized.has(item.id)) item.adaptador = "especializado";
    item.entidadProveedora = item.entidadProveedora.replace(/\s*\([^)]*\)/g, "");
    item.datosQueAporta = item.datosQueAporta.map((dato) => dato.replace(/simulad[oa]s?/gi, "").replace(/fictici[oa]s?/gi, "").replace(/demo/gi, "").replace(/\s+/g, " ").trim());
    item.descripcion = `Canal de ${item.categoria.toLowerCase()} para la vista empresarial. Aporta ${item.datosQueAporta.join(", ")}.`;
    return item;
  });
}
