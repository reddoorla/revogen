// Single source of truth for the site's canonical origin (apex, no trailing
// slash, no `www`). Import this anywhere a canonical absolute URL is needed —
// the sitemap, and any future canonical/og/JSON-LD tags — so the origin can
// never drift between them. The repo had no such constant before; it now lives
// here rather than being re-hardcoded per route.
export const SITE_URL = "https://revogen.com";

// Canonical site name, used as the brand prefix in <title> fallbacks and as the
// last-resort tab title. Kept here so it can't drift between routes. The
// `settings` document's site_name wins over it (P1-120); this is the fallback.
export const SITE_NAME = "RevoGen Biologics";

/**
 * Build a unique, human-readable <title> fallback from a document's own UID
 * (e.g. "wound-care" -> "RevoGen Biologics | Wound Care"). Used only when a
 * document has no `meta_title` set in Prismic, so pages never collapse to the
 * bare site name — which would make several page titles identical. Mirrors the
 * "RevoGen Biologics | X" shape editors already use in Prismic meta_titles.
 *
 * @param {string | null | undefined} uid
 * @param {string} siteName the brand prefix: the `settings` document's
 *   site_name, or SITE_NAME when that is empty
 * @returns {string}
 */
export function titleFromUid(uid, siteName) {
  if (!uid) return siteName;
  const label = uid
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return label ? `${siteName} | ${label}` : siteName;
}
