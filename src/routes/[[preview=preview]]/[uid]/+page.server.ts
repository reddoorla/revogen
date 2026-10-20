import { error } from "@sveltejs/kit";

import { createClient } from "$lib/prismicio";
import { titleFromUid } from "$lib/site";

export async function load({ params, fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  let page;
  try {
    page = await client.getByUID("page", params.uid);
  } catch {
    throw error(404, `Page "${params.uid}" not found`);
  }

  const distributorCategories = await client.getAllByType("resource_hub_category");

  return {
    page,
    distributorCategories,
    title: page.data.meta_title || titleFromUid(page.uid),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image.url,
  };
}

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("page");

  // src/routes/contact owns /contact (a redirect to the distributor form). A
  // page with that uid would otherwise fail every prerender with a static-route
  // clash.
  return pages
    .filter((page) => page.uid !== "contact")
    .map((page) => {
      return { uid: page.uid };
    });
}
