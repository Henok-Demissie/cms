import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { assignComplaintToMe, closeComplaint, reactToComplaint, replyToComplaint } from "./actions"
import { deleteComplaint } from "../../actions"
import { DeleteSubmissionButton } from "@/components/dashboard/delete-submission-button"
import { EditComplaintDialog } from "@/components/dashboard/edit-complaint-dialog"
import { BackButton } from "@/components/back-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  params: Promise<{ id: string }>
}

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase())
}

export default async function ComplaintDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const isStaff = session.user.role !== "CUSTOMER"

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      tenant: { select: { id: true, name: true, subdomain: true, sector: true } },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        include: {
          author: { select: { id: true, name: true, role: true } },
          customer: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: true,
    },
  })

  // Authorization check
  const isAuthorized = complaint && (
    isStaff
      ? complaint.tenantId === session.user.tenantId
      : (complaint.customerId === session.user.id || complaint.customerEmail === session.user.email || complaint.customerName === session.user.name)
  )

  if (!complaint || !isAuthorized) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint not found</CardTitle>
            <CardDescription>The complaint ID `{id}` was not found or you do not have permission to view it.</CardDescription>
          </CardHeader>
          <CardContent>
            <BackButton fallbackHref="/dashboard/complaints" label="Back to complaints" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const acknowledged = complaint.reactions.some((reaction) => reaction.type === "ACKNOWLEDGED")
  const priorityReaction = complaint.reactions.some((reaction) => reaction.type === "PRIORITY")

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Complaint {complaint.id.slice(-6).toUpperCase()}</CardTitle>
              <CardDescription>Details and conversation history</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-sm font-semibold text-primary">
              🏢 {complaint.tenant.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{complaint.customerName ?? "Customer"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Organization</p>
                <p className="font-medium text-primary">{complaint.tenant.name}</p>
              </div>
            </div>

            {(complaint.customerEmail || complaint.customerPhone) && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {complaint.customerEmail && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{complaint.customerEmail}</p>
                  </div>
                )}
                {complaint.customerPhone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{complaint.customerPhone}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Title</p>
              <h2 className="font-semibold text-lg">{complaint.title}</h2>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{complaint.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary">{formatLabel(complaint.status)}</Badge>
              <Badge variant={complaint.priority === "CRITICAL" ? "destructive" : "outline"}>
                {formatLabel(complaint.priority)}
              </Badge>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">Assigned to</p>
              <p className="font-medium">
                {complaint.assignedTo?.name ?? "Staff team"}
              </p>
              {complaint.assignedTo?.email && (
                <p className="text-xs text-muted-foreground">
                  {complaint.assignedTo.email}
                </p>
              )}
            </div>

            {isStaff && (
              <div className="flex flex-wrap gap-2">
                <form action={assignComplaintToMe.bind(null, complaint.id)}>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={
                      complaint.assignedTo?.id === session.user.id ||
                      complaint.status === "RESOLVED" ||
                      complaint.status === "CLOSED"
                    }
                  >
                    {complaint.assignedTo?.id === session.user.id
                      ? "Assigned to you"
                      : "Assign to me"}
                  </Button>
                </form>
                <form action={closeComplaint.bind(null, complaint.id)}>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={complaint.status === "CLOSED"}
                  >
                    {complaint.status === "CLOSED" ? "Closed" : "Close complaint"}
                  </Button>
                </form>
              </div>
            )}

            {/* The author may still correct a complaint nobody has picked up —
                the same rule the server and the phone app both enforce. */}
            {!isStaff && complaint.status === "NEW" && complaint.messages.length === 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <div>
                  <p className="text-sm font-medium">Correct this complaint</p>
                  <p className="text-xs text-muted-foreground">
                    No one from {complaint.tenant.name} has replied yet, so the title and
                    description can still be changed.
                  </p>
                </div>
                <EditComplaintDialog
                  id={complaint.id}
                  title={complaint.title}
                  description={complaint.description}
                  variant="button"
                />
              </div>
            )}

            {/* Erasing the complaint removes its whole conversation with it — the
                messages and reactions cascade on the foreign key. */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div>
                <p className="text-sm font-medium">Erase this complaint</p>
                <p className="text-xs text-muted-foreground">
                  Permanently deletes the complaint and every message on it. This cannot be undone.
                </p>
              </div>
              <DeleteSubmissionButton
                id={complaint.id}
                action={deleteComplaint}
                itemLabel="complaint"
                variant="button"
                redirectTo={isStaff ? "/dashboard/complaints" : "/dashboard/my-complaints"}
              />
            </div>

            <div className="rounded-lg border border-border p-3">
              <h3 className="font-semibold">Complaint conversation & Staff Responses</h3>
              <div className="mt-3 space-y-2">
                {complaint.messages.length ? (
                  complaint.messages.map((item) => {
                    const isStaffAuthor = item.authorRole ? item.authorRole !== "CUSTOMER" : (item.author?.role ? item.author.role !== "CUSTOMER" : false)
                    const authorName = item.authorName || item.author?.name || item.customer?.name || (isStaffAuthor ? "Staff" : "Customer")
                    return (
                      <div
                        key={item.id}
                        className={`rounded-md p-3 ${
                          isStaffAuthor
                            ? "border border-primary/20 bg-primary/10"
                            : "border border-border bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold">
                            {authorName}{" "}
                            {isStaffAuthor && (
                              <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] text-primary">
                                Staff Response
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-sm">{item.message}</p>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No replies yet.</p>
                )}
              </div>
              <form action={replyToComplaint.bind(null, complaint.id)} className="mt-4 space-y-2">
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder={isStaff ? "Write a response to the customer..." : "Write a follow-up message..."}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-sm"
                />
                <Button type="submit">
                  {isStaff ? "Send Staff Response" : "Send Message"}
                </Button>
              </form>
            </div>

            {isStaff && (
              <div className="flex flex-wrap gap-2">
                <form action={reactToComplaint.bind(null, complaint.id, "ACKNOWLEDGED")}>
                  <Button type="submit" variant="outline" disabled={acknowledged}>
                    {acknowledged ? "Acknowledged" : "Acknowledge complaint"}
                  </Button>
                </form>
                <form action={reactToComplaint.bind(null, complaint.id, "PRIORITY")}>
                  <Button type="submit" variant="outline" disabled={priorityReaction}>
                    {priorityReaction ? "Marked priority" : "Mark as priority"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
