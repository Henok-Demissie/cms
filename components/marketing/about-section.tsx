export function AboutSection() {
  return (
    <section id="about" className="scroll-mt-28 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
            <span className="text-xs text-black uppercase tracking-widest">About</span>
          </div>
          <h2 className="font-sans text-4xl md:text-5xl font-semibold mb-4">About ResolveHQ</h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ResolveHQ is a complaint management platform built for government organizations and public service teams. It helps teams capture, triage, and resolve citizen feedback with transparency and speed.
          </p>
        </div>
      </div>
    </section>
  )
}
