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

export async function getRetailPackages(network: IdataNetwork): Promise<RetailPackage[]> {
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
