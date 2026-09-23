"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Clock, HelpCircle, Phone, Signal, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { bundles, checkers, formatGhs, networks, type Bundle, type NetworkId, type ServiceTab } from "@/lib/data"
import { BundleCard } from "./bundle-card"
import { CheckoutSheet } from "./checkout-sheet"

const tabs: { id: ServiceTab; label: string; icon?: typeof Zap }[] = [
  { id: "mtn", label: "MTN" },
  { id: "telecel", label: "Telecel" },
  { id: "airteltigo", label: "AirtelTigo" },
  { id: "airtime", label: "Airtime", icon: Phone },
  { id: "checkers", label: "Checkers", icon: Signal },
]

export function BuyData() {
  const [tab, setTab] = useState<ServiceTab>("mtn")
  const [plan, setPlan] = useState<"regular" | "flexa">("regular")
  const [airtimeNet, setAirtimeNet] = useState<NetworkId>(networks[0].id)
  const [airtimeAmt, setAirtimeAmt] = useState("")
  const [selected, setSelected] = useState<{ title: string; price: number; network?: NetworkId } | null>(null)

  const visible = useMemo<Bundle[]>(() => {
    if (tab === "airtime" || tab === "checkers") return []
    return bundles.filter((b) => b.network === tab && (tab !== "mtn" || !!b.flexa === (plan === "flexa")))
  }, [tab, plan])

  const networkName = (id: string) => networks.find((n) => n.id === id)?.name

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={tab} onValueChange={(v) => setTab(v as ServiceTab)} className="gap-5">
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="flex-none px-4 py-1.5">
              {Icon && <Icon />}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tab !== "checkers" && (
          <Alert className="border-primary/30 bg-success/8">
            <Clock className="text-brand-emerald" />
            <AlertTitle className="flex items-center gap-2">
              {tab === "airtime" ? "Airtime is usually instant" : "Valid for up to 90 days"}
              <Badge variant="outline" className="gap-1 border-primary/40 text-brand-emerald">
                <span className="pulse-dot size-1.5 rounded-full bg-brand-green" aria-hidden />
                Live
              </Badge>
            </AlertTitle>
            <AlertDescription>
              {tab === "airtime"
                ? "Credit is applied to the number right away and every order is tracked end-to-end."
                : "These bundles last far longer than daily plans. Most deliver within minutes, but during heavy demand it can take a few hours — every order is tracked end-to-end until it lands."}{" "}
              {tab !== "airtime" && (
                <Link href="/dashboard/support" className="inline-flex items-center gap-1 font-medium text-brand-emerald hover:underline">
                  <HelpCircle className="size-3.5" aria-hidden /> Why can delivery take longer?
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        {(["mtn", "telecel", "airteltigo"] as const).map((net) => (
          <TabsContent key={net} value={net} className="flex flex-col gap-5">
            {net === "mtn" && (
              <ToggleGroup
                type="single"
                variant="outline"
                value={plan}
                onValueChange={(v) => v && setPlan(v as "regular" | "flexa")}
                className="w-full sm:w-auto"
                aria-label="MTN plan type"
              >
                <ToggleGroupItem value="regular" className="flex-1 px-4 sm:flex-none">
                  Regular MTN
                </ToggleGroupItem>
                <ToggleGroupItem value="flexa" className="flex-1 gap-1.5 px-4 sm:flex-none">
                  <Zap className="text-brand-emerald" />
                  MTN Flexa
                  <span className="hidden text-xs font-normal text-muted-foreground sm:inline">· every number</span>
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((b) => (
                <BundleCard
                  key={b.id}
                  bundle={b}
                  onSelect={() =>
                    setSelected({
                      title: `${networkName(b.network)}${b.flexa ? " Flexa" : ""} ${b.sizeGb}GB · ${b.validityDays} days`,
                      price: b.price,
                      network: b.network,
                    })
                  }
                />
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="airtime">
          <Card className="card-shadow max-w-xl">
            <CardHeader>
              <CardTitle>Airtime top-up</CardTitle>
              <CardDescription>Instant credit to any Ghanaian number.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Network</FieldLabel>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={airtimeNet}
                    onValueChange={(v) => v && setAirtimeNet(v as NetworkId)}
                    className="w-full"
                    aria-label="Network"
                  >
                    {networks.map((n) => (
                      <ToggleGroupItem key={n.id} value={n.id} className="flex-1">
                        {n.name}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="airtime-amt">Amount</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>GHS</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="airtime-amt"
                      inputMode="decimal"
                      placeholder="10.00"
                      value={airtimeAmt}
                      onChange={(e) => setAirtimeAmt(e.target.value)}
                    />
                  </InputGroup>
                  <FieldDescription>Minimum GHS 1.00. Quick picks:</FieldDescription>
                  <ButtonGroup>
                    {[5, 10, 20, 50].map((v) => (
                      <Button key={v} type="button" variant="outline" size="sm" onClick={() => setAirtimeAmt(String(v))}>
                        {v}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button
                className="brand-gradient brand-glow w-full font-bold text-brand-deep hover:opacity-90"
                disabled={!airtimeAmt || Number(airtimeAmt) <= 0}
                onClick={() =>
                  setSelected({
                    title: `${networkName(airtimeNet)} airtime · ${formatGhs(Number(airtimeAmt))}`,
                    price: Number(airtimeAmt),
                    network: airtimeNet,
                  })
                }
              >
                Continue
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="checkers">
          <div className="grid gap-4 sm:grid-cols-2">
            {checkers.map((c) => (
              <Card
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected({ title: c.name, price: c.price })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setSelected({ title: c.name, price: c.price })
                  }
                }}
                className="card-shadow cursor-pointer transition-all outline-none hover:-translate-y-0.5 hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <CardHeader>
                  <Badge variant="secondary" className="w-fit uppercase tracking-wider">
                    {c.org} · {c.year}
                  </Badge>
                  <CardTitle className="mt-2">{c.name}</CardTitle>
                  <CardDescription>Serial &amp; PIN delivered instantly via SMS</CardDescription>
                </CardHeader>
                <CardFooter>
                  <span className="brand-gradient-text text-lg font-extrabold tabular-nums">{formatGhs(c.price)}</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CheckoutSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
