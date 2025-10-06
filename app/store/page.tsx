import { Suspense } from "react"
import { MarketplaceDiscovery } from "@/components/marketplace/marketplace-discovery"
import { Skeleton } from "@/components/ui/skeleton"
import { StoreHeader } from "@/components/marketplace/store-header"
import { Footer } from "@/components/landing/footer"

export default function MarketplacePage() {
  return (
    <>
      <StoreHeader />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight">Discover Stores</h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
              Browse unique products from independent businesses and artisans
            </p>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-3xl" />
                ))}
              </div>
            }
          >
            <MarketplaceDiscovery />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  )
}
