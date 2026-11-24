import { error } from "@sveltejs/kit";

import { createClient } from "$lib/prismicio";
import { SITE_NAME, titleFromUid } from "$lib/site";

export async function load({ params, fetch, cookies, parent }) {
  const client = createClient({ fetch, cookies });
  const parentData = parent();
  // Handled by the awaits below; this only stops Node calling it unhandled meanwhile.
  parentData.catch(() => {});

  let page;
  try {
    page = await client.getByUID("page", params.uid);
  } catch {
    const { settings } = await parentData;
    const message = settings?.not_found_message || 'Page "{page}" not found';
    throw error(
      404,
      message.replaceAll("{page}", () => params.uid),
    );
  }

  const [distributorCategories, { settings }] = await Promise.all([
    client.getAllByType("resource_hub_category"),
    parentData,
  ]);

  return {
    page,
    distributorCategories,
    title: page.data.meta_title || titleFromUid(page.uid, settings?.site_name || SITE_NAME),
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
