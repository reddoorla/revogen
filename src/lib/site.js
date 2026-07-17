// Single source of truth for the site's canonical origin (apex, no trailing
// slash, no `www`). Import this anywhere a canonical absolute URL is needed —
// the sitemap, and any future canonical/og/JSON-LD tags — so the origin can
// never drift between them. The repo had no such constant before; it now lives
// here rather than being re-hardcoded per route.
export const SITE_URL = "https://revogen.com";

// Canonical site name, used as the brand prefix in <title> fallbacks and as the
// last-resort tab title. Kept here so it can't drift between routes.
export const SITE_NAME = "Revogen Biologics";

/**
 * Build a unique, human-readable <title> fallback from a document's own UID
 * (e.g. "wound-care" -> "Revogen Biologics | Wound Care"). Used only when a
 * document has no `meta_title` set in Prismic, so pages never collapse to the
 * bare site name — which would make several page titles identical. Mirrors the
 * "Revogen Biologics | X" shape editors already use in Prismic meta_titles.
 *
 * @param {string | null | undefined} uid
 * @returns {string}
 */
export function titleFromUid(uid) {
  if (!uid) return SITE_NAME;
  const label = uid
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return label ? `${SITE_NAME} | ${label}` : SITE_NAME;
}
