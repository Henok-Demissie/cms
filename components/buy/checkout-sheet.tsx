"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { formatGhs, wallet } from "@/lib/data"

interface Item {
  title: string
  price: number
  network?: string
}

export function CheckoutSheet({ item, onClose }: { item: Item | null; onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<"idle" | "paying" | "done">("idle")
  const insufficient = item ? wallet.balance < item.price : false
  const validPhone = phone.replace(/\D/g, "").length >= 10
  const invalid = touched && !validPhone

  const close = () => {
    onClose()
    setTimeout(() => {
      setStatus("idle")
      setPhone("")
      setTouched(false)
    }, 250)
  }

  const pay = () => {
    setStatus("paying")
    setTimeout(() => setStatus("done"), 900)
  }

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        {item && status !== "done" && (
          <>
            <SheetHeader>
              <SheetTitle>Confirm purchase</SheetTitle>
              <SheetDescription>Review the details and pay from your wallet.</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 px-4">
              <Item variant="outline" className="brand-gradient-soft border-primary/30">
                <ItemContent>
                  <ItemDescription>Item</ItemDescription>
                  <ItemTitle className="text-base">{item.title}</ItemTitle>
                </ItemContent>
                <span className="text-2xl font-extrabold tabular-nums">{formatGhs(item.price)}</span>
              </Item>

              <FieldGroup>
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor="phone">Recipient phone number</FieldLabel>
                  <Input
                    id="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="024 000 0000"
                    value={phone}
                    aria-invalid={invalid || undefined}
                    onBlur={() => setTouched(true)}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <FieldDescription>
                    {invalid ? "Enter a valid 10-digit Ghanaian number." : "The bundle is delivered to this number."}
                  </FieldDescription>
                </Field>
              </FieldGroup>

              <Separator />

              <Item variant="outline">
                <ItemMedia variant="icon" className="text-brand-emerald">
                  <Wallet />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Wallet balance</ItemTitle>
                  <ItemDescription>Paid instantly, no card needed</ItemDescription>
                </ItemContent>
                <span className={cn("font-bold tabular-nums", insufficient && "text-destructive")}>
                  {formatGhs(wallet.balance)}
                </span>
              </Item>

              {insufficient && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Insufficient balance</AlertTitle>
                  <AlertDescription>
                    You need {formatGhs(item.price - wallet.balance)} more.{" "}
                    <Link href="/dashboard/wallet" className="font-semibold underline">
                      Top up your wallet
                    </Link>{" "}
                    to continue.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <SheetFooter>
              <Button
                className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90"
                disabled={!validPhone || insufficient || status === "paying"}
                onClick={pay}
              >
                {status === "paying" && <Spinner data-icon="inline-start" />}
                {status === "paying" ? "Processing…" : `Pay ${formatGhs(item.price)}`}
              </Button>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
            </SheetFooter>
          </>
        )}

        {item && status === "done" && (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>Order placed</SheetTitle>
              <SheetDescription>Your order was placed successfully.</SheetDescription>
            </SheetHeader>
            <Empty className="flex-1">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="brand-gradient border-0 text-brand-deep">
                  <CheckCircle2 />
                </EmptyMedia>
                <EmptyTitle>Order placed</EmptyTitle>
                <EmptyDescription>
                  {item.title} is on its way to {phone}. You can follow its progress in Orders.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex-row justify-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard/orders">View orders</Link>
                </Button>
                <Button onClick={close}>Done</Button>
              </EmptyContent>
            </Empty>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
