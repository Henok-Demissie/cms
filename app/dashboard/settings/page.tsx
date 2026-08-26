import type React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserCog } from "lucide-react"

import { AccountSetting } from "@/components/dashboard/account-setting"
import { AppearanceSetting } from "@/components/dashboard/appearance-setting"
import { LanguageSetting } from "@/components/dashboard/language-setting"
import { prisma } from "@/lib/prisma"
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "@/lib/languages"

function roleLabel(role: string) {
  if (role === "CUSTOMER") return "Customer"
  if (role === "ADMIN") return "Administrator"
  return "Agent"
}

type SettingsSectionProps = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}

function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-serif text-lg font-semibold leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const isCustomer = session.user.role === "CUSTOMER"

  const account = isCustomer
    ? await prisma.customer.findUnique({
        where: { id: session.user.id },
        select: { language: true },
      })
    : await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { language: true },
      })

  const storedLanguage = account?.language
  const language = isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE

  return (
    <div className="flex flex-1 flex-col gap-5 bg-background p-4 md:p-7">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Settings</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight">Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your language, switch between day and night mode, and manage your account.
        </p>
      </header>

      <div className="grid w-full max-w-3xl gap-4">
        {/* No "Language" / "Appearance" headings: the two language names and the
            night mode row are self-describing, and the page header above already
            says what this card is for. */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <LanguageSetting defaultValue={language} className="sm:max-w-sm" />
          <AppearanceSetting />
        </section>

        <SettingsSection icon={UserCog} title="Account" description="Your profile and session.">
          <AccountSetting
            userName={session.user.name}
            userEmail={session.user.email}
            userImage={session.user.image}
            roleLabel={roleLabel(session.user.role)}
          />
        </SettingsSection>
      </div>
    </div>
  )
}
