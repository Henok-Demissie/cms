"use client"

import { ArrowUpRight, ArrowRight, MessageSquareWarning } from "lucide-react"
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
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-8">
              <MessageSquareWarning className="w-4 h-4 text-black" />
              <span className="text-xs text-black uppercase tracking-widest">Complaint Management SaaS</span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl font-normal leading-tight mb-6 lg:text-8xl w-full">
              <AnimatedText text="Turn customer complaints into resolved cases" delay={0.3} />
            </h1>
          </div>

          <p
            className={`max-w-2xl mx-auto leading-relaxed mb-10 transition-all duration-1000 delay-[800ms] text-base text-zinc-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            A multi-tenant platform where businesses configure sector-specific intake forms, track complaints through a
            full status pipeline, meet SLA deadlines, and expose a versioned REST API for web and future mobile apps.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-12">
          <div className="relative">
            <div
              className={`relative w-[520px] md:w-[625px] lg:w-[780px] will-change-transform transition-all duration-[1500ms] ease-out delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[400px]"
              }`}
            >
              <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-6xl">
            <div
              className={`text-left transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {sectors}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Business sectors</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Restaurants, healthcare, retail, banking, hospitality, telecom, government, and manufacturing — each
                with tailored categories and fields.
              </p>
            </div>

            <div
              className={`text-left transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {slaCompliance}
              </p>
              <p className="text-base font-medium text-foreground mb-1">SLA compliance</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Auto-escalation flags and deadline timers keep your team on track before complaints go overdue.
              </p>
            </div>

            <div
              className={`text-left transition-all duration-1000 delay-[400ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
                {tenants}
              </p>
              <p className="text-base font-medium text-foreground mb-1">Active tenants</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each business gets isolated data, role-based access, and its own subdomain or path-based routing.
              </p>
            </div>

            <div
              className={`text-left transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <p className="text-6xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
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
          className={`flex justify-center mt-16 transition-all duration-1000 delay-[600ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <button className="relative flex items-center gap-0 border border-border rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden">
            <span className="absolute inset-0 bg-foreground rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 origin-right" />

            <span className="relative text-sm text-foreground group-hover:text-background pr-4 uppercase tracking-wide transition-colors duration-300">
              Register your business
            </span>
            <span className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-foreground group-hover:hidden" />
              <ArrowUpRight className="w-4 h-4 text-background hidden group-hover:block" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
