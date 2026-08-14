"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"
const testimonials = [
  {
    name: "Maria Santos",
    role: "Operations Director, Coastal Bistro Group",
    content:
      "ResolveHQ cut our average resolution time in half. The sector-specific intake form captures exactly what our kitchen team needs.",
    initials: "MS",
  },
  {
    name: "Dr. James Okonkwo",
    role: "Patient Experience Lead, Meridian Health",
    content:
      "HIPAA-aware workflows and internal notes let our supervisors escalate complaints without exposing sensitive details to patients.",
    initials: "JO",
  },
  {
    name: "Sarah Chen",
    role: "CX Manager, Urban Retail Co.",
    content:
      "The REST API meant we plugged complaint intake into our existing mobile app in a week. Same backend, same SLA rules.",
    initials: "SC",
  },
]

const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

export function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPaused || !scrollRef.current) return

    const scrollContainer = scrollRef.current
    let animationFrameId: number

    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 1

        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 3) {
          scrollContainer.scrollLeft = 0
        }
      }
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused])

  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-4">
              <MessageCircle className="w-4 h-4 text-black" />
              <span className="text-xs text-black uppercase tracking-widest">Testimonials</span>
            </div>
            <h2 className="font-sans text-5xl font-normal leading-tight">Trusted across every sector</h2>
          </div>

          <div className="lg:w-2/3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
              style={{ scrollBehavior: "auto" }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[400px] bg-card border border-border rounded-2xl p-8"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
                    >
                      {testimonial.initials}
                    </div>
                    <p className="text-lg text-foreground leading-relaxed flex-1">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-foreground font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
