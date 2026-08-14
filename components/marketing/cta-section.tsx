import { ArrowUpRight, ArrowRight, Play } from "lucide-react"

export function CTASection() {
  return (
    <section id="demo" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <Play className="w-4 h-4 text-black" />
            <span className="text-xs text-black uppercase tracking-widest">Get started</span>
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
            <a href="/register" className="relative inline-flex items-center gap-0 border border-border rounded-full px-4 py-2 transition-all duration-300 group overflow-hidden">
              <span className="absolute inset-0 bg-foreground rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300" />
              <span className="text-sm text-foreground group-hover:text-background pr-4 uppercase tracking-wide relative z-10 transition-colors duration-300">
                Start free trial
              </span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center relative z-10">
                <ArrowRight className="w-4 h-4 text-foreground group-hover:opacity-0 absolute transition-opacity duration-300" />
                <ArrowUpRight className="w-4 h-4 text-foreground group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
