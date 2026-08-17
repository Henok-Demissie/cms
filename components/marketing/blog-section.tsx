import { ArrowUpRight, ArrowRight, FileEdit } from "lucide-react"
import Image from "next/image"

const articles = [
  {
    title: "Designing sector-specific complaint categories: A practical guide",
    category: "Guides",
    date: "Mar 12, 2026",
    image: "/images/card-marble.png",
  },
  {
    title: "REST API v1 is live: Bearer auth for web and mobile from day one",
    category: "Product",
    date: "Feb 28, 2026",
    image: "/images/watch-hand.png",
  },
]

export function BlogSection() {
  return (
    <section id="blog" className="px-5 py-16 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5">
            <FileEdit className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary">Resources</span>
          </div>
          <h2 className="font-sans text-5xl font-normal mb-6">Guides & product updates</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Best practices for complaint resolution, SLA configuration, multi-tenant architecture, and API integration
            patterns for your sector.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {articles.map((article, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="bg-card rounded-2xl overflow-hidden border border-border mb-4 aspect-[4/3] relative">
                <Image
                  src={article.image || "/public/images/watch-hand.png"}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-foreground mb-3 group-hover:opacity-80 transition-opacity text-lg">
                {article.title}
              </h3>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 border border-border rounded-full text-xs text-foreground">
                  {article.category}
                </span>
                <span className="text-sm text-muted-foreground">{article.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="relative flex items-center gap-0 border border-border rounded-full pl-6 pr-1.5 py-1.5 transition-all duration-300 group overflow-hidden">
            <span className="absolute inset-0 bg-foreground rounded-full scale-x-0 origin-right group-hover:scale-x-100 transition-transform duration-300" />
            <span className="text-sm text-foreground group-hover:text-background pr-4 uppercase tracking-wide relative z-10 transition-colors duration-300">
              Browse all resources
            </span>
            <span className="w-10 h-10 rounded-full flex items-center justify-center relative z-10">
              <ArrowRight className="w-4 h-4 text-foreground group-hover:opacity-0 absolute transition-opacity duration-300" />
              <ArrowUpRight className="w-4 h-4 text-foreground group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
