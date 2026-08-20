import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type OrgOption = {
  id: string
  name: string
  subdomain: string
  sector?: string
}

type ComplaintAddFormProps = {
  action: (formData: FormData) => Promise<void>
  organizations?: OrgOption[]
}

export function ComplaintAddForm({ action, organizations = [] }: ComplaintAddFormProps) {
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold">Submit a complaint</h2>
        <p className="text-xs text-muted-foreground">
          Tell us what happened. Select the target organization and our staff will review your case and reply here.
        </p>
      </div>

      {organizations.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="tenantId">Select Organization / Company</Label>
          <select
            id="tenantId"
            name="tenantId"
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">-- Choose an Organization --</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} {org.sector ? `(${org.sector})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="title">Complaint title</Label>
        <Input id="title" name="title" placeholder="e.g. Delayed service / payment issue" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the complaint in detail"
          rows={3}
          className="min-h-16"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Submit complaint
        </Button>
      </div>
    </form>
  )
}
