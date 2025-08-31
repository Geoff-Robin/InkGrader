"use client";

import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/ui/footer";
import { ReactNode } from "react";

export default function ExamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <Navbar />
      {children}
      <SiteFooter />
    </div>
  );
}
