import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent -z-10" />

      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium">New: AI Grading v2.0 is live</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
          The Future of <span className="text-primary italic">Grading</span> <br className="hidden md:block" />
          is Here.
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
          Automate classroom assessments with unmatched precision. Save hundreds of hours
          on manual grading while providing personalized feedback to every student.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-12 px-8 text-base font-semibold group">
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold transition-all hover:bg-muted/50">
            <PlayCircle className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 bg-linear-to-r from-primary to-cyan-500 rounded-[2rem] blur opacity-20 -z-10" />
          <div className="rounded-[1.5rem] border border-white/10 overflow-hidden shadow-2xl bg-card">
            <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
              </div>
              <div className="mx-auto text-xs text-muted-foreground font-mono">dashboard.inkgrader.ai</div>
            </div>
            <div className="aspect-video bg-muted/5 animate-pulse flex items-center justify-center">
              <p className="text-muted-foreground font-mono text-sm">Dashboard Preview...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
