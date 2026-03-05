"use client";
import React from "react";
import Link from "next/link";
import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <Link href="/home" className="flex items-center gap-2 group">
                        <div className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">InkGrader</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl px-4 h-10 font-bold transition-all"
                        onClick={async () => {
                            await authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        window.location.href = "/login";
                                    },
                                },
                            });
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
