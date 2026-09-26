import { Mail, MessageCircle, Send } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    q: "Why does my data sometimes take longer?",
    a: "Most bundles land in 5–30 minutes. During network congestion (evenings, weekends, month-end) MTN and others can queue requests for up to 48 hours. Your order is safe and tracked the whole time.",
  },
  {
    q: "What is MTN Flexa?",
    a: "Flexa bundles work on every MTN number, including numbers that are blocked from regular bundle sharing. They are priced slightly differently and delivered through a separate channel.",
  },
  {
    q: "Can I get a refund?",
    a: "If a bundle fails at the network we refund your wallet automatically. Successful deliveries are not refundable — please double-check the recipient number before paying.",
  },
  {
    q: "How do I fund my wallet?",
    a: "Go to Wallet, tap Deposit and pay with MTN MoMo, Telecel Cash or AT Money. Funds arrive in seconds.",
  },
]

const channels = [
  { icon: MessageCircle, label: "WhatsApp", value: "+233 24 000 0000", href: "https://wa.me/233240000000", primary: true },
  { icon: Send, label: "Telegram", value: "@DataSpots", href: "https://t.me/DataSpots" },
  { icon: Mail, label: "Email", value: "support@DataSpots.app", href: "mailto:support@DataSpots.app" },
]

export default function SupportPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <PageHeader title="Support" subtitle="We reply fast — usually under 10 minutes" />

      <div className="grid gap-3 sm:grid-cols-3">
        {channels.map(({ icon: Icon, label, value, href, primary }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`card-shadow flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${
              primary ? "brand-gradient border-transparent text-brand-deep brand-glow" : "border-border bg-card"
            }`}
          >
            <span className={`flex size-10 items-center justify-center rounded-full ${primary ? "bg-brand-deep/12" : "bg-success/10 text-brand-emerald"}`}>
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold">{label}</p>
              <p className={`text-xs ${primary ? "opacity-75" : "text-muted-foreground"}`}>{value}</p>
            </div>
          </a>
        ))}
      </div>

      <section className="card-shadow rounded-2xl border border-border bg-card p-5">
        <h2 className="title-bar text-sm font-bold">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-2">
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="card-shadow flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-bold">Still stuck?</p>
          <p className="text-xs text-muted-foreground">Send us the Order ID and we will sort it out.</p>
        </div>
        <Button asChild className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">
          <a href="https://wa.me/233240000000" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" /> Chat on WhatsApp
          </a>
        </Button>
      </section>
    </div>
  )
}
