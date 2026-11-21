import { buildCatalog } from "@/integrations/catalog";
import { mulberry32, pad, pick } from "@/lib/simulation/rng";
import type {
  Actuacion,
  Alerta,
  Contrato,
  Documento,
  Empresa,
  EventoAuditoria,
  Expediente,
  ProcesoJuridico,
  RelacionEmpresarial,
  ReporteFinanciero,
  TerritorioIndicador,
} from "@/types/domain";
import type { ConnectorDefinition, ConnectorExecution } from "@/integrations/types";

export const SEED = 3602025;

const SECTORES = [
  "Manufactura",
  "Comercio",
  "Construcción",
  "Servicios profesionales",
  "Agroindustria",
  "Energía",
  "Transporte",
  "Salud",
  "Tecnología",
  "Financiero",
  "Educación",
  "Minería",
] as const;

const GEO = [
  ["Antioquia", "Medellín"],
  ["Bogotá D.C.", "Bogotá"],
  ["Valle del Cauca", "Cali"],
  ["Atlántico", "Barranquilla"],
  ["Santander", "Bucaramanga"],
  ["Cundinamarca", "Soacha"],
  ["Bolívar", "Cartagena"],
  ["Risaralda", "Pereira"],
  ["Norte de Santander", "Cúcuta"],
  ["Tolima", "Ibagué"],
  ["Caldas", "Manizales"],
  ["Nariño", "Pasto"],
  ["Córdoba", "Montería"],
  ["Meta", "Villavicencio"],
  ["Huila", "Neiva"],
  ["Magdalena", "Santa Marta"],
] as const;

const TIPOS = ["S.A.S.", "S.A.", "Ltda.", "S.C.A."] as const;
const TAMANOS: Empresa["tamanoEmpresarial"][] = ["micro", "pequena", "mediana", "grande"];
const MODALIDADES = ["Licitación pública", "Selección abreviada", "Mínima cuantía", "Contratación directa"];
const ENTIDADES = [
  "Alcaldía de Puerto Verde",
  "Gobernación de la Sabana Norte",
  "Instituto Regional de Infraestructura",
  "Empresa de Servicios del Litoral",
  "Fondo de Desarrollo Territorial",
];

const FEATURED: Array<Partial<Empresa> & { razonSocial: string; historia: string }> = [
  { razonSocial: "Andina Alimentos S.A.S.", tipoSocietario: "S.A.S.", sector: "Manufactura", departamento: "Antioquia", municipio: "Medellín", nivelRiesgo: "baja", etiquetas: ["caso-360", "referencia"], historia: "Caso de referencia con fuentes consistentes." },
  { razonSocial: "Horizonte Construcciones S.A.S.", tipoSocietario: "S.A.S.", sector: "Construcción", departamento: "Valle del Cauca", municipio: "Cali", nivelRiesgo: "critica", etiquetas: ["insolvencia", "caso-principal"], historia: "Caída de ingresos, pasivos crecientes y expediente de seguimiento." },
  { razonSocial: "Delta Laboratorios S.A.S.", tipoSocietario: "S.A.S.", sector: "Tecnología", departamento: "Bogotá D.C.", municipio: "Bogotá", nivelRiesgo: "media", etiquetas: ["innovacion"], historia: "Crecimiento con vacíos documentales." },
  { razonSocial: "Comercializadora del Caribe S.A.S.", tipoSocietario: "S.A.S.", sector: "Comercio", departamento: "Atlántico", municipio: "Barranquilla", nivelRiesgo: "alta", etiquetas: ["contratos", "concentracion"], historia: "Alta participación contractual con una sola entidad." },
  { razonSocial: "Innova Andes S.A.S.", tipoSocietario: "S.A.S.", sector: "Servicios profesionales", departamento: "Cundinamarca", municipio: "Soacha", nivelRiesgo: "baja", etiquetas: ["relaciones"], historia: "Vínculos societarios." },
  { razonSocial: "Pacífico Agroindustrial S.A.", razonSocialCorta: "PACIF AGRO", tipoSocietario: "S.A.", sector: "Agroindustria", departamento: "Nariño", municipio: "Pasto", nivelRiesgo: "alta", etiquetas: ["calidad-datos", "duplicado"], historia: "Nombre abreviado en una fuente y completo en otra." },
  { razonSocial: "Andes Norte Energía S.A.S.", tipoSocietario: "S.A.S.", sector: "Energía", departamento: "Santander", municipio: "Bucaramanga", nivelRiesgo: "media", etiquetas: ["territorio"], historia: "Comparativo territorial." },
  { razonSocial: "Caribe Logística Ltda.", tipoSocietario: "Ltda.", sector: "Transporte", departamento: "Bolívar", municipio: "Cartagena", nivelRiesgo: "media", etiquetas: ["procesos"], historia: "Procesos jurídicos asociados." },
  { razonSocial: "Orinoquía Minera S.A.", tipoSocietario: "S.A.", sector: "Minería", departamento: "Meta", municipio: "Villavicencio", nivelRiesgo: "alta", etiquetas: ["reporte-tardio"], historia: "Reporte financiero desactualizado." },
  { razonSocial: "Valle Industrial S.A.S.", tipoSocietario: "S.A.S.", sector: "Manufactura", departamento: "Valle del Cauca", municipio: "Cali", nivelRiesgo: "baja", etiquetas: ["comparacion"], historia: "Par de comparación industrial." },
];

