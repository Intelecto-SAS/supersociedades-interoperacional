import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-brand-burgundy text-white hover:bg-[#7d243a]",
    secondary: "bg-white text-brand-blue border border-surface-line hover:bg-slate-50",
    ghost: "bg-transparent text-brand-blue hover:bg-white/10",
    danger: "bg-flag-red text-white hover:bg-[#b0001d]",
  };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold disabled:opacity-50", styles[variant], className)} {...props} />;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-md border border-surface-line bg-white px-3 py-2 text-sm", props.className)} />;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-surface-line bg-white p-5 shadow-card", className)}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ok" | "warn" | "risk" | "info" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    ok: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-900",
    risk: "bg-rose-50 text-rose-800",
    info: "bg-blue-50 text-brand-blue",
  };
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-surface-line bg-slate-50 p-6 text-sm text-slate-600">{children}</p>;
}
