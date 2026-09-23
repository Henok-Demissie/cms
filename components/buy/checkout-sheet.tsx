"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Wallet } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { detectNetwork, formatGhs, isValidGhPhone, networkOf, normalizeGhPhone, wallet, type NetworkId } from "@/lib/data"

interface CheckoutItem {
  title: string
  price: number
  network?: NetworkId
}

export function CheckoutSheet({ item, onClose }: { item: CheckoutItem | null; onClose: () => void }) {
  const [phone, setPhone] = useState("")
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<"idle" | "paying" | "done">("idle")

  const insufficient = item ? wallet.balance < item.price : false
  const validPhone = isValidGhPhone(phone)
  const invalid = touched && phone.length > 0 && !validPhone

  const detected = useMemo(() => detectNetwork(phone), [phone])
  const expected = item?.network
  // A wrong-network number would send the bundle to the wrong SIM and burn the money — block it.
  const mismatch = !!expected && !!detected && detected !== expected
  // Recognized as belonging to the correct network.
  const matched = !!expected && detected === expected
  // 10 digits entered but the prefix isn't one we recognize for any network.
  const unknownPrefix = !!expected && validPhone && detected === null

  const expectedName = expected ? networkOf(expected)?.name : undefined
  const detectedName = detected ? networkOf(detected)?.name : undefined

  const canPay = validPhone && !insufficient && !mismatch && status !== "paying"

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

  const prettyPhone = normalizeGhPhone(phone) || phone

  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        {item && status !== "done" && (
          <>
            <SheetHeader>
              <SheetTitle>Confirm purchase</SheetTitle>
              <SheetDescription>Review the details and pay from your wallet.</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
              <Item variant="outline" className="brand-gradient-soft border-primary/30">
                <ItemContent>
                  <ItemDescription>Item</ItemDescription>
                  <ItemTitle className="text-base">{item.title}</ItemTitle>
                </ItemContent>
                <span className="text-2xl font-extrabold tabular-nums">{formatGhs(item.price)}</span>
              </Item>

              <FieldGroup>
                <Field data-invalid={invalid || mismatch || undefined}>
                  <FieldLabel htmlFor="phone">Recipient phone number</FieldLabel>
                  <InputGroup className={cn(matched && "border-brand-emerald/60")}>
                    <InputGroupAddon>
                      <span aria-hidden className="text-base leading-none">
                        🇬🇭
                      </span>
                      <InputGroupText className="font-semibold text-foreground">+233</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="phone"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="your phone number"
                      value={phone}
                      aria-invalid={invalid || mismatch || undefined}
                      onBlur={() => setTouched(true)}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </InputGroup>
                  <FieldDescription>
                    {invalid
                      ? "Enter a valid 10-digit Ghana number, e.g. 024 000 0000."
                      : expected
                        ? `The ${expectedName} bundle is delivered to this number.`
                        : "The item is delivered to this number."}
                  </FieldDescription>
                </Field>
              </FieldGroup>

              {mismatch && (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertTitle>This looks like a {detectedName} number</AlertTitle>
                  <AlertDescription>
                    You&apos;re buying a <strong>{expectedName}</strong> bundle, but {prettyPhone} is a {detectedName}{" "}
                    number. Sending it will fail and you could lose your money. Switch to the {detectedName} tab or fix
                    the number.
                  </AlertDescription>
                </Alert>
              )}

              {unknownPrefix && (
                <Alert>
                  <AlertTriangle className="text-brand-emerald" />
                  <AlertTitle>Double-check this number</AlertTitle>
                  <AlertDescription>
                    We couldn&apos;t match {prettyPhone} to a known {expectedName} prefix. Make sure it&apos;s a valid{" "}
                    {expectedName} number before paying.
                  </AlertDescription>
                </Alert>
              )}

              {matched && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-brand-emerald">
                  <ShieldCheck className="size-4" aria-hidden />
                  Confirmed {detectedName} number
                </p>
              )}

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
                disabled={!canPay}
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
                  {item.title} is queued for {prettyPhone}. Most orders land within minutes, but heavy demand can push
                  it to a few hours — you can track it anytime in Orders.
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
