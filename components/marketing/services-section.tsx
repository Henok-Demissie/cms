import { ClipboardList, Building2, Timer, BarChart3, Code2, Bell, Layers } from "lucide-react"

const services = [
  {
    icon: ClipboardList,
    title: "Sector-Specific Intake",
    description:
      "Public complaint forms with customizable fields per sector — restaurants, healthcare, retail, banking, and more.",
  },
  {
    icon: Building2,
    title: "Multi-Tenant Isolation",
    description:
      "Each business is a tenant with isolated data, subdomain or path routing, and role-based access control.",
  },
  {
    icon: Timer,
    title: "SLA Management",
    description:
      "Configurable resolution deadlines per category with auto-escalation when deadlines approach or pass.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Volume by category, average resolution time, repeat complaint detection, and trend charts via Recharts.",
  },
  {
    icon: Code2,
    title: "Versioned REST API",
    description:
      "Full /api/v1/ endpoints with Bearer token auth from day one — ready for a future mobile app on the same backend.",
  },
  {
    icon: Bell,
    title: "Multi-Channel Notifications",
    description:
      "Email and SMS alerts to customers on status changes, plus webhooks for email and WhatsApp intake channels.",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-28 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full mb-6 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2]">
            <Layers className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">Platform</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6 text-balance">
            Everything you need to manage customer complaints
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From tenant onboarding and public intake forms to internal dashboards, SLA timers, and a mobile-ready API —
            built for businesses across every sector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="group relative rounded-3xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-[#ADA996] to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative bg-card p-8 rounded-3xl h-full border border-border group-hover:border-transparent transition-all duration-300 m-[1px]">
                <div className="w-12 h-12 border border-border rounded-xl flex items-center justify-center mb-6 group-hover:border-foreground/30 transition-colors">
                  <service.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
