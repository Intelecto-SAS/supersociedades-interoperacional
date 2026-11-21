"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SimpleBars({ data, x, y, label }: { data: Record<string, string | number>[]; x: string; y: string; label: string }) {
  return (
    <div>
      <p className="sr-only">{label}. {data.map((d) => `${d[x]} ${d[y]}`).join(", ")}</p>
      <div className="h-64 w-full" aria-hidden>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#E2E6EC" vertical={false} />
            <XAxis dataKey={x} tick={{ fontSize: 11 }} interval={0} angle={-25} height={70} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={y} fill="#2A477A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
