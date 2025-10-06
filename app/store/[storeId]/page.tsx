import { Suspense } from "react"
import { StoreView } from "@/components/marketplace/store-view"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

interface StorePageProps {
  params: {
    storeId: string
  }
}

export default function StorePage({ params }: StorePageProps) {
  if (!params.storeId) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="mb-8 h-32 w-full rounded-3xl" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <StoreView storeId={params.storeId} />
    </Suspense>
  )
}
