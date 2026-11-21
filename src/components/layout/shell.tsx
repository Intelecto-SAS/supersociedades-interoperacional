"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Search } from "lucide-react";
import { NAV } from "@/components/layout/nav";
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

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [palette, setPalette] = useState(false);
  const escenario = useDemoStore((s) => s.escenario);
  const setEscenario = useDemoStore((s) => s.setEscenario);
  const rol = useDemoStore((s) => s.rol);
  const setRol = useDemoStore((s) => s.setRol);
  const caidos = useDemoStore((s) => Object.values(s.conectores).filter((c) => c.estado === "caido").length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return getDataset().empresas.filter((e) => `${e.razonSocial} ${e.id} ${e.nitDemo}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[272px_1fr]">
      <aside className={`${open ? "fixed inset-y-0 z-30 w-[272px]" : "hidden"} flex flex-col bg-brand-blue text-white md:sticky md:top-0 md:flex md:h-screen`}>
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-burgundy text-sm font-bold">360</span>
            <div>
              <p className="text-base font-bold leading-tight">CONECTA 360</p>
              <p className="text-[11px] text-white/70">Interoperabilidad empresarial</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Principal">
          {NAV.map((group) => (
            <div key={group.grupo}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{group.grupo}</p>
              <ul className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} className={`block rounded-lg px-3 py-2 text-sm transition ${active ? "bg-white font-semibold text-brand-blue" : "text-white/90 hover:bg-white/10"}`} onClick={() => setOpen(false)}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/70">
          <p className="font-semibold text-white">{caidos ? `${caidos} fuentes con incidencia` : "Fuentes en línea"}</p>
          <p>Corte 29 de octubre de 2025</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-20 border-b border-surface-line bg-white/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" className="md:hidden" aria-label="Abrir menú" onClick={() => setOpen((v) => !v)}><Menu size={16} /></Button>
            <form className="relative min-w-[220px] flex-1" onSubmit={(e) => { e.preventDefault(); if (results[0]) router.push(`/empresas/${results[0].id}`); }}>
              <label className="sr-only" htmlFor="global-search">Buscar sociedad</label>
              <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} />
              <TextInput id="global-search" className="h-10 rounded-full pl-9" placeholder="Buscar sociedad, NIT o expediente" value={query} onChange={(e) => { setQuery(e.target.value); setPalette(true); }} onFocus={() => setPalette(true)} />
            </form>
            <label className="text-xs font-semibold text-slate-500">Contexto
              <select aria-label="Contexto de operación" className="ml-2 h-10 rounded-full border border-surface-line bg-white px-3 text-sm font-semibold text-brand-ink" value={escenario} onChange={(e) => setEscenario(e.target.value as typeof escenario)}>
                {ESCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">Perfil
              <select aria-label="Perfil de trabajo" className="ml-2 h-10 rounded-full border border-surface-line bg-white px-3 text-sm font-semibold text-brand-ink" value={rol} onChange={(e) => { const next = e.target.value as typeof rol; setRol(next); router.push(ROL_HOME[next]); }}>
                {ROLES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
            <Link href="/observabilidad" className="hidden rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-brand-blue sm:inline">Centro de operación</Link>
            <Link href="/demo" className="rounded-full bg-brand-burgundy px-3 py-2 text-xs font-semibold text-white">Casos</Link>
          </div>
        </header>
        {palette && query ? (
          <div className="border-b border-surface-line bg-white px-6 py-3 shadow-card" role="listbox" aria-label="Resultados de búsqueda">
            {results.length === 0 ? <p className="text-sm text-slate-500">No hay sociedades con ese criterio.</p> : results.map((e) => (
              <button key={e.id} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setPalette(false); setQuery(""); router.push(`/empresas/${e.id}`); }}>
                <span className="font-semibold">{e.razonSocial}</span>
                <span className="text-slate-500">{e.municipio}</span>
              </button>
            ))}
          </div>
        ) : null}
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
