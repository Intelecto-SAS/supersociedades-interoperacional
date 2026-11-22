import {
  Bell, Building2, FileCheck, FileText, Inbox, LayoutDashboard, Mail, Send, Settings,
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
  { id: "empresa", label: "Mi sociedad", icon: Building2, href: "/empresa" },
  { id: "documentos", label: "Documentos", icon: FileCheck, href: "/documentos" },
  { id: "solicitudes", label: "Solicitudes", icon: Inbox, items: [
    { href: "/solicitudes", label: "Mis solicitudes" },
    { href: "/solicitudes/nueva", label: "Nueva solicitud FURT" },
  ]},
  { id: "correspondencia", label: "Correspondencia", icon: Mail, href: "/correspondencia" },
  { id: "salida", label: "Salida 4-72", icon: Send, href: "/salida-472" },
  { id: "datos", label: "Datos validados", icon: FileText, href: "/datos" },
  { id: "canales", label: "Canales EDI", icon: Bell, href: "/canales" },
  { id: "preferencias", label: "Preferencias", icon: Settings, href: "/configuracion" },
];

export const NAV_FLAT: NavLink[] = NAV.flatMap((entry) => entry.href ? [{ href: entry.href, label: entry.label }] : (entry.items ?? []));
