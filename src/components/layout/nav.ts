import {
  Bell, Building2, FolderKanban, Landmark, LayoutDashboard, Scale, Settings, Sparkles, Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavLink = { href: string; label: string };
export type NavEntry = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  items?: NavLink[];
};

export const NAV: NavEntry[] = [
  { id: "inicio", label: "Inicio", icon: LayoutDashboard, href: "/dashboard" },
  { id: "trabajo", label: "Mi trabajo", icon: FolderKanban, items: [
    { href: "/expedientes", label: "Expedientes" },
    { href: "/vigilancia/alertas", label: "Alertas" },
  ]},
  { id: "sociedades", label: "Sociedades", icon: Building2, href: "/empresas" },
  { id: "analisis", label: "Análisis", icon: Scale, items: [
    { href: "/vigilancia", label: "Vigilancia" },
    { href: "/vigilancia/alertas", label: "Alertas" },
    { href: "/finanzas", label: "Finanzas" },
    { href: "/insolvencia", label: "Insolvencia" },
    { href: "/contratacion", label: "Contratación" },
    { href: "/territorio", label: "Territorio" },
  ]},
  { id: "tramites", label: "Trámites", icon: Bell, items: [
    { href: "/radicacion", label: "Radicación" },
    { href: "/documentos", label: "Documentos" },
    { href: "/informes", label: "Informes" },
  ]},
  { id: "integraciones", label: "Integraciones", icon: Workflow, items: [
    { href: "/integraciones", label: "Catálogo" },
    { href: "/flujos", label: "Flujos" },
    { href: "/observabilidad", label: "Operación" },
    { href: "/gobierno-datos", label: "Gobierno de datos" },
    { href: "/auditoria", label: "Auditoría" },
  ]},
  { id: "herramientas", label: "Herramientas", icon: Sparkles, items: [
    { href: "/asistente", label: "Asistente" },
    { href: "/demo", label: "Casos de uso" },
    { href: "/acerca-de", label: "Acerca de" },
  ]},
  { id: "preferencias", label: "Preferencias", icon: Settings, href: "/configuracion" },
];

export const NAV_FLAT: NavLink[] = NAV.flatMap((entry) => entry.href ? [{ href: entry.href, label: entry.label }] : (entry.items ?? []));
