"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Precision OCR",
    description: "Decipher every scribble with laser‑sharp accuracy.",
  },
  {
    title: "Agentic AI",
    description: "Autonomous AI that reads, understands, and corrects contextually.",
  },
  {
    title: "Instant Feedback",
    description: "Receive corrections and comments the moment you upload.",
  },
  {
    title: "Actionable Reports",
    description:
      "No‑fluff summaries highlighting strengths, weaknesses, and next steps.",
  },
  {
    title: "Zero Bias",
    description: "Every paper judged by logic, not mood. Consistent. Fair.",
  },
  {
    title: "RAG For Reference Material",
    description: "Get greater accuracy in grading with relevant context.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Features
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="border border-border bg-card hover:shadow-lg transition-shadow"
          >
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
