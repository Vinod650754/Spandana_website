import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/primitives";

type Column<T> = {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (item: T) => string;
  emptyState?: ReactNode;
};

export function DataTable<T>({ columns, rows, rowKey, emptyState }: DataTableProps<T>) {
  if (rows.length === 0) {
    return emptyState ?? null;
  }

  return (
    <GlassCard>
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className={`px-5 py-4 font-semibold ${column.className ?? ""}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={rowKey(row)} className="transition hover:bg-slate-50/70">
                  {columns.map((column) => (
                    <td key={column.header} className={`px-5 py-4 align-top text-slate-700 ${column.className ?? ""}`}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassCard>
  );
}
