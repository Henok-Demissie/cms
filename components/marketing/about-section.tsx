export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <span className="text-xs uppercase tracking-widest text-primary">About</span>
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold mb-4">About AbetBay</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AbetBay is a complaint management platform built for government organizations and public service teams. It helps teams capture, triage, and resolve citizen feedback with transparency and speed.
          </p>
        </div>
      </div>
    </section>
  )
}
