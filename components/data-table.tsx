"use client"

import { useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
export type DataTableColumn<T> = {
  header: ReactNode
  className?: string
  cell: (row: T, index: number) => ReactNode
}

export type DataTablePaginationLabels = {
  previous: string
  next: string
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  pageSize = 10,
  emptyText,
  labels,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => React.Key
  pageSize?: number
  emptyText: string
  labels: DataTablePaginationLabels
}) {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const start = current * pageSize
  const slice = rows.slice(start, start + pageSize)

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {slice.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-20 text-center text-muted-foreground"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            slice.map((row, i) => (
              <TableRow key={getRowKey(row, start + i)}>
                {columns.map((col, j) => (
                  <TableCell key={j} className={col.className}>
                    {col.cell(row, start + i)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t px-3 py-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {current + 1} / {pageCount}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              aria-label={labels.previous}
              title={labels.previous}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={current === pageCount - 1}
              aria-label={labels.next}
              title={labels.next}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
