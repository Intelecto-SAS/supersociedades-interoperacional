"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Search } from "lucide-react";
import { FloatingNavigation } from "@/components/layout/floating-nav";
import { NAV_FLAT } from "@/components/layout/nav";
import { InspectorProvider } from "@/components/layout/inspector";
import { Button, TextInput } from "@/components/ui/primitives";
import { useDemoStore, useEmpresaSesion } from "@/lib/storage/store";
import { solicitudesDe } from "@/features/portal/solicitudes";

const TITLES: Record<string, string> = {
  "/dashboard": "Inicio",
  "/empresa": "Mi sociedad",
  "/documentos": "Documentos",
  "/solicitudes": "Solicitudes",
  "/solicitudes/nueva": "Nueva solicitud",
  "/correspondencia": "Correspondencia",
  "/salida-472": "Salida 4-72",
  "/datos": "Datos validados",
  "/canales": "Canales EDI",
  "/configuracion": "Preferencias",
  "/entrar": "Entrar",
};

type Hit = { tipo: string; label: string; hint: string; href: string };

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [palette, setPalette] = useState(false);
  const [session, setSession] = useState(false);
  const { empresa, solicitudes } = useEmpresaSesion();
  const setEmpresaActiva = useDemoStore((s) => s.setEmpresaActiva);
  const publicPage = pathname === "/entrar";
  const title = TITLES[pathname] ?? (pathname.startsWith("/solicitudes/") ? "Solicitud" : "Portal de empresas");

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
    const sols: Hit[] = solicitudesDe(empresa.id).filter((s) => `${s.asunto} ${s.id} ${s.tramite}`.toLowerCase().includes(q)).slice(0, 6).map((s) => ({ tipo: "Solicitud", label: s.asunto, hint: s.canal, href: `/solicitudes/${s.id}` }));
    const destinos: Hit[] = NAV_FLAT.filter((n) => n.label.toLowerCase().includes(q)).map((n) => ({ tipo: "Ir a", label: n.label, hint: n.href, href: n.href }));
    return [...sols, ...destinos].slice(0, 10);
  }, [query, empresa.id]);

  if (publicPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <InspectorProvider>
      <div className="min-h-screen">
        <FloatingNavigation pathname={pathname} mobileOpen={open} onCloseMobile={() => setOpen(false)} />
        <div className="workspace min-w-0 md:pl-[260px]">
          <header className="no-print sticky top-4 z-20 mx-4 flex h-16 items-center gap-3 rounded-2xl border border-surface-line bg-white px-3 shadow-card">
            <Button variant="secondary" className="md:hidden" aria-label="Abrir menú" onClick={() => setOpen(true)}><Menu size={16} /></Button>
            <p className="hidden min-w-24 text-sm font-semibold text-brand-ink sm:block">{title}</p>
            <form className="relative min-w-0 flex-1" onSubmit={(e) => { e.preventDefault(); if (results[0]) { setPalette(false); router.push(results[0].href); } }}>
              <label className="sr-only" htmlFor="global-search">Buscar en mi sociedad</label>
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
              <TextInput id="global-search" className="h-10 pl-9" placeholder="Buscar solicitudes, trámites o secciones" value={query} onChange={(e) => { setQuery(e.target.value); setPalette(true); }} onFocus={() => setPalette(true)} />
            </form>
            <button className="max-w-[180px] truncate rounded-md border border-surface-line px-3 py-2 text-left text-sm font-semibold text-brand-blue" aria-expanded={session} onClick={() => setSession((v) => !v)}>{empresa.razonSocial}</button>
            <Link href="/solicitudes/nueva" className="hidden rounded-md bg-brand-burgundy px-3 py-2 text-xs font-semibold text-white sm:inline">Nueva solicitud</Link>
          </header>
          {session ? (
            <div className="mx-4 mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-surface-line bg-white px-3 py-2 text-sm">
              <p>Sesión de {empresa.razonSocial} · {empresa.nitDemo}</p>
              <p className="text-slate-500">{solicitudes.filter((s) => s.estado !== "cerrada").length} solicitudes abiertas</p>
              <Link className="font-semibold text-brand-blue" href="/entrar">Cambiar de sociedad</Link>
              <button className="font-semibold text-brand-blue" onClick={() => { setEmpresaActiva("DEMO-EMP-0001"); setSession(false); }}>Andina Alimentos</button>
            </div>
          ) : null}
          {palette && query ? (
            <div className="mx-4 mt-2 rounded-xl border border-surface-line bg-white px-2 py-2 shadow-card" role="listbox" aria-label="Resultados de búsqueda">
              {results.length === 0 ? <p className="px-2 py-1 text-sm text-slate-500">No hay registros de esta sociedad con ese criterio.</p> : results.map((hit) => (
                <button key={`${hit.tipo}-${hit.href}-${hit.label}`} className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setPalette(false); setQuery(""); router.push(hit.href); }}>
                  <span><span className="mr-2 text-xs font-semibold uppercase text-slate-400">{hit.tipo}</span><span className="font-semibold">{hit.label}</span></span>
                  <span className="text-slate-500">{hit.hint}</span>
                </button>
              ))}
            </div>
          ) : null}
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </InspectorProvider>
  );
}
