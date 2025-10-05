import type React from "react"
import type { Metadata } from "next"
import { Inter, Open_Sans } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Ventoury",
  description:
    "Manage your inventory with confidence. Ventoury is a complete inventory management system for modern businesses, featuring real-time tracking, sales analytics, customer management, and comprehensive reporting.",
  generator: "v0.app",
  alternates: {
    canonical: "https://ventoury.app/",
  },
  openGraph: {
    siteName: "Ventoury",
    title: "Ventoury — Modern Inventory Management",
    description: "Manage your inventory with confidence. Complete inventory management solution for modern businesses.",
    type: "website",
    url: "https://ventoury.app/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventoury — Modern Inventory Management",
    description: "Manage your inventory with confidence. Complete inventory management solution for modern businesses.",
    site: "@ventoury",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${openSans.variable} antialiased`}>
      <body className="font-body bg-background text-foreground overflow-x-hidden">{children}</body>
    </html>
  )
}
