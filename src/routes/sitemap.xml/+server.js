import { createClient } from "$lib/prismicio";
// Import the canonical origin from a single source of truth so the sitemap
// stays in lockstep with any future canonical/og/JSON-LD tags. Never re-hardcode
// the origin here — duplicating it is how a stale-`www` drift bug crept into a
// sibling site's sitemap.
import { SITE_URL } from "$lib/site";

// Prerendered alongside the rest of the site, so it's a static file Netlify serves.
export const prerender = true;

// Prismic document type -> public path. Keep in sync with the `routes` resolver
// in src/lib/prismicio.js and the route folders under
// src/routes/[[preview=preview]]/. Types not listed here (e.g. the
// `resource_hub_category` supporting type, which has no standalone page) are
// intentionally excluded.
/** @type {Record<string, (uid: string) => string>} */
const TYPE_PATHS = {
  page: (uid) => (uid === "home" ? "/" : `/${uid}`),
  surgical_grafts: (uid) => `/surgical-grafts/${uid}`,
};

export async function GET({ fetch }) {
  const client = createClient({ fetch });
  const docs = await client.dangerouslyGetAll().catch(() => []);

  const urls = [];
  for (const doc of docs) {
    const build = TYPE_PATHS[doc.type];
    if (!build || !doc.uid) continue;
    const loc = SITE_URL + build(doc.uid);
    const lastmod = doc.last_publication_date?.slice(0, 10);
    urls.push(
      `\t<url>\n\t\t<loc>${loc}</loc>${lastmod ? `\n\t\t<lastmod>${lastmod}</lastmod>` : ""}\n\t</url>`,
    );
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
