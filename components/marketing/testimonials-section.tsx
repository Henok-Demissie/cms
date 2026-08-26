"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"
const testimonials = [
  {
    name: "One place for every complaint",
    role: "Centralized intake",
    content:
      "Capture reports from customers, phone calls, email, and internal teams in one organized workspace.",
  },
  {
    name: "Clear ownership and progress",
    role: "Complaint management",
    content:
      "Assign complaints to the right person, track updates, and make sure nothing gets lost between teams.",
  },
  {
    name: "Better service decisions",
    role: "Operational insight",
    content:
      "Use complaint trends and resolution status to spot recurring issues and improve service quality.",
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
    <section id="testimonials" className="px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="lg:w-1/3">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-widest text-primary">How it helps</span>
            </div>
            <h2 className="font-sans text-5xl font-normal leading-tight">Built for responsive customer service</h2>
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
                  className="flex-shrink-0 w-full rounded-xl border border-border bg-card p-6 sm:w-[400px]"
                >
                  <p className="text-lg leading-relaxed text-foreground">{testimonial.content}</p>
                  <div className="mt-auto">
                    <p className="mt-6 font-medium text-foreground">{testimonial.name}</p>
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
