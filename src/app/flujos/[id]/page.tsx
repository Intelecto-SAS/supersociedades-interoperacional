"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page";
import { Empty } from "@/components/ui/primitives";
import { getFlow } from "@/features/flows/definitions";

const FlowCanvas = dynamic(() => import("./flow-canvas").then((m) => m.FlowCanvas), {
  ssr: false,
  loading: () => <p>Cargando diagrama…</p>,
});

export default function FlujoPage() {
  const { id } = useParams<{ id: string }>();
  const flow = getFlow(id);
  if (!flow) return <Empty>Flujo no encontrado.</Empty>;
  return (
    <div>
      <PageHeader crumbs={[{ href: "/flujos", label: "Flujos" }, { href: `/flujos/${flow.id}`, label: flow.nombre }]} title={flow.nombre} description={flow.objetivo} />
      <FlowCanvas flow={flow} />
    </div>
  );
}
