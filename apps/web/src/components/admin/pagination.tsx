"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="inline-flex items-center gap-2 disabled:opacity-40">
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <span>
        Page {page} of {pageCount}
      </span>
      <button type="button" onClick={() => onPageChange(Math.min(pageCount, page + 1))} disabled={page === pageCount} className="inline-flex items-center gap-2 disabled:opacity-40">
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
