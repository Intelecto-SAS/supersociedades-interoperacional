"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NAV, type NavEntry } from "@/components/layout/nav";

const KEY = "conecta360-nav";

function matches(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/vigilancia" || href === "/solicitudes") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FloatingNavigation({ pathname, mobileOpen, onCloseMobile }: { pathname: string; mobileOpen: boolean; onCloseMobile: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [flyout, setFlyout] = useState<string | null>(null);
  const [folded, setFolded] = useState<string[]>(() => NAV.filter((entry) => entry.items).map((entry) => entry.id));

  useEffect(() => {
    if (localStorage.getItem(KEY) === "expanded") setExpanded(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFlyout(null);
        if (!expanded) return;
        setExpanded(false);
        localStorage.setItem(KEY, "compact");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded]);

  const setMode = (next: boolean) => {
    setExpanded(next);
    setFlyout(null);
    localStorage.setItem(KEY, next ? "expanded" : "compact");
  };

  const onPick = (entry: NavEntry) => {
    if (entry.items) setFlyout((current) => current === entry.id ? null : entry.id);
  };

  const body = (labels: boolean) => (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-burgundy text-xs font-bold">360</span>
        {labels ? <span className="text-sm font-bold leading-tight">CONECTA 360</span> : null}
      </div>
      <nav aria-label="Principal" className="mt-3 flex-1 space-y-1 overflow-y-auto px-2 pb-2 [scrollbar-width:thin]">
        {NAV.map((entry) => {
          const Icon = entry.icon;
          const active = entry.href ? matches(pathname, entry.href) : entry.items?.some((item) => matches(pathname, item.href));
          const openGroup = !folded.includes(entry.id);
          return (
            <div key={entry.id} className="relative">
              {entry.href ? (
                <Link href={entry.href} aria-label={entry.label} aria-current={active ? "page" : undefined} title={entry.label} className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-white font-semibold text-brand-blue" : "hover:bg-white/10"}`} onClick={() => { setFlyout(null); onCloseMobile(); }}>
                  <Icon size={18} aria-hidden />
                  {labels ? entry.label : <span className="sr-only">{entry.label}</span>}
                </Link>
              ) : (
                <button type="button" aria-label={entry.label} aria-expanded={flyout === entry.id || (labels && openGroup)} title={entry.label} className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm ${active ? "bg-white font-semibold text-brand-blue" : "hover:bg-white/10"}`} onClick={() => labels ? setFolded((list) => list.includes(entry.id) ? list.filter((id) => id !== entry.id) : [...list, entry.id]) : onPick(entry)}>
                  <Icon size={18} aria-hidden />
                  {labels ? entry.label : <span className="sr-only">{entry.label}</span>}
                </button>
              )}
              {labels && entry.items && openGroup ? (
                <ul className="mb-1 ml-9 space-y-0.5">
                  {entry.items.map((item) => (
                    <li key={item.href}><Link href={item.href} aria-current={matches(pathname, item.href) ? "page" : undefined} className={`block rounded-md px-2 py-1.5 text-sm ${matches(pathname, item.href) ? "bg-white font-semibold text-brand-blue" : "text-white/90 hover:bg-white/10"}`} onClick={onCloseMobile}>{item.label}</Link></li>
                  ))}
                </ul>
              ) : null}
              {!labels && flyout === entry.id && entry.items ? (
                <div className="absolute left-[68px] top-0 z-50 w-56 rounded-2xl border border-white/10 bg-brand-blue p-2 shadow-card">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white/60">{entry.label}</p>
                  {entry.items.map((item) => (
                    <Link key={item.href} href={item.href} className="block rounded-lg px-2 py-2 text-sm hover:bg-white/10" onClick={() => { setFlyout(null); onCloseMobile(); }}>{item.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
      <button type="button" className="m-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-white/10 text-sm font-semibold" onClick={() => setMode(!labels)}>
        {labels ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        {labels ? "Contraer" : <span className="sr-only">Expandir menú</span>}
      </button>
    </div>
  );

  return (
    <>
      <div className="fixed bottom-4 left-4 top-4 z-30 hidden w-[72px] md:block">
        <div className="h-full rounded-2xl bg-brand-blue shadow-card">{body(false)}</div>
        {expanded ? (
          <>
            <button aria-label="Cerrar menú" className="fixed inset-0 z-30 cursor-default bg-slate-900/25" onClick={() => setMode(false)} />
            <div className="absolute left-0 top-0 z-40 h-full w-[288px] rounded-2xl bg-brand-blue shadow-card">{body(true)}</div>
          </>
        ) : null}
        {flyout ? <button aria-label="Cerrar submenú" className="fixed inset-0 z-20 cursor-default" onClick={() => setFlyout(null)} /> : null}
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-slate-900/40" onClick={onCloseMobile} />
          <div className="absolute bottom-4 left-4 top-4 w-[min(288px,calc(100%-2rem))] rounded-2xl bg-brand-blue shadow-card">
            <button className="absolute right-2 top-2 z-10 rounded-md p-2 text-white" aria-label="Cerrar" onClick={onCloseMobile}><X size={16} /></button>
            {body(true)}
          </div>
        </div>
      ) : null}
    </>
  );
}
