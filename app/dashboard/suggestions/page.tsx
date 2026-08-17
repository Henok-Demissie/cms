import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { submitSuggestion } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock3, Lightbulb, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

type SuggestionRow = { id: string; title: string; description: string; status: string }

export default async function SuggestionsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const staff = session.user.role !== "CUSTOMER"
  const { new: creating } = await searchParams
  const suggestions = await prisma.$queryRawUnsafe<SuggestionRow[]>('SELECT "id", "title", "description", "status" FROM "Suggestion" WHERE "tenantId" = ? ORDER BY "createdAt" DESC', session.user.tenantId)
  const stats = [{ label: "Total", value: suggestions.length, icon: Lightbulb, tone: "text-primary" }, { label: "New", value: suggestions.filter((item) => item.status === "NEW").length, icon: Clock3, tone: "text-primary" }, { label: "Under Review", value: suggestions.filter((item) => item.status === "IN_REVIEW").length, icon: Search, tone: "text-amber-500" }, { label: "Accepted", value: suggestions.filter((item) => item.status === "ACCEPTED").length, icon: CheckCircle2, tone: "text-emerald-500" }]
  return <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
    {!staff && <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">Benefit: Your information is auto-filled and all suggestions are tracked in your account.</div>}
    <section className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Lightbulb className="h-6 w-6 text-primary" />Suggestions</h1><p className="mt-1 text-sm text-muted-foreground">{staff ? "Review ideas submitted by customers" : "Help us improve our services"}</p></div>{!staff && <Link href="/dashboard/suggestions?new=1" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Submit Suggestion</Link>}</section>
    {!staff && creating === "1" && <form action={submitSuggestion} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm"><h2 className="font-serif text-lg font-semibold">Submit Suggestion</h2><Input name="title" placeholder="Suggestion title" required /><Textarea name="description" placeholder="Describe your suggestion" rows={4} required /><div className="flex justify-end gap-2"><Link href="/dashboard/suggestions" className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</Link><Button type="submit">Submit suggestion</Button></div></form>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="min-h-28 rounded-xl border border-border bg-card p-5"><p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className={`h-4 w-4 ${stat.tone}`} />{stat.label}</p><p className={`mt-8 font-serif text-2xl font-semibold ${stat.tone}`}>{stat.value}</p></article> })}</section>
    <section className="overflow-hidden rounded-xl border border-border bg-card"><div className="flex flex-wrap items-center justify-between gap-3 p-5"><h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><Clock3 className="h-5 w-5 text-primary" />Suggestion History</h2><div className="flex items-center gap-2"><div className="flex h-9 w-44 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground"><Search className="h-4 w-4" />Search...</div><button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium"><SlidersHorizontal className="h-4 w-4" />Filter</button><button className="grid h-9 w-9 place-items-center rounded-md border border-border"><RefreshCw className="h-4 w-4" /></button></div></div>{suggestions.length ? <div className="divide-y divide-border">{suggestions.map((item) => <article key={item.id} className="p-4"><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></article>)}</div> : <div className="grid min-h-72 place-items-center text-center"><div><Lightbulb className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 font-serif text-lg font-semibold">No suggestions submitted</h3><p className="mt-1 text-sm text-muted-foreground">You haven&apos;t submitted any suggestions yet</p></div></div>}</section>
  </div>
}
