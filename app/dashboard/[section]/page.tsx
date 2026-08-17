import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Bell, BookOpen, CircleHelp, Lightbulb, MessageSquareHeart, RefreshCw, UserRound } from "lucide-react"

const sections = {
  "my-complaints": { title: "My complaints", description: "Track updates and responses to the complaints you have submitted.", icon: MessageSquareHeart },
  suggestions: { title: "Suggestions", description: "Share an idea to help improve services and the complaint experience.", icon: Lightbulb },
  feedback: { title: "Feedback", description: "Tell us about your experience so we can continue improving the service.", icon: MessageSquareHeart },
  notifications: { title: "Notifications", description: "Stay up to date with replies, status changes, and important service updates.", icon: Bell },
  "service-catalog": { title: "Service catalog", description: "Browse the services available through your organization.", icon: BookOpen },
  help: { title: "Help & FAQ", description: "Find answers about submitting and tracking complaints.", icon: CircleHelp },
  profile: { title: "My profile", description: "View your account details and contact information.", icon: UserRound },
} as const

type Section = keyof typeof sections

export default async function WorkspaceSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { section } = await params
  const content = sections[section as Section]
  if (!content) redirect("/dashboard")

  const staff = session.user.role !== "CUSTOMER"
  const Icon = content.icon
  const reviewText = section === "suggestions" && staff
    ? "Review suggestions from customers, identify useful ideas, and follow up with the right team."
    : content.description

  return (
    <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="flex items-center gap-2 font-serif text-2xl font-semibold"><Icon className="h-6 w-6 text-primary" />{content.title}</h1><p className="mt-1 text-sm text-muted-foreground">{reviewText}</p></div>
        {section === "notifications" && <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-accent"><RefreshCw className="h-4 w-4" />Refresh</button>}
      </section>
      {section === "notifications" ? <><section className="flex w-full max-w-md rounded-lg bg-card p-1"><button className="flex-1 rounded-md bg-muted px-4 py-2 text-sm font-medium">Notifications</button><button className="flex-1 px-4 py-2 text-sm text-muted-foreground">Settings</button></section><section className="rounded-xl border border-border bg-card"><div className="border-b border-border p-4"><h2 className="font-serif text-lg font-semibold">Notifications</h2><p className="text-sm text-muted-foreground">All caught up!</p></div><div className="grid min-h-72 place-items-center p-8 text-center"><div><Bell className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-4 font-serif text-lg font-semibold">No notifications</h3><p className="mt-1 text-sm text-muted-foreground">You&apos;ll be notified about updates to your complaints</p></div></div></section></> : <section className="rounded-xl border border-border bg-card p-8 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground"><Icon className="h-7 w-7" /></span><p className="mt-4 font-serif text-lg font-semibold">Nothing to show yet</p><p className="mt-1 text-sm text-muted-foreground">New {content.title.toLowerCase()} activity will appear here.</p></section>}
    </div>
  )
}
