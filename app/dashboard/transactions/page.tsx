import { PageHeader } from "@/components/brand/page-header"
import { TransactionsList } from "@/components/transactions/transactions-list"

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Transactions" subtitle="Your complete transaction history" />
      <TransactionsList />
    </div>
  )
}
