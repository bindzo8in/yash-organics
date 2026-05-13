/**
 * Generates a URL for a Cloudinary image
 * Since we store the full secure_url, this just returns the input
 * This file is safe to import in client components
 */
export function getImageUrl(urlOrId: string) {
  if (!urlOrId) return "";
  return urlOrId;
}
