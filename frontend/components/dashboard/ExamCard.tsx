"use client";
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Calendar, Users, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";

interface Exam {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    student_count?: number;
}

export function ExamCard({ exam }: { exam: Exam }) {
    return (
        <Card className="group border border-border bg-card transition-all hover:shadow-xl hover:border-primary/20 overflow-hidden relative">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Academic
                    </div>
                </div>
                <CardTitle className="text-xl font-bold mt-4 line-clamp-1">{exam.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mt-1">
                    {exam.description || "No description provided for this exam."}
                </p>
            </CardHeader>

            <CardContent className="pb-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{exam.created_at ? new Date(exam.created_at).toLocaleDateString() : "Just now"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{exam.student_count || 0} Students</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0 pb-6">
                <Button asChild className="w-full h-11 rounded-xl font-semibold transition-all group/btn shadow-lg shadow-primary/10">
                    <Link href={`/home/exams/${exam.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>

            <div className="absolute top-0 left-0 w-1 h-full bg-primary transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
        </Card>
    );
}
