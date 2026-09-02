"use client"

import { useState } from "react"
import { ArrowDownToLine, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const methods = ["MTN MoMo", "Telecel Cash", "AT Money"]

export function DepositDialog({ variant = "hero" }: { variant?: "hero" | "solid" }) {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState(methods[0])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className={
            variant === "hero"
              ? "h-12 w-full border border-brand-deep/15 bg-brand-deep/10 font-bold text-brand-deep hover:bg-brand-deep/15"
              : "brand-gradient brand-glow h-11 font-bold text-brand-deep hover:opacity-90"
          }
        >
          <ArrowDownToLine className="size-4" /> Deposit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top up wallet</DialogTitle>
          <DialogDescription>Pay with mobile money. Funds arrive in seconds.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="deposit-amt" className="text-xs font-semibold text-muted-foreground">
              Amount (GHS)
            </label>
            <Input
              id="deposit-amt"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 text-lg font-bold"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {[10, 20, 50, 100, 200].map((v) => (
                <Button key={v} type="button" size="sm" variant="outline" onClick={() => setAmount(String(v))}>
                  {v}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  aria-pressed={method === m}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-colors ${
                    method === m ? "border-brand-green bg-success/10" : "border-border text-muted-foreground"
                  }`}
                >
                  <Smartphone className="size-4" aria-hidden />
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="brand-gradient brand-glow h-11 font-bold text-brand-deep hover:opacity-90"
            disabled={!amount || Number(amount) <= 0}
          >
            Deposit {amount ? `GHS ${Number(amount).toFixed(2)}` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
