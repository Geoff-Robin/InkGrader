"use client";
import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Search,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    BookOpen,
    Upload,
    CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [showGraded, setShowGraded] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const referenceInputRef = useRef<HTMLInputElement>(null);
    const answersInputRef = useRef<HTMLInputElement>(null);

    const { data: session } = authClient.useSession();
    const userId = session?.user?.id;

    const { data: students = [], isLoading: loading, error } = useQuery<Student[]>({
        queryKey: ["exam-students", id, userId, showGraded],
        queryFn: async () => {
            if (!userId) return [];
            // Added ?graded=${showGraded} to appropriately fetch list
            const response = await fetch(`/api/proxy/exam/${id}/students?graded=${showGraded ? 'true' : 'false'}`, {
                headers: {
                    "X-User-Id": userId,
                }
            });
            if (!response.ok) throw new Error("Failed to fetch students");
            const data = await response.json();
            return data.map((s: any) => ({
                id: s.id,
                name: `Student ${s.id.slice(0, 4)}`,
                status: s.marks !== null && s.marks !== undefined ? "completed" : "pending",
                score: s.marks,
                total_score: 100, // Assuming 100 for now
                submitted_at: new Date().toISOString()
            }));
        },
        refetchInterval: 5000, // Poll interval to keep UI reactive while grading background processes are running
        enabled: !!id && !!userId,
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };

    const uploadMutation = useMutation({
        mutationFn: async ({ type, files }: { type: 'reference' | 'answers', files: FileList }) => {
            if (!userId) throw new Error("Unauthorized");

            const body: any = {};

            if (type === 'reference') {
                body.reference_file_base_64 = await fileToBase64(files[0]);
                body.reference_filename = files[0].name;
            } else if (type === 'answers') {
                const base64Files = await Promise.all(
                    Array.from(files).map(f => fileToBase64(f))
                );
                body.filenames = Array.from(files).map(f => f.name);
                body.files_base_64 = base64Files;
            }

            const response = await fetch(`/api/proxy/exam/${id}/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`Failed to upload ${type}`);
            return response.json();
        },
        onSuccess: (_, variables) => {
            if (variables.type === 'answers') {
                setSuccessMessage("Answers uploaded successfully! Processing and grading have started.");
            } else {
                setSuccessMessage("Reference Material uploaded successfully!");
            }
            queryClient.invalidateQueries({ queryKey: ["exam-students", id] });
            setTimeout(() => setSuccessMessage(null), 5000);
        },
    });


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'reference' | 'answers') => {
        if (e.target.files && e.target.files.length > 0) {
            uploadMutation.mutate({ type, files: e.target.files });
        }
    };

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

                {/* Hidden File Inputs */}
                <input
                    type="file"
                    ref={referenceInputRef}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'reference')}
                    accept=".pdf,.doc,.docx,.txt"
                />
                <input
                    type="file"
                    ref={answersInputRef}
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'answers')}
                    accept=".pdf,.doc,.docx,.txt"
                />

                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl h-11 px-4 font-semibold"
                        onClick={() => referenceInputRef.current?.click()}
                        disabled={uploadMutation.isPending}
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        {uploadMutation.isPending && uploadMutation.variables?.type === 'reference' ? 'Uploading...' : 'Reference Material'}
                    </Button>
                    <Button
                        variant="default"
                        className="rounded-xl h-11 px-4 font-bold shadow-lg shadow-primary/10"
                        onClick={() => answersInputRef.current?.click()}
                        disabled={uploadMutation.isPending}
                    >
                        {uploadMutation.isPending && uploadMutation.variables?.type === 'answers' ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload & Grade Answers
                    </Button>
                </div>
            </div>

            {successMessage && (
                <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="font-bold">Success</AlertTitle>
                    <AlertDescription className="font-medium">
                        {successMessage}
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                    const gradedStudents = students.filter(s => s.status === 'completed');
                    const totalScore = gradedStudents.reduce((acc, s) => acc + (s.score || 0), 0);
                    const totalMaxScore = gradedStudents.reduce((acc, s) => acc + (s.total_score || 100), 0);
                    const avgScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

                    return [
                        { label: "Total Fetch Count", value: students.length, color: "primary" },
                        { label: "Graded Here", value: gradedStudents.length, color: "emerald" },
                        { label: "Pending Here", value: students.filter(s => s.status === "pending" || s.status === "grading").length, color: "amber" },
                        { label: "Average Score", value: `${avgScore}%`, color: "indigo" },
                    ].map((stat, i) => (
                        <Card key={i} className="border border-border/60 bg-card shadow-sm hover:shadow-md transition-all rounded-2xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-muted-foreground uppercase">{stat.label}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-extrabold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ));
                })()}
            </div>

            {/* Student List Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search students..."
                            className="pl-10 h-11 bg-card/50 rounded-xl border-border/60 focus-visible:ring-primary/20 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Toggle Button for Graded / Ungraded */}
                    <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-auto self-end sm:self-auto border border-border/50">
                        <Button
                            variant={!showGraded ? "default" : "ghost"}
                            className={`rounded-lg h-9 w-full sm:w-32 font-bold shadow-none ${!showGraded ? 'text-primary-foreground' : 'text-muted-foreground'} active:scale-100`}
                            onClick={() => setShowGraded(false)}
                        >
                            Ungraded
                        </Button>
                        <Button
                            variant={showGraded ? "default" : "ghost"}
                            className={`rounded-lg h-9 w-full sm:w-32 font-bold shadow-none ${showGraded ? 'bg-emerald-600 text-primary-foreground hover:bg-emerald-700' : 'text-muted-foreground'} active:scale-100`}
                            onClick={() => setShowGraded(true)}
                        >
                            Graded
                        </Button>
                    </div>
                </div>

                <Card className="rounded-2xl border-border/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Submission Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="group hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm">
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
                                                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden hidden md:block border border-border/50">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--emerald-500),0.3)]"
                                                                style={{ width: `${(student.score / (student.total_score || 100)) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground font-medium tracking-widest">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-9 px-4 rounded-lg font-bold hover:bg-primary hover:text-primary-foreground group-hover:translate-x-1 transition-all"
                                                        onClick={() => router.push(`/home/exams/${id}/students/${student.id}`)}
                                                    >
                                                        View Report
                                                        <ChevronRight className="ml-1 w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground/40 mb-2">
                                                    <Search className="w-8 h-8" />
                                                </div>
                                                <h3 className="font-bold text-foreground/80">No students found</h3>
                                                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">Upload student answer papers to see them listed here.</p>
                                            </div>
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
