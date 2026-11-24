// A `settings` document for tests/content/settings-fallback.spec.ts (P1-120):
// the page's `settings` replaces the root layout's in page.data, so the
// layout's Nav and Footer render from this. Behind the /dev guard, so no
// deployed site serves it.
import type { Settings } from "$lib/settings";

const empty = { type: "paragraph" as const, text: "", spans: [] };
const line = (text: string) => [{ type: "paragraph" as const, text, spans: [] }];

export function load() {
  const settings = {
    // Empty on purpose: the footer must show the code's tagline.
    footer_tagline: "",
    // Filled: the footer must show these instead of the code's.
    copyright_name: "Fixture Biologics",
    address: line("1 Fixture Way\nTestville"),
    footer_links: [
      {
        label: line("fixture link"),
        link: { link_type: "Web", url: "https://example.com/fixture" },
        is_sub_item: false,
      },
      // No label: skipped, never rendered as an empty link.
      {
        label: [empty],
        link: { link_type: "Web", url: "https://example.com/x" },
        is_sub_item: false,
      },
    ],
    // Empty group: the nav must show the code's menu.
    nav_items: [],
  } as unknown as Settings;

  return { settings };
}
