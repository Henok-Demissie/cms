import Link from "next/link"
import { notFound } from "next/navigation"
import { ShieldCheck } from "lucide-react"

import { BackButton } from "@/components/back-button"
import { PublicComplaintForm } from "@/components/public-complaint-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{ subdomain: string }>
}

export default async function PublicComplaintPage({ params }: Props) {
  const { subdomain } = await params
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { name: true, subdomain: true },
  })

  if (!tenant) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <BackButton fallbackHref="/" className="mb-4" />
        <Link
          href="/"
          className="mb-6 flex w-fit items-center gap-2 text-sm font-semibold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          AbetBay
        </Link>

        <Card>
          <CardHeader>
            <p className="text-sm font-medium text-primary">{tenant.name}</p>
            <CardTitle className="text-2xl">Submit a complaint</CardTitle>
            <CardDescription>
              No account or login is required. Your complaint will be sent
              directly to the organization&apos;s support team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PublicComplaintForm subdomain={tenant.subdomain} />
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Please do not include passwords or other sensitive information.
        </p>
      </div>
    </main>
  )
}
