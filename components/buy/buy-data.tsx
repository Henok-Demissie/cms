"use client"

import { useMemo, useState } from "react"
import { Activity, Clock, HelpCircle, Phone, Signal, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { bundles, checkers, formatGhs, networks, type Bundle, type ServiceTab } from "@/lib/data"
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
  const [flexa, setFlexa] = useState(false)
  const [airtimeNet, setAirtimeNet] = useState(networks[0].id)
  const [airtimeAmt, setAirtimeAmt] = useState("")
  const [selected, setSelected] = useState<{ title: string; price: number; network?: string } | null>(null)

  const visible = useMemo<Bundle[]>(() => {
    if (tab === "airtime" || tab === "checkers") return []
    return bundles.filter((b) => b.network === tab && (tab !== "mtn" || !!b.flexa === flexa))
  }, [tab, flexa])

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Service" className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1 sm:grid-cols-5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              tab === id ? "brand-gradient brand-glow text-brand-deep" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="size-3.5" aria-hidden />}
            {label}
          </button>
        ))}
      </div>

      {tab === "mtn" && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1">
          <button
            onClick={() => setFlexa(false)}
            aria-pressed={!flexa}
            className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
              !flexa ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Regular MTN
          </button>
          <button
            onClick={() => setFlexa(true)}
            aria-pressed={flexa}
            className={`flex flex-col items-center rounded-xl py-2 text-sm font-semibold transition-colors ${
              flexa ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3.5 text-brand-emerald" aria-hidden /> MTN Flexa
            </span>
            <span className="text-[10px] uppercase tracking-wider text-brand-emerald">every number</span>
          </button>
        </div>
      )}

      {tab !== "checkers" && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-green/30 bg-success/8 px-4 py-3">
          <span className="pulse-dot size-2 rounded-full bg-brand-green" aria-hidden />
          <span className="flex size-8 items-center justify-center rounded-full bg-card text-brand-emerald">
            <Clock className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Delivering in 5–30 minutes</p>
            <p className="truncate text-xs text-muted-foreground">Orders are flowing normally — safe and tracked</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-brand-emerald">
            <Activity className="size-3" aria-hidden /> LIVE
          </span>
        </div>
      )}

      {tab !== "checkers" && tab !== "airtime" && (
        <a href="/dashboard/support" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-emerald hover:underline">
          <HelpCircle className="size-3.5" aria-hidden /> Why does my data sometimes take longer?
        </a>
      )}

      {visible.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((b) => (
            <BundleCard
              key={b.id}
              bundle={b}
              onSelect={() =>
                setSelected({
                  title: `${networks.find((n) => n.id === b.network)?.name} ${b.sizeGb}GB · ${b.validityDays} days`,
                  price: b.price,
                  network: b.network,
                })
              }
            />
          ))}
        </div>
      )}

      {tab === "airtime" && (
        <div className="card-shadow rounded-2xl border border-border bg-card p-5">
          <h2 className="title-bar text-sm font-bold">Airtime top-up</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {networks.map((n) => (
              <button
                key={n.id}
                onClick={() => setAirtimeNet(n.id)}
                aria-pressed={airtimeNet === n.id}
                className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                  airtimeNet === n.id ? "border-brand-green bg-success/10 text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                {n.name}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="airtime-amt" className="text-xs font-semibold text-muted-foreground">
                Amount (GHS)
              </label>
              <Input
                id="airtime-amt"
                inputMode="decimal"
                placeholder="e.g. 10"
                value={airtimeAmt}
                onChange={(e) => setAirtimeAmt(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              {[5, 10, 20, 50].map((v) => (
                <Button key={v} type="button" variant="outline" size="sm" onClick={() => setAirtimeAmt(String(v))}>
                  {v}
                </Button>
              ))}
            </div>
          </div>
          <Button
            className="brand-gradient brand-glow mt-4 h-11 w-full font-bold text-brand-deep hover:opacity-90"
            disabled={!airtimeAmt || Number(airtimeAmt) <= 0}
            onClick={() =>
              setSelected({
                title: `${networks.find((n) => n.id === airtimeNet)?.name} airtime`,
                price: Number(airtimeAmt),
                network: airtimeNet,
              })
            }
          >
            Continue
          </Button>
        </div>
      )}

      {tab === "checkers" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {checkers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected({ title: c.name, price: c.price })}
              className="card-shadow group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-green/50"
            >
              <span className="w-fit rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {c.org} · {c.year}
              </span>
              <span className="text-base font-bold">{c.name}</span>
              <span className="brand-gradient-text text-lg font-extrabold">{formatGhs(c.price)}</span>
              <span className="text-xs text-muted-foreground">Serial &amp; PIN delivered instantly via SMS</span>
            </button>
          ))}
        </div>
      )}

      <CheckoutSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
