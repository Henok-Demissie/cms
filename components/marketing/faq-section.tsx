import { HelpCircle } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Who is AbetBay for?",
    answer: "AbetBay is for organizations that want a clear, reliable way to receive, assign, and resolve customer complaints. It works well for service teams, public offices, and growing businesses handling requests across several channels.",
  },
  {
    question: "How can customers submit a complaint?",
    answer: "You can share your public complaint form with customers, or add complaints received by phone, email, WhatsApp, or in person directly from the complaint center.",
  },
  {
    question: "What happens after a complaint is submitted?",
    answer: "Every complaint enters your workspace with a clear status. Your team can review it, assign responsibility, add internal notes, and keep the customer informed until the complaint is resolved.",
  },
  {
    question: "Can different team members have different access?",
    answer: "Yes. Your workspace supports role-based access, so administrators, supervisors, agents, and viewers can each work with the information they need.",
  },
  {
    question: "Can I see how my team is performing?",
    answer: "The dashboard gives you a simple view of new, in-progress, and resolved complaints, plus recent activity and complaint-volume trends to support daily decisions.",
  },
  {
    question: "How do I get started?",
    answer: "Register your organization, choose your setup, and begin adding complaints or sharing your public form. You can invite your team and tailor the process as your workflow grows.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-20 px-5 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <HelpCircle className="size-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary">FAQ</span>
          </div>
          <h2 className="mb-4 font-sans text-4xl font-normal text-balance md:text-5xl">Frequently asked questions</h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">Everything you need to know about managing complaints with AbetBay.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border border-border bg-card px-4 data-[state=open]:border-primary/40">
              <AccordionTrigger className="py-4 text-left text-base font-medium text-foreground hover:text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
