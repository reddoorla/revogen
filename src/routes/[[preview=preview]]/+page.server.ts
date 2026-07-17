import { createClient } from "$lib/prismicio";
import { SITE_NAME } from "$lib/site";

export async function load({ fetch, cookies }) {
  const client = createClient({ fetch, cookies });

  const page = await client.getByUID("page", "home");

  return {
    page,
    title: page.data.meta_title || SITE_NAME,
    meta_description: page.data.meta_description,
    meta_title: page.data.meta_title,
    meta_image: page.data.meta_image.url,
  };
}

export function entries() {
  return [{}];
}
