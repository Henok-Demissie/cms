"use client"

import { useTransition } from "react"
import { revokeOwnerAccount } from "@/app/actions/owners"
import { Button } from "@/components/ui/button"

type Account = { id: string; name: string; email: string; createdAt: Date; isOwner: boolean }

export function OwnerAccountList({ accounts }: { accounts: Account[] }) {
  const [pending, startTransition] = useTransition()
  const customers = accounts.filter((account) => !account.isOwner)

  return (
    <section className="card-shadow rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold">Customer accounts</h2>
          <p className="text-xs text-muted-foreground">{customers.length} real account{customers.length === 1 ? "" : "s"}</p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-border">
        {customers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No customer accounts yet.</p>
        ) : customers.map((account) => (
          <div key={account.id} className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{account.name}</p>
              <p className="truncate text-xs text-muted-foreground">{account.email}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                if (window.confirm(`Revoke access for ${account.email}?`)) {
                  startTransition(() => revokeOwnerAccount(account.id))
                }
              }}
            >
              Revoke access
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
