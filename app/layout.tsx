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
  title: "Ventoury - Business Management Platform",
  description:
    "Manage your inventory, sales, customers, and business operations with Ventoury. A comprehensive platform for modern businesses.",
  generator: "v0.app",
  alternates: {
    canonical: "https://ventoury.app/",
  },
  openGraph: {
    siteName: "Ventoury",
    title: "Ventoury — Business Management Platform",
    description: "Manage your inventory, sales, customers, and business operations with Ventoury.",
    type: "website",
    url: "https://ventoury.app/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventoury — Business Management Platform",
    description: "Manage your inventory, sales, customers, and business operations with Ventoury.",
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
      <body className="font-sans bg-background text-foreground">
        <LocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
