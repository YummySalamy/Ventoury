import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { LocaleProvider } from "@/contexts/LocaleContext"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Ventoury - Plan Your Dream Adventure",
  description:
    "Discover, plan, and book unforgettable travel experiences with AI-powered recommendations tailored just for you.",
  generator: "v0.app",
  alternates: {
    canonical: "https://ventoury.app/",
  },
  openGraph: {
    siteName: "Ventoury",
    title: "Ventoury — AI-Powered Travel Planning",
    description: "Discover, plan, and book unforgettable travel experiences with AI-powered recommendations.",
    type: "website",
    url: "https://ventoury.app/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventoury — AI-Powered Travel Planning",
    description: "Discover, plan, and book unforgettable travel experiences with AI-powered recommendations.",
    site: "@ventoury",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground overflow-x-hidden">
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
