import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ComplaintAddFormProps = {
  action: (formData: FormData) => Promise<void>
}

export function ComplaintAddForm({ action }: ComplaintAddFormProps) {
  return (
    <form action={action} className="grid gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-base font-semibold">Submit a complaint</h2>
        <p className="text-xs text-muted-foreground">
          Tell us what happened. Our staff will review your case and reply here.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Complaint title</Label>
        <Input id="title" name="title" placeholder="Delayed delivery refund" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the complaint in detail"
          rows={2}
          className="min-h-16"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm">
          Save complaint
        </Button>
      </div>
    </form>
  )
}
