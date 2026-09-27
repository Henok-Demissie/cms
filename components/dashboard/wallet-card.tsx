"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownToLine, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatGhs } from "@/lib/data"

// Accepts real balance from the server — no hardcoded mock wallet
export function WalletCard({ balance }: { balance: number }) {
  const [hidden, setHidden] = useState(false)

  return (
    <Card className="card-shadow relative overflow-hidden">
      <CardHeader>
        <CardDescription>Available balance</CardDescription>
        <CardTitle className="text-3xl font-extrabold tabular-nums tracking-tight">
          {hidden ? "GHS ••••" : formatGhs(balance)}
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
        <p className="text-xs text-muted-foreground">
          {balance === 0 ? "Fund your wallet to start buying data." : "Your available Ghdatastore wallet balance."}
        </p>
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
