import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { assignComplaintToMe, closeComplaint } from "./actions"
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

  const complaint = (await prisma.complaint.findFirst({
    where: { id, tenantId: session.user.tenantId },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  }))

  if (!complaint) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint not found</CardTitle>
            <CardDescription>The complaint ID `{id}` was not found.</CardDescription>
          </CardHeader>
          <CardContent>
            <BackButton fallbackHref="/dashboard/complaints" label="Back to complaints" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complaint {complaint.id}</CardTitle>
          <CardDescription>Details for this complaint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{complaint.customerName ?? "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Source</p>
                <p className="font-medium">{complaint.source}</p>
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
                {complaint.assignedTo?.name ?? "Not assigned"}
              </p>
              {complaint.assignedTo?.email && (
                <p className="text-xs text-muted-foreground">
                  {complaint.assignedTo.email}
                </p>
              )}
            </div>

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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
