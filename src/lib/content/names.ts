// Naming rules for blog categories and tags. Safe to import from client components.

export const TAG_MAX_LENGTH = 40;

/** Stable identifier for a category: "Heart health" becomes "heart-health". */
export function categorySlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Tags are stored in lower case with single spaces, so "Blood Pressure " and "blood pressure" are one tag. */
export function normaliseTag(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
