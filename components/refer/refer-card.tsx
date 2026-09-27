"use client"

import { useState } from "react"
import { Check, Copy, Gift, Link2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReferCardProps {
  code: string
  link: string
  referralCount: number
  qualifiedCount: number
}

export function ReferCard({ code, link, referralCount, qualifiedCount }: ReferCardProps) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null)

  const copy = async (what: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(what === "code" ? code : link)
      setCopied(what)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const whatsappText = `Get cheap data bundles on DataSpots! 🇬🇭\nUse my referral link and get MTN 1GB for just GHS 3.50 on your first order.\n\n👉 ${link}`
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

  return (
    <section className="card-shadow relative overflow-hidden rounded-2xl bg-brand-deep p-5 text-brand-deep-foreground">
      <div className="relative flex items-center gap-3">
        <span className="brand-gradient flex size-10 items-center justify-center rounded-full text-brand-deep">
          <Gift className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-lg font-bold">Refer &amp; Earn</h1>
          <p className="text-xs opacity-70">Earn data credit for every friend who buys.</p>
        </div>
      </div>

      {/* Referral code display */}
      <div className="relative mt-5 flex items-center justify-between rounded-xl bg-white/6 px-4 py-3 ring-1 ring-white/10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">Your code</p>
          <p className="brand-gradient-text mt-0.5 font-mono text-2xl font-extrabold tracking-[0.35em]">{code}</p>
        </div>
        <button
          onClick={() => copy("code")}
          aria-label="Copy referral code"
          className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/15"
        >
          {copied === "code" ? (
            <Check className="size-4 text-brand-lime" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>

      {/* Referral link display */}
      <div className="relative mt-3 flex items-center justify-between rounded-xl bg-white/4 px-4 py-2.5 ring-1 ring-white/8">
        <p className="min-w-0 truncate font-mono text-[11px] opacity-60">{link}</p>
        <button
          onClick={() => copy("link")}
          aria-label="Copy referral link"
          className="ml-2 shrink-0 rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/15"
        >
          {copied === "link" ? (
            <Check className="size-3.5 text-brand-lime" />
          ) : (
            <Link2 className="size-3.5" />
          )}
        </button>
      </div>

      {/* Share & copy actions */}
      <div className="relative mt-4 flex flex-col gap-2">
        <Button asChild className="brand-gradient brand-glow h-11 font-bold text-brand-deep hover:opacity-90">
          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" /> Share on WhatsApp
          </a>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() => copy("code")}
            className="h-10 bg-white/10 font-semibold text-brand-deep-foreground hover:bg-white/15"
          >
            <Copy className="size-4" /> {copied === "code" ? "Copied!" : "Copy code"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => copy("link")}
            className="h-10 bg-white/10 font-semibold text-brand-deep-foreground hover:bg-white/15"
          >
            <Link2 className="size-4" /> {copied === "link" ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="relative mt-5 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-4">
        {[
          ["Friends joined", referralCount],
          ["Qualified", qualifiedCount],
        ].map(([label, v]) => (
          <div key={label as string} className="flex flex-col items-center gap-0.5">
            <span className="text-base font-extrabold">{v}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{label}</span>
          </div>
        ))}
      </div>

      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand-green/25 blur-3xl" />
    </section>
  )
}
