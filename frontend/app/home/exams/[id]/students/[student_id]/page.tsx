"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Info,
    MessageSquare,
    FileText,
    Download,
    Share2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "../../../../../../components/ui/badge";
import { Separator } from "../../../../../../components/ui/separator";
import { cn } from "../../../../../../lib/utils";
import { Label } from "../../../../../../components/ui/label";

import { useQuery } from "@tanstack/react-query";

interface QuestionResult {
    question_number: number;
    question_text: string;
    student_answer: string;
    score: number;
    max_score: number;
    feedback: string;
    is_correct: boolean;
}

interface StudentResult {
    student_id: string;
    student_name: string;
    exam_name: string;
    total_score: number;
    max_total_score: number;
    overall_feedback: string;
    results: QuestionResult[];
}

export default function StudentResultPage() {
    const { id, student_id } = useParams();
    const router = useRouter();

    const { data: result, isLoading: loading, error } = useQuery<StudentResult>({
        queryKey: ["student-result", id, student_id],
        queryFn: async () => {
            const response = await fetch(`/api/proxy/exam/${id}/students/${student_id}`, {
                headers: {
                    "X-User-Id": "default-user",
                }
            });
            if (!response.ok) throw new Error("Failed to fetch student result");
            return response.json();
        },
        enabled: !!id && !!student_id,
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold animate-pulse text-lg">Analyzing Grading Results...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-destructive">Error Loading Results</h2>
                <p className="text-muted-foreground mt-2">{error instanceof Error ? error.message : "Result not found"}</p>
                <Button onClick={() => router.back()} className="mt-6 rounded-xl">Go Back</Button>
            </div>
        );
    }

    const scorePercentage = (result.total_score / result.max_total_score) * 100;

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Navigation */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="group -ml-4 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Exam View
            </Button>

            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-card p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 -z-10" />

                <div className="space-y-4">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full font-bold">
                        GRADING REPORT
                    </Badge>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight">{result.student_name}</h1>
                        <p className="text-xl text-muted-foreground font-medium">{result.exam_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Final Score</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-primary">{result.total_score}</span>
                            <span className="text-2xl font-bold text-muted-foreground">/ {result.max_total_score}</span>
                        </div>
                    </div>
                    <div className="h-16 w-[2px] bg-border mx-2" />
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-black text-primary">{Math.round(scorePercentage)}%</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl h-11 px-6 font-semibold shadow-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
                <Button variant="outline" className="rounded-xl h-11 px-6 font-semibold shadow-sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Student
                </Button>
            </div>

            {/* Overall Feedback */}
            <Card className="rounded-3xl border-primary/10 bg-primary/5 shadow-inner">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <MessageSquare className="w-5 h-5" />
                        AI Summary & Feedback
                    </CardTitle>
                    <CardDescription className="text-primary/70 font-medium">A high-level overview of the student's performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-lg leading-relaxed font-medium text-foreground/90 italic">
                        "{result.overall_feedback}"
                    </p>
                </CardContent>
            </Card>

            {/* Question Analysis */}
            <div className="space-y-6">
                <h2 className="text-2xl font-extrabold px-2">Detailed Question Analysis</h2>

                {result.results.map((q, idx) => (
                    <Card key={idx} className="rounded-3xl border-border/60 hover:border-primary/20 transition-all overflow-hidden">
                        <div className={cn(
                            "h-1.5 w-full",
                            q.is_correct ? "bg-emerald-500" : q.score > 0 ? "bg-amber-500" : "bg-destructive"
                        )} />
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold">Question {q.question_number}</CardTitle>
                                    <p className="text-muted-foreground font-medium">{q.question_text}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-muted-foreground mb-1">SCORE</div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn("text-xl font-black", q.is_correct ? "text-emerald-500" : "text-primary")}>{q.score}</span>
                                        <span className="text-sm text-muted-foreground">/ {q.max_score}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator className="bg-border/40" />
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-2 block">Student Answer</Label>
                                <div className="p-4 rounded-2xl bg-muted/50 border border-border/40 text-sm font-medium leading-relaxed">
                                    {q.student_answer}
                                </div>
                            </div>

                            <div className="flex gap-4 items-start p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 mt-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-black uppercase text-emerald-600 tracking-widest mb-1 block">Feedback & Correction</span>
                                    <p className="text-sm text-emerald-900/80 font-medium leading-relaxed">{q.feedback}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
