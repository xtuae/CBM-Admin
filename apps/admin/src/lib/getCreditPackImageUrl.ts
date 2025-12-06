const PLACEHOLDER_PACK_IMAGE = "/images/default-pack.png";
const PLACEHOLDER_CATEGORY_IMAGE = "/images/default-category.png";

/**
 * Returns a safe image URL for a credit pack.
 * If the given URL is falsy or invalid, falls back to the local placeholder.
 */
export function getCreditPackImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return PLACEHOLDER_PACK_IMAGE;
  }
  return url;
}

/**
 * Returns a safe image URL for a category.
 * If the given URL is falsy or invalid, falls back to the local placeholder.
 */
export function getCategoryIconUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return PLACEHOLDER_CATEGORY_IMAGE;
  }
  return url;
}
