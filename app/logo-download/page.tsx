"use client"

import { useRef } from "react"
import Link from "next/link"
import { Download, ArrowLeft, Check, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LogoDownloadPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const downloadPNG = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw gradient squircle
    const grad = ctx.createLinearGradient(32, 32, 480, 480)
    grad.addColorStop(0, "#10B981")
    grad.addColorStop(0.5, "#22C55E")
    grad.addColorStop(1, "#84CC16")

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(32, 32, 448, 448, 112)
    ctx.fill()

    // Draw inner icon
    ctx.save()
    ctx.translate(136, 136)
    ctx.scale(10, 10)
    ctx.strokeStyle = "#092716"
    ctx.fillStyle = "#092716"
    ctx.lineWidth = 2.4
    ctx.lineCap = "round"

    // Wave 1
    ctx.beginPath()
    // d="M4 16.5c2.8-4.8 7.4-8.5 12.5-9.5"
    ctx.moveTo(4, 16.5)
    ctx.bezierCurveTo(6.8, 11.7, 11.4, 8.0, 16.5, 7.0)
    ctx.stroke()

    // Wave 2
    ctx.beginPath()
    // d="M6.5 19c2.1-3.4 5.3-6 8.9-7.1"
    ctx.moveTo(6.5, 19)
    ctx.bezierCurveTo(8.6, 15.6, 11.8, 13.0, 15.4, 11.9)
    ctx.stroke()

    // Dot circle cx="18" cy="6" r="2.6"
    ctx.beginPath()
    ctx.arc(18, 6, 2.6, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Trigger download
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "ghdatastore-logo.png"
    a.click()
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/admin">
            <ArrowLeft className="size-4 mr-1.5" /> Back to Console
          </Link>
        </Button>

        <div className="card-shadow rounded-3xl border border-border bg-card p-6 sm:p-8 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-4">
            <ShieldCheck className="size-3.5" /> Paystack Ready (512x512 PNG)
          </span>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Ghdatastore Official Logo</h1>
          <p className="mt-1 text-xs text-muted-foreground max-w-md">
            Download this high-resolution logo and upload it directly to your Paystack dashboard under <strong>Settings &gt; System &gt; Business Logo</strong>.
          </p>

          {/* Logo Visual Preview */}
          <div className="mt-6 size-48 rounded-3xl brand-gradient brand-glow flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <svg viewBox="0 0 24 24" className="size-28" fill="none">
              <path
                d="M4 16.5c2.8-4.8 7.4-8.5 12.5-9.5M6.5 19c2.1-3.4 5.3-6 8.9-7.1"
                stroke="#092716"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="18" cy="6" r="2.6" fill="#092716" />
            </svg>
          </div>

          {/* Download Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full">
            <Button
              onClick={downloadPNG}
              className="brand-gradient brand-glow font-bold text-brand-deep px-6 h-11"
            >
              <Download className="size-4 mr-2" /> Download PNG for Paystack
            </Button>
            <Button
              variant="outline"
              asChild
              className="font-semibold h-11"
            >
              <a href="/ghdatastore-logo.svg" download="ghdatastore-logo.svg">
                <Download className="size-4 mr-2" /> Download SVG
              </a>
            </Button>
          </div>

          {/* Instructions Box */}
          <div className="mt-8 w-full rounded-2xl border border-border bg-muted/30 p-4 text-left text-xs space-y-2">
            <p className="font-bold text-foreground">How to apply in Paystack:</p>
            <div className="flex items-start gap-2 text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">1</span>
              <span>Click the green <strong>Download PNG for Paystack</strong> button above.</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">2</span>
              <span>Return to your open Paystack tab (<strong>Settings &gt; System</strong>).</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">3</span>
              <span>Click <strong>Choose a file</strong> under <em>Business logo</em> and select your downloaded <code>ghdatastore-logo.png</code>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
