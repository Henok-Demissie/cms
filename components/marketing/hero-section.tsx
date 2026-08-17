"use client"

import Link from "next/link"
import { ArrowUpRight, ArrowRight, BriefcaseBusiness, MessageSquareWarning, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatedText } from "./animated-text"

function useCountUp(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0)

  useEffect(() => {
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
  }, [end, duration])

  return count + suffix
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const sectors = useCountUp(8, 2000, "")
  const slaCompliance = useCountUp(94, 2000, "%")
  const tenants = useCountUp(500, 2000, "+")
  const resolved = useCountUp(2, 2000, "M+")

  return (
    <section className="px-5 pb-16 pt-24 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
          >
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 mb-8">
              <MessageSquareWarning className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary uppercase tracking-widest">Trusted by 100+ Legal Organizations</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-normal leading-tight mb-6 lg:text-6xl w-full">
              Transform Your <span className="font-semibold">Customer</span> <span className="font-semibold">Service</span> Operations
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

          <div className={`mx-auto mt-8 max-w-2xl transition-all duration-700 delay-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
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

        <div className="flex flex-col items-center justify-center gap-12">
          <div className="relative">
            <div
              className={`relative w-[520px] md:w-[625px] lg:w-[780px] will-change-transform transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[400px]"
              }`}
            >
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
            </div>
          </div>

          <div className="grid max-w-6xl grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            <div
              className={`text-left transition-all duration-700 delay-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
              className={`text-left transition-all duration-700 delay-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
              className={`text-left transition-all duration-700 delay-[460ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
              className={`text-left transition-all duration-700 delay-[540ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
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
        </div>

        <div
          className={`mt-10 flex justify-center transition-all duration-700 delay-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">
            Register your business
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
