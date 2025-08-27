"use client"

import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useRouter } from "next/navigation"

export function ExamCard({ exam }: any) {
    const router = useRouter();
    return (
        <Card key={exam.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="p-6 h-full flex flex-col">
                {/* Header */}
                <CardHeader>
                    <FileText className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardDescription>
                    {/* Exam Info */}
                    <div className="flex-1 flex items-center justify-center">
                        <h3 className="font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                            {exam.exam_name}
                        </h3>
                    </div>

                    {/* Action Area */}
                    <div onClick={() => router.push(`/dashboard/results/${exam.id}`)} className="text-xs text-muted-foreground text-center group-hover:text-primary transition-colors">
                        Check Results
                    </div>
                </CardDescription>
            </div>  
        </Card>
    )
}