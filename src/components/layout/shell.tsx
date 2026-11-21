"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Search } from "lucide-react";
import { NAV } from "@/components/layout/nav";
import { Badge, Button, TextInput } from "@/components/ui/primitives";
import { ESCENARIOS } from "@/features/scenarios/apply";
import { ROL_HOME, useDemoStore } from "@/lib/storage/store";
import { getDataset } from "@/data/seed/dataset";

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
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className={`${open ? "block" : "hidden"} border-r border-white/10 bg-brand-blue text-white md:block`}>
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-lg font-bold tracking-tight">CONECTA 360</p>
          <p className="text-xs text-white/80">Prototipo de interoperabilidad empresarial</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[#FFC800]">Demo · datos simulados</p>
        </div>
        <nav className="space-y-4 px-3 py-4" aria-label="Principal">
          {NAV.map((group) => (
            <div key={group.grupo}>
              <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-white/60">{group.grupo}</p>
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} className={`block rounded-md px-2 py-1.5 text-sm ${active ? "bg-white text-brand-blue" : "text-white/90 hover:bg-white/10"}`} onClick={() => setOpen(false)}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <p className="px-4 pb-4 text-xs text-white/70">Modo demostración activo. Conexiones reales: 0.</p>
      </aside>
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-surface-line bg-white/95 px-3 py-2 backdrop-blur">
          <Button variant="secondary" className="md:hidden" aria-label="Abrir menú" onClick={() => setOpen((v) => !v)}><Menu size={16} /></Button>
          <form className="relative min-w-[180px] flex-1" onSubmit={(e) => { e.preventDefault(); if (results[0]) router.push(`/empresas/${results[0].id}`); }}>
            <label className="sr-only" htmlFor="global-search">Buscar empresa ficticia</label>
            <Search className="pointer-events-none absolute left-2 top-2.5 text-slate-400" size={16} />
            <TextInput id="global-search" className="pl-8" placeholder="Buscar empresa o identificador (Ctrl+K)" value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setPalette(true)} />
          </form>
          <label className="text-xs text-slate-500">Escenario
            <select aria-label="Escenario de demostración" className="ml-1 rounded-md border border-surface-line px-2 py-1 text-sm" value={escenario} onChange={(e) => setEscenario(e.target.value as typeof escenario)}>
              {ESCENARIOS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-500">Rol simulado
            <select aria-label="Rol simulado" className="ml-1 rounded-md border border-surface-line px-2 py-1 text-sm" value={rol} onChange={(e) => { const next = e.target.value as typeof rol; setRol(next); router.push(ROL_HOME[next]); }}>
              <option value="direccion">Dirección</option>
              <option value="financiero">Analista financiero</option>
              <option value="juridico">Analista jurídico</option>
              <option value="supervisor">Supervisor</option>
              <option value="integraciones">Administrador de integraciones</option>
              <option value="datos">Responsable de datos</option>
            </select>
          </label>
          <Link href="/observabilidad" className="text-xs font-semibold text-brand-blue">Integraciones {caidos ? `${caidos} en falla` : "en simulación"}</Link>
          <Link href="/demo" className="text-xs font-semibold text-brand-burgundy">Guía</Link>
          <Badge tone="warn">Datos simulados</Badge>
        </header>
        {palette && query ? (
          <div className="border-b border-surface-line bg-white px-4 py-2" role="listbox" aria-label="Resultados de búsqueda">
            {results.length === 0 ? <p className="text-sm text-slate-500">Sin coincidencias en las empresas ficticias.</p> : results.map((e) => (
              <button key={e.id} className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-slate-50" onClick={() => { setPalette(false); setQuery(""); router.push(`/empresas/${e.id}`); }}>
                {e.razonSocial} · {e.id}
              </button>
            ))}
          </div>
        ) : null}
        <main className="px-4 py-5 md:px-6">{children}</main>
      </div>
    </div>
  );
}
