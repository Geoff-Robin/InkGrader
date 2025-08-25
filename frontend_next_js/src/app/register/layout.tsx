"use client"
import React from "react";

export const metadata = {
  title: "Register - InkGrader",
  description: "Register to access InkGrader and manage your grading tasks.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  );
}
