"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Search } from "lucide-react";
import { FloatingNavigation } from "@/components/layout/floating-nav";
import { NAV_FLAT } from "@/components/layout/nav";
import { InspectorProvider } from "@/components/layout/inspector";
import { Button, TextInput } from "@/components/ui/primitives";
import { ESCENARIOS } from "@/features/scenarios/apply";
import { ROL_HOME, useDemoStore } from "@/lib/storage/store";
import { getDataset } from "@/data/seed/dataset";

const ROLES = [
  ["direccion", "Dirección"],
  ["financiero", "Analista financiero"],
  ["juridico", "Analista jurídico"],
  ["supervisor", "Supervisor"],
  ["integraciones", "Integraciones"],
  ["datos", "Gobierno de datos"],
] as const;

const TITLES: Record<string, string> = {
  "/dashboard": "Inicio",
  "/empresas": "Sociedades",
  "/expedientes": "Expedientes",
  "/vigilancia": "Vigilancia",
  "/vigilancia/alertas": "Alertas",
  "/finanzas": "Finanzas",
  "/insolvencia": "Insolvencia",
  "/contratacion": "Contratación",
  "/territorio": "Territorio",
  "/radicacion": "Radicación",
  "/documentos": "Documentos",
  "/informes": "Informes",
  "/integraciones": "Integraciones",
  "/flujos": "Flujos",
  "/observabilidad": "Operación",
  "/gobierno-datos": "Gobierno de datos",
  "/auditoria": "Auditoría",
  "/asistente": "Asistente",
  "/demo": "Casos de uso",
  "/configuracion": "Preferencias",
  "/acerca-de": "Acerca de",
};

type Hit = { tipo: string; label: string; hint: string; href: string };

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [palette, setPalette] = useState(false);
  const [session, setSession] = useState(false);
  const escenario = useDemoStore((s) => s.escenario);
  const setEscenario = useDemoStore((s) => s.setEscenario);
  const rol = useDemoStore((s) => s.rol);
  const setRol = useDemoStore((s) => s.setRol);
  const title = TITLES[pathname] ?? (pathname.startsWith("/empresas/") ? "Sociedad" : pathname.startsWith("/expedientes/") ? "Expediente" : pathname.startsWith("/flujos/") ? "Flujo" : pathname.startsWith("/integraciones/") ? "Integración" : "CONECTA 360");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setSession(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Hit[];
    const data = getDataset();
    const empresas: Hit[] = data.empresas.filter((e) => `${e.razonSocial} ${e.id} ${e.nitDemo}`.toLowerCase().includes(q)).slice(0, 5).map((e) => ({ tipo: "Sociedad", label: e.razonSocial, hint: e.municipio, href: `/empresas/${e.id}` }));
    const expedientes: Hit[] = data.expedientes.filter((e) => `${e.id} ${e.tipo} ${e.empresaId}`.toLowerCase().includes(q)).slice(0, 4).map((e) => ({ tipo: "Expediente", label: e.id, hint: e.tipo, href: `/expedientes/${e.id}` }));
    const alertas: Hit[] = data.alertas.filter((a) => `${a.descripcion} ${a.id} ${a.empresaId}`.toLowerCase().includes(q)).slice(0, 4).map((a) => ({ tipo: "Alerta", label: a.descripcion, hint: a.empresaId, href: `/vigilancia/alertas` }));
    const conectores: Hit[] = data.conectores.filter((c) => `${c.nombre} ${c.id}`.toLowerCase().includes(q)).slice(0, 4).map((c) => ({ tipo: "Integración", label: c.nombre, hint: c.entidadProveedora, href: `/integraciones/${c.id}` }));
    const destinos: Hit[] = NAV_FLAT.filter((n) => n.label.toLowerCase().includes(q)).map((n) => ({ tipo: "Ir a", label: n.label, hint: n.href, href: n.href }));
    return [...empresas, ...expedientes, ...alertas, ...conectores, ...destinos].slice(0, 12);
  }, [query]);

  return (
    <InspectorProvider>
      <div className="min-h-screen">
        <FloatingNavigation pathname={pathname} mobileOpen={open} onCloseMobile={() => setOpen(false)} />
        <div className="workspace min-w-0 md:pl-[104px]">
          <header className="no-print sticky top-4 z-20 mx-4 flex h-16 items-center gap-3 rounded-2xl border border-surface-line bg-white px-3 shadow-card">
            <Button variant="secondary" className="md:hidden" aria-label="Abrir menú" onClick={() => setOpen(true)}><Menu size={16} /></Button>
            <p className="hidden min-w-28 text-sm font-semibold text-brand-ink sm:block">{title}</p>
            <form className="relative min-w-0 flex-1" onSubmit={(e) => { e.preventDefault(); if (results[0]) { setPalette(false); router.push(results[0].href); } }}>
              <label className="sr-only" htmlFor="global-search">Buscar</label>
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
              <TextInput id="global-search" className="h-10 pl-9" placeholder="Buscar sociedad, expediente, alerta o módulo" value={query} onChange={(e) => { setQuery(e.target.value); setPalette(true); }} onFocus={() => setPalette(true)} />
            </form>
            <button className="rounded-md border border-surface-line px-3 py-2 text-sm font-semibold text-brand-blue" aria-expanded={session} onClick={() => setSession((v) => !v)}>Sesión</button>
            <Link href="/demo" className="hidden rounded-md bg-brand-burgundy px-3 py-2 text-xs font-semibold text-white sm:inline">Casos</Link>
          </header>
          {session ? (
            <div className="mx-3 mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-surface-line bg-white px-3 py-2 text-sm md:mx-4">
              <label>Perfil
                <select aria-label="Perfil de trabajo" className="ml-2 h-9 rounded-md border border-surface-line px-2" value={rol} onChange={(e) => { const next = e.target.value as typeof rol; setRol(next); router.push(ROL_HOME[next]); }}>
                  {ROLES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
              <label>Contexto
                <select aria-label="Contexto de operación" className="ml-2 h-9 rounded-md border border-surface-line px-2" value={escenario} onChange={(e) => setEscenario(e.target.value as typeof escenario)}>
                  {ESCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </label>
              <Link className="text-brand-blue" href="/configuracion">Preferencias</Link>
              <Link className="text-brand-blue" href="/observabilidad">Operación</Link>
            </div>
          ) : null}
          {palette && query ? (
            <div className="mx-3 mt-2 rounded-xl border border-surface-line bg-white px-2 py-2 shadow-card md:mx-4" role="listbox" aria-label="Resultados de búsqueda">
              {results.length === 0 ? <p className="px-2 py-1 text-sm text-slate-500">No hay registros con ese criterio.</p> : results.map((hit) => (
                <button key={`${hit.tipo}-${hit.href}-${hit.label}`} className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setPalette(false); setQuery(""); router.push(hit.href); }}>
                  <span><span className="mr-2 text-xs font-semibold uppercase text-slate-400">{hit.tipo}</span><span className="font-semibold">{hit.label}</span></span>
                  <span className="text-slate-500">{hit.hint}</span>
                </button>
              ))}
            </div>
          ) : null}
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </InspectorProvider>
  );
}
