export function InstitutionalLogo({ src, alt = "Marca institucional autorizada" }: { src?: string; alt?: string }) {
  if (src) {
    return (
      // El archivo autorizado se muestra tal cual llega; no se optimiza en el prototipo.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="h-10 w-auto" />
    );
  }
  return (
    <div>
      <p className="text-lg font-bold">CONECTA 360</p>
      <p className="text-xs">Interoperabilidad empresarial</p>
    </div>
  );
}
