"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/data-display/accordion";
import { Typography } from "@/components/data-display/typography";
import { motion } from "framer-motion";

interface FAQ {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faq: FAQ[];
}

export function FaqSection({ faq }: FaqSectionProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" className="mb-4 text-white">
              Frequently Asked Questions
            </Typography>
            <Typography className="mb-8 text-slate-400">
              Everything you need to know about our platform and widget integration.
            </Typography>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-b border-slate-800"
              >
                <AccordionTrigger className="text-left text-lg font-medium text-white hover:text-slate-300">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
