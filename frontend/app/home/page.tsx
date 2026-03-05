"use client";
import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExamCard } from "@/components/dashboard/ExamCard";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { CreateExamDialog } from "@/components/dashboard/CreateExamDialog";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

interface Exam {
  id: string;
  exam_name: string;
  created_at?: string;
  student_count?: number;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { data: exams = [], isLoading: loading, error, refetch: fetchExams } = useQuery<Exam[]>({
    queryKey: ["exams", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch("/api/proxy/exam", {
        headers: {
          "X-User-Id": userId,
        }
      });
      if (!response.ok) throw new Error("Failed to fetch exams");
      return response.json();
    },
    enabled: !!userId,
  });

  const filteredExams = exams.filter(exam =>
    exam.exam_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Assessments</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and monitor all your classroom evaluations.</p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsCreateOpen(true)}
          className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create New Exam
        </Button>
      </div>

      <CreateExamDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchExams}
      />

      {/* Controls Section */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/50 p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search exams..."
            className="pl-10 h-11 bg-background rounded-xl border-border/60 focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" className="h-11 rounded-xl px-4 gap-2 font-semibold">
            <Filter className="h-4 w-4" />
            Recently Created
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading assessments...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 py-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">Fetch Error</AlertTitle>
          <AlertDescription className="text-base mt-2">
            {error instanceof Error ? error.message : "An unknown error occurred"}. Please ensure the backend server is running and try again.
          </AlertDescription>
        </Alert>
      ) : filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">No assessments found</h2>
          <p className="text-muted-foreground max-w-sm mt-2 font-medium">
            You haven't created any exams yet. Start by creating your first assessment to see it here.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="mt-8 rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
          >
            Create First Exam
          </Button>
        </div>
      )}
    </div>
  );
}
