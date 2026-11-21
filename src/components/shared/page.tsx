import type { ReactNode } from "react";

export function PageHeader({ title, description, actions, crumbs }: { title: string; description?: string; actions?: ReactNode; crumbs?: { href: string; label: string }[] }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        {crumbs ? (
          <nav aria-label="Miga de pan" className="mb-1 text-xs text-slate-500">
            {crumbs.map((c, i) => (
              <span key={c.href}>
                {i > 0 ? " / " : ""}
                <a href={c.href} className="underline-offset-2 hover:underline">{c.label}</a>
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="text-[1.7rem] font-bold tracking-tight text-brand-blue">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
