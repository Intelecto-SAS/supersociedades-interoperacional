import {
  Bell, Building2, FileText, FolderOpen, GitBranch, Landmark, LayoutDashboard, Map,
  Scale, Search, Settings, Shield, Sparkles, Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { id: string; grupo: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  { id: "trabajo", grupo: "Mi trabajo", items: [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/empresas", label: "Sociedades", icon: Building2 },
    { href: "/expedientes", label: "Expedientes", icon: FolderOpen },
  ]},
  { id: "analisis", grupo: "Análisis", items: [
    { href: "/vigilancia", label: "Vigilancia", icon: Shield },
    { href: "/vigilancia/alertas", label: "Alertas", icon: Bell },
    { href: "/finanzas", label: "Finanzas", icon: Landmark },
    { href: "/insolvencia", label: "Insolvencia", icon: Scale },
    { href: "/contratacion", label: "Contratación", icon: FileText },
    { href: "/territorio", label: "Territorio", icon: Map },
  ]},
  { id: "tramites", grupo: "Trámites", items: [
    { href: "/radicacion", label: "Radicación", icon: FileText },
    { href: "/documentos", label: "Documentos", icon: FileText },
    { href: "/informes", label: "Informes", icon: FileText },
  ]},
  { id: "datos", grupo: "Datos", items: [
    { href: "/integraciones", label: "Integraciones", icon: GitBranch },
    { href: "/flujos", label: "Flujos", icon: Workflow },
    { href: "/observabilidad", label: "Operación", icon: Workflow },
    { href: "/gobierno-datos", label: "Gobierno de datos", icon: Shield },
    { href: "/auditoria", label: "Auditoría", icon: Search },
  ]},
  { id: "herramientas", grupo: "Herramientas", items: [
    { href: "/asistente", label: "Asistente", icon: Sparkles },
    { href: "/demo", label: "Casos de uso", icon: Sparkles },
    { href: "/configuracion", label: "Preferencias", icon: Settings },
    { href: "/acerca-de", label: "Acerca de", icon: Settings },
  ]},
];

export const NAV_FLAT = NAV.flatMap((g) => g.items);
