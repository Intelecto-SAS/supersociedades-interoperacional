# CONECTA 360

Laboratorio de interoperabilidad y analítica empresarial. Es un prototipo independiente, con datos ficticios, para mostrar cómo se vería una vista 360 de sociedades, un catálogo de fuentes, reglas de riesgo y flujos de integración.

No está conectado a la Superintendencia de Sociedades, la DIAN, el RUES, la Rama Judicial, el SECOP ni a ninguna otra entidad. No es una plataforma oficial.

## Alcance

- 200 empresas ficticias, 72 conectores en modo simulado y ocho flujos ejecutables.
- Perfil 360, alertas, insolvencia, contratación, expedientes, radicación, territorio, finanzas, informes, gobierno de datos y un asistente local.
- Estado de demostración en el navegador, con exportación e importación JSON.

## Tecnologías

Next.js (App Router), TypeScript, React, Tailwind CSS, Radix UI, Lucide, Recharts, TanStack Table, Zod, React Flow y Zustand. Pruebas con Vitest y Playwright.

## Requisitos

Node.js 20 o superior. No hace falta base de datos, llaves ni red institucional.

## Instalación y ejecución

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## Arquitectura

Vea `docs/architecture.md`. Los módulos de interfaz consumen el registro de conectores y los servicios. No consultan cada fuente por su cuenta.

## Módulos

Panel, integraciones, empresas, vigilancia, insolvencia, contratación, expedientes, documentos, radicación, flujos, territorio, finanzas, asistente, informes, gobierno de datos, auditoría, observabilidad, demostraciones, configuración y acerca de.

## Datos ficticios

Semilla fija `3602025`. Identificadores `DEMO-EMP`, `DEMO-NIT`, `DEMO-EXP` y `DEMO-CON`. Corte 29 de octubre de 2025. Moneda COP.

## Integraciones simuladas

Todas en modo MOCK. Acceso real: por verificar. Detalle en `docs/integrations.md`.

## Limitaciones

`docs/limitations.md`.

## Despliegue en Vercel

Importe el repositorio, deje el framework en Next.js y publique sin variables de entorno. Pasos en `docs/deployment.md`.
