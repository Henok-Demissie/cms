export function mapProviderStatus(providerStatus: string): string {
  const s = providerStatus.toLowerCase()
  if (["completed", "success", "delivered"].includes(s)) return "delivered"
  if (["failed", "rejected", "cancelled", "refunded"].includes(s)) return "failed"
  return "processing"
}
