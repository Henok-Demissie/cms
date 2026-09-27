"use client"

import { useState, useTransition } from "react"
import {
  Crown,
  ShieldCheck,
  UserPlus,
  UserX,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  Calendar,
  Wallet,
  Info,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { grantAdminByEmailAction, revokeAdminAction } from "@/app/actions/owner"

function formatGHS(amount: number) {
  return `GHS ${Number(amount || 0).toFixed(2)}`
}

function formatDate(date: string | Date | undefined) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function OwnersPlaceView({
  owner,
  currentAdmin,
  isOwner,
}: {
  owner: any
  currentAdmin: any
  isOwner: boolean
}) {
  const [adminEmail, setAdminEmail] = useState("")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAppointAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminEmail.trim()) return
    setFeedback(null)

    startTransition(async () => {
      const res = await grantAdminByEmailAction(adminEmail.trim())
      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Admin appointed successfully!" })
        setAdminEmail("")
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to appoint admin." })
      }
    })
  }

  const handleRevokeAdmin = () => {
    if (!currentAdmin) return
    if (!confirm(`Are you sure you want to remove ${currentAdmin.name || currentAdmin.email} from the administrator role?`)) return
    setFeedback(null)

    startTransition(async () => {
      const res = await revokeAdminAction(currentAdmin.id)
      if (res.success) {
        setFeedback({ type: "success", text: "Administrator privileges removed. The admin slot is now open." })
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to remove admin." })
      }
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-xs font-semibold ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* 1. Primary Owner's Place */}
      <section className="card-shadow relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10">
              <Crown className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  {owner?.name || "DataSpots Owner"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/40">
                  <Crown className="size-3 text-amber-500" /> Permanent Primary Owner
                </span>
              </div>
              <p className="mt-1 font-mono text-sm text-foreground/80 font-semibold flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                {owner?.email || "Pboxtv9@gmail.com"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Primary Owner Since {formatDate(owner?.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Wallet className="size-3.5 text-emerald-500" />
                  Wallet: <span className="font-bold text-emerald-500">{formatGHS(owner?.balance || 0)}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
            <Lock className="size-4 shrink-0 text-amber-500" />
            <span>Root Immutable Account (Cannot be revoked)</span>
          </div>
        </div>

        <div className="mt-6 border-t border-border/80 pt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Owner Authority:</span> Only the primary owner (<span className="font-mono text-foreground font-semibold">Pboxtv9@gmail.com</span>) has authority to appoint or revoke administrator privileges. System architecture strictly limits the platform to a single appointed admin.
          </p>
        </div>
      </section>

      {/* 2. Single Admin Slot */}
      <section className="card-shadow rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-blue-500" />
              <h3 className="text-lg font-black tracking-tight text-foreground">
                Appointed Administrator
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  currentAdmin
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                Slot: {currentAdmin ? "1 / 1 (Filled)" : "0 / 1 (Available)"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              DataSpots policy allows <span className="font-bold text-foreground">only one admin</span> at a time to maintain strict platform control.
            </p>
          </div>
        </div>

        {/* State A: Admin is currently appointed */}
        {currentAdmin ? (
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
              <div className="flex items-center gap-3.5">
                <span className="flex size-11 items-center justify-center rounded-full bg-blue-500/20 text-blue-500 font-bold text-base">
                  {(currentAdmin.name?.[0] || "A").toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {currentAdmin.name || "Administrator"}
                    </p>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Active Admin
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {currentAdmin.email}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Appointed: {formatDate(currentAdmin.appointedAt)} · Balance: {formatGHS(currentAdmin.balance || 0)}
                  </p>
                </div>
              </div>

              {isOwner && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleRevokeAdmin}
                  className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold"
                >
                  <UserX className="size-3.5 mr-1.5" />
                  {isPending ? "Removing..." : "Remove Admin"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info className="size-4 shrink-0 text-blue-500" />
              <span>
                To appoint a different administrator, you must first click <strong className="text-foreground">Remove Admin</strong> to free the slot.
              </span>
            </div>
          </div>
        ) : (
          /* State B: No Admin Appointed — Show Appoint Form (Owner Only) */
          <div className="mt-6 flex flex-col gap-6">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShieldCheck className="size-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">No Administrator Appointed</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                The single admin slot is currently open. Appointing an admin will grant them access to the Admin Console to view orders and customers.
              </p>

              {isOwner ? (
                <form
                  onSubmit={handleAppointAdmin}
                  className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto"
                >
                  <Input
                    type="email"
                    placeholder="Enter registered customer's email..."
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    disabled={isPending}
                    required
                    className="h-10 text-xs"
                  />
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="brand-gradient brand-glow shrink-0 font-bold text-brand-deep w-full sm:w-auto"
                  >
                    <UserPlus className="size-3.5 mr-1.5" />
                    {isPending ? "Appointing..." : "Appoint Admin"}
                  </Button>
                </form>
              ) : (
                <p className="mt-4 text-xs font-semibold text-muted-foreground">
                  Only the primary owner (<span className="font-mono">Pboxtv9@gmail.com</span>) can appoint an administrator.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
