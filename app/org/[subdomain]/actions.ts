"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { prisma } from "@/lib/prisma"

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  )

const complaintSchema = z.object({
  title: z.string().trim().min(3, "Please enter a complaint title.").max(150),
  description: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters of detail.")
    .max(5000),
  customerName: optionalText(100),
  customerPhone: optionalText(40),
  customerEmail: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().email("Please enter a valid email address.").max(254).optional(),
  ),
  website: z.string().max(500).optional(),
})

export type PublicComplaintState = {
  success: boolean
  message: string
}

export async function submitPublicComplaint(
  subdomain: string,
  _previousState: PublicComplaintState,
  formData: FormData,
): Promise<PublicComplaintState> {
  const parsed = complaintSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone"),
    customerEmail: formData.get("customerEmail"),
    website: formData.get("website"),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Please check your information.",
    }
  }

  // Silently accept bot submissions caught by the honeypot without saving them.
  if (parsed.data.website) {
    return {
      success: true,
      message: "Your complaint has been submitted successfully.",
    }
  }

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { id: true },
  })

  if (!tenant) {
    return {
      success: false,
      message: "This organization could not be found.",
    }
  }

  await prisma.complaint.create({
    data: {
      tenantId: tenant.id,
      customerName: parsed.data.customerName ?? null,
      customerPhone: parsed.data.customerPhone ?? null,
      customerEmail: parsed.data.customerEmail ?? null,
      title: parsed.data.title,
      description: parsed.data.description,
      source: "WEB",
      status: "NEW",
      priority: "MEDIUM",
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/complaints")

  return {
    success: true,
    message: "Your complaint has been submitted successfully.",
  }
}
