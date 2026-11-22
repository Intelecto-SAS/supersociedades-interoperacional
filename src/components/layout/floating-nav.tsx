"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { NAV } from "@/components/layout/nav";

function matches(pathname: string, href: string) {
  if (href === "/dashboard" || href === "/vigilancia" || href === "/solicitudes") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FloatingNavigation({ pathname, mobileOpen, onCloseMobile }: { pathname: string; mobileOpen: boolean; onCloseMobile: () => void }) {
  const body = (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-burgundy text-xs font-bold">360</span>
        <div>
          <p className="text-sm font-bold leading-tight">CONECTA 360</p>
          <p className="text-[11px] text-white/70">Portal de empresas</p>
        </div>
      </div>
      <nav aria-label="Principal" className="flex-1 space-y-1 overflow-y-auto px-2 py-3 [scrollbar-width:thin]">
        {NAV.map((entry) => {
          const Icon = entry.icon;
          const active = entry.href ? matches(pathname, entry.href) : entry.items?.some((item) => matches(pathname, item.href));
          return (
            <div key={entry.id}>
              {entry.href ? (
                <Link href={entry.href} aria-current={active ? "page" : undefined} className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-white font-semibold text-brand-blue" : "text-white/90 hover:bg-white/10"}`} onClick={onCloseMobile}>
                  <Icon size={18} aria-hidden />
                  {entry.label}
                </Link>
              ) : (
                <p className="flex h-11 items-center gap-3 px-3 text-sm font-semibold text-white/70">
                  <Icon size={18} aria-hidden />
                  {entry.label}
                </p>
              )}
              {entry.items ? (
                <ul className="mb-1 ml-9 space-y-0.5">
                  {entry.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={matches(pathname, item.href) ? "page" : undefined} className={`block rounded-md px-2 py-1.5 text-sm ${matches(pathname, item.href) ? "bg-white font-semibold text-brand-blue" : "text-white/90 hover:bg-white/10"}`} onClick={onCloseMobile}>{item.label}</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-brand-blue md:block">{body}</aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-slate-900/40" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-[min(260px,calc(100%-2.5rem))] bg-brand-blue">
            <button className="absolute right-2 top-2 z-10 rounded-md p-2 text-white" aria-label="Cerrar" onClick={onCloseMobile}><X size={16} /></button>
            {body}
          </aside>
        </div>
      ) : null}
    </>
  );
}
