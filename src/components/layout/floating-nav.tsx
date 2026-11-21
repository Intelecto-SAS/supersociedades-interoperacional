"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PanelLeft, X } from "lucide-react";
import { NAV } from "@/components/layout/nav";

const KEY = "conecta360-nav";

export function FloatingNavigation({ pathname, mobileOpen, onCloseMobile }: { pathname: string; mobileOpen: boolean; onCloseMobile: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw === "pinned") {
      setPinned(true);
      setExpanded(true);
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.nav = pinned && expanded ? "pinned" : "compact";
  }, [pinned, expanded]);

  useEffect(() => {
    if (!expanded || pinned) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, pinned]);

  const togglePin = () => {
    const next = !pinned;
    setPinned(next);
    setExpanded(next);
    localStorage.setItem(KEY, next ? "pinned" : "compact");
  };

  const showLabels = expanded || mobileOpen;
  const active = (href: string) => pathname === href || (href !== "/dashboard" && href !== "/vigilancia" && pathname.startsWith(href));

  const rail = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-burgundy text-xs font-bold text-white">360</span>
        {showLabels ? <button className="rounded-md p-2 text-white" aria-label={pinned ? "Volver al menú compacto" : "Fijar menú expandido"} onClick={togglePin}><PanelLeft size={16} /></button> : null}
      </div>
      <nav aria-label="Principal" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-3 [scrollbar-width:thin]">
        {NAV.map((group) => (
          <div key={group.id}>
            {showLabels ? (
              <button className="px-2 text-[10px] font-bold uppercase tracking-wide text-white/50" onClick={() => setClosedGroups((g) => g.includes(group.id) ? g.filter((id) => id !== group.id) : [...g, group.id])}>{group.grupo}</button>
            ) : null}
            {!closedGroups.includes(group.id) || !showLabels ? (
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const on = active(item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} title={item.label} aria-label={item.label} aria-current={on ? "page" : undefined} className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${on ? "bg-white font-semibold text-brand-blue" : "text-white/90 hover:bg-white/10"}`} onClick={onCloseMobile}>
                        <Icon size={18} aria-hidden />
                        {showLabels ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ))}
      </nav>
      {!showLabels ? <button className="m-2 rounded-md bg-white/10 py-2 text-xs font-semibold text-white" onClick={() => setExpanded(true)}>Abrir</button> : null}
    </div>
  );

  return (
    <>
      <div className={`pointer-events-none fixed left-4 top-4 z-30 hidden h-[calc(100vh-2rem)] md:block ${pinned && expanded ? "w-[288px]" : "w-[72px]"}`}>
        <div className="pointer-events-auto relative h-full">
          <div className={`h-full overflow-hidden rounded-xl bg-brand-blue shadow-card ${pinned && expanded ? "w-[288px]" : "w-[72px]"}`}>{!expanded || pinned ? rail : null}</div>
          {expanded && !pinned ? (
            <>
              <button aria-label="Cerrar menú" className="pointer-events-auto fixed inset-0 -z-10 cursor-default bg-slate-900/20" onClick={() => setExpanded(false)} />
              <div className="pointer-events-auto absolute left-0 top-0 h-full w-[288px] rounded-xl bg-brand-blue shadow-card">{rail}</div>
            </>
          ) : null}
        </div>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-slate-900/40" onClick={onCloseMobile} />
          <div className="absolute inset-y-3 left-3 w-[min(288px,calc(100%-1.5rem))] overflow-hidden rounded-xl bg-brand-blue shadow-card">
            <button className="absolute right-2 top-2 z-10 rounded-md p-2 text-white" aria-label="Cerrar" onClick={onCloseMobile}><X size={16} /></button>
            <div className="h-full">{rail}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
