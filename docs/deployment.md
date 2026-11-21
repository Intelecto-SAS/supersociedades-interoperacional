# Despliegue en Vercel

1. Suba este repositorio a GitHub.
2. En Vercel, importe el proyecto.
3. Framework: Next.js. Comando de build: `npm run build`. Comando de instalación: `npm install`.
4. No hace falta base de datos ni variables obligatorias. La aplicación publica sin ellas.
5. Opcional: cree `DATOS_GOV_APP_TOKEN` con un App Token de datos.gov.co. Sirve solo para la consulta SECOP en vivo y no tiene valor por defecto. Vea `.env.example`.
6. Publique.

Comprobaciones locales antes de importar:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

El sitio no escribe en disco durante la ejecución. La única salida externa es `www.datos.gov.co`, y solo desde `/api/live/secop`. El resto de conectores permanece en el catálogo local.
