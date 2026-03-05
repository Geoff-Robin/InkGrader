"use client";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is InkGrader?",
    answer:
      "InkGrader is an AI-powered web app that reads and evaluates handwritten or typed papers using OCR and agentic AI—delivering fast, fair, and context-aware corrections.",
  },
  {
    question: "How does InkGrader work?",
    answer:
      "Upload a photo or scan of a paper. Our OCR reads the content. Agentic AI evaluates grammar, logic, and structure—then generates instant corrections and feedback.",
  },
  {
    question: "What types of papers can it grade?",
    answer:
      "Essays, short answers, handwritten reports, and typed documents. If it's readable, InkGrader can process it.",
  },
  {
    question: "Is InkGrader accurate?",
    answer:
      "Brutally. Our OCR is tuned for messy handwriting. The AI doesn’t just check spelling—it understands context and meaning.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "Nope. InkGrader runs in your browser. No downloads. No dependencies. Just upload and grade.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. Uploaded papers are encrypted in transit and deleted after processing. No lingering traces. No data mining.",
  },
  {
    question: "Does InkGrader use RAG?",
    answer:
      "Yes. InkGrader leverages Retrieval-Augmented Generation (RAG) to enrich its feedback. This means it can pull in relevant references and context when grading, making corrections more insightful and grounded.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about the platform and how it works.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4"
        >
          {faqs.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-2xl bg-card px-4">
              <AccordionTrigger className="text-lg font-bold hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
