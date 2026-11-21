"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";

type Payload = { title: string; body: ReactNode };

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
        <aside ref={panelRef} tabIndex={-1} role="dialog" aria-modal="false" aria-labelledby={titleId} className="fixed inset-x-3 bottom-3 top-auto z-40 max-h-[80vh] overflow-y-auto rounded-xl border border-surface-line bg-white p-4 shadow-card outline-none md:inset-y-4 md:left-auto md:right-4 md:w-[400px] md:max-h-none">
          <div className="flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-base font-bold text-brand-ink">{payload.title}</h2>
            <button className="rounded-md px-2 py-1 text-sm font-semibold text-brand-blue" onClick={close}>Cerrar</button>
          </div>
          <div className="mt-3 text-sm">{payload.body}</div>
        </aside>
      ) : null}
    </InspectorContext.Provider>
  );
}
