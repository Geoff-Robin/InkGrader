"use client";
import NavBar from "./_components/NavBar";
import Footer from "./_components/Footer";
import { Boxes } from "@/components/ui/background-boxes";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-white dark:bg-slate-900">
      {/* Container for everything ABOVE the footer */}
      <NavBar />
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col">
        <Boxes />
        <main className="relative z-10 pt-32 grow flex flex-col">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
