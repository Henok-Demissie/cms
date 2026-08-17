import Link from "next/link"
import { CalendarDays, Clock3, Phone, ShieldCheck } from "lucide-react"

import { Footer } from "@/components/marketing/footer"
import { Header } from "@/components/marketing/header"

const contactOptions = [
  {
    title: "Call us",
    description: "Speak directly with our team to arrange your product demo.",
    value: "0945309092",
    href: "tel:0945309092",
    icon: Phone,
  },
  {
    title: "Book a demo",
    description: "Choose a convenient time for a personalized walkthrough of AbetBay.",
    value: "Bole, Addis Ababa",
    href: "/register",
    icon: CalendarDays,
  },
  {
    title: "Support hours",
    description: "Our team is available to help you get started.",
    value: "Monday – Friday, 8:30 AM – 5:30 PM",
    icon: Clock3,
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden px-5 pb-12 pt-28 sm:px-6 sm:pb-14 sm:pt-32">
        <div className="absolute inset-x-0 top-0 -z-0 h-full bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.06_190_/_0.35),transparent_55%)]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            See AbetBay in action
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Get in touch
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tell us about your customer service goals. We&apos;ll show you how AbetBay can streamline complaint intake,
            resolution, and reporting for your team.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card/30 px-5 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3">
          {contactOptions.map(({ title, description, value, href, icon: Icon }) => {
            const content = (
              <>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <p className="mt-4 text-sm font-semibold text-primary">{value}</p>
              </>
            )

            return href ? (
              <Link
                key={title}
                href={href}
                className="group rounded-xl border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                {content}
              </Link>
            ) : (
              <div key={title} className="rounded-xl border border-border bg-background p-5">
                {content}
              </div>
            )
          })}
        </div>
      </section>

      <section className="px-5 py-10 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">Ready when you are.</p>
        <Link
          href="/register"
          className="mt-4 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Start free trial
        </Link>
      </section>

      <Footer />
    </main>
  )
}
