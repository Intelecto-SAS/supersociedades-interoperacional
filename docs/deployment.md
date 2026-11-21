# Despliegue en Vercel

1. Suba este repositorio a GitHub.
2. En Vercel, importe el proyecto.
3. Framework: Next.js. Comando de build: `npm run build`. Comando de instalación: `npm install`.
4. No hace falta base de datos ni variables obligatorias. La aplicación publica sin ellas.
5. Opcional: `DATOS_GOV_APP_TOKEN` para la cuota de SECOP. `CROMA_API_KEY` activa RUES, Rama Judicial de personas jurídicas y Supersociedades. `CROMA_ORG_ID` queda como referencia y no se envía. Ninguna lleva valor en el repositorio. Vea `.env.example`.
6. Publique.

Comprobaciones locales antes de importar:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

El sitio no escribe en disco durante la ejecución. Las salidas externas permitidas son `www.datos.gov.co` (`/api/live/secop`) y `api.croma.run` (`/api/live/croma`). El resto de conectores permanece en el catálogo local.
