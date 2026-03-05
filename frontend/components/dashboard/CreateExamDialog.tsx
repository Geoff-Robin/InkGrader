"use client";
import React, { useState, useRef } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, Sparkles, Upload } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

interface CreateExamDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateExamDialog({ isOpen, onClose, onSuccess }: CreateExamDialogProps) {
    const [name, setName] = useState("");
    const [questionsFile, setQuestionsFile] = useState<File | null>(null);
    const [rubricsFile, setRubricsFile] = useState<File | null>(null);
    const [referenceFile, setReferenceFile] = useState<File | null>(null);

    const questionsInputRef = useRef<HTMLInputElement>(null);
    const rubricsInputRef = useRef<HTMLInputElement>(null);
    const referenceInputRef = useRef<HTMLInputElement>(null);

    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();
    const userId = session?.user?.id;

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

    const { mutate: createExam, isPending: loading, error: mutationError } = useMutation({
        mutationFn: async ({ exam_name }: { exam_name: string }) => {
            if (!userId) throw new Error("Authentication required");
            if (!questionsFile) throw new Error("Questions file is required");
            if (!rubricsFile) throw new Error("Rubrics file is required");

            const payload: any = { exam_name };
            payload.questions_filename = questionsFile.name;
            payload.questions_file_base_64 = await fileToBase64(questionsFile);

            payload.rubrics_filename = rubricsFile.name;
            payload.rubrics_file_base_64 = await fileToBase64(rubricsFile);

            if (referenceFile) {
                payload.reference_filename = referenceFile.name;
                payload.reference_file_base_64 = await fileToBase64(referenceFile);
            }
            if (!userId) throw new Error("Authentication required");
            const response = await fetch("/api/proxy/exam", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": userId,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to create exam");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            setName("");
            setQuestionsFile(null);
            setRubricsFile(null);
            setReferenceFile(null);
            // reset refs if necessary, though they unmount
            onSuccess();
            onClose();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createExam({ exam_name: name });
    };

    const error = mutationError instanceof Error ? mutationError.message : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Assessment">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold">Exam Name</Label>
                    <Input
                        id="name"
                        placeholder="e.g. Midterm Mathematics"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 rounded-xl border-border/60 focus-visible:ring-primary/20"
                    />
                </div>

                <div className="space-y-4 pt-2 border-t border-border/30">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            Questions
                            <span className="text-destructive text-xs ml-1">*Required</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept=".pdf,.txt"
                                ref={questionsInputRef}
                                onChange={(e) => setQuestionsFile(e.target.files?.[0] || null)}
                                className="h-12 file:h-full file:mr-4 file:py-0 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            Rubrics
                            <span className="text-destructive text-xs ml-1">*Required</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept=".pdf,.txt"
                                ref={rubricsInputRef}
                                onChange={(e) => setRubricsFile(e.target.files?.[0] || null)}
                                className="h-12 file:h-full file:mr-4 file:py-0 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            Reference Material
                            <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                type="file"
                                accept=".pdf,.txt"
                                ref={referenceInputRef}
                                onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
                                className="h-12 file:h-full file:mr-4 file:py-0 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                            />
                            {referenceFile && (
                                <Button
                                    variant="ghost"
                                    className="h-12 w-12 text-destructive shrink-0"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setReferenceFile(null);
                                        if (referenceInputRef.current) referenceInputRef.current.value = "";
                                    }}
                                >
                                    X
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                            <Sparkles className="h-5 w-5 mr-2" />
                        )}
                        Create Assessment
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
