import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { paginate, readPageParams, type PageSearchParams } from "@/lib/pagination"
import { submitFeedback, respondFeedback } from "./actions"
import { deleteFeedback } from "../actions"
import { DeleteSubmissionButton } from "@/components/dashboard/delete-submission-button"
import { ListPagination } from "@/components/dashboard/list-pagination"
import { OrganizationSelect } from "@/components/dashboard/organization-select"
import { SubmissionPopover } from "@/components/dashboard/submission-popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock3, MessageSquare, RefreshCw } from "lucide-react"
import Link from "next/link"

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const staff = session.user.role !== "CUSTOMER"

  const where = staff
    ? { tenantId: session.user.tenantId }
    : {
        OR: [
          { customerId: session.user.id },
          { authorId: session.user.id },
          { authorEmail: session.user.email ?? undefined },
        ],
      }

  // Count first so the requested page can be clamped before it is queried.
  const totalCount = await prisma.feedback.count({ where })
  const pagination = paginate(totalCount, readPageParams(await searchParams))

  const [feedback, organizations] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    !staff
      ? prisma.tenant.findMany({
          where: { subdomain: { not: "public" } },
          select: { id: true, name: true, subdomain: true, sector: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
      {!staff && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          Share your experience with an organization. Staff can review your feedback and reply.
        </div>
      )}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{staff ? "Customer Feedback" : "My Feedback"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff ? "Review customer satisfaction ratings and feedback for your organization" : "View and track all your feedback submissions"}
          </p>
        </div>
        {!staff && (
          <SubmissionPopover
            triggerLabel="New Feedback"
            title="Submit feedback"
            description="Rate your experience with an organization. Their staff can review your feedback and reply."
            submitLabel="Submit Feedback"
            successMessage="Feedback submitted"
            action={submitFeedback}
          >
            <OrganizationSelect organizations={organizations} />
            <div className="space-y-1.5">
              <Label htmlFor="rating">Rating</Label>
              <select
                id="rating"
                name="rating"
                defaultValue="5"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 — Excellent</option>
                <option value="4">⭐⭐⭐⭐ 4 — Good</option>
                <option value="3">⭐⭐⭐ 3 — Average</option>
                <option value="2">⭐⭐ 2 — Poor</option>
                <option value="1">⭐ 1 — Very poor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Your feedback</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your experience in detail..."
                rows={4}
                required
              />
            </div>
          </SubmissionPopover>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
              <Clock3 className="h-5 w-5 text-primary" />
              {staff ? "Organization Feedback" : "Feedback History"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">{totalCount} entries</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/feedback" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium">
              <RefreshCw className="h-4 w-4" />Refresh
            </Link>
          </div>
        </div>

        {feedback.length ? (
          <div className="divide-y divide-border">
            {feedback.map((item) => (
              <article key={item.id} className="space-y-3 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-semibold text-primary">
                        🏢 {item.tenant.name}
                      </Badge>
                      <span className="font-medium text-amber-500">
                        {"★".repeat(item.rating || 5)}{"☆".repeat(5 - (item.rating || 5))} ({item.rating || 5}/5)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted on {new Date(item.createdAt).toLocaleDateString()}
                      {staff && item.authorName && ` by ${item.authorName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.response || item.status === "REVIEWED" ? "default" : "secondary"}>
                      {item.response || item.status === "REVIEWED" ? "Responded" : "Pending"}
                    </Badge>
                    <DeleteSubmissionButton id={item.id} action={deleteFeedback} itemLabel="feedback" />
                  </div>
                </div>

                <p className="text-sm text-foreground/90">{item.message}</p>

                {item.response && (
                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                    <p className="text-xs font-semibold text-primary">Staff / Company Response:</p>
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
                    <p className="text-xs font-medium text-muted-foreground">Respond to customer feedback:</p>
                    <form action={respondFeedback.bind(null, item.id)} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input name="response" placeholder="Write staff response..." defaultValue={item.response || ""} required className="flex-1" />
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
          <div className="grid min-h-52 place-items-center p-6 text-center">
            <div>
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-3 font-serif text-lg font-semibold">No feedback yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {staff ? "No customer feedback has been submitted to your organization yet." : "Submit your first feedback to get started"}
              </p>
            </div>
          </div>
        )}

        <ListPagination {...pagination} />
      </section>
    </div>
  )
}
