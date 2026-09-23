"use client"

import { Check, Copy, Gift, Share2, Users } from "lucide-react"
import { useState } from "react"

export function ReferralInviteCard({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({ title: "Join DataSell", text: "Join me on DataSell and get started with affordable data.", url: link })
      return
    }
    await copyLink()
  }

  return (
    <section className="rounded-2xl border border-[#bcefc5] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e3f9e6] text-[#08a94f]"><Gift className="size-6" /></div>
        <div>
          <h2 className="text-lg font-bold text-[#10251a]">Invite friends and earn</h2>
          <p className="mt-1 text-sm text-[#587160]">Share your link. Your referral is recorded when they create an account.</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-[#f1fbf3] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#587160]">Your invite link</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={link} aria-label="Referral invite link" className="min-w-0 flex-1 rounded-lg border border-[#cfe9d4] bg-white px-3 py-2.5 text-sm text-[#193524] outline-none" />
          <button type="button" onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#08b957] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#059947]">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy link"}</button>
        </div>
        <button type="button" onClick={shareLink} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#08a94f] hover:underline"><Share2 className="size-4" />Share invite</button>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-[#e3eee5] pt-4 text-sm text-[#587160]"><Users className="size-4 text-[#08a94f]" />No verified referrals yet</div>
      <p className="mt-2 text-xs text-[#718277]">Referral code: <span className="font-mono font-semibold text-[#193524]">{code}</span></p>
    </section>
  )
}
