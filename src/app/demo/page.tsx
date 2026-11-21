"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card } from "@/components/ui/primitives";
import { useDemoStore } from "@/lib/storage/store";

type Paso = { t: string; href: string; donde: string; hacer: string; ver: string };

const ESCENARIOS: { id: string; nombre: string; minutos: number; fuentes: string; objetivo: string; resultado: string; pasos: Paso[] }[] = [
  {
    id: "s1",
    nombre: "Una empresa en 360 grados",
    minutos: 8,
    fuentes: "RUES en vivo, ficha de plataforma, SIREM, finanzas",
    objetivo: "Armar la lectura de Andina Alimentos S.A.S. con el registro de la plataforma y, aparte, una consulta real a RUES.",
    resultado: "Ficha con pestañas recorridas e informe listo para imprimir. La consulta de RUES no se mezcla con el identificador de la plataforma.",
    pasos: [
      { t: "Abrir la ficha", href: "/empresas/DEMO-EMP-0001", donde: "Sociedades → Andina Alimentos S.A.S.", hacer: "Entre por el enlace de este paso. Confirme el nombre, el sector Manufactura y Medellín, Antioquia. No cambie de empresa.", ver: "El encabezado muestra Andina Alimentos S.A.S. y el nivel de riesgo." },
      { t: "Leer el resumen", href: "/empresas/DEMO-EMP-0001", donde: "Pestaña Resumen", hacer: "Pulse Resumen. Recorra la línea de tiempo desde la constitución hasta los cortes 2022, 2023 y 2024. Mire el gráfico de ingresos.", ver: "Hay tres cortes y la serie de ingresos en millones de pesos." },
      { t: "Cruzar finanzas", href: "/finanzas", donde: "Finanzas", hacer: "En el selector de empresa deje o elija Andina Alimentos S.A.S. Compare la tendencia del último año con activos, pasivos, patrimonio y utilidad.", ver: "La tendencia aparece en porcentaje y el balance del último ejercicio está listado." },
      { t: "Consultar RUES real", href: "/integraciones/rues", donde: "Integraciones → RUES", hacer: "Verifique la insignia Integración real. En Consulta de registros elija Buscar por nombre, escriba un nombre publicado (por ejemplo Éxito) y pulse Consultar. No use el identificador de Andina Alimentos: esa sociedad no está en el registro mercantil.", ver: "Llega una respuesta del registro externo, separada de la ficha de la plataforma." },
      { t: "Ver el origen de los datos de la ficha", href: "/empresas/DEMO-EMP-0001", donde: "Pestaña Trazabilidad", hacer: "Vuelva a la ficha. Abra Trazabilidad. Alterne Ver respuesta original y Ver datos normalizados.", ver: "La original y la normalizada se muestran distintas, con la fuente y la confianza." },
      { t: "Cerrar con el informe", href: "/informes", donde: "Informes", hacer: "Elija Perfil empresarial, la empresa Andina Alimentos S.A.S. y el periodo 2024. Marque Indicadores, Hallazgos y Fuentes. Pulse Imprimir si quiere guardar el PDF del navegador.", ver: "La vista previa trae el nombre, el riesgo y el pie con el corte del 29 de octubre de 2025." },
    ],
  },
  {
    id: "s2",
    nombre: "Alerta temprana de insolvencia",
    minutos: 8,
    fuentes: "SIREM en vivo, reglas, expediente",
    objetivo: "Seguir a Horizonte Construcciones S.A.S. desde la caída de ingresos hasta el expediente.",
    resultado: "Reglas disparadas, alerta en revisión y expediente abierto.",
    pasos: [
      { t: "Abrir el caso", href: "/insolvencia", donde: "Insolvencia", hacer: "Lea la ficha de Horizonte Construcciones S.A.S. Compare ingresos y la relación activos/pasivos de 2022, 2023 y 2024. Abra el expediente que aparece en la misma pantalla.", ver: "2024 muestra pasivos por encima de activos y utilidad negativa. Hay una recomendación de revisión humana." },
      { t: "Ejecutar las reglas", href: "/vigilancia", donde: "Vigilancia", hacer: "En el selector elija Horizonte Construcciones S.A.S. Pulse Ejecutar evaluación. Lea cada regla y su evidencia.", ver: "Aparecen al menos pasivos superiores a activos y caída de ingresos." },
      { t: "Trabajar la alerta", href: "/vigilancia/alertas", donde: "Alertas", hacer: "Filtre estado Abierta. Localice una alerta de Horizonte Construcciones. Pulse Asignar y revisar. Si quiere dejar constancia, pulse Crear expediente.", ver: "El mensaje de estado confirma la asignación o el expediente creado en este navegador." },
      { t: "Estados financieros reales", href: "/integraciones/sirem", donde: "Integraciones → SIREM", hacer: "Confirme Integración real. Elija Estados financieros, escriba un NIT publicado de 9 dígitos sin puntos ni dígito de verificación y pulse Consultar. El NIT de la plataforma no sirve aquí.", ver: "La respuesta lista los ejercicios publicados para esa sociedad, sin mezclarse con Horizonte Construcciones." },
      { t: "Pedir el resumen", href: "/asistente", donde: "Asistente", hacer: "Pulse la pregunta Genera un resumen gerencial de este caso y luego Consultar. Abra los enlaces de evidencia.", ver: "La respuesta cita los ejercicios de Horizonte Construcciones y enlaza la ficha y el módulo de insolvencia." },
    ],
  },
  {
    id: "s3",
    nombre: "Contratación y relaciones",
    minutos: 7,
    fuentes: "SECOP en vivo y contratos de la plataforma",
    objetivo: "Ver la concentración de Comercializadora del Caribe S.A.S. y contrastarla con una consulta real de SECOP.",
    resultado: "Participación por entidad, relaciones y un informe de contratación.",
    pasos: [
      { t: "Abrir al contratista", href: "/empresas/DEMO-EMP-0004", donde: "Ficha de Comercializadora del Caribe S.A.S.", hacer: "Abra la pestaña Contratación. Cuente los contratos y las entidades. Luego abra Relaciones y pulse los identificadores de las sociedades vinculadas.", ver: "Hay varios contratos y al menos un vínculo con otra sociedad de la plataforma." },
      { t: "Filtrar el módulo", href: "/contratacion", donde: "Contratación", hacer: "En el campo de empresa escriba DEMO-EMP-0004. Mire el valor filtrado, el gráfico por sector y el bloque Mayor participación.", ver: "El total y el ranking cambian y esa sociedad queda entre las de mayor valor." },
      { t: "Consultar SECOP real", href: "/contratacion", donde: "Consulta SECOP en vivo, al inicio de Contratación", hacer: "Escriba un proveedor o NIT que exista en SECOP II, elija Contratos SECOP II y pulse Consultar. Abra Ver respuesta original en un resultado. No busque DEMO-EMP-0004.", ver: "Los registros traen la URL de datos.gov.co y no tienen identificador de la plataforma." },
      { t: "Cerrar el reporte", href: "/informes", donde: "Informes", hacer: "Elija Contratación, la empresa Comercializadora del Caribe S.A.S. y Descargar CSV o JSON.", ver: "El archivo se descarga con el tipo de informe y los conteos del corte." },
    ],
  },
  {
    id: "s4",
    nombre: "Radicación de un documento",
    minutos: 6,
    fuentes: "Extracción y expediente",
    objetivo: "Llevar un documento precargado hasta un radicado, con confirmación antes de crearlo.",
    resultado: "Radicado asociado a un expediente y anotado en auditoría.",
    pasos: [
      { t: "Elegir el documento", href: "/radicacion", donde: "Radicación, paso 1", hacer: "En el selector deje Documento 1. El texto habla de reorganización de Horizonte Construcciones S.A.S. Pulse Continuar.", ver: "El paso 2 muestra el mismo texto leído en el navegador." },
      { t: "Revisar clasificación y sociedad", href: "/radicacion", donde: "Pasos 3 a 5", hacer: "Avance con Continuar. Confirme la materia Insolvencia, la sociedad DEMO-EMP-0002 y el trámite de seguimiento.", ver: "La confianza de la sugerencia queda visible antes de las validaciones." },
      { t: "Validar y confirmar", href: "/radicacion", donde: "Pasos 6 a 9", hacer: "Lea las tres validaciones. Siga hasta el paso en el que el botón dice Confirmar y radicar. Púlselo una sola vez.", ver: "Aparece un radicado con prefijo DEMO-RAD-LOCAL y el nombre del documento de origen." },
      { t: "Comprobar la auditoría", href: "/auditoria", donde: "Auditoría", hacer: "Busque la acción radicacion en la primera tarjeta.", ver: "El detalle incluye el identificador del radicado que acaba de crear." },
    ],
  },
  {
    id: "s5",
    nombre: "Falla y recuperación de una fuente",
    minutos: 7,
    fuentes: "Flujo de perfil y RUES",
    objetivo: "Ejecutar el flujo de perfil, sacar a RUES de línea y volver a dejarla operativa.",
    resultado: "El flujo se detiene de forma controlada y la auditoría guarda la incidencia.",
    pasos: [
      { t: "Ejecutar el flujo sano", href: "/flujos/flujo-perfil", donde: "Flujos → Perfil empresarial", hacer: "Pulse Ejecutar. Abra cada paso de la lista y revise entrada y salida del nodo seleccionado.", ver: "El estado queda completado y el texto dice Flujo terminado." },
      { t: "Marcar la caída", href: "/observabilidad", donde: "Operación de integraciones", hacer: "En el selector elija RUES. Pulse Marcar caída. Lea el mensaje de estado.", ver: "RUES queda fuera de línea y el texto advierte que los flujos dependientes se detienen." },
      { t: "Ver el efecto en el flujo", href: "/flujos/flujo-perfil", donde: "El mismo flujo", hacer: "Pulse Ejecutar otra vez. Lea el primer paso y los que quedan omitidos.", ver: "El primer nodo termina en error y los siguientes dicen que no se ejecutaron." },
      { t: "Recuperar y reintentar", href: "/observabilidad", donde: "Operación de integraciones", hacer: "Con RUES seleccionado pulse Recuperar y luego Reintentar sincronización. Vuelva al flujo y pulse Ejecutar.", ver: "La fuente queda operativa y el flujo vuelve a terminar completo." },
      { t: "Revisar la auditoría", href: "/auditoria", donde: "Auditoría", hacer: "Recorra las primeras acciones: flujo ejecutado, incidencia y recuperación.", ver: "Cada tarjeta tiene fecha y el identificador del flujo o de la fuente." },
    ],
  },
  {
    id: "s6",
    nombre: "Gobierno y calidad de datos",
    minutos: 6,
    fuentes: "RUES, DIAN y SIREM de la plataforma",
    objetivo: "Comparar tres versiones de Pacífico Agroindustrial S.A. sin borrar las originales.",
    resultado: "Conflicto explicado, regla de consolidación y ficha con el alias visible.",
    pasos: [
      { t: "Abrir el caso de calidad", href: "/gobierno-datos", donde: "Gobierno de datos", hacer: "Baje hasta Pacífico Agroindustrial S.A. Lea en orden: registros originales, coincidencia, conflicto, regla, consolidado y evidencias.", ver: "Una fuente muestra PACIF AGRO y otra la razón social completa. El consolidado conserva la razón social larga." },
      { t: "Contrastar los dos paneles", href: "/gobierno-datos", donde: "Los dos recuadros de JSON", hacer: "A la izquierda están los originales. A la derecha, los atributos consolidados. No hay un botón que reemplace la fuente.", ver: "El alias y la fecha de corte distinta siguen en el panel izquierdo." },
      { t: "Abrir la ficha", href: "/empresas/DEMO-EMP-0006", donde: "Pestaña Empresarial y luego Trazabilidad", hacer: "En Empresarial lea el alias tributario. En Trazabilidad alterne respuesta original y datos normalizados.", ver: "El alias PACIF AGRO sigue visible junto a Pacífico Agroindustrial S.A." },
    ],
  },
  {
    id: "s7",
    nombre: "Informe ejecutivo",
    minutos: 5,
    fuentes: "Panel e informes",
    objetivo: "Pasar de los indicadores del corte a un archivo descargable.",
    resultado: "Vista previa coherente con el panel y un JSON o CSV.",
    pasos: [
      { t: "Leer el corte", href: "/dashboard", donde: "Panel ejecutivo", hacer: "Cambie el periodo entre 2022, 2023 y 2024. Abra Empresas que requieren revisión y entre a una ficha. Vuelva al panel con el navegador.", ver: "Las tarjetas salen de las sociedades y alertas cargadas, no de cifras sueltas." },
      { t: "Armar el informe", href: "/informes", donde: "Informes", hacer: "Elija Resumen ejecutivo, Horizonte Construcciones S.A.S. y 2024. Deje marcadas Indicadores, Hallazgos y Fuentes.", ver: "El resumen menciona el número de sociedades, las alertas abiertas y el riesgo de la empresa elegida." },
      { t: "Exportar", href: "/informes", donde: "Acciones del encabezado", hacer: "Pulse Descargar JSON y luego Descargar CSV. Si necesita papel, pulse Imprimir y use el cuadro del navegador para guardar PDF.", ver: "Se descargan informe.json e informe.csv. La impresión oculta la barra lateral." },
    ],
  },
  {
    id: "s8",
    nombre: "Analítica territorial",
    minutos: 5,
    fuentes: "Departamentos de la plataforma",
    objetivo: "Filtrar una región, leer el riesgo y exportar el resultado.",
    resultado: "Un CSV con las sociedades del departamento y sector elegidos.",
    pasos: [
      { t: "Elegir la región", href: "/territorio", donde: "Territorio", hacer: "En Departamento elija Valle del Cauca. Deje Sector en blanco. Lea empresas en el filtro, riesgo alto o crítico y el índice de actividad.", ver: "El texto nombra a Valle del Cauca, su sector principal y el conteo de riesgo alto." },
      { t: "Cruzar el sector", href: "/territorio", donde: "El mismo filtro", hacer: "Elija un sector, por ejemplo Manufactura. Compare el nuevo conteo con el del paso anterior.", ver: "El número de sociedades baja o se mantiene, y el riesgo se recalcula solo con ese sector." },
      { t: "Abrir una sociedad", href: "/empresas", donde: "Sociedades", hacer: "Use el filtro de sector que corresponda y abra una sociedad del Valle del Cauca. Confirme el departamento en el encabezado.", ver: "La ficha muestra Valle del Cauca y el mismo sector del filtro." },
      { t: "Exportar", href: "/territorio", donde: "Territorio", hacer: "Vuelva a dejar Valle del Cauca y el sector deseado. Pulse Exportar.", ver: "Se descarga territorio.csv con identificador, departamento, sector y riesgo." },
    ],
  },
];

