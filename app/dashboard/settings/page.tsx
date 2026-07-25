import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="text-2xl font-semibold">Workspace settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure your dashboard preferences and tenant options here.
        </p>
      </div>
    </div>
  )
}
