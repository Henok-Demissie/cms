import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
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

const demoComplaints: Record<string, any> = {
  "CMP-1024": {
    id: "CMP-1024",
    customerName: "Alicia Brooks",
    customerPhone: "+1 202-555-0101",
    customerEmail: "alicia@example.com",
    source: "Email",
    title: "Delayed delivery refund",
    description:
      "The customer reported a delayed delivery and requested a refund for the missing shipment window.",
    status: "In review",
    priority: "High",
  },
  "CMP-1022": {
    id: "CMP-1022",
    customerName: "Marcus Lee",
    customerPhone: "+1 202-555-0123",
    customerEmail: "marcus@example.com",
    source: "Phone",
    title: "Billing mismatch",
    description:
      "The customer noticed an invoice amount that did not match the order confirmation.",
    status: "Escalated",
    priority: "Critical",
  },
  "CMP-1019": {
    id: "CMP-1019",
    customerName: "Nina Patel",
    customerPhone: "+1 202-555-0144",
    customerEmail: "nina@example.com",
    source: "Portal",
    title: "Order not received",
    description:
      "The customer reported that the order had not arrived after the expected delivery date.",
    status: "Resolved",
    priority: "Medium",
  },
  "CMP-1016": {
    id: "CMP-1016",
    customerName: "Daniel Ortiz",
    customerPhone: "+1 202-555-0187",
    customerEmail: "daniel@example.com",
    source: "Chat",
    title: "Wrong item delivered",
    description:
      "The customer received the wrong product and requested a replacement or credit.",
    status: "Pending",
    priority: "High",
  },
}

export default async function ComplaintDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const complaint = (await prisma.complaint.findUnique({
    where: { id },
  })) ?? demoComplaints[id]

  if (!complaint) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Complaint not found</CardTitle>
            <CardDescription>The complaint ID `{id}` was not found.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">It may be a demo ID — return to the complaints list to view real records.</p>
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
              <Badge variant="secondary">{complaint.status}</Badge>
              <Badge variant={complaint.priority === "Critical" ? "destructive" : "outline"}>
                {complaint.priority}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Assign</Button>
              <Button variant="destructive">Close</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
