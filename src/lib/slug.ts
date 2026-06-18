export function slugify(input: string): string {
  const base = (input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "") // strip combining diacritical marks (é -> e)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "post";
}
