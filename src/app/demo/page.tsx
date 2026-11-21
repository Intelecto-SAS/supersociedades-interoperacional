"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page";
import { Button, Card } from "@/components/ui/primitives";
import { useDemoStore } from "@/lib/storage/store";

const ESCENARIOS = [
  { id: "s1", nombre: "Una empresa en 360 grados", minutos: 3, fuentes: "RUES, DIAN, SIREM, Rama Judicial", objetivo: "Ver cómo varias fuentes alimentan una ficha.", resultado: "Informe de Andina Ejemplo listo para imprimir.", pasos: [
    { t: "Seleccionar empresa", href: "/empresas/DEMO-EMP-0001" },
    { t: "Registro empresarial", href: "/empresas/DEMO-EMP-0001" },
    { t: "Información tributaria", href: "/integraciones/dian-rut" },
    { t: "Información financiera", href: "/finanzas" },
    { t: "Procesos", href: "/empresas/DEMO-EMP-0008" },
    { t: "Consolidar", href: "/empresas/DEMO-EMP-0001" },
    { t: "Evidencias", href: "/gobierno-datos" },
    { t: "Informe", href: "/informes" },
  ]},
  { id: "s2", nombre: "Alerta temprana de insolvencia", minutos: 3, fuentes: "SIREM, reglas", objetivo: "Recorrer el caso Horizonte Construcciones.", resultado: "Alerta, expediente y resumen.", pasos: [
    { t: "Seleccionar empresa", href: "/insolvencia" },
    { t: "Evolución financiera", href: "/finanzas" },
    { t: "Ejecutar reglas", href: "/vigilancia" },
    { t: "Generar alerta", href: "/vigilancia/alertas" },
    { t: "Crear expediente", href: "/expedientes/DEMO-EXP-0001" },
    { t: "Resumen", href: "/asistente" },
  ]},
  { id: "s3", nombre: "Contratación y relaciones", minutos: 2, fuentes: "SECOP, RUP", objetivo: "Ver concentración e inconsistencias.", resultado: "Reporte contractual.", pasos: [
    { t: "Contratista", href: "/empresas/DEMO-EMP-0004" },
    { t: "Contratos", href: "/contratacion" },
    { t: "Registro", href: "/integraciones/rues" },
    { t: "Relaciones", href: "/empresas/DEMO-EMP-0004" },
    { t: "Inconsistencias", href: "/gobierno-datos" },
    { t: "Reporte", href: "/informes" },
  ]},
  { id: "s4", nombre: "Radicación inteligente", minutos: 2, fuentes: "Extracción, GeDeSS", objetivo: "Completar el asistente documental.", resultado: "Radicado creado.", pasos: [
    { t: "Documento", href: "/radicacion" },
    { t: "Extracción", href: "/radicacion" },
    { t: "Clasificar", href: "/radicacion" },
    { t: "Empresa", href: "/radicacion" },
    { t: "Validar", href: "/radicacion" },
    { t: "Confirmar", href: "/radicacion" },
    { t: "Radicado", href: "/radicacion" },
  ]},
  { id: "s5", nombre: "Falla y recuperación", minutos: 2, fuentes: "RUES", objetivo: "Registrar una caída y recuperar la fuente.", resultado: "Auditoría de la incidencia.", pasos: [
    { t: "Abrir flujo", href: "/flujos/flujo-perfil" },
    { t: "Ejecutar", href: "/flujos/flujo-perfil" },
    { t: "Marcar caída", href: "/observabilidad" },
    { t: "Ver error", href: "/flujos/flujo-perfil" },
    { t: "Reintentar", href: "/observabilidad" },
    { t: "Recuperar", href: "/observabilidad" },
    { t: "Auditoría", href: "/auditoria" },
  ]},
  { id: "s6", nombre: "Gobierno y calidad", minutos: 2, fuentes: "RUES, DIAN, SIREM", objetivo: "Comparar fuentes sin borrar las originales.", resultado: "Registro consolidado con evidencias.", pasos: [
    { t: "Duplicados", href: "/gobierno-datos" },
    { t: "Comparar", href: "/gobierno-datos" },
    { t: "Diferencias", href: "/gobierno-datos" },
    { t: "Normalizar", href: "/gobierno-datos" },
    { t: "Consolidar", href: "/gobierno-datos" },
    { t: "Trazabilidad", href: "/empresas/DEMO-EMP-0006" },
  ]},
  { id: "s7", nombre: "Informe ejecutivo", minutos: 2, fuentes: "Tablero", objetivo: "Armar y exportar un resumen.", resultado: "JSON, CSV o impresión.", pasos: [
    { t: "Periodo", href: "/dashboard" },
    { t: "Indicadores", href: "/dashboard" },
    { t: "Resumen", href: "/informes" },
    { t: "Evidencias", href: "/informes" },
    { t: "Exportar", href: "/informes" },
  ]},
  { id: "s8", nombre: "Analítica territorial", minutos: 2, fuentes: "DANE y DNP", objetivo: "Filtrar una región y exportar.", resultado: "CSV territorial.", pasos: [
    { t: "Región", href: "/territorio" },
    { t: "Sectores", href: "/territorio" },
    { t: "Empresas", href: "/empresas" },
    { t: "Riesgos", href: "/territorio" },
    { t: "Exportar", href: "/territorio" },
  ]},
];

export default function DemoPage() {
  const [activo, setActivo] = useState(ESCENARIOS[0]!.id);
  const [paso, setPaso] = useState(0);
  const item = ESCENARIOS.find((e) => e.id === activo)!;
  const resetDemo = useDemoStore((s) => s.reset);
  return (
    <div>
      <PageHeader title="Casos de uso" description="Recorridos guiados para dirección, supervisión y tecnología." actions={<Button variant="danger" onClick={() => { if (confirm("¿Restablecer la sesión de este navegador?")) resetDemo(); }}>Restablecer sesión</Button>} />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">{ESCENARIOS.map((e) => <button key={e.id} className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${e.id === activo ? "border-brand-burgundy bg-white" : "bg-white"}`} onClick={() => { setActivo(e.id); setPaso(0); }}>{e.nombre}</button>)}</div>
        <Card>
          <h2 className="text-lg font-bold">{item.nombre}</h2>
          <p className="text-sm">{item.objetivo}</p>
          <p className="mt-1 text-xs">Duración estimada: {item.minutos} min · Fuentes: {item.fuentes}</p>
          <p className="mt-2 text-sm">Progreso {paso + 1} de {item.pasos.length}</p>
          <div className="mt-2 h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand-burgundy" style={{ width: `${((paso + 1) / item.pasos.length) * 100}%` }} /></div>
          <p className="mt-3 font-semibold">{item.pasos[paso]?.t}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setPaso(0)}>Iniciar recorrido</Button>
            <Link className="rounded-md bg-brand-blue px-3 py-2 text-sm font-semibold text-white" href={item.pasos[paso]!.href}>Ir al paso</Link>
            <Button variant="secondary" disabled={paso === 0} onClick={() => setPaso((p) => p - 1)}>Anterior</Button>
            <Button variant="secondary" disabled={paso === item.pasos.length - 1} onClick={() => setPaso((p) => p + 1)}>Siguiente</Button>
            <Button variant="secondary" onClick={() => setPaso(0)}>Reiniciar escenario</Button>
          </div>
          <p className="mt-3 text-sm">Resultado esperado: {item.resultado}</p>
        </Card>
      </div>
    </div>
  );
}
