const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-CO");

export function formatCOP(value: number) {
  return cop.format(value);
}

export function formatNumber(value: number) {
  return num.format(value);
}

export function formatPercent(value: number) {
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value * 100)} %`;
}

export function formatDate(value: string) {
  const date = value.length <= 10 ? new Date(`${value}T12:00:00-05:00`) : new Date(value);
  return new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", dateStyle: "medium" }).format(date);
}
