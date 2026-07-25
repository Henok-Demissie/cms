import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ComplaintFormSection } from "@/components/complaint-form-section"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"

async function addComplaint(formData: FormData) {
  "use server"

  const session = await auth()
  if (!session?.user?.tenantId) {
    redirect("/login")
  }

  const title = formData.get("title")?.toString()?.trim()
  const description = formData.get("description")?.toString()?.trim()

  if (!title || !description) {
    throw new Error("Title and description are required")
  }

  await prisma.complaint.create({
    data: {
      tenantId: session.user.tenantId,
      customerName: formData.get("customerName")?.toString()?.trim() || null,
      customerPhone: formData.get("customerPhone")?.toString()?.trim() || null,
      customerEmail: formData.get("customerEmail")?.toString()?.trim() || null,
      source: formData.get("source")?.toString() || "OTHER",
      title,
      description,
      status: formData.get("status")?.toString() || "NEW",
      priority: formData.get("priority")?.toString() || "MEDIUM",
    },
  })

  revalidatePath("/dashboard/complaints")
  redirect("/dashboard/complaints")
}

export default async function ComplaintsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const complaints = await prisma.complaint.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Complaints</p>
        <h1 className="text-xl font-semibold">Admin complaint center</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Add complaints received by phone, email, web form, WhatsApp, or any other channel.
        </p>
      </div>

      <ComplaintFormSection action={addComplaint} />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Recent complaints</h2>
            <p className="text-xs text-muted-foreground">Complaints captured for this tenant</p>
          </div>
        </div>

        {complaints.length === 0 ? (
          <p className="text-xs text-muted-foreground">No complaints have been added yet.</p>
        ) : (
          <div className="space-y-2">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{complaint.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {complaint.customerName || "Unknown customer"} • {complaint.source}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="text-xs">{complaint.status}</Badge>
                    <Badge variant="outline" className="text-xs">{complaint.priority}</Badge>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{complaint.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
