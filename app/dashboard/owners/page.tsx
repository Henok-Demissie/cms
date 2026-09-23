import { redirect } from "next/navigation"
import { requireOwner, listAccounts, OWNER_EMAIL } from "@/lib/owner"
import { PageHeader } from "@/components/brand/page-header"
import { OwnerAccountList } from "@/components/owners/owner-account-list"

export default async function OwnersPage() {
  try {
    await requireOwner()
  } catch {
    redirect("/dashboard")
  }

  const accounts = await listAccounts()
  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <PageHeader title="Owner accounts" subtitle="Manage customer access without putting the primary owner at risk." />
      <section className="rounded-2xl border border-brand-green/30 bg-brand-green/5 p-5">
        <p className="text-sm font-semibold">Primary owner</p>
        <p className="mt-1 text-sm text-muted-foreground">{OWNER_EMAIL}</p>
        <p className="mt-3 text-xs text-muted-foreground">This account is permanent and cannot be revoked by anyone.</p>
      </section>
      <OwnerAccountList accounts={accounts} />
    </div>
  )
}
