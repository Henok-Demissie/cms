"use client"

import { useMemo, useState, useTransition, type CSSProperties } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Wallet } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { checkers, detectNetwork, formatGhs, isValidGhPhone, networkOf, normalizeGhPhone, type NetworkId } from "@/lib/data"
import { placeDataOrder } from "@/app/actions/orders"

export interface ClientPackage {
  packageId: number
  label: string
  dataSize: number
  customerPrice: number
}

export type PackagesByNetwork = Record<NetworkId, ClientPackage[]>

const NETWORKS: { id: NetworkId; name: string; color: string; foreground: string }[] = [
  { id: "mtn", name: "MTN", color: "#ffcc00", foreground: "#1a1400" },
  { id: "telecel", name: "Telecel", color: "#e60000", foreground: "#ffffff" },
  { id: "airteltigo", name: "AirtelTigo", color: "#0a2a8a", foreground: "#ffffff" },
]

interface Selected {
  network: NetworkId
  pkg: ClientPackage
}

export function LiveBuyData({
  packages,
  walletBalance,
}: {
  packages: PackagesByNetwork
  walletBalance: number
}) {
  const [tab, setTab] = useState<NetworkId | "checkers">("mtn")
  const [selected, setSelected] = useState<Selected | null>(null)

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as NetworkId)} className="gap-5">
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
          {NETWORKS.map((n) => (
            <TabsTrigger
              key={n.id}
              value={n.id}
              className="flex-none border-2 border-transparent px-4 py-1.5 font-bold data-[state=active]:border-current"
              style={{ "--network-color": n.color, color: tab === n.id ? n.foreground : n.color, backgroundColor: tab === n.id ? n.color : undefined } as CSSProperties}
            >
              {n.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="checkers" className="flex-none whitespace-nowrap px-3 py-1.5 font-bold">
            Checkers
          </TabsTrigger>
        </TabsList>

<Alert className="border-primary/30 bg-success/8 py-3">
            <Clock className="text-brand-emerald" />
            <AlertTitle className="flex flex-wrap items-center gap-2">
              Live delivery
              <Badge variant="outline" className="gap-1 border-primary/40 text-brand-emerald">
                <span className="pulse-dot size-1.5 rounded-full bg-brand-green" aria-hidden />
                Live
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              Most orders arrive within 30 minutes. MTN deliveries may take longer during busy periods.
            </AlertDescription>
          </Alert>

        <TabsContent value="checkers" className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {checkers.filter((checker) => checker.id === "waec-wassce").map((checker) => (
              <Card key={checker.id} className="card-shadow flex flex-col border-t-4 border-t-[#08b957]">
                <CardHeader>
                  <CardTitle className="text-xl font-extrabold">{checker.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{checker.org} · {checker.year}</p>
                  <p className="mt-3 text-xl font-extrabold text-brand-emerald">{formatGhs(checker.price)}</p>
                </CardContent>
                <CardFooter>
                  <Button className="brand-gradient brand-glow w-full font-bold text-brand-deep hover:opacity-90" disabled>
                    Coming soon
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {NETWORKS.map((n) => (
          <TabsContent key={n.id} value={n.id} className="flex flex-col gap-5">
            {packages[n.id].length === 0 ? (
              <Empty className="rounded-lg border">
                <EmptyHeader>
                  <EmptyTitle>No bundles available</EmptyTitle>
                  <EmptyDescription>{n.name} packages are temporarily unavailable. Please check back soon.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {packages[n.id].map((pkg) => (
                  <Card key={pkg.packageId} className="card-shadow flex flex-col border-t-4" style={{ borderTopColor: n.color }}>
                    <CardHeader>
                      <CardTitle className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold tabular-nums">{pkg.dataSize}GB</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <span className="brand-gradient-text text-xl font-extrabold tabular-nums">
                        {formatGhs(pkg.customerPrice)}
                      </span>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="brand-gradient brand-glow w-full font-bold text-brand-deep hover:opacity-90"
                        onClick={() => setSelected({ network: n.id, pkg })}
                      >
                        Buy {pkg.dataSize}GB
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <LiveCheckoutSheet selected={selected} walletBalance={walletBalance} onClose={() => setSelected(null)} />
    </div>
  )
}

function LiveCheckoutSheet({
  selected,
  walletBalance,
  onClose,
}: {
  selected: Selected | null
  walletBalance: number
  onClose: () => void
}) {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  const price = selected?.pkg.customerPrice ?? 0
  const insufficient = walletBalance < price
  const validPhone = isValidGhPhone(phone)
  const invalid = touched && phone.length > 0 && !validPhone

  const detected = useMemo(() => detectNetwork(phone), [phone])
  const expected = selected?.network
  const mismatch = !!expected && !!detected && detected !== expected
  const matched = !!expected && detected === expected
  const unknownPrefix = !!expected && validPhone && detected === null

  const expectedName = expected ? networkOf(expected)?.name : undefined
  const detectedName = detected ? networkOf(detected)?.name : undefined
  const prettyPhone = normalizeGhPhone(phone) || phone

  const canPay = validPhone && !insufficient && !mismatch && !pending

  const close = () => {
    onClose()
    setTimeout(() => {
      setDone(false)
      setPhone("")
      setTouched(false)
    }, 250)
  }

  const pay = () => {
    if (!selected) return
    startTransition(async () => {
      const res = await placeDataOrder({
        network: selected.network,
        packageLabel: selected.pkg.label,
        recipient: normalizeGhPhone(phone),
      })
      if (res.ok) {
        setDone(true)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <Sheet open={!!selected} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        {selected && !done && (
          <>
            <SheetHeader>
              <SheetTitle>Confirm purchase</SheetTitle>
              <SheetDescription>Review the details and pay from your wallet.</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
              <Item variant="outline" className="brand-gradient-soft border-primary/30">
                <ItemContent>
                  <ItemDescription>Item</ItemDescription>
                  <ItemTitle className="text-base">
                    {expectedName} {selected.pkg.dataSize}GB
                  </ItemTitle>
                </ItemContent>
                <span className="text-2xl font-extrabold tabular-nums">{formatGhs(price)}</span>
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
                      onChange={(e) => setPhone(e.target.value.replace(/^\+?233\s*/, ""))}
                    />
                  </InputGroup>
                  <FieldDescription>
                    {invalid
                      ? "Enter a valid 10-digit Ghana number, e.g. 024 000 0000."
                      : `The ${expectedName} bundle is delivered to this number.`}
                  </FieldDescription>
                </Field>
              </FieldGroup>

              {mismatch && (
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertTitle>This looks like a {detectedName} number</AlertTitle>
                  <AlertDescription>
                    You&apos;re buying a <strong>{expectedName}</strong> bundle, but {prettyPhone} is a {detectedName}{" "}
                    number. Sending it will fail. Switch to the {detectedName} tab or fix the number.
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
                  {formatGhs(walletBalance)}
                </span>
              </Item>

              {insufficient && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Insufficient balance</AlertTitle>
                  <AlertDescription>
                    You need {formatGhs(price - walletBalance)} more.{" "}
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
                {pending && <Spinner data-icon="inline-start" />}
                {pending ? "Placing order…" : `Pay ${formatGhs(price)}`}
              </Button>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
            </SheetFooter>
          </>
        )}

        {selected && done && (
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
                  {expectedName} {selected.pkg.dataSize}GB is being delivered to {prettyPhone}. Most orders land within
                  minutes, but heavy demand can push it to a few hours — track it anytime in Orders.
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