export type Dataset = {
  empresas: Empresa[];
  reportes: ReporteFinanciero[];
  contratos: Contrato[];
  procesos: ProcesoJuridico[];
  documentos: Documento[];
  actuaciones: Actuacion[];
  alertas: Alerta[];
  expedientes: Expediente[];
  relaciones: RelacionEmpresarial[];
  auditoria: EventoAuditoria[];
  conectores: ConnectorDefinition[];
  ejecuciones: ConnectorExecution[];
  territorio: TerritorioIndicador[];
};

function ciiu(sector: string) {
  const map: Record<string, string> = {
    Manufactura: "C1410",
    Comercio: "G4690",
    Construcción: "F4111",
    "Servicios profesionales": "M7020",
    Agroindustria: "A0126",
    Energía: "D3511",
    Transporte: "H4923",
    Salud: "Q8610",
    Tecnología: "J6201",
    Financiero: "K6499",
    Educación: "P8544",
    Minería: "B0729",
  };
  return map[sector] ?? "S9609";
}

function buildFeaturedFinancials(empresa: Empresa, index: number): ReporteFinanciero[] {
  const periods = ["2022", "2023", "2024"];
  if (empresa.etiquetas.includes("insolvencia")) {
    const rows = [
      { ingresos: 48_000_000_000, activos: 62_000_000_000, pasivos: 30_000_000_000, utilidad: 2_400_000_000 },
      { ingresos: 31_000_000_000, activos: 58_000_000_000, pasivos: 49_000_000_000, utilidad: -4_200_000_000 },
      { ingresos: 18_500_000_000, activos: 51_000_000_000, pasivos: 63_000_000_000, utilidad: -8_700_000_000 },
    ];
    return periods.map((periodo, i) => ({
      id: `DEMO-FIN-${pad(index)}-${periodo}`,
      empresaId: empresa.id,
      periodo,
      ...rows[i]!,
      patrimonio: rows[i]!.activos - rows[i]!.pasivos,
      fuente: i === 2 ? "xbrl" : "sirem",
      fechaCorte: `${periodo}-12-31`,
      calidadDato: i === 2 ? 0.71 : 0.93,
    }));
  }
  if (empresa.etiquetas.includes("calidad-datos")) {
    return periods.map((periodo, i) => ({
      id: `DEMO-FIN-${pad(index)}-${periodo}`,
      empresaId: empresa.id,
      periodo,
      ingresos: 12_000_000_000 - i * 400_000_000,
      activos: 20_000_000_000,
      pasivos: 9_000_000_000,
      patrimonio: 11_000_000_000,
      utilidad: i === 1 ? 0 : 800_000_000,
      fuente: i === 1 ? "dian-validaciones" : "sirem",
      fechaCorte: i === 1 ? `${Number(periodo) + 1}-02-02` : `${periodo}-12-31`,
      calidadDato: i === 1 ? 0.48 : 0.9,
      incompleto: i === 1,
    }));
  }
  return periods.map((periodo, i) => {
    const ingresos = 8_000_000_000 + index * 900_000_000 + i * 600_000_000;
    const activos = ingresos * 1.4;
    const pasivos = activos * (0.35 + (index % 5) * 0.04);
    const utilidad = ingresos * (0.06 + (i - 1) * 0.01);
    return {
      id: `DEMO-FIN-${pad(index)}-${periodo}`,
      empresaId: empresa.id,
      periodo,
      ingresos: Math.round(ingresos),
      activos: Math.round(activos),
      pasivos: Math.round(pasivos),
      patrimonio: Math.round(activos - pasivos),
      utilidad: Math.round(utilidad),
      fuente: "sirem",
      fechaCorte: `${periodo}-12-31`,
      calidadDato: 0.9,
    };
  });
}

