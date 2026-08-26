import { Label } from "@/components/ui/label"

export type OrgOption = {
  id: string
  name: string
  subdomain: string
  sector?: string
}

/**
 * Target-organization picker shared by the complaint, suggestion and feedback
 * submission popovers. Renders nothing when the customer has no organization to
 * choose from — the server actions fall back to the first non-public tenant.
 */
export function OrganizationSelect({
  organizations,
  label = "Target organization",
}: {
  organizations: OrgOption[]
  label?: string
}) {
  if (organizations.length === 0) return null

  return (
    <div className="space-y-1.5">
      <Label htmlFor="tenantId">{label}</Label>
      <select
        id="tenantId"
        name="tenantId"
        required
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">— Choose an organization —</option>
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
            {org.sector ? ` (${org.sector})` : ""}
          </option>
        ))}
      </select>
    </div>
  )
}
