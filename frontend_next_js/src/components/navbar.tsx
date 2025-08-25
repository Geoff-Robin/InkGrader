"use client"

import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()

  // Routes where we want to show Login
  const authPages = ["/", "/login", "/register"]
  const showLogin = authPages.includes(pathname)
  const router = useRouter()
  const handleLogout = async()=>{

  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/10 backdrop-blur-md backdrop-saturate-150 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}  
          <Link href="/">
            <div className="flex items-center">
              <img src="/logo.png" alt="InkGrader Logo" className="h-8 w-8 mr-2" />
              <h1 className="text-xl font-semibold text-foreground">InkGrader</h1>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {pathname !== "/" && <ThemeToggle />}

            {showLogin ? (
              <Link href="/login">
                <Button className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            ) : (
              <Button className="flex items-center gap-2" onClick={() => {handleLogout}}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