export default function DemoPage() {
  const [activo, setActivo] = useState(ESCENARIOS[0]!.id);
  const [paso, setPaso] = useState(0);
  const item = ESCENARIOS.find((e) => e.id === activo)!;
  const actual = item.pasos[paso]!;
  const resetDemo = useDemoStore((s) => s.reset);
  return (
    <div>
      <PageHeader title="Casos de uso" description="Cada recorrido dice en qué pantalla entrar, qué pulsar y qué debe verse antes de pasar al siguiente." actions={<Button variant="danger" onClick={() => { if (confirm("¿Restablecer la sesión de este navegador?")) resetDemo(); }}>Restablecer sesión</Button>} />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">{ESCENARIOS.map((e) => (
          <button key={e.id} className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${e.id === activo ? "border-brand-burgundy bg-white" : "bg-white"}`} onClick={() => { setActivo(e.id); setPaso(0); }}>
            <span className="font-semibold">{e.nombre}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{e.minutos} min · {e.pasos.length} pasos</span>
          </button>
        ))}</div>
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-bold">{item.nombre}</h2>
            <p className="mt-1 text-sm">{item.objetivo}</p>
            <p className="mt-2 text-xs text-slate-500">Duración estimada: {item.minutos} min · Fuentes: {item.fuentes}</p>
            <p className="mt-3 text-sm">Paso {paso + 1} de {item.pasos.length}</p>
            <div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand-burgundy" style={{ width: `${((paso + 1) / item.pasos.length) * 100}%` }} /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setPaso(0)}>Iniciar recorrido</Button>
              <Button variant="secondary" disabled={paso === 0} onClick={() => setPaso((p) => p - 1)}>Anterior</Button>
              <Button variant="secondary" disabled={paso === item.pasos.length - 1} onClick={() => setPaso((p) => p + 1)}>Siguiente</Button>
              <Button variant="secondary" onClick={() => setPaso(0)}>Reiniciar escenario</Button>
            </div>
          </Card>
          <Card className="border-brand-burgundy">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-burgundy">Ahora</p>
            <h3 className="mt-1 text-base font-bold">{actual.t}</h3>
            <p className="mt-2 text-sm"><span className="font-semibold">Dónde. </span>{actual.donde}</p>
            <p className="mt-2 text-sm"><span className="font-semibold">Qué hacer. </span>{actual.hacer}</p>
            <p className="mt-2 text-sm"><span className="font-semibold">Qué debe ver. </span>{actual.ver}</p>
            <Link className="mt-4 inline-flex rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white" href={actual.href}>Abrir este paso</Link>
          </Card>
          <ol className="space-y-2">
            {item.pasos.map((step, index) => (
              <li key={step.t}>
                <button className={`w-full rounded-xl border px-4 py-3 text-left ${index === paso ? "border-brand-burgundy bg-white" : "border-surface-line bg-white/70"}`} onClick={() => setPaso(index)}>
                  <span className="text-xs font-semibold text-slate-500">Paso {index + 1}</span>
                  <span className="mt-0.5 block text-sm font-semibold">{step.t}</span>
                  <span className="mt-1 block text-sm text-slate-600">{step.hacer}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="text-sm text-slate-600">Al terminar: {item.resultado}</p>
        </div>
      </div>
    </div>
  );
}
