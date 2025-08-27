// app/login/layout.tsx
"use client"
import React from "react";

const metadata = {
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
