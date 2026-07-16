// Single source of truth for the site's canonical origin (apex, no trailing
// slash, no `www`). Import this anywhere a canonical absolute URL is needed —
// the sitemap, and any future canonical/og/JSON-LD tags — so the origin can
// never drift between them. The repo had no such constant before; it now lives
// here rather than being re-hardcoded per route.
export const SITE_URL = "https://revogen.com";
