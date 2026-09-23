"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { topUpWallet } from "@/app/actions/wallet"

export function DepositDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [pending, startTransition] = useTransition()

  const submit = () => {
    const value = Number(amount)
    if (!value || value <= 0) {
      toast.error("Enter an amount to add.")
      return
    }
    startTransition(async () => {
      const res = await topUpWallet()
      if (res.ok) {
        toast.success(res.message)
        setAmount("")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-deep font-bold text-brand-lime hover:bg-brand-deep/90">
          <Plus /> Top up wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top up wallet</DialogTitle>
          <DialogDescription>Add funds to your DataSell wallet to pay for bundles instantly.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="topup-amt">Amount</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>GHS</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="topup-amt"
              inputMode="decimal"
              placeholder="50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </InputGroup>
          <FieldDescription>Enter any positive amount in Ghana cedis.</FieldDescription>
          <ButtonGroup>
            {[10, 20, 50, 100].map((v) => (
              <Button key={v} type="button" variant="outline" size="sm" onClick={() => setAmount(String(v))}>
                {v}
              </Button>
            ))}
          </ButtonGroup>
        </Field>
        <DialogFooter>
          <Button
            className="brand-gradient brand-glow font-bold text-brand-deep hover:opacity-90"
            disabled={pending}
            onClick={submit}
          >
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "Adding…" : "Add funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
