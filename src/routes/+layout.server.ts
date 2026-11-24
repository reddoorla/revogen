import type { LayoutServerLoad } from "./$types";
import { building } from "$app/env";
import { createClient } from "$lib/prismicio";
import { loadSettings } from "$lib/settings";

export const prerender = "auto";

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
  // An active Prismic preview session is signalled by this cookie: editors who
  // arrive via a Prismic preview link have it set, normal visitors never do. We
  // only mount the Prismic toolbar for previewers (the toolbar sets ~21
  // third-party cookies that otherwise hit every visitor and fail Lighthouse).
  const isPreviewSession = !!cookies.get("io.prismic.preview");

  // Site-wide words and menus (the `settings` singleton); null renders the
  // code's own wording everywhere.
  const settings = await loadSettings(createClient({ fetch, cookies }), building);

  return {
    isPreviewSession,
    settings,
  };
};
