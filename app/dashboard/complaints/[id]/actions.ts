"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function refreshComplaintPages(id: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/complaints")
  revalidatePath(`/dashboard/complaints/${id}`)
}

export async function assignComplaintToMe(id: string) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/complaints/${id}`)
  }

  const result = await prisma.complaint.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId,
      status: { notIn: ["RESOLVED", "CLOSED"] },
    },
    data: {
      assignedToId: session.user.id,
      assignedAt: new Date(),
      status: "ASSIGNED",
    },
  })

  if (result.count === 0) {
    throw new Error("This complaint cannot be assigned.")
  }

  refreshComplaintPages(id)
}

export async function closeComplaint(id: string) {
  const session = await auth()
  if (!session?.user) {
    redirect(`/login?callbackUrl=/dashboard/complaints/${id}`)
  }

  const result = await prisma.complaint.updateMany({
    where: {
      id,
      tenantId: session.user.tenantId,
      status: { not: "CLOSED" },
    },
    data: { status: "CLOSED" },
  })

  if (result.count === 0) {
    throw new Error("This complaint is already closed or no longer exists.")
  }

  refreshComplaintPages(id)
}
