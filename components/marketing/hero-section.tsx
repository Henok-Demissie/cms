"use client"

import Link from "next/link"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2]">
              <MessageSquareWarning className="w-4 h-4 text-black" />
              <span className="text-xs text-black uppercase tracking-widest">Trusted by 71+ Government Organizations</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl font-normal leading-tight mb-6 lg:text-6xl w-full">
              Transform Your <span className="font-semibold">Customer</span> <span className="font-semibold">Service</span> Operations
            </h1>
          </div>

          <p
            className={`max-w-2xl mx-auto leading-relaxed mb-6 transition-all duration-1000 delay-[800ms] text-sm md:text-base text-zinc-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            The comprehensive complaint management system that helps government organizations deliver faster
            resolutions, better transparency, and improved citizen satisfaction.
          </p>

          <div className={`flex items-center justify-center gap-4 transition-all duration-1000 delay-[900ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <Link href="/register" className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-2 rounded-full">
              <span className="text-sm">Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/#demo" className="inline-flex items-center gap-3 border border-border px-4 py-2 rounded-full">
              <span className="text-sm">Watch Demo</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className={`max-w-xl mx-auto mt-8 transition-all duration-1000 delay-[1000ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="bg-muted p-4 rounded-lg shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
              <div className="flex gap-3">
                <Link href="/login?portal=customer" className="px-3 py-2 bg-background border rounded-md flex items-center gap-2">
                  Customer Portal
                </Link>
                <Link href="/login?portal=staff" className="px-3 py-2 bg-background border rounded-md flex items-center gap-2">
                  Staff Portal
                </Link>
              </div>
            </div>
          </div>
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
              <p className="text-4xl md:text-5xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
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
              <p className="text-4xl md:text-5xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
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
              <p className="text-4xl md:text-5xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
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
              <p className="text-4xl md:text-5xl font-medium bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] bg-clip-text text-transparent mb-2">
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
