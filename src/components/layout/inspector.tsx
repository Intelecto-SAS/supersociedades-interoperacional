"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

type Payload = { title: string; body: ReactNode; actions?: ReactNode };

type Ctx = {
  open: (payload: Payload, opener?: HTMLElement | null) => void;
  close: () => void;
};

const InspectorContext = createContext<Ctx | null>(null);

export function useInspector() {
  const ctx = useContext(InspectorContext);
  if (!ctx) throw new Error("useInspector requiere Shell");
  return ctx;
}

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setPayload(null);
    opener.current?.focus();
  }, []);

  const open = useCallback((next: Payload, from?: HTMLElement | null) => {
    opener.current = from ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setPayload(next);
  }, []);

  useEffect(() => {
    if (!payload) return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [payload, close]);

  return (
    <InspectorContext.Provider value={{ open, close }}>
      {children}
      {payload ? (
        <aside ref={panelRef} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby={titleId} className="fixed inset-x-4 bottom-4 top-16 z-40 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl border border-surface-line bg-white shadow-card outline-none md:inset-y-4 md:left-auto md:right-4 md:w-[390px] md:max-h-none">
          <div className="flex items-start justify-between gap-3 border-b border-surface-line px-4 py-3">
            <h2 id={titleId} className="text-base font-bold text-brand-ink">{payload.title}</h2>
            <button className="rounded-lg px-2 py-1 text-sm font-semibold text-brand-blue" onClick={close}>Cerrar</button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">{payload.body}</div>
          {payload.actions ? <div className="flex flex-wrap gap-2 border-t border-surface-line px-4 py-3">{payload.actions}</div> : null}
        </aside>
      ) : null}
    </InspectorContext.Provider>
  );
}
