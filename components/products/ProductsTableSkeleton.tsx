"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProductsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="text-left py-4 px-4">
              <Skeleton className="h-4 w-20" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="border-b border-neutral-100">
              <td className="py-4 px-4">
                <Skeleton className="h-12 w-12 rounded" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="py-4 px-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
              <td className="py-4 px-4">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
