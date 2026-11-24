import { createClient } from "$lib/prismicio";
import { SITE_NAME, titleFromUid } from "$lib/site";

export async function load({ params, fetch, cookies, parent }) {
  const client = createClient({ fetch, cookies });
  const { settings } = await parent();

  const page = await client.getByUID("surgical_grafts", params.uid);

  return {
    page,
    title: page.data.meta_title || titleFromUid(page.uid, settings?.site_name || SITE_NAME),
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image.url,
  };
}

export async function entries() {
  const client = createClient();

  const pages = await client.getAllByType("surgical_grafts");
  return pages.map((page) => {
    return { uid: page.uid };
  });
}
