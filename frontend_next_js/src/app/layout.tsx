"use client";

import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/ui/footer";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthContextProvider } from "@/lib/authContext";
import { usePathname } from "next/navigation";

const metadata: Metadata = {
  title: "InkGrader",
  description: "Created with InkGrader",
  generator: "InkGrader",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/dashboard","/exam"];
  const hideLayout = noLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (hideLayout){
    return(
      <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col">
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <AuthContextProvider>
              {children}
            </AuthContextProvider>
          </NextThemesProvider>
        </body>
      </html>
    )
  }
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
  );
}
