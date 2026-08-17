import { Check, ArrowUpRight, Tag } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "For small teams getting started with complaint management",
    features: [
      "1 tenant, up to 3 agents",
      "Public complaint intake form",
      "Basic SLA rules per category",
      "Email notifications",
      "REST API access (rate-limited)",
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/mo",
    description: "For growing businesses with higher complaint volume",
    features: [
      "Everything in Starter",
      "Up to 15 agents + Supervisor roles",
      "SMS/WhatsApp notifications via Twilio",
      "Analytics dashboard with Recharts",
      "File attachments via UploadThing",
      "Email intake webhook",
    ],
    cta: "Choose Professional",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations across multiple sectors",
    features: [
      "Everything in Professional",
      "Unlimited agents and tenants",
      "Custom sector field schemas",
      "SSO + advanced RBAC",
      "Dedicated SLA policies",
      "Priority API support",
    ],
    cta: "Contact sales",
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary">Pricing</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6 text-balance">Plans that scale with your complaint volume</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every plan includes multi-tenant isolation, role-based access, and versioned API endpoints. Upgrade or
            downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div key={index} className="relative group">
              <div className="pointer-events-none absolute -inset-2 rounded-xl bg-primary/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

              <div
                className={`relative flex flex-col rounded-xl border bg-card p-6 ${
                  plan.popular ? "border-primary/60" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6">
                    <span className="rounded-md bg-primary px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-medium text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 border border-border rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-foreground" />
                      </div>
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors ${
                    plan.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border hover:border-primary/40 hover:bg-accent"
                  }`}
                >
                  {plan.cta}
                  <ArrowUpRight className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
