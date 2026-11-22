"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Empty } from "@/components/ui/primitives";
import { useDemoStore, useView } from "@/lib/storage/store";

export default function EmpresaIdPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useView();
  const setEmpresa = useDemoStore((s) => s.setEmpresaActiva);
  const empresa = data.empresas.find((e) => e.id === id);
  useEffect(() => {
    if (!empresa) return;
    setEmpresa(empresa.id);
    router.replace("/empresa");
  }, [empresa, router, setEmpresa]);
  if (!empresa) return <Empty>No hay una sociedad con el identificador {id}.</Empty>;
  return <p>Abriendo el portal de {empresa.razonSocial}…</p>;
}
