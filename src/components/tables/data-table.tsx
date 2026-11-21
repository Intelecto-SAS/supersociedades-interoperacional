"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/primitives";

export function DataTable<T>({ columns, data, pageSize = 10 }: { columns: ColumnDef<T, unknown>[]; data: T[]; pageSize?: number }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });
  const caption = useMemo(() => `${data.length} registros en la vista actual`, [data.length]);
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-slate-50 text-brand-blue">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} scope="col" className="border-b border-surface-line px-3 py-2 font-semibold">
                    {header.isPlaceholder ? null : (
                      <button className="text-left" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-slate-50/60">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-surface-line px-3 py-2 align-top">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
          <Button variant="secondary" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}
