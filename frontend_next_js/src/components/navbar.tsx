"use client"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"

export default function Navbar() {


  return (
    <nav className="sticky bg-opacity-60 top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-4xl m-5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <img src="/logo.png" alt="InkGrader Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-semibold text-foreground">InkGrader</h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
              <Link href="/login">
                <Button className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
