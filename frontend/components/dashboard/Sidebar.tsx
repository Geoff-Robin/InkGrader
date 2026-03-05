"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    LogOut,
    GraduationCap
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/home" },
    { icon: BookOpen, label: "Exams", href: "/home/exams" },
    { icon: Users, label: "Students", href: "/home/students" },
    { icon: Settings, label: "Settings", href: "/home/settings" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 transition-all">
            {/* Brand */}
            <div className="p-6">
                <Link href="/home" className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">InkGrader</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-xs"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4 h-4 transition-transform group-hover:scale-110",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            {item.label}
                            {isActive && (
                                <div className="ml-auto w-1 h-4 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-3"
                    asChild
                >
                    <Link href="/api/auth/sign-out">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </Link>
                </Button>
            </div>
        </aside>
    );
}
