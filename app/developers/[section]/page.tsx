import { notFound } from "next/navigation"
import Link from "next/link"
import { BarChart3, ClipboardList, Shield, Terminal, Webhook, Workflow, type LucideIcon } from "lucide-react"
import { PageHeader } from "@/components/brand/page-header"
import { EmptyState } from "@/components/brand/empty-state"
import { StatusBadge } from "@/components/brand/status-badge"
import { Button } from "@/components/ui/button"
import { NetworkChip } from "@/components/brand/network-chip"
import { formatDate, formatGhs, orders, requestLogs } from "@/lib/data"

const sections: Record<string, { title: string; subtitle: string; icon: LucideIcon; empty: string }> = {
  access: { title: "API access", subtitle: "Tell us about your project and which services you need", icon: Workflow, empty: "Your access request is approved. All services are enabled on your account." },
  orders: { title: "API orders", subtitle: "Orders created through your API keys", icon: ClipboardList, empty: "No API orders yet." },
  logs: { title: "Request logs", subtitle: "Last 24 hours of API requests", icon: Terminal, empty: "No requests yet." },
  webhooks: { title: "Webhooks", subtitle: "Receive order status updates in real time", icon: Webhook, empty: "No webhook endpoints registered yet." },
  usage: { title: "Usage", subtitle: "Spend and request volume by service", icon: BarChart3, empty: "Usage data appears after your first API call." },
  security: { title: "Security", subtitle: "Key rotation, IP allow-listing and signing secrets", icon: Shield, empty: "Webhook signatures use HMAC-SHA256. Rotate keys from the API keys page." },
}

export default async function DevSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const s = sections[section]
  if (!s) notFound()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={s.title} subtitle={s.subtitle} />

      {section === "orders" && (
        <ul className="card-shadow divide-y divide-border rounded-2xl border border-border bg-card">
          {orders.slice(0, 6).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <NetworkChip id={o.network} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{o.label}</p>
                <p className="font-mono text-xs text-muted-foreground">{o.id} · {formatDate(o.createdAt)}</p>
              </div>
              <span className="text-sm font-bold">{formatGhs(o.amount)}</span>
              <StatusBadge status={o.status} />
            </li>
          ))}
        </ul>
      )}

      {section === "logs" && (
        <ul className="card-shadow divide-y divide-border rounded-2xl border border-border bg-card font-mono text-xs">
          {requestLogs.map((r) => (
            <li key={r.id} className="flex items-center gap-4 px-5 py-3">
              <span className="w-12 font-bold">{r.method}</span>
              <span className="flex-1 truncate">{r.path}</span>
              <StatusBadge status={r.status < 400 ? "success" : "failed"} />
              <span className="w-16 text-right">{r.ms} ms</span>
              <span className="hidden w-16 text-right text-muted-foreground sm:block">{r.at}</span>
            </li>
          ))}
        </ul>
      )}

      {section !== "orders" && section !== "logs" && (
        <EmptyState
          icon={s.icon}
          title={s.title}
          description={s.empty}
          action={
            section === "webhooks" ? (
              <Button className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90">Add endpoint</Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/developers/docs">Read the docs</Link>
              </Button>
            )
          }
        />
      )}
    </div>
  )
}
