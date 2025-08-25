// app/login/layout.tsx
"use client"
import React from "react";

const metadata = {
    title: "Dashboard - InkGrader",
    description: "Dashboard to access InkGrader and manage your grading tasks.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            {children}
        </div>
    );
}
