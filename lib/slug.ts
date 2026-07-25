export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

export async function uniqueSubdomain(
  base: string,
  exists: (subdomain: string) => Promise<boolean>,
): Promise<string> {
  const slug = slugify(base) || "tenant"
  let candidate = slug
  let counter = 1

  while (await exists(candidate)) {
    candidate = `${slug}-${counter}`
    counter += 1
  }

  return candidate
}
