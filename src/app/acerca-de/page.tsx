import { PageHeader } from "@/components/shared/page";
import { Card } from "@/components/ui/primitives";

export default function AcercaPage() {
  return (
    <div>
      <PageHeader title="Acerca de CONECTA 360" description="Prototipo de interoperabilidad empresarial." />
      <Card className="space-y-3 text-sm">
        <p>Este prototipo es una demostración tecnológica independiente. No está conectado a los sistemas oficiales de la Superintendencia de Sociedades ni de otras entidades. Todos los datos empresariales, financieros, jurídicos y documentales son ficticios.</p>
        <p>La identidad visual se inspira en el Manual de Identidad Visual Institucional, código GCO-MA-001, versión 010, del 29 de octubre de 2025. No se reproduce el logotipo ni el escudo.</p>
        <p>Marca mostrada: CONECTA 360. Pie: Prototipo de interoperabilidad empresarial. Identificación permanente: DEMO · DATOS SIMULADOS.</p>
        <p>Controles pendientes para una versión productiva: identidad y acceso, autorización por recurso, auditoría persistente, gestión de secretos, protección de datos, cifrado, retención, integración segura, acuerdos institucionales, revisión jurídica, monitoreo y recuperación ante fallos. Este prototipo no afirma cumplimiento legal.</p>
      </Card>
    </div>
  );
}
