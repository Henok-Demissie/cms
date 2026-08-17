import { ClipboardList, Building2, Timer, BarChart3, Code2, Bell } from "lucide-react"

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
    <section id="services" className="scroll-mt-20 px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
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
            <div key={index} className="group relative rounded-xl transition-all duration-300">
              <div className="absolute inset-0 rounded-xl bg-primary/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative m-px h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 group-hover:border-primary/40">
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
