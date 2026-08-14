"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

import { ComplaintAddForm } from "@/components/dashboard/complaint-add-form"
import { Button } from "@/components/ui/button"

type ComplaintFormSectionProps = {
  action: (formData: FormData) => Promise<void>
}

export function ComplaintFormSection({ action }: ComplaintFormSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant={open ? "outline" : "default"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <>
              <X className="size-3.5" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              Add complaint
            </>
          )}
        </Button>
      </div>

      {open ? <ComplaintAddForm action={action} /> : null}
    </div>
  )
}
