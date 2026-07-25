"use client"

import { Check, Sparkles } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const features = [
  "Tenant registration with sector onboarding",
  "Role-based access: Admin, Supervisor, Agent, Viewer",
  "Public complaint form with file uploads",
  "Status pipeline: New → In Review → Assigned → Resolved → Closed",
  "Internal notes and agent assignment",
  "Bearer token + session auth on all API routes",
]

const allComplaints = [
  { id: "#1042", status: "Assigned", category: "Food Quality", priority: "High" },
  { id: "#1041", status: "In Review", category: "Billing", priority: "Medium" },
  { id: "#1040", status: "Resolved", category: "Wait Time", priority: "Low" },
  { id: "#1039", status: "New", category: "Hygiene", priority: "Critical" },
  { id: "#1038", status: "Closed", category: "Staff Behavior", priority: "Medium" },
  { id: "#1037", status: "Assigned", category: "Delivery", priority: "High" },
  { id: "#1036", status: "In Review", category: "Refund", priority: "Medium" },
  { id: "#1035", status: "Resolved", category: "Allergen Info", priority: "High" },
  { id: "#1034", status: "New", category: "Reservation", priority: "Low" },
  { id: "#1033", status: "Closed", category: "Noise Complaint", priority: "Low" },
]

export function FeaturesSection() {
  const [openCount, setOpenCount] = useState(47)
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const scrollPosition = useRef(0)
  const lastUpdateTime = useRef(0)

  const tripleComplaints = [...allComplaints, ...allComplaints, ...allComplaints]

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!scrollRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (!lastUpdateTime.current) lastUpdateTime.current = timestamp
      const deltaTime = timestamp - lastUpdateTime.current
      lastUpdateTime.current = timestamp

      scrollPosition.current += (deltaTime / 1000) * 35

      const singleSetHeight = scrollRef.current.scrollHeight / 3

      if (scrollPosition.current >= singleSetHeight) {
        scrollPosition.current = 0
        setOpenCount((prev) => Math.max(12, prev + (Math.random() > 0.5 ? -1 : 1)))
      }

      scrollRef.current.style.transform = `translateY(-${scrollPosition.current}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-card border border-border p-6 shadow-xl rounded-3xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Open complaints</p>
                    <p className="text-3xl font-light text-foreground transition-all duration-500">{openCount}</p>
                  </div>
                  <div className="w-10 h-10 border border-border rounded-full flex items-center justify-center">
                    <span className="text-foreground text-sm font-medium">R</span>
                  </div>
                </div>

                <div className="relative h-[240px] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />

                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider relative z-20">
                      Recent complaints
                    </p>

                    <div className="relative">
                      <div ref={scrollRef} className="space-y-0 will-change-transform">
                        {tripleComplaints.map((complaint, i) => (
                          <div
                            key={`${complaint.id}-${i}`}
                            className="flex items-center justify-between py-3 border-b border-border"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-9 h-9 bg-card border border-border rounded-lg flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">{complaint.id.slice(1, 3)}</span>
                              </div>
                              <div>
                                <p className="text-sm text-foreground">{complaint.id}</p>
                                <p className="text-xs text-muted-foreground">{complaint.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-foreground">{complaint.status}</p>
                              <p className="text-xs text-muted-foreground">{complaint.priority}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-black" />
                <span className="text-xs text-black uppercase tracking-widest">Features</span>
              </div>
              <h2 className="font-sans text-5xl font-normal mb-6 text-balance">
                Built for teams that resolve complaints fast
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Filter by status, category, and priority. Assign agents, add internal notes, track SLA deadlines, and
                notify customers automatically — all from a single dashboard with full API access.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 border border-border rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
