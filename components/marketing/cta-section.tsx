import { ArrowRight, Play } from "lucide-react"

export function CTASection() {
  return (
    <section id="demo" className="px-5 py-14 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary">Get started</span>
          </div>
          <h2 className="font-sans text-3xl md:text-4xl font-normal leading-tight max-w-4xl mx-auto">
            Register your business and launch complaint intake in minutes
          </h2>
        </div>

        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-4xl">
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

            <img
              src="/images/ipad-hand.png"
              alt="Hands holding tablet showing complaint management dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex gap-12">
            <div>
              <p className="text-4xl font-light text-foreground">8</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Sectors</p>
            </div>
            <div>
              <p className="text-4xl font-light text-foreground">v1 API</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Mobile-ready</p>
            </div>
          </div>

            <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-sm max-w-sm text-center md:text-right text-zinc-200">
              Pick your sector, invite your team, publish your intake form, and start resolving complaints with full SLA
              tracking and analytics — all on one platform.
            </p>
            <a href="/register" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
