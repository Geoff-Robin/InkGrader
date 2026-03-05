"use client";
import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, Sparkles } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateExamDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateExamDialog({ isOpen, onClose, onSuccess }: CreateExamDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const queryClient = useQueryClient();

    const { mutate: createExam, isPending: loading, error: mutationError } = useMutation({
        mutationFn: async ({ name, description }: { name: string, description: string }) => {
            const response = await fetch("/api/proxy/exam", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": "default-user",
                },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                throw new Error("Failed to create exam");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exams"] });
            setName("");
            setDescription("");
            onSuccess();
            onClose();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        createExam({ name, description });
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

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-bold">Description (Optional)</Label>
                    <Input
                        id="description"
                        placeholder="e.g. Algebra and Calculus foundations"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="h-12 rounded-xl border-border/60 focus-visible:ring-primary/20"
                    />
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
