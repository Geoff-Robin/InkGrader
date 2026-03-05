"use client";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import ToggleIcon from "./ToggleIcon";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const themeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="flex items-center justify-between w-full max-w-7xl h-16 px-6 rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg saturate-150 transition-all duration-300">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            InkGrader
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
            FAQ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </a>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors"
            onClick={themeToggle}
          >
            <ToggleIcon />
          </button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="font-semibold">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="font-semibold shadow-lg shadow-primary/20">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
