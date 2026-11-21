import { PageHeader } from "@/components/shared/page";
import { Card } from "@/components/ui/primitives";

export default function AcercaPage() {
  return (
    <div>
      <PageHeader title="Acerca de CONECTA 360" description="Plataforma de interoperabilidad y analítica empresarial." />
      <Card className="space-y-3 text-sm leading-6">
        <p>CONECTA 360 reúne el registro de las sociedades, la información financiera, la contratación, los procesos y los expedientes en una sola vista.</p>
        <p>El seguimiento de riesgo explica la regla y la evidencia. Los flujos muestran cada paso, la entrada y la salida. El gobierno de datos conserva el registro de origen junto con el consolidado.</p>
        <p>La interfaz usa la paleta institucional vinotinto y azul, con Nunito Sans.</p>
      </Card>
    </div>
  );
}
