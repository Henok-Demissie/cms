import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { submitSuggestion, respondSuggestion } from "./actions"
import { deleteSuggestion } from "../actions"
import { DeleteSubmissionButton } from "@/components/dashboard/delete-submission-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock3, Lightbulb, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

export default async function SuggestionsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const staff = session.user.role !== "CUSTOMER"
  const { new: creating } = await searchParams

  const [suggestions, organizations] = await Promise.all([
    prisma.suggestion.findMany({
      where: staff
        ? { tenantId: session.user.tenantId }
        : {
            OR: [
              { customerId: session.user.id },
              { authorId: session.user.id },
              { authorEmail: session.user.email ?? undefined },
            ],
          },
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    !staff
      ? prisma.tenant.findMany({
          where: { subdomain: { not: "public" } },
          select: { id: true, name: true, subdomain: true, sector: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ])

  const stats = [
    { label: "Total", value: suggestions.length, icon: Lightbulb, tone: "text-primary" },
    { label: "New", value: suggestions.filter((item) => item.status === "NEW").length, icon: Clock3, tone: "text-primary" },
    { label: "Under Review", value: suggestions.filter((item) => item.status === "IN_REVIEW").length, icon: Search, tone: "text-amber-500" },
    { label: "Accepted", value: suggestions.filter((item) => item.status === "ACCEPTED").length, icon: CheckCircle2, tone: "text-emerald-500" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
      {!staff && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Select the company or organization you want to send suggestions to. Their staff will review and respond.
        </div>
      )}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-serif text-2xl font-semibold">
            <Lightbulb className="h-6 w-6 text-primary" />
            Suggestions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff ? "Review and respond to ideas submitted for your organization" : "Share ideas to help organizations improve their services"}
          </p>
        </div>
        {!staff && (
          <Link href="/dashboard/suggestions?new=1" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" />
            Submit Suggestion
          </Link>
        )}
      </section>

      {!staff && creating === "1" && (
        <form action={submitSuggestion} className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold">Submit a Suggestion</h2>
          {organizations.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="tenantId">Target Organization</Label>
              <select
                id="tenantId"
                name="tenantId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">-- Choose an Organization --</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.sector ? `(${org.sector})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Suggestion title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Suggestion Details</Label>
            <Textarea id="description" name="description" placeholder="Describe your suggestion in detail..." rows={4} required />
          </div>
          <div className="flex justify-end gap-2">
            <Link href="/dashboard/suggestions" className="rounded-md border border-border px-4 py-2 text-sm font-medium">
              Cancel
            </Link>
            <Button type="submit">Submit Suggestion</Button>
          </div>
        </form>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="min-h-28 rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Icon className={`h-4 w-4 ${stat.tone}`} />
                {stat.label}
              </p>
              <p className={`mt-8 font-serif text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
            </article>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <Clock3 className="h-5 w-5 text-primary" />
            {staff ? "Organization Suggestions" : "My Suggestions History"}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-44 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Search...</span>
            </div>
            <Link href="/dashboard/suggestions" className="grid h-9 w-9 place-items-center rounded-md border border-border">
              <RefreshCw className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {suggestions.length ? (
          <div className="divide-y divide-border">
            {suggestions.map((item) => (
              <article key={item.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base">{item.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="font-semibold text-primary">
                        🏢 {item.tenant.name}
                      </Badge>
                      <span>•</span>
                      <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                      {staff && item.authorName && (
                        <>
                          <span>•</span>
                          <span>By: {item.authorName}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === "ACCEPTED" ? "default" : item.status === "IN_REVIEW" ? "secondary" : "outline"}>
                      {item.status.replace(/_/g, " ")}
                    </Badge>
                    <DeleteSubmissionButton id={item.id} action={deleteSuggestion} itemLabel="suggestion" />
                  </div>
                </div>
                <p className="text-sm text-foreground/90">{item.description}</p>

                {item.response && (
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                    <p className="text-xs font-semibold text-primary">Company / Staff Response:</p>
                    <p className="mt-1 text-sm">{item.response}</p>
                    {item.respondedAt && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Responded on {new Date(item.respondedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {staff && (
                  <div className="mt-2 rounded-md border border-border/80 bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Respond to this suggestion:</p>
                    <form action={respondSuggestion.bind(null, item.id)} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input name="response" placeholder="Write staff response..." defaultValue={item.response || ""} required className="flex-1" />
                      <select name="status" defaultValue={item.status || "ACCEPTED"} className="h-9 rounded-md border border-input bg-background px-3 text-xs">
                        <option value="ACCEPTED">Accept Idea</option>
                        <option value="IN_REVIEW">Under Review</option>
                        <option value="DECLINED">Decline</option>
                      </select>
                      <Button type="submit" size="sm">
                        {item.response ? "Update Response" : "Send Response"}
                      </Button>
                    </form>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <Lightbulb className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-serif text-lg font-semibold">No suggestions found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {staff ? "No suggestions have been submitted to your organization yet." : "You haven't submitted any suggestions yet."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
