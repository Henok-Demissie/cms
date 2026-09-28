export function mapProviderStatus(providerStatus: string): string {
  const s = providerStatus.toLowerCase().trim()
  // All known iDataGH/Tera "success" status strings
  if (
    [
      "completed",
      "complete",
      "success",
      "successful",
      "delivered",
      "sent",
      "active",
      "paid",
      "confirmed",
      "approved",
      "processed",
      "fulfilled",
      "done",
    ].includes(s)
  )
    return "delivered"

  // All known failure strings
  if (
    [
      "failed",
      "failure",
      "rejected",
      "cancelled",
      "canceled",
      "refunded",
      "error",
      "declined",
      "expired",
    ].includes(s)
  )
    return "failed"

  return "processing"
}
