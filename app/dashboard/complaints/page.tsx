import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ComplaintFormSection } from "@/components/dashboard/complaint-form-section";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  Loader2,
  Plus,
  Search,
} from "lucide-react";

async function addComplaint(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.tenantId) {
    redirect("/login");
  }
  if (session.user.role !== "CUSTOMER") {
    throw new Error("Staff cannot submit customer complaints.");
  }

  const title = formData.get("title")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim();

  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  await prisma.complaint.create({
    data: {
      tenantId: session.user.tenantId,
      customerName: session.user.name || null,
      customerEmail: session.user.email || null,
      source: "WEB",
      title,
      description,
      status: "NEW",
      priority: "MEDIUM",
    },
  });

  revalidatePath("/dashboard/complaints");
  redirect("/dashboard/complaints");
}

function formatRelativeDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function getStatusConfig(status: string) {
  switch (status) {
    case "NEW":
      return { dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" };
    case "IN_PROGRESS":
      return { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" };
    case "RESOLVED":
      return { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" };
    case "CLOSED":
      return { dot: "bg-zinc-400", text: "text-zinc-400", bg: "bg-zinc-400/10 border-zinc-400/20" };
    case "ESCALATED":
      return { dot: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" };
    default:
      return { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/50 border-muted" };
  }
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "destructive" as const;
    case "MEDIUM":
      return "secondary" as const;
    case "LOW":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

export default async function ComplaintsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isCustomer = session.user.role === "CUSTOMER";

  const complaints = await prisma.complaint.findMany({
    where: {
      tenantId: session.user.tenantId,
      ...(isCustomer
        ? {
            OR: [
              { customerEmail: session.user.email ?? undefined },
              { customerName: session.user.name ?? undefined },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalCount = complaints.length;
  const newCount = complaints.filter((c) => c.status === "NEW").length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;

  const stats = [
    { label: "Total", value: totalCount, icon: FileText, tone: "text-primary bg-primary/15" },
    { label: "New", value: newCount, icon: AlertCircle, tone: "text-blue-400 bg-blue-400/15" },
    { label: "In Progress", value: inProgressCount, icon: Loader2, tone: "text-amber-400 bg-amber-400/15" },
    { label: "Resolved", value: resolvedCount, icon: CheckCircle2, tone: "text-emerald-400 bg-emerald-400/15" },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-5 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Complaints
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight">
            {isCustomer ? "Complaint Center" : "Review Complaints"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCustomer
              ? "Submit a complaint and follow its progress."
              : "Review incoming complaints, triage cases, and track resolution."}
          </p>
        </div>
        {isCustomer && (
          <Link
            href="/dashboard/complaints?new=1"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/20"
            >
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-serif text-2xl font-semibold">{stat.value}</p>
              </div>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
            </article>
          );
        })}
      </section>

      {isCustomer && <ComplaintFormSection action={addComplaint} />}

      {/* Table Section */}
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-serif text-lg font-semibold">
              {isCustomer ? "Recent Complaints" : "Incoming Complaints"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {totalCount} complaint{totalCount !== 1 ? "s" : ""} captured
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground sm:w-64">
              <Search className="h-3.5 w-3.5" />
              <span>Search complaints…</span>
            </div>
          </div>
        </div>

        {complaints.length === 0 ? (
          <div className="grid min-h-[280px] place-items-center p-10 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-serif text-lg font-semibold">No Complaints Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isCustomer
                  ? "Submit your first complaint to get started."
                  : "No complaints have been submitted yet."}
              </p>
              {isCustomer && (
                <Link
                  href="/dashboard/complaints?new=1"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Submit Complaint
                </Link>
              )}
            </div>
          </div>
        ) : (
          <Table>
            <TableCaption>
              Showing the {Math.min(complaints.length, 50)} most recent complaints.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] pl-5">#</TableHead>
                <TableHead>Complaint</TableHead>
                {!isCustomer && <TableHead>Customer</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="pr-5 text-right">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint, index) => {
                const statusConfig = getStatusConfig(complaint.status);
                return (
                  <TableRow key={complaint.id} className="group">
                    <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                      {complaint.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="max-w-[320px] whitespace-normal">
                      <Link
                        href={`/dashboard/complaints/${complaint.id}`}
                        className="group/link inline-flex items-center gap-1 font-medium transition-colors hover:text-primary"
                      >
                        {complaint.title}
                        <ArrowUpRight className="hidden h-3.5 w-3.5 opacity-0 transition-opacity group-hover/link:inline-block group-hover/link:opacity-100" />
                      </Link>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {complaint.description}
                      </p>
                    </TableCell>
                    {!isCustomer && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                            {(complaint.customerName || "U")[0].toUpperCase()}
                          </span>
                          <span className="text-sm">{complaint.customerName || "Unknown"}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                        {complaint.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityConfig(complaint.priority)} className="text-xs">
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {complaint.source}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <span className="text-xs text-muted-foreground" title={complaint.createdAt.toLocaleString()}>
                        {formatRelativeDate(complaint.createdAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={isCustomer ? 5 : 6} className="pl-5">
                  Total
                </TableCell>
                <TableCell className="pr-5 text-right">
                  {complaints.length} complaint{complaints.length !== 1 ? "s" : ""}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </section>
    </div>
  );
}
