import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const faqs = [
  {
    question: "How does multi-tenancy work?",
    answer:
      "Each business registers as a tenant with isolated data scoped by tenant_id on all core tables. You can access your workspace via subdomain (tenant.resolvehq.com) or path-based routing (/org/your-slug). Roles — Admin, Supervisor, Agent, and Viewer — are enforced per tenant.",
  },
  {
    question: "Which business sectors are supported?",
    answer:
      "ResolveHQ ships with presets for restaurants, healthcare, retail/e-commerce, banking/finance, hotels/hospitality, telecom/utilities, government, and manufacturing/B2B. During onboarding you pick your sector, which configures default complaint categories and sector-specific metadata fields.",
  },
  {
    question: "Can customers submit complaints anonymously?",
    answer:
      "Yes. Each tenant can toggle anonymous submission on their public intake form. When enabled, customer name and contact fields become optional while still capturing the complaint details, category, and attachments.",
  },
  {
    question: "Is there an API for mobile apps?",
    answer:
      "Yes. All endpoints live under /api/v1/ with a consistent response shape { success, data, error }. Routes support both session cookies (web) and JWT Bearer tokens (mobile). Complaints, tenants, users, status updates, and webhooks are all exposed from day one.",
  },
  {
    question: "How do SLA timers and escalation work?",
    answer:
      "You define SLA rules per category (e.g., 24 hours for billing complaints). Each complaint gets an slaDeadline. When the deadline is approaching or passed, the system flags the case for auto-escalation and can notify supervisors via email or SMS.",
  },
  {
    question: "What intake channels are supported?",
    answer:
      "Phase one includes the public web form and an email parsing webhook. WhatsApp webhook intake is planned for a later release. All channels create complaints in the same pipeline with identical status history and notification flows.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6 text-balance">Frequently asked questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about ResolveHQ. Can&apos;t find your answer? Contact our support team.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-foreground/30"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