export function createDataset(): Dataset {
  const rng = mulberry32(SEED);
  const empresas: Empresa[] = [];

  FEATURED.forEach((item, i) => {
    const n = i + 1;
    empresas.push({
      id: `DEMO-EMP-${pad(n)}`,
      identificadorDemo: `DEMO-EMP-${pad(n)}`,
      nitDemo: `DEMO-NIT-${pad(n)}`,
      razonSocial: item.razonSocial,
      razonSocialCorta: item.razonSocialCorta,
      tipoSocietario: item.tipoSocietario ?? "S.A.S.",
      actividadCiiu: ciiu(item.sector ?? "Comercio"),
      sector: item.sector ?? "Comercio",
      departamento: item.departamento ?? "Bogotá D.C.",
      municipio: item.municipio ?? "Bogotá",
      estadoMatriculaSimulado: "activa",
      estadoSupervisionSimulado: item.nivelRiesgo === "critica" ? "seguimiento_especial" : "ordinaria",
      fechaConstitucionFicticia: `201${i % 8}-0${(i % 8) + 1}-15`,
      tamanoEmpresarial: item.nivelRiesgo === "critica" ? "grande" : "mediana",
      nivelRiesgo: item.nivelRiesgo ?? "media",
      etiquetas: [...(item.etiquetas ?? []), "destacada"],
      calidadRegistro: item.etiquetas?.includes("calidad-datos") ? 0.55 : 0.94,
    });
  });

  for (let n = FEATURED.length + 1; n <= 200; n += 1) {
    const sector = pick(rng, SECTORES);
    const [departamento, municipio] = pick(rng, GEO);
    const tipo = pick(rng, TIPOS);
    const tam = pick(rng, TAMANOS);
    const riesgoRoll = rng();
    const nivelRiesgo: Empresa["nivelRiesgo"] =
      riesgoRoll > 0.93 ? "critica" : riesgoRoll > 0.78 ? "alta" : riesgoRoll > 0.5 ? "media" : "baja";
    const incompleta = rng() > 0.94;
    empresas.push({
      id: `DEMO-EMP-${pad(n)}`,
      identificadorDemo: `DEMO-EMP-${pad(n)}`,
      nitDemo: `DEMO-NIT-${pad(n)}`,
      razonSocial: `${pick(rng, ["Andes", "Río", "Litoral", "Cumbre", "Sabana", "Bruma", "Norte", "Sur"])} ${pick(rng, ["Andina", "del Valle", "del Pacífico", "Nacional", "Asociados"])} ${tipo}`,
      tipoSocietario: tipo,
      actividadCiiu: incompleta ? "" : ciiu(sector),
      sector,
      departamento,
      municipio,
      estadoMatriculaSimulado: rng() > 0.96 ? "cancelada" : "activa",
      estadoSupervisionSimulado: nivelRiesgo === "critica" || nivelRiesgo === "alta" ? "seguimiento" : "ordinaria",
      fechaConstitucionFicticia: `${2004 + Math.floor(rng() * 18)}-${pad(1 + Math.floor(rng() * 12), 2)}-${pad(1 + Math.floor(rng() * 27), 2)}`,
      tamanoEmpresarial: tam,
      nivelRiesgo,
      etiquetas: incompleta ? ["incompleta"] : [],
      calidadRegistro: incompleta ? 0.42 : Math.round((0.72 + rng() * 0.26) * 100) / 100,
    });
  }

  const reportes: ReporteFinanciero[] = [];
  empresas.forEach((empresa, index) => {
    if (index < FEATURED.length) {
      reportes.push(...buildFeaturedFinancials(empresa, index + 1));
      return;
    }
    const baseIngresos = (empresa.tamanoEmpresarial === "grande" ? 40 : empresa.tamanoEmpresarial === "mediana" ? 12 : empresa.tamanoEmpresarial === "pequena" ? 3 : 0.8) * 1_000_000_000;
    for (const [offset, periodo] of ["2022", "2023", "2024"].entries()) {
      const factor = 0.85 + rng() * 0.4 - (empresa.nivelRiesgo === "critica" ? offset * 0.12 : 0);
      const ingresos = Math.round(baseIngresos * factor);
      const activos = Math.round(ingresos * (1.1 + rng()));
      const leverage = empresa.nivelRiesgo === "critica" ? 1.05 + rng() * 0.2 : 0.3 + rng() * 0.5;
      const pasivos = Math.round(activos * leverage);
      const utilidad = Math.round(ingresos * (empresa.nivelRiesgo === "alta" || empresa.nivelRiesgo === "critica" ? -0.08 - rng() * 0.05 : 0.04 + rng() * 0.08));
      const tardio = empresa.etiquetas.includes("incompleta") && periodo === "2024";
      reportes.push({
        id: `DEMO-FIN-${pad(index + 1)}-${periodo}`,
        empresaId: empresa.id,
        periodo,
        ingresos,
        activos,
        pasivos,
        patrimonio: activos - pasivos,
        utilidad,
        fuente: rng() > 0.85 ? "xbrl" : "sirem",
        fechaCorte: tardio ? "2024-06-30" : `${periodo}-12-31`,
        calidadDato: tardio ? 0.5 : Math.round((0.7 + rng() * 0.28) * 100) / 100,
        incompleto: tardio,
      });
    }
  });

  const contratos: Contrato[] = [];
  for (let i = 1; i <= 350; i += 1) {
    const prefer = i <= 28 ? "DEMO-EMP-0004" : empresas[Math.floor(rng() * empresas.length)]!.id;
    const empresa = empresas.find((e) => e.id === prefer)!;
    contratos.push({
      id: `DEMO-CON-${pad(i)}`,
      empresaId: empresa.id,
      entidadContratanteFicticia: pick(rng, ENTIDADES),
        objeto: `Suministro ${i} para ${empresa.sector.toLowerCase()}`,
      valorCOP: Math.round((50_000_000 + rng() * (empresa.id === "DEMO-EMP-0004" ? 8_000_000_000 : 2_000_000_000)) / 1000) * 1000,
      fecha: `202${2 + (i % 3)}-${pad(1 + (i % 12), 2)}-${pad(1 + (i % 27), 2)}`,
      modalidad: pick(rng, MODALIDADES),
      estado: rng() > 0.8 ? "liquidado" : rng() > 0.5 ? "en_ejecucion" : "adjudicado",
      fuente: i % 3 === 0 ? "secop-i" : "secop-ii",
      sector: empresa.sector,
    });
  }

  const procesos: ProcesoJuridico[] = [];
  for (let i = 1; i <= 150; i += 1) {
    const empresa = i <= 6 ? empresas[i % 2 === 0 ? 1 : 7]! : empresas[Math.floor(rng() * empresas.length)]!;
    procesos.push({
      id: `DEMO-PRC-${pad(i)}`,
      empresaId: empresa.id,
      radicadoFicticio: `DEMO-RAD-23-${pad(i, 5)}`,
      tipo: pick(rng, ["Civil", "Laboral", "Administrativo", "Societario"]),
      etapa: pick(rng, ["Admisión", "Pruebas", "Alegatos", "Sentencia de ejemplo"]),
      fechaInicio: `202${1 + (i % 4)}-${pad(1 + (i % 12), 2)}-10`,
      estado: rng() > 0.75 ? "archivado" : "activo",
      fuente: "rama-procesos",
    });
  }

  const expedientes: Expediente[] = [];
  for (let i = 1; i <= 100; i += 1) {
    const empresa = i === 1 ? empresas[1]! : empresas[(i * 3) % empresas.length]!;
    expedientes.push({
      id: `DEMO-EXP-${pad(i)}`,
      empresaId: empresa.id,
      tipo: i === 1 ? "Insolvencia" : pick(rng, ["Supervisión", "Documental", "Contratación", "Societario"]),
      estado: i === 1 ? "en_seguimiento" : pick(rng, ["abierto", "en_seguimiento", "cerrado"]),
      responsableDemo: pick(rng, ["Equipo jurídico", "Equipo financiero", "Equipo de supervisión"]),
      resumen: i === 1 ? "Expediente de Horizonte Construcciones S.A.S. con señales de dificultad financiera." : `Expediente ${i} de ${empresa.razonSocial}.`,
      fechaApertura: `2024-${pad(1 + (i % 12), 2)}-${pad(1 + (i % 27), 2)}`,
    });
  }

  const documentos: Documento[] = [];
  const muestras = [
    "Solicitud radicada por Horizonte Construcciones S.A.S. sobre reorganización.",
    "Estado financiero con caída de ingresos operacionales.",
    "Contrato de suministro con la Alcaldía de Puerto Verde.",
  ];
  for (let i = 1; i <= 300; i += 1) {
    const exp = expedientes[(i - 1) % expedientes.length]!;
    documentos.push({
      id: `DEMO-DOC-${pad(i)}`,
      expedienteId: i % 17 === 0 ? null : exp.id,
      empresaId: exp.empresaId,
      nombre: i <= 3 ? `Documento ${i}.txt` : `Documento ${i}.pdf`,
      tipo: pick(rng, ["Memorial", "Estados financieros", "Contrato", "Certificación", "Oficio"]),
      fecha: `2025-${pad(1 + (i % 10), 2)}-${pad(1 + (i % 27), 2)}`,
      clasificacion: i === 1 ? "Insolvencia" : pick(rng, ["Financiero", "Contractual", "Societario", "Atención"]),
      contenidoFicticio: i <= 3 ? muestras[i - 1]! : `Texto del documento ${i} asociado a ${exp.empresaId}.`,
      confianzaSimulada: i <= 3 ? 0.86 : Math.round((0.6 + rng() * 0.38) * 100) / 100,
    });
  }

  const actuaciones: Actuacion[] = [];
  for (let i = 1; i <= 200; i += 1) {
    const exp = expedientes[i % expedientes.length]!;
    actuaciones.push({
      id: `DEMO-ACT-${pad(i)}`,
      expedienteId: exp.id,
      empresaId: exp.empresaId,
      descripcion: `Actuación ${i}: revisión de piezas del expediente ${exp.id}.`,
      fecha: `2025-${pad(1 + (i % 10), 2)}-${pad(1 + (i % 27), 2)}`,
      tipo: pick(rng, ["Reparto", "Requerimiento", "Respuesta", "Nota interna"]),
    });
  }

  const alertas: Alerta[] = [];
  const pushAlert = (a: Alerta) => alertas.push(a);
  pushAlert({
    id: "DEMO-ALR-0001",
    empresaId: "DEMO-EMP-0002",
    tipo: "Financiero",
    severidad: "critica",
    descripcion: "Los pasivos del periodo 2024 superan los activos.",
    reglaAplicada: "R-PASIVOS-ACTIVOS",
    evidencias: ["DEMO-FIN-0002-2024"],
    estado: "abierta",
    fecha: "2025-10-15",
    responsableDemo: null,
  });
  pushAlert({
    id: "DEMO-ALR-0002",
    empresaId: "DEMO-EMP-0002",
    tipo: "Financiero",
    severidad: "alta",
    descripcion: "Los ingresos cayeron más de 30% entre 2023 y 2024.",
    reglaAplicada: "R-CAIDA-INGRESOS",
    evidencias: ["DEMO-FIN-0002-2023", "DEMO-FIN-0002-2024"],
    estado: "abierta",
    fecha: "2025-10-15",
    responsableDemo: null,
  });
  pushAlert({
    id: "DEMO-ALR-0003",
    empresaId: "DEMO-EMP-0002",
    tipo: "Financiero",
    severidad: "alta",
    descripcion: "Pérdidas en dos ejercicios consecutivos.",
    reglaAplicada: "R-PERDIDAS",
    evidencias: ["DEMO-FIN-0002-2023", "DEMO-FIN-0002-2024"],
    estado: "en_revision",
    fecha: "2025-10-16",
    responsableDemo: "Equipo financiero",
  });
  pushAlert({
    id: "DEMO-ALR-0004",
    empresaId: "DEMO-EMP-0006",
    tipo: "Calidad",
    severidad: "media",
    descripcion: "La razón social abreviada no coincide con el registro completo y una fecha de corte difiere.",
    reglaAplicada: "R-DIFERENCIA-FUENTES",
    evidencias: ["rues", "sirem", "dian-validaciones"],
    estado: "abierta",
    fecha: "2025-09-30",
    responsableDemo: null,
  });
  pushAlert({
    id: "DEMO-ALR-0005",
    empresaId: "DEMO-EMP-0004",
    tipo: "Contratación",
    severidad: "alta",
    descripcion: "Concentración de contratos con una sola entidad contratante.",
    reglaAplicada: "R-CONCENTRACION",
    evidencias: ["DEMO-CON-0001"],
    estado: "abierta",
    fecha: "2025-10-02",
    responsableDemo: null,
  });

  for (let i = alertas.length + 1; i <= 150; i += 1) {
    const empresa = empresas[Math.floor(rng() * empresas.length)]!;
    const tipo = pick(rng, ["Financiero", "Calidad", "Jurídico", "Contratación", "Documental"]);
    alertas.push({
      id: `DEMO-ALR-${pad(i)}`,
      empresaId: empresa.id,
      tipo,
      severidad: empresa.nivelRiesgo === "baja" ? "baja" : pick(rng, ["media", "alta"] as const),
      descripcion: `Señal ${i} de tipo ${tipo.toLowerCase()} sobre ${empresa.razonSocial}.`,
      reglaAplicada: tipo === "Calidad" ? "R-INCOMPLETA" : tipo === "Jurídico" ? "R-PROCESOS" : "R-VARIACION",
      evidencias: [empresa.id],
      estado: rng() > 0.72 ? "cerrada" : rng() > 0.55 ? "en_revision" : "abierta",
      fecha: `2025-${pad(1 + (i % 10), 2)}-${pad(1 + (i % 27), 2)}`,
      responsableDemo: rng() > 0.6 ? "Equipo de supervisión" : null,
    });
  }

  const relaciones: RelacionEmpresarial[] = [
    { id: "DEMO-REL-0001", origen: "DEMO-EMP-0005", destino: "DEMO-EMP-0001", tipoRelacion: "proveedor", fuente: "rues", esSimulada: true },
    { id: "DEMO-REL-0002", origen: "DEMO-EMP-0005", destino: "DEMO-EMP-0003", tipoRelacion: "vinculo_societario", fuente: "rues", esSimulada: true },
    { id: "DEMO-REL-0003", origen: "DEMO-EMP-0004", destino: "DEMO-EMP-0007", tipoRelacion: "consorcio_demo", fuente: "secop-ii", esSimulada: true },
    { id: "DEMO-REL-0004", origen: "DEMO-EMP-0010", destino: "DEMO-EMP-0002", tipoRelacion: "acreedor_demo", fuente: "sirem", esSimulada: true },
    { id: "DEMO-REL-0005", origen: "DEMO-EMP-0008", destino: "DEMO-EMP-0004", tipoRelacion: "subcontratista", fuente: "secop-ii", esSimulada: true },
  ];
  for (let i = relaciones.length + 1; i <= 80; i += 1) {
    const a = empresas[Math.floor(rng() * 80)]!;
    const b = empresas[Math.floor(rng() * 80)]!;
    if (a.id === b.id) continue;
    relaciones.push({
      id: `DEMO-REL-${pad(i)}`,
      origen: a.id,
      destino: b.id,
      tipoRelacion: pick(rng, ["proveedor", "cliente", "vinculo_societario"]),
      fuente: "rues",
      esSimulada: true,
    });
  }

  const conectores = buildCatalog();
  const ejecuciones: ConnectorExecution[] = conectores.slice(0, 40).map((c, i) => ({
    id: `DEMO-EXE-${pad(i + 1)}`,
    sourceId: c.id,
    operacion: "sync",
    estado: c.estadoSimulado === "degradado" ? "parcial" : "ok",
    fecha: c.ultimaSincronizacionFicticia,
    duracionMs: c.tiempoRespuestaMs,
    detalle: "Sincronización del catálogo.",
  }));

  const auditoria: EventoAuditoria[] = [
    {
      id: "DEMO-AUD-0001",
      accion: "carga_inicial",
      usuarioDemo: "sistema_demo",
      recurso: "dataset",
      fecha: "2025-10-29T08:00:00-05:00",
      detalle: "Carga del corte del 29 de octubre de 2025.",
    },
  ];

  const porDepto = new Map<string, Empresa[]>();
  for (const e of empresas) {
    const list = porDepto.get(e.departamento) ?? [];
    list.push(e);
    porDepto.set(e.departamento, list);
  }
  const territorio: TerritorioIndicador[] = [...porDepto.entries()].map(([departamento, list]) => {
    const sectores = new Map<string, number>();
    for (const e of list) sectores.set(e.sector, (sectores.get(e.sector) ?? 0) + 1);
    const sectorPrincipal = [...sectores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return {
      departamento,
      empresas: list.length,
      riesgoAlto: list.filter((e) => e.nivelRiesgo === "alta" || e.nivelRiesgo === "critica").length,
      indiceActividadFicticio: Math.round(40 + list.length * 1.7),
      sectorPrincipal,
    };
  });

  return { empresas, reportes, contratos, procesos, documentos, actuaciones, alertas, expedientes, relaciones, auditoria, conectores, ejecuciones, territorio };
}

let cached: Dataset | null = null;
export function getDataset(): Dataset {
  if (!cached) cached = createDataset();
  return cached;
}
