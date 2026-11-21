export function toCsv(rows: Record<string, string | number | boolean | null | undefined>[]) {
  if (!rows.length) return "vacio\n";
  const headers = Object.keys(rows[0]!);
  const esc = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((h) => esc(row[h])).join(","))].join("\n");
}
