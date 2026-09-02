"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Moon,
  Palette,
  Send,
  Shield,
  ShieldAlert,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

function Panel({ icon: Icon, title, subtitle, children }: { icon: LucideIcon; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="card-shadow rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-success/10 text-brand-emerald">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Row({ icon: Icon, title, text, href, danger }: { icon: LucideIcon; title: string; text: string; href?: string; danger?: boolean }) {
  const inner = (
    <>
      <span className={`flex size-8 items-center justify-center rounded-full ${danger ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="flex-1">
        <span className={`block text-sm font-semibold ${danger ? "text-destructive" : ""}`}>{title}</span>
        <span className="block text-xs text-muted-foreground">{text}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </>
  )
  const cls = "flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted"
  return href ? (
    <Link href={href} className={cls}>{inner}</Link>
  ) : (
    <button type="button" className={cls}>{inner}</button>
  )
}

export function SettingsPanels() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [hideWa, setHideWa] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion)
  }, [reduceMotion])
  useEffect(() => {
    document.documentElement.classList.toggle("hide-whatsapp", hideWa)
  }, [hideWa])

  const current = mounted ? theme : undefined

  return (
    <>
      <Panel icon={Palette} title="Appearance" subtitle="How DataSell looks on your device">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Theme</p>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={current === t}
              className={`inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold capitalize transition-all ${
                current === t ? "brand-gradient brand-glow text-brand-deep" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "light" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
              {t}
            </button>
          ))}
        </div>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
          <span>
            <span className="block text-sm font-semibold">Reduce animations</span>
            <span className="block text-xs text-muted-foreground">Disable motion for smoother experience on slower devices.</span>
          </span>
          <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
        </label>
        <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
          <span>
            <span className="block text-sm font-semibold">Hide WhatsApp channel button</span>
            <span className="block text-xs text-muted-foreground">Already joined our channel? Turn this on to hide the floating button.</span>
          </span>
          <Switch checked={hideWa} onCheckedChange={setHideWa} />
        </label>
      </Panel>

      <Panel icon={Shield} title="Security" subtitle="Password and active sessions">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pw" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New password</label>
          <Input id="pw" type="password" placeholder="At least 8 characters" className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pw2" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confirm password</label>
          <Input id="pw2" type="password" placeholder="Repeat the new password" className="h-11" />
        </div>
        <Button type="button" className="brand-gradient brand-glow h-11 font-bold text-brand-deep hover:opacity-90">
          Update password
        </Button>
        <div className="flex flex-col border-t border-border pt-2">
          <Row icon={LogOut} title="Sign out (this device)" text="Ends this session and returns to the homepage." href="/" />
          <Row icon={ShieldAlert} title="Sign out everywhere" text="Revokes sessions on every device." danger />
        </div>
      </Panel>

      <Panel icon={Send} title="Integrations" subtitle="Link other apps to your account">
        <Row icon={Send} title="Connect Telegram" text="Get order alerts in the DataSell bot." />
      </Panel>

      <Panel icon={HelpCircle} title="Help & Support" subtitle="We are here for you">
        <Row icon={HelpCircle} title="Support Center" text="Quick answers, live help, and order tracking." href="/dashboard/support" />
        <Row icon={Mail} title="Email us" text="support@datasell.app" href="mailto:support@datasell.app" />
      </Panel>

      <Panel icon={FileText} title="Legal & Privacy" subtitle="The fine print and how we handle your data">
        <Row icon={FileText} title="Terms of Service" text="Rules for using DataSell." href="/legal/terms" />
        <Row icon={FileText} title="Privacy Policy" text="How we collect and use data." href="/legal/privacy" />
        <Row icon={FileText} title="Disclaimer" text="Service limitations and more." href="/legal/disclaimer" />
      </Panel>

      <section className="brand-gradient-soft card-shadow flex items-center justify-between rounded-2xl border border-brand-green/30 p-5">
        <div>
          <p className="text-sm font-bold">DataSell</p>
          <p className="text-xs text-muted-foreground">Affordable data bundles in Ghana — MTN, Telecel and AirtelTigo.</p>
        </div>
        <span className="rounded-full bg-card px-2.5 py-1 font-mono text-[10px] font-bold text-brand-emerald">v1.0</span>
      </section>
    </>
  )
}
