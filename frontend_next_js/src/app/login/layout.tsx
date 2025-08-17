// app/login/layout.tsx
import Navbar from "@/components/navbar";
import { SiteFooter } from "@/components/ui/footer";
import React from "react";

export const metadata = {
  title: "Login - InkGrader",
  description: "Login to access InkGrader and manage your grading tasks.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
