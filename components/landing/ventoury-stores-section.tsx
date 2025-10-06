"use client"

import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function VentouryStoresSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-neutral-50" id="ventoury-stores">
      <div className="container-custom">
        <Reveal>
          <div className="text-left mb-16">
            <h2 className="text-4xl text-neutral-900 mb-4 lg:text-6xl">
              Ventoury <span className="italic font-light">Stores</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Discover unique businesses or showcase your products to the world. Join our marketplace and connect with
              customers instantly.
            </p>
          </div>
        </Reveal>

        <div className="relative mb-12">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none" />

            {/* Main image from Supabase bucket */}
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/public-images/landing-page/ventoury_stores.png`}
              alt="Ventoury Stores Marketplace"
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>

        <Reveal delay={0.2}>
          <div className="flex justify-center">
            <Link href="/store">
              <Button
                size="lg"
                className="bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Browse Shops
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
