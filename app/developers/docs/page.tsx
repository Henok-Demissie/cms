import { PageHeader } from "@/components/brand/page-header"

const create = `curl -X POST https://api.dataspots.app/v1/orders \\
  -H "Authorization: Bearer ds_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "network": "mtn",
    "bundle": "mtn-5",
    "phone": "0245550198",
    "reference": "your-unique-id"
  }'`

const response = `{
  "id": "DS-7F3K2Q",
  "status": "processing",
  "amount": 21.83,
  "network": "mtn",
  "phone": "0245550198",
  "created_at": "2026-09-03T08:42:11Z"
}`

const endpoints = [
  ["POST", "/v1/orders", "Create a data, airtime or checker order"],
  ["GET", "/v1/orders/:id", "Fetch order status"],
  ["GET", "/v1/orders", "List orders (paginated)"],
  ["GET", "/v1/pricing", "Current bundle catalogue & prices"],
  ["GET", "/v1/wallet", "Wallet balance"],
  ["POST", "/v1/webhooks", "Register a webhook endpoint"],
]

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-2xl bg-brand-deep p-5 font-mono text-xs leading-relaxed text-brand-deep-foreground">
      <code>{children}</code>
    </pre>
  )
}

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Documentation" subtitle="REST API · JSON · Bearer auth · Base URL https://api.dataspots.app" />

      <section className="flex flex-col gap-3">
        <h2 className="title-bar text-sm font-bold">Create an order</h2>
        <Code>{create}</Code>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Response</h3>
        <Code>{response}</Code>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="title-bar text-sm font-bold">Endpoints</h2>
        <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {endpoints.map(([m, p, d]) => (
                <tr key={p}>
                  <td className="w-20 px-5 py-3 font-mono text-xs font-bold text-brand-emerald">{m}</td>
                  <td className="px-5 py-3 font-mono text-xs">{p}</td>
                  <td className="px-5 py-3 text-muted-foreground">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="title-bar text-sm font-bold">Order statuses</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            ["pending", "Received, awaiting wallet debit"],
            ["processing", "Sent to the network"],
            ["delivered", "Confirmed on the recipient's line"],
            ["failed", "Network rejected — wallet refunded"],
          ].map(([s, d]) => (
            <li key={s} className="card-shadow rounded-2xl border border-border bg-card p-4">
              <p className="font-mono text-xs font-bold text-brand-emerald">{s}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
