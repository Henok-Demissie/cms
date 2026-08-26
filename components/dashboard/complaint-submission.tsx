import { submitComplaint } from "@/app/dashboard/complaints/actions"
import { OrganizationSelect, type OrgOption } from "@/components/dashboard/organization-select"
import { SubmissionPopover } from "@/components/dashboard/submission-popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * Complaint form in a centred overlay. Rendered from the Complaint Center header
 * and empty state, and from My Complaints — so no page has to navigate somewhere
 * else just to open the form.
 */
export function ComplaintSubmission({
  triggerLabel,
  organizations,
}: {
  triggerLabel: string
  organizations: OrgOption[]
}) {
  return (
    <SubmissionPopover
      triggerLabel={triggerLabel}
      title="Submit a complaint"
      description="Tell us what happened. Staff at the organization you pick will review your complaint and reply here."
      submitLabel="Submit complaint"
      successMessage="Complaint submitted"
      action={submitComplaint}
    >
      <OrganizationSelect organizations={organizations} label="Select organization / company" />
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
          rows={4}
          required
        />
      </div>
    </SubmissionPopover>
  )
}
