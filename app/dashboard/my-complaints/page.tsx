import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  paginate,
  readPageParams,
  readSearchQuery,
  searchFilter,
  type PageSearchParams,
} from "@/lib/pagination"
import { deleteComplaint } from "../actions"
import { ComplaintSubmission } from "@/components/dashboard/complaint-submission"
import { DeleteSubmissionButton } from "@/components/dashboard/delete-submission-button"
import { EditComplaintDialog } from "@/components/dashboard/edit-complaint-dialog"
import { ListPagination } from "@/components/dashboard/list-pagination"
import { ListSearch } from "@/components/dashboard/list-search"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, RefreshCw } from "lucide-react"

export default async function MyComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "CUSTOMER") redirect("/dashboard/complaints")

  const params = await searchParams
  const query = readSearchQuery(params)

  // "Mine" is already an OR, so the search term joins it as a sibling AND.
  const scope = {
    OR: [
      { customerId: session.user.id },
      { customerEmail: session.user.email ?? undefined },
      { customerName: session.user.name ?? undefined },
    ],
  }
  const matches = searchFilter(query, ["title", "description"])
  const where = { AND: matches ? [scope, matches] : [scope] }

  // Count first so the requested page can be clamped before it is queried.
  const totalCount = await prisma.complaint.count({ where })
  const pagination = paginate(totalCount, readPageParams(params))

  const [complaints, organizations] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, subdomain: true } },
        messages: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    // Needed by the submission form, which opens here rather than sending the
    // customer over to the Complaint Center.
    prisma.tenant.findMany({
      where: { subdomain: { not: "public" } },
      select: { id: true, name: true, subdomain: true, sector: true },
      orderBy: { name: "asc" },
    }),
  ])
  // Complaint totals live on the dashboard's stat tabs, not here.

  return (
    <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">My Complaints</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and track all your submitted complaints and staff responses</p>
        </div>
        <ComplaintSubmission triggerLabel="New Complaint" organizations={organizations} />
      </section>
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <h2 className="font-serif text-lg font-semibold">Complaints List</h2>
            <p className="text-xs text-muted-foreground">
            {totalCount} complaint{totalCount !== 1 ? "s" : ""} {query ? "matching" : "found"}
          </p>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <ListSearch placeholder="Search complaints…" className="flex-1 sm:w-80" />
            <Link href="/dashboard/my-complaints" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent">
              <RefreshCw className="h-4 w-4" />Refresh
            </Link>
          </div>
        </div>
        {complaints.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Complaint</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Staff Messages</TableHead>
                <TableHead className="text-right">Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => {
                // Same rule the server enforces: still editable while nobody
                // from the organization has picked it up.
                const canEdit = complaint.status === "NEW" && complaint.messages.length === 0
                return (
                <TableRow key={complaint.id}>
                  <TableCell className="max-w-80 whitespace-normal">
                    <Link href={`/dashboard/complaints/${complaint.id}`} className="font-medium hover:text-primary hover:underline">
                      {complaint.title}
                    </Link>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{complaint.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold text-primary">
                      {complaint.tenant.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{complaint.status.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>{complaint.priority}</TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">
                      {complaint.messages.length} message{complaint.messages.length !== 1 ? "s" : ""}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-start gap-1.5">
                      {canEdit && (
                        <EditComplaintDialog
                          id={complaint.id}
                          title={complaint.title}
                          description={complaint.description}
                        />
                      )}
                      <DeleteSubmissionButton
                        id={complaint.id}
                        action={deleteComplaint}
                        itemLabel="complaint"
                      />
                    </div>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold">
                {query ? "No Matching Complaints" : "No Complaints Found"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {query
                  ? `Nothing matches "${query}". Try a different term or clear the search.`
                  : "Submit a new complaint to get started."}
              </p>
              {!query && (
                <div className="mt-4 flex justify-center">
                  <ComplaintSubmission triggerLabel="Submit Complaint" organizations={organizations} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Replaces the old caption and "Total complaints" footer row. */}
        <ListPagination {...pagination} />
      </section>
    </div>
  )
}
