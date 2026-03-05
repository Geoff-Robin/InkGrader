"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  ShieldCheck,
  BarChart3,
  FileSearch,
  Cpu,
  Database
} from "lucide-react";

const features = [
  {
    title: "Precision OCR",
    description: "Decipher every scribble with laser‑sharp accuracy using advanced pattern recognition.",
    icon: <FileSearch className="w-6 h-6" />,
  },
  {
    title: "Agentic AI",
    description: "Autonomous reasoning agents that understand context, nuance, and intent.",
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    title: "Instant Feedback",
    description: "Real-time grading that provides immediate pedagogical guidance to students.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "Actionable Insights",
    description: "Deep analytics highlighting learning gaps and curricular opportunities.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: "Objective Grading",
    description: "Eliminate fatigue and bias with perfectly consistent, logic-driven assessments.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    title: "RAG Knowledge",
    description: "Augmented intelligence using your specific reference materials and rubrics.",
    icon: <Database className="w-6 h-6" />,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need for <span className="text-primary">Scalable</span> Grading
          </h2>
          <p className="text-lg text-muted-foreground">
            Built with state-of-the-art AI to handle the complexity of modern education.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {features.map((feature, idx) => (
            <Card key={idx} className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-primary/50 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-primary to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
