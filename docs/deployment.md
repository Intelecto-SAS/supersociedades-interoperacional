# Despliegue en Vercel

1. Suba este repositorio a GitHub.
2. En Vercel, importe el proyecto.
3. Framework: Next.js. Comando de build: `npm run build`. Comando de instalación: `npm install`.
4. No agregue variables de entorno ni base de datos.
5. Publique.

Comprobaciones locales antes de importar:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

El sitio no escribe en disco durante la ejecución y no llama servicios institucionales.
