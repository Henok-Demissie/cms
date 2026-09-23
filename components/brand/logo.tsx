import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  markOnly?: boolean
  className?: string
}

export function Logo({ href = "/", size = "md", showTagline = true, markOnly = false, className }: LogoProps) {
  const mark = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9"
  const word = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg"

  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="DataSell home">
      <span
        className={cn(
          "brand-gradient brand-glow relative grid shrink-0 place-items-center rounded-xl text-primary-foreground",
          mark,
        )}
      >
        <svg viewBox="0 0 24 24" className="size-[58%]" fill="none" aria-hidden="true">
          <path
            d="M4 16.5c2.8-4.8 7.4-8.5 12.5-9.5M6.5 19c2.1-3.4 5.3-6 8.9-7.1"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="18" cy="6" r="2.6" fill="currentColor" />
        </svg>
      </span>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-extrabold tracking-tight text-foreground", word)}>
            Data<span className="brand-gradient-text">Sell</span>
          </span>
          {showTagline && (
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Buy data. Save more.
            </span>
          )}
        </span>
      )}
    </Link>
  )
}
