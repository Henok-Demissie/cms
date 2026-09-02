"use client"

import { useState } from "react"
import { CheckCircle2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { formatGhs, wallet } from "@/lib/data"

interface Item {
  title: string
  price: number
  network?: string
}

export function CheckoutSheet({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [done, setDone] = useState(false)
  const insufficient = item ? wallet.balance < item.price : false

  const close = () => {
    onClose()
    setTimeout(() => {
      setDone(false)
      setPhone("")
    }, 250)
  }

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {item && !done && (
          <>
            <SheetHeader>
              <SheetTitle>Confirm purchase</SheetTitle>
              <SheetDescription>{item.title}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-5 px-4">
              <div className="brand-gradient-soft rounded-2xl border border-brand-green/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
                <p className="mt-1 text-3xl font-extrabold">{formatGhs(item.price)}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">
                  Recipient phone number
                </label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="024 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Wallet className="size-4 text-brand-emerald" aria-hidden /> Wallet balance
                </span>
                <span className={`font-bold ${insufficient ? "text-destructive" : ""}`}>{formatGhs(wallet.balance)}</span>
              </div>
              {insufficient && (
                <p className="text-xs text-destructive">Insufficient balance. Top up your wallet to continue.</p>
              )}
              <Button
                className="brand-gradient brand-glow h-11 font-bold text-brand-deep hover:opacity-90"
                disabled={phone.replace(/\D/g, "").length < 10 || insufficient}
                onClick={() => setDone(true)}
              >
                Pay {formatGhs(item.price)}
              </Button>
            </div>
          </>
        )}
        {item && done && (
          <div className="flex flex-col items-center gap-4 px-4 pt-16 text-center">
            <span className="brand-gradient brand-glow flex size-16 items-center justify-center rounded-full text-brand-deep">
              <CheckCircle2 className="size-8" aria-hidden />
            </span>
            <SheetTitle>Order placed</SheetTitle>
            <SheetDescription>
              {item.title} is on its way to {phone}. Track it in Orders.
            </SheetDescription>
            <Button variant="outline" onClick={close} className="mt-2">
              Done
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
