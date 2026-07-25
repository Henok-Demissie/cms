"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const sources = [
  { value: "PHONE", label: "Phone" },
  { value: "EMAIL", label: "Email" },
  { value: "WEB", label: "Web form" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "OTHER", label: "Other" },
] as const

const priorities = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
] as const

const statuses = [
  { value: "NEW", label: "New" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const

type ComplaintAddFormProps = {
  action: (formData: FormData) => Promise<void>
}

export function ComplaintAddForm({ action }: ComplaintAddFormProps) {
  const [source, setSource] = useState("PHONE")
  const [priority, setPriority] = useState("MEDIUM")
  const [status, setStatus] = useState("NEW")

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <h2 className="text-base font-semibold">Add a new complaint</h2>
        <p className="text-xs text-muted-foreground">
          Capture details from any incoming channel and route it into the queue.
        </p>
      </div>

      <div className="space-y-1.5 md:col-span-3">
        <Label htmlFor="title">Complaint title</Label>
        <Input id="title" name="title" placeholder="Delayed delivery refund" required />
      </div>

      <div className="space-y-1.5">
        <Label>Source</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-full" size="sm">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="source" value={source} />
      </div>

      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-full" size="sm">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="priority" value={priority} />
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full" size="sm">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={status} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerName">Customer name</Label>
        <Input id="customerName" name="customerName" placeholder="Alicia Brooks" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerPhone">Phone number</Label>
        <Input id="customerPhone" name="customerPhone" placeholder="+1 555 123 4567" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerEmail">Email</Label>
        <Input id="customerEmail" name="customerEmail" type="email" placeholder="customer@example.com" />
      </div>

      <div className="space-y-1.5 md:col-span-3">
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

      <div className="md:col-span-3 flex justify-end">
        <Button type="submit" size="sm">
          Save complaint
        </Button>
      </div>
    </form>
  )
}
