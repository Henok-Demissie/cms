import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { submitFeedback } from "./actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock3, Eye, MessageSquare, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

type FeedbackRow = { id: string; message: string; rating: number | null }

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const staff = session.user.role !== "CUSTOMER"
  const { new: creating } = await searchParams
  const feedback = await prisma.$queryRawUnsafe<FeedbackRow[]>('SELECT "id", "message", "rating" FROM "Feedback" WHERE "tenantId" = ? ORDER BY "createdAt" DESC', session.user.tenantId)
  const stats = [{ label: "Total", value: feedback.length, icon: MessageSquare, tone: "text-muted-foreground" }, { label: "New", value: feedback.length, icon: Clock3, tone: "text-primary" }, { label: "In Review", value: 0, icon: Eye, tone: "text-amber-500" }, { label: "Resolved", value: 0, icon: CheckCircle2, tone: "text-emerald-500" }]
  return <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
    <section className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-serif text-2xl font-semibold">{staff ? "Customer Feedback" : "My Feedback"}</h1><p className="mt-1 text-sm text-muted-foreground">View and track all your feedback submissions</p></div>{!staff && <Link href="/dashboard/feedback?new=1" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />New Feedback</Link>}</section>
    {!staff && creating === "1" && <form action={submitFeedback} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm"><h2 className="font-serif text-lg font-semibold">Submit Feedback</h2><select name="rating" defaultValue="5" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Average</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select><Textarea name="message" placeholder="Tell us about your experience" rows={4} required /><div className="flex justify-end gap-2"><Link href="/dashboard/feedback" className="rounded-md border border-border px-4 py-2 text-sm font-medium">Cancel</Link><Button type="submit">Submit feedback</Button></div></form>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="flex min-h-28 items-center justify-between rounded-xl border border-border bg-card p-5"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 font-serif text-2xl font-semibold">{stat.value}</p></div><Icon className={`h-7 w-7 ${stat.tone}`} /></article> })}</section>
    <section className="overflow-hidden rounded-xl border border-border bg-card"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><h2 className="flex items-center gap-2 font-serif text-lg font-semibold"><Clock3 className="h-5 w-5 text-primary" />Feedback History</h2><p className="mt-1 text-xs text-muted-foreground">{feedback.length} results from {feedback.length} total</p></div><div className="flex items-center gap-2"><button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium"><RefreshCw className="h-4 w-4" />Refresh</button><button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium"><SlidersHorizontal className="h-4 w-4" />Filters</button></div></div><div className="m-4 flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground"><Search className="h-4 w-4" />Search feedback...</div>{feedback.length ? <div className="divide-y divide-border">{feedback.map((item) => <article key={item.id} className="p-4"><p className="text-xs text-primary">{item.rating ? `${item.rating}/5 rating` : "Feedback"}</p><p className="mt-1 text-sm text-muted-foreground">{item.message}</p></article>)}</div> : <div className="grid min-h-52 place-items-center p-6 text-center"><div><MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-3 font-serif text-lg font-semibold">No feedback yet</h3><p className="mt-1 text-sm text-muted-foreground">Submit your first feedback to get started</p></div></div>}</section>
  </div>
}
