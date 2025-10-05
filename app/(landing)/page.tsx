"use client"
import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedModules } from "@/components/landing/featured-modules"
import { CategoriesStrip } from "@/components/landing/categories-strip"
import { IntegrationsSection } from "@/components/landing/integrations-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturedModules />
      <CategoriesStrip />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
