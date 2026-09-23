import { PageHeader } from "@/components/brand/page-header"
import { SettingsPanels } from "@/components/settings/settings-panels"

export default function SettingsPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <PageHeader title="Settings" subtitle="Preferences, security, and support" />
      <SettingsPanels />
    </div>
  )
}
