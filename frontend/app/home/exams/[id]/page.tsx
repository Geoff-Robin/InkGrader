"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    FileText,
    Search,
    ExternalLink,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { cn } from "../../../../lib/utils";

import { useQuery } from "@tanstack/react-query";

interface Student {
    id: string;
    name: string;
    status: "pending" | "grading" | "completed" | "failed";
    score?: number;
    total_score?: number;
    submitted_at?: string;
}

export default function ExamDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: students = [], isLoading: loading, error } = useQuery<Student[]>({
        queryKey: ["exam-students", id],
        queryFn: async () => {
            const response = await fetch(`/api/proxy/exam/${id}/students`, {
                headers: {
                    "X-User-Id": "default-user",
                }
            });
            if (!response.ok) throw new Error("Failed to fetch students");
            return response.json();
        },
        enabled: !!id,
    });

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: Student["status"]) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Graded</Badge>;
            case "grading":
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1 rounded-full animate-pulse"><Clock className="w-3 h-3 mr-1" /> Grading</Badge>;
            case "failed":
                return <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>;
            default:
                return <Badge variant="secondary" className="px-3 py-1 rounded-full text-muted-foreground">Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Loading exam details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 px-4">
                <div className="w-20 h-20 rounded-3xl bg-destructive/5 flex items-center justify-center text-destructive mx-auto mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold">Error Loading Students</h2>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2 font-medium">
                    {error instanceof Error ? error.message : "Something went wrong"}.
                    Please ensure the backend server is running and try again.
                </p>
                <Button onClick={() => router.push("/home")} className="mt-8 rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Navigation */}
            <Button
                variant="ghost"
                onClick={() => router.push("/home")}
                className="group -ml-4 text-muted-foreground hover:text-foreground mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </Button>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight">Exam Results</h1>
                        <Badge variant="outline" className="h-6 border-primary/20 text-primary bg-primary/5">ID: {id?.slice(0, 8)}</Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">Review and manage individual student submissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl h-11 px-4 font-semibold">
                        <FileText className="w-4 h-4 mr-2" />
                        Upload Rubric
                    </Button>
                    <Button className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
                        Grade All
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: students.length, color: "primary" },
                    { label: "Graded", value: students.filter(s => s.status === "completed").length, color: "emerald" },
                    { label: "Pending", value: students.filter(s => s.status === "pending" || s.status === "grading").length, color: "amber" },
                    { label: "Average Score", value: "84%", color: "indigo" },
                ].map((stat, i) => (
                    <Card key={i} className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-all rounded-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">{stat.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-extrabold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Student List Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search students..."
                            className="pl-10 h-11 bg-card/50 rounded-xl border-border/60 focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="rounded-2xl border-border/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 border-b border-border text-sm font-bold text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Submission Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                <span className="text-muted-foreground font-medium">Fetching students...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="group hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {student.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <span className="font-bold text-sm tracking-tight">{student.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                                {student.submitted_at ? new Date(student.submitted_at).toLocaleDateString() : "Mar 15, 2024"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(student.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.score !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold">{student.score} / {student.total_score || 100}</span>
                                                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden hidden md:block">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                                style={{ width: `${(student.score / (student.total_score || 100)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 rounded-lg font-bold hover:bg-primary hover:text-primary-foreground group-hover:scale-105 transition-all"
                                                    onClick={() => router.push(`/home/exams/${id}/students/${student.id}`)}
                                                >
                                                    View Report
                                                    <ChevronRight className="ml-1 w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-medium">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
