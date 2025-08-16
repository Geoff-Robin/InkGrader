import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SiteFooter } from "@/components/ui/footer"

export const metadata: Metadata = {
  title: "InkGrader",
  description: "Created with InkGrader",
  generator: "InkGrader",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className="flex flex-col">
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Navbar />
            {children}
          <SiteFooter />
        </NextThemesProvider>
      </body>

    </html >
  )
}
