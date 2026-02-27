"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import ToggleIcon from "./ToggleIcon";

export default function NavBar() {
  const { theme, setTheme } = useTheme();
  const themeToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full">
      <div
        className="flex items-center justify-between bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-white/30 dark:border-white/10 shadow-sm saturate-150"
        style={{ padding: "12px 40px", width: "100vw" }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={50} height={40} />
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            InkGrader
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold dark:text-gray-200 text-black">
          <a href="#features" className="hover:text-blue-600 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">
            Pricing
          </a>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          <button
            className="text-gray-900 dark:text-white hover:opacity-70 transition-opacity"
            onClick={themeToggle}
          >
            <ToggleIcon />
          </button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              style={{ padding: "10px 14px", fontSize: "15px", height: "35px" }}
            >
              Log in
            </Button>
            <Button
              size="lg"
              style={{
                padding: "10px 14px",
                fontSize: "15px",
                height: "35px",
              }}
            >
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
