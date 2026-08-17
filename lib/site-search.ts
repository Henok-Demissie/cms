export type SearchItem = {
  label: string
  target: string
  keywords: string[]
}

export const siteSearchItems: SearchItem[] = [
  {
    label: "Home",
    target: "top",
    keywords: ["home", "hero", "abetbay", "complaint management"],
  },
  {
    label: "About",
    target: "about",
    keywords: ["about", "abetbay", "government", "public service"],
  },
  {
    label: "Features",
    target: "features",
    keywords: ["features", "dashboard", "pipeline", "assignment", "api"],
  },
  {
    label: "Service Catalog",
    target: "services",
    keywords: ["services", "catalog", "intake", "sla", "analytics", "api"],
  },
  {
    label: "Contact",
    target: "contact",
    keywords: ["contact", "footer", "support", "help"],
  },
  {
    label: "Feedback",
    target: "feedback",
    keywords: ["feedback", "review", "report", "issues"],
  },
  {
    label: "Suggestions",
    target: "suggestions",
    keywords: ["suggestions", "ideas", "features", "workflows"],
  },
  {
    label: "FAQ",
    target: "faq",
    keywords: ["faq", "questions", "multi-tenancy", "sla", "anonymous"],
  },
  {
    label: "Pricing",
    target: "pricing",
    keywords: ["pricing", "plans", "starter", "subscription"],
  },
]

export function filterSearchItems(query: string): SearchItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return siteSearchItems.filter((item) => {
    const haystack = [item.label, ...item.keywords].join(" ").toLowerCase()
    return haystack.includes(normalized)
  })
}
