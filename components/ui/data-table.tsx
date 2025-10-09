"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string
}

export function DataTable<T>({ data, columns, onRowClick, loading, emptyMessage, keyExtractor }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-neutral-100">
                  {columns.map((_, idx) => (
                    <td key={idx} className="py-3 sm:py-4 px-2 sm:px-4">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return <div className="text-center py-12 text-neutral-600">{emptyMessage || "No data available"}</div>
  }

  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="text-left py-3 sm:py-4 px-2 sm:px-4 font-semibold text-neutral-900 text-xs sm:text-sm whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr
                key={keyExtractor(row)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-neutral-100 hover:bg-neutral-900 group transition-all duration-300 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col, colIdx) => {
                  const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor]
                  return (
                    <td
                      key={colIdx}
                      className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-300 transition-colors whitespace-nowrap ${col.className || ""}`}
                    >
                      {value as ReactNode}
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
