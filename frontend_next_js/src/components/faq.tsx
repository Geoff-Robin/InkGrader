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
    <section className="relative z-20 w-full max-w-4xl mx-auto mt-24">
      <h2 className="text-4xl font-extrabold text-center mb-12">
        FAQ
      </h2>
      <Accordion
        type="single"
        collapsible
        className="w-full border rounded-xl divide-y divide-border"
      >
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="border-0">
            <AccordionTrigger className="px-6 py-6 text-xl font-semibold text-left hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 py-6 text-lg leading-relaxed text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
