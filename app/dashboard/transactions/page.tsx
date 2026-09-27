import { PageHeader } from "@/components/brand/page-header"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { getMyTransactions } from "@/app/actions/orders"

export const dynamic = "force-dynamic"

export default async function TransactionsPage() {
  // Real transactions from the DB for this user only
  const txns = await getMyTransactions()
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Transactions" subtitle="Your complete transaction history" />
      <TransactionsList transactions={txns} />
    </div>
  )
}
