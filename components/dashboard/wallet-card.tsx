"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatGhs, wallet } from "@/lib/data"

export function WalletCard() {
  const [hidden, setHidden] = useState(false)
  const spentPct = Math.round((wallet.walletPayments / wallet.totalDeposited) * 100)

  return (
    <Card className="card-shadow relative overflow-hidden">
      <CardHeader>
        <CardDescription>Available balance</CardDescription>
        <CardTitle className="text-3xl font-extrabold tabular-nums tracking-tight">
          {hidden ? "GHS ••••" : formatGhs(wallet.balance)}
        </CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setHidden((v) => !v)}
            aria-label={hidden ? "Show balance" : "Hide balance"}
          >
            {hidden ? <EyeOff /> : <Eye />}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Spent {formatGhs(wallet.walletPayments)}</span>
          <span>of {formatGhs(wallet.totalDeposited)} deposited</span>
        </div>
        <Progress value={spentPct} aria-label={`${spentPct}% of deposits spent`} />
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button asChild className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">
          <Link href="/dashboard/wallet">
            <ArrowDownToLine data-icon="inline-start" />
            Deposit
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/wallet">
            Manage
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
      <div aria-hidden className="pointer-events-none absolute -bottom-16 -right-16 size-48 rounded-full bg-brand-lime/15 blur-3xl" />
    </Card>
  )
}
