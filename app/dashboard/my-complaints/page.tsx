import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, ClipboardList, Clock3, FileText, Mail, Plus, RefreshCw, Search } from "lucide-react"

export default async function MyComplaintsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "CUSTOMER") redirect("/dashboard/complaints")

  const complaints = await prisma.complaint.findMany({
    where: { tenantId: session.user.tenantId, OR: [{ customerEmail: session.user.email ?? undefined }, { customerName: session.user.name ?? undefined }] },
    include: { messages: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  })
  const active = complaints.filter((complaint) => !["RESOLVED", "CLOSED"].includes(complaint.status)).length
  const resolved = complaints.filter((complaint) => ["RESOLVED", "CLOSED"].includes(complaint.status)).length
  const stats = [
    { label: "Total", value: complaints.length, icon: ClipboardList, tone: "text-primary bg-primary/15" },
    { label: "Active", value: active, icon: Clock3, tone: "text-amber-500 bg-amber-500/15" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, tone: "text-emerald-500 bg-emerald-500/15" },
    { label: "With letters", value: complaints.filter((complaint) => complaint.messages.length > 0).length, icon: Mail, tone: "text-indigo-400 bg-indigo-400/15" },
  ]

  return <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
    <section className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="font-serif text-2xl font-semibold">My Complaints</h1><p className="mt-1 text-sm text-muted-foreground">View and track all your complaints</p></div><Link href="/dashboard/complaints?new=1" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"><Plus className="h-4 w-4" />New Complaint</Link></section>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="flex min-h-28 items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm"><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-1 font-serif text-2xl font-semibold">{stat.value}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}><Icon className="h-5 w-5" /></span></article> })}</section>
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4"><div><h2 className="font-serif text-lg font-semibold">Complaints List</h2><p className="text-xs text-muted-foreground">{complaints.length} complaints found</p></div><div className="flex w-full items-center gap-2 sm:w-auto"><div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground sm:w-80"><Search className="h-4 w-4" /><span>Search complaints...</span></div><button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent"><RefreshCw className="h-4 w-4" />Refresh</button></div></div>{complaints.length ? <Table><TableCaption>A list of your submitted complaints.</TableCaption><TableHeader><TableRow><TableHead>Complaint</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Messages</TableHead><TableHead className="text-right">Submitted</TableHead></TableRow></TableHeader><TableBody>{complaints.map((complaint) => <TableRow key={complaint.id}><TableCell className="max-w-80 whitespace-normal"><Link href={`/dashboard/complaints/${complaint.id}`} className="font-medium hover:text-primary hover:underline">{complaint.title}</Link><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{complaint.description}</p></TableCell><TableCell><Badge variant="secondary">{complaint.status.replace(/_/g, " ")}</Badge></TableCell><TableCell>{complaint.priority}</TableCell><TableCell>{complaint.messages.length}</TableCell><TableCell className="text-right text-muted-foreground">{complaint.createdAt.toLocaleDateString()}</TableCell></TableRow>)}</TableBody><TableFooter><TableRow><TableCell colSpan={4}>Total complaints</TableCell><TableCell className="text-right">{complaints.length}</TableCell></TableRow></TableFooter></Table> : <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground"><FileText className="h-7 w-7" /></span><h3 className="mt-4 font-serif text-lg font-semibold">No Complaints Found</h3><p className="mt-1 text-sm text-muted-foreground">Submit a new complaint to get started.</p><Link href="/dashboard/complaints?new=1" className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Submit Complaint</Link></div></div>}</section>
  </div>
}
