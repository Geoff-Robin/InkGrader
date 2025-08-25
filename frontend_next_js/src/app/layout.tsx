import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/navbar"
import { SiteFooter } from "@/components/ui/footer"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { AuthContextProvider } from "@/lib/authContext" // import your context

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
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <AuthContextProvider>
            <Navbar />
            {children}
            <SiteFooter />
          </AuthContextProvider>
        </NextThemesProvider>
      </body>
    </html>
  )
}
