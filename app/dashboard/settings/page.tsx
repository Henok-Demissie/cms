import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 md:p-4">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your dashboard preferences and tenant options here.
        </p>
      </div>
    </div>
  )
}
