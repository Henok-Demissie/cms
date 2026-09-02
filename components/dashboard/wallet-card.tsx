"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowRight, Eye, EyeOff, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatGhs, wallet } from "@/lib/data"

export function WalletCard() {
  const [hidden, setHidden] = useState(false)
  return (
    <section className="card-shadow relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-brand-green/30 bg-success/10 text-brand-emerald">
            <Wallet className="size-4.5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-bold">Wallet</h2>
            <p className="text-xs text-muted-foreground">Cedis · GHS</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHidden((v) => !v)}
          aria-label={hidden ? "Show balance" : "Hide balance"}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Available balance
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {hidden ? "GHS ••••" : formatGhs(wallet.balance)}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="brand-gradient brand-glow h-11 font-bold text-brand-deep hover:opacity-90">
          <Link href="/dashboard/wallet">
            <ArrowDownToLine className="size-4" /> Deposit
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-11 font-semibold">
          <Link href="/dashboard/wallet">
            Manage <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-16 size-48 rounded-full bg-brand-lime/15 blur-3xl"
      />
    </section>
  )
}
