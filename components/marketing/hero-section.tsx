"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowRight, BriefcaseBusiness, MessageSquareWarning, UserRound } from "lucide-react"
import { useEffect, useRef, useState } from "react"

function useCountUp(end: number, duration = 2000, suffix = "", start = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start])

  return count + suffix
}

// Fires once when the element first scrolls into view, so the stats below the
// fold animate when the visitor reaches them instead of on page load.
function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [statsRef, statsInView] = useInView<HTMLDivElement>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const sectors = useCountUp(8, 2000, "", statsInView)
  const slaCompliance = useCountUp(94, 2000, "%", statsInView)
  const tenants = useCountUp(500, 2000, "+", statsInView)
  const resolved = useCountUp(2, 2000, "M+", statsInView)

  return (
    <section className="px-5 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* First screen — fills the viewport and ends at the sign-in card. */}
        <div className="flex min-h-[100svh] flex-col justify-start pt-20 pb-16 text-center">
          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
          >
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 mb-8">
              <MessageSquareWarning className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary uppercase tracking-widest">Trusted by 100+ Legal Organizations</span>
            </div>

            <h1 className="font-serif text-[2.75rem] md:text-[3.5rem] font-normal leading-tight mb-6 lg:text-[4.25rem] w-full">
              Transform Your <span className="font-semibold">Customer</span> <span className="font-semibold">Service</span>
              <span className="block">Operations</span>
            </h1>
          </div>

          <p
            className={`max-w-2xl mx-auto leading-relaxed mb-6 transition-all duration-700 delay-150 ease-[cubic-bezier(0.16,1,0.3,1)] text-sm md:text-base text-zinc-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            The comprehensive complaint management system that helps government organizations deliver faster
            resolutions, better transparency, and improved citizen satisfaction.
          </p>

          <div className={`flex items-center justify-center gap-4 transition-all duration-700 delay-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/customer/register" className="inline-flex items-center gap-3 rounded-md bg-primary px-5 py-2 text-primary-foreground transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">
              <span className="text-sm">Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-3 rounded-full border border-border px-4 py-2 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10">
              <span className="text-sm">Watch Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className={`mx-auto mt-8 max-w-2xl w-full transition-all duration-700 delay-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="rounded-xl border border-border bg-card/70 p-3 shadow-sm backdrop-blur-sm sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-4">
              <div className="mb-3 text-left sm:mb-0">
                <p className="text-sm font-medium text-foreground">Sign in to your account</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Choose the portal that matches your account type.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <Link
                  href="/login?portal=customer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Customer portal
                </Link>
                <Link
                  href="/login?portal=staff"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Staff portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Second screen — the stats, revealed on scroll. */}
        <div ref={statsRef} className="pb-16">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            <div
              className={`text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-4xl md:text-5xl font-medium text-primary mb-2">
                {sectors}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Business sectors</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Restaurants, healthcare, retail, banking, hospitality, telecom, government, and manufacturing — each
                with tailored categories and fields.
              </p>
            </div>

            <div
              className={`text-center transition-all duration-700 delay-[80ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-4xl md:text-5xl font-medium text-primary mb-2">
                {slaCompliance}
              </p>
              <p className="text-base font-medium text-foreground mb-1">SLA compliance</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Auto-escalation flags and deadline timers keep your team on track before complaints go overdue.
              </p>
            </div>

            <div
              className={`text-center transition-all duration-700 delay-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-4xl md:text-5xl font-medium text-primary mb-2">
                {tenants}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Active tenants</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each business gets isolated data, role-based access, and its own subdomain or path-based routing.
              </p>
            </div>

            <div
              className={`text-center transition-all duration-700 delay-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-4xl md:text-5xl font-medium text-primary mb-2">
                {resolved}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Complaints resolved</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                From intake to closure — with status history, internal notes, and customer notifications at every step.
              </p>
            </div>
          </div>

          <div
            className={`mt-10 flex justify-center transition-all duration-700 delay-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">
              Register your business
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
