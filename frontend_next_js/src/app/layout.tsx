"use client"

import type React from "react";
import "./globals.css";
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/ui/footer";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthContextProvider } from "@/lib/authContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Routes without Navbar/Footer
  const noLayoutRoutes = ["/dashboard", "/exam"];
  const isProtectedRoute = noLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    async function checkAuth() {
      if (isProtectedRoute) {
        const token = sessionStorage.getItem("token");

        if (!token) {
          router.replace("/");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status !== 200) {
          sessionStorage.removeItem("token");
          router.replace("/");
          return;
        }
      }

      setLoading(false);
    }

    checkAuth();
  }, [pathname, isProtectedRoute, router]);

  // Show a temporary loader while checking authentication
  if (loading && isProtectedRoute) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col items-center justify-center h-screen">
          <p>Checking authentication...</p>
        </body>
      </html>
    );
  }

  // Protected routes (no Navbar/Footer)
  if (isProtectedRoute) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className="flex flex-col">
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <AuthContextProvider>{children}</AuthContextProvider>
          </NextThemesProvider>
        </body>
      </html>
    );
  }

  // Normal routes (with Navbar/Footer)
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
