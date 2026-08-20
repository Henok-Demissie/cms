"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, X } from "lucide-react"

import { ComplaintAddForm, type OrgOption } from "@/components/dashboard/complaint-add-form"
import { Button } from "@/components/ui/button"

type ComplaintFormSectionProps = {
  action: (formData: FormData) => Promise<void>
  organizations?: OrgOption[]
}

export function ComplaintFormSection({ action, organizations = [] }: ComplaintFormSectionProps) {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(searchParams.get("new") === "1")

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

      {open ? <ComplaintAddForm action={action} organizations={organizations} /> : null}
    </div>
  )
}
