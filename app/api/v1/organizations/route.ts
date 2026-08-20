import { apiError, apiSuccess } from "@/lib/api/response"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const organizations = await prisma.tenant.findMany({
      where: { subdomain: { not: "public" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, subdomain: true, sector: true },
    })
    return apiSuccess({ organizations })
  } catch {
    return apiError("Unable to load organizations", 500)
  }
}
