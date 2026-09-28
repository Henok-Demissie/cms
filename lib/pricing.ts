import "server-only"
import { getPackages, type IdataNetwork, type IdataPackage } from "@/lib/idatagh"

/**
 * Retail markup applied to iDataGH agent (cost) prices.
 * costPrice = what we pay iDataGH. customerPrice = what the customer pays us.
 * Margin = customerPrice - costPrice.
 *
 * Percentage markup with a minimum absolute margin so tiny bundles still profit.
 */
const MARKUP_PERCENT = 0.15 // 15%
const MIN_MARGIN_GHS = 0.5

export interface RetailPackage {
  packageId: number
  label: string
  dataSize: number
  costPrice: number
  customerPrice: number
}

export function applyMarkup(costPrice: number): number {
  const withPercent = costPrice * (1 + MARKUP_PERCENT)
  const withFloor = Math.max(withPercent, costPrice + MIN_MARGIN_GHS)
  // Round up to the nearest 0.05 GHS for clean pricing.
  return Math.ceil(withFloor * 20) / 20
}

function toRetail(pkg: IdataPackage): RetailPackage {
  return {
    packageId: pkg.package_id,
    label: String(pkg.label),
    dataSize: pkg.data_size,
    costPrice: pkg.price,
    customerPrice: applyMarkup(pkg.price),
  }
}

const STANDARD_TELECEL_PACKAGES: IdataPackage[] = [
  { package_id: 201, label: "1", data_size: 1, price: 4.5 },
  { package_id: 202, label: "2", data_size: 2, price: 9.0 },
  { package_id: 205, label: "5", data_size: 5, price: 21.5 },
  { package_id: 210, label: "10", data_size: 10, price: 41.0 },
  { package_id: 215, label: "15", data_size: 15, price: 60.0 },
  { package_id: 220, label: "20", data_size: 20, price: 78.0 },
]

export async function getRetailPackages(network: IdataNetwork): Promise<RetailPackage[]> {
  if (network === "telecel") {
    // Check both "telecel" and "vodafone" to capture all wholesale packages
    const [telecelRes, vodaRes] = await Promise.all([
      getPackages("telecel").catch(() => null),
      getPackages("vodafone" as IdataNetwork).catch(() => null),
    ])

    const livePackages = [
      ...(telecelRes?.packages || []),
      ...(vodaRes?.packages || []),
    ]

    // Create a map of bundles by data_size, seeded with standard bundles
    const sizeMap = new Map<number, IdataPackage>()
    for (const std of STANDARD_TELECEL_PACKAGES) {
      sizeMap.set(std.data_size, std)
    }
    // Overwrite with live packages from provider if available
    for (const live of livePackages) {
      if (live && live.data_size) {
        sizeMap.set(live.data_size, live)
      }
    }

    return Array.from(sizeMap.values())
      .map(toRetail)
      .sort((a, b) => a.dataSize - b.dataSize)
  }

  const res = await getPackages(network)
  return (res.packages || []).map(toRetail).sort((a, b) => a.dataSize - b.dataSize)
}

/** Look up a single package by its label for the given network (used at order time). */
export async function findRetailPackage(
  network: IdataNetwork,
  label: string,
): Promise<RetailPackage | null> {
  const packages = await getRetailPackages(network)
  return packages.find((p) => p.label === String(label)) ?? null
}
