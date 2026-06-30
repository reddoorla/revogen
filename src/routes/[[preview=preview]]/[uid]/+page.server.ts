import { error } from "@sveltejs/kit";

import { createClient } from "$lib/prismicio";

export async function load({ params, fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  let page;
  try {
    page = await client.getByUID("page", params.uid);
  } catch {
    throw error(404, `Page "${params.uid}" not found`);
  }

  // The Distributor Resource Hub documents are intentionally NOT fetched here:
  // this route is prerendered, so anything returned would be baked into the
  // static HTML and readable without auth. They are served from the
  // authenticated /api/distributor endpoint instead.
  return {
    page,
    title: page.data.meta_title || "Revogen Biologics",
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image.url,
  };
}

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("page");

  return pages.map((page) => {
    return { uid: page.uid };
  });
}
