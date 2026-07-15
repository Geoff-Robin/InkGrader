import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Create an exam",
    description: "Add your questions, answer key, and grading rubric.",
  },
  {
    number: "02",
    title: "Upload student work",
    description: "Submit handwritten scans or typed responses in one batch.",
  },
  {
    number: "03",
    title: "Review the results",
    description: "Check scores and feedback before sharing them with students.",
  },
];

export function HeroSection() {
  return (
    <section className="h-full overflow-hidden">
      <div className="mx-auto grid h-full w-full max-w-6xl items-center gap-4 px-5 py-4 sm:gap-8 sm:px-8 sm:py-6 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:py-10 lg:gap-20">
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-medium text-muted-foreground">InkGrader</p>
          <h1 className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
            Thoughtful grading, without the busywork.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground sm:mt-5 sm:text-lg">
            Turn student responses into consistent scores and useful feedback,
            guided by the questions, answers, and rubric you provide.
          </p>

          <div className="mt-6 flex items-center gap-4 sm:mt-8">
            <Button asChild size="lg" className="group">
              <Link href="/signup">
                Start grading
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <Check className="h-4 w-4" />
              Review every result
            </div>
          </div>
        </div>

        <div className="border-y border-border md:border md:bg-card">
          <div className="border-b border-border py-2.5 md:px-7 md:py-5">
            <p className="text-sm font-semibold">How it works</p>
          </div>
          <div className="divide-y divide-border">
            {steps.map((step) => (
              <div
                key={step.number}
                className="grid grid-cols-[2.5rem_1fr] gap-2 py-2.5 md:grid-cols-[3rem_1fr] md:px-7 md:py-5"
              >
                <span className="pt-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {step.number}
                </span>
                <div>
                  <h2 className="text-sm font-semibold sm:text-base">{step.title}</h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground sm:leading-6">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
