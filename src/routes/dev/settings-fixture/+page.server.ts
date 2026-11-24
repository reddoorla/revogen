// A `settings` document for tests/content/settings-fallback.spec.ts (P1-120):
// the page's `settings` replaces the root layout's in page.data, so the
// layout's Nav and Footer render from this. `?filled` fills the fields the
// default leaves empty. Empty values have the shapes Prismic sends (null text,
// an "Any" link, an empty rich-text array). Behind the /dev guard, so no
// deployed site serves it.
import type { Settings } from "$lib/settings";
import type { RichTextField } from "@prismicio/client";

type Link = Settings["footer_links"][number]["link"];

const line = (text: string): RichTextField => [{ type: "paragraph", text, spans: [] }];
const web = (url: string): Link => ({ link_type: "Web", url });
const noLink: Link = { link_type: "Any" };

export function load({ url }) {
  // ?none: no settings document at all, as on the live site today.
  if (url.searchParams.has("none")) return { settings: null };
  const filled = url.searchParams.has("filled");
  const settings: Partial<Settings> = {
    // Empty by default: the footer must show the code's tagline.
    footer_tagline: filled ? "Fixture tagline" : null,
    // Filled: the footer must show these instead of the code's.
    copyright_name: "Fixture Biologics",
    address: line("1 Fixture Way\nTestville"),
    footer_links: [
      { label: line("fixture link"), link: web("https://example.com/fixture"), is_sub_item: false },
      // No label, or no link: skipped, never rendered as an empty link.
      { label: [], link: web("https://example.com/x"), is_sub_item: false },
      { label: line("no link"), link: noLink, is_sub_item: false },
    ],
    // Empty by default: the nav must show the code's menu.
    nav_items: filled
      ? [
          {
            label: line("Fixture menu item"),
            link: { link_type: "Web", url: "https://example.com/menu", target: "_blank" },
            column: "right",
            is_sub_item: true,
          },
        ]
      : [],
  };

  return { settings };
}
