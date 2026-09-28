# Revogen — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. The code says what the site does
now; this says what it used to do and what changing it cost.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 161 commits summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: a deliberately
coarse summary written from the commit log, not from memory. Detail below this
line is trustworthy; detail above it is not, and nothing here should be cited
as though someone wrote it down at the time. For anything before 2026-09-05 the
commit log is the record.

**What this repo is.** The marketing site for Revogen Biologics
(`revogen.com`) — a regenerative-biologics company with ocular, wound-care and
surgical-graft product lines, plus a password-gated distributor resource hub.
SvelteKit 2 / Svelte 5 / Tailwind v4 / Prismic on Netlify, built from Tucker's
own SvelteKit + Prismic starter rather than from `reddoor-starter`; the README
is still that starter's and describes the template, not this site.

**The eras.** 161 commits from 2025-08-08 to here, in three separated runs.
**Aug–Nov 2025 (71 commits)** is the original build, straight to `main` with
terse lowercase subjects — nav, footer, the first slices, the intro animation
and its timing, the distributor hub, before/after imagery, then Rive. Then
nothing from December through March. **Apr–May 2026 (7 commits)**: Rive text
editing and error handling, the preview toolbar. **Jun 2026 onward (83
commits)** is a different repo culturally — everything is a numbered PR. June
opens with onboarding onto `@reddoorla/maintenance` (shared configs, Node 24 +
pnpm 11, the reusable CI workflow), then a multi-agent code review on
2026-06-29 set the summer's agenda and most of it landed: 24 MB of raw home-page
PNGs replaced with a responsive pipeline (#22), `TwoCol`'s contact form and spec
table made real markup (#23), a real-page Lighthouse gate on PRs (#28), forms
moved off Netlify Forms to central ingest (#8), plus `/health`, a smoke suite,
`sitemap.xml` and GA4. July and August are mostly Renovate, with one content
event: **#63, the RevoGen takedown** — a client compliance request on 2026-08-07
to pull all product narrative copy while their language is rewritten for
approval. The category descriptions and hero headline turned out to be
hardcoded in components rather than in Prismic, so a content decision needed a
code change.

**One belief corrected on contact, two days old.** #69 put each product still
behind its Rive canvas as a fallback, assuming the canvas would paint over it.
Rive artboards are transparent outside their artwork and the canvas is 12px
taller than the still, so the still's baked-in labels ghosted through every
product Rive. #73 renders it only after `onLoadError`, verified by pixel diff
against a build of #69's parent — slice 1, 0 pixels changed.
`scripts/pixel-diff.mjs` is that harness, kept.

**State as of this entry.** `main` at `0f98204`, no open PRs. Three untracked
paths from other sessions — `docs/code-review-2026-06-29.md`,
`docs/morning-reports/`, `src/lib/utils/reducedMotion.ts` — were left exactly
as found.

**The distributor gate is a soft gate, and that is the design.** Recording it
here because it reads like a security defect to anyone auditing the code cold,
and it is not one — Tucker, 2026-09-05: _"the revogen password is a fake lock,
there's nothing actually sensitive behind it."_

Mechanically it offers no protection at all, in two independent ways.
`DistributorLogin/index.svelte:46` compares the entry against a literal compiled
into the CLIENT bundle, so it ships to every visitor; and `[uid]/+page.server.ts`
fetches every `resource_hub_category` document unconditionally into the SSR
payload, so the gated links are in page source whether or not anyone types
anything. Even a strong password checked server-side would not have hidden them,
given that second half.

Neither is worth fixing on its own terms. The gate signals "this is for
distributors" and filters the incurious; it was never asked to withstand
anybody. What would change that is the content behind it changing — pricing,
contracts, anything a competitor would want — and at that point BOTH halves need
doing together, because fixing the password alone buys nothing while the SSR
payload still carries the links.

An earlier version of this entry called this "June's critical finding is still
open" and prescribed rotating the credential. That was wrong about the intent,
and is left recorded rather than deleted: an auditor who finds a hardcoded
password in a public repo will reach the same conclusion, so the reason it is
not a defect belongs in writing.

## 2026-09-15 — AmnioArmor staged for removal in a Prismic release (content only, nothing merged)

Erik relayed Meaghan's request in `#revogen` to pull AmnioArmor from "the main
page and the distributor hub". It was never on the home page: it lived as the
second `two_col` (imageTableText) slice on the Wound Care page, as the
"AmnioArmor" header (four PDFs) in the Wound Care resource-hub category, and as
one video row in the Training category. All three are removed in the Prismic
release "Remove AmnioArmor" (`aqlqGxEAAIYcfVCh`), left unpublished for review.
No code changed; the nav and footer "Amnion Patches" links point at the
SurgiShield surgical page, not AmnioArmor, so they stay.

Two things found on the way. The Prismic MCP was not activated for this repo
until today, so content was inventoried through the public API with
`dangerouslyGetAll` (15 documents) and grepped as JSON — faster than the MCP
for "where does this string appear". And the defect behind Erik's screenshot:
on the Amnion Patches page, the Single Layer section's third row (4x8 cm,
RBA2012FD-S) is described as "Dual Layer". It is a one-field edit, held until
Meaghan confirms. The training video row removed had its own title in the URL
field, so it was already a dead link.

Later the same day: Meaghan confirmed single layer by email, so the RBA2012FD-S
row is fixed in its own release, "Amnion Patches single layer fix"
(`aqlsEBEAABgefVR1`), kept separate from the AmnioArmor release so either can
publish on its own. Neither is published from here.

## 2026-09-16 — Previewing a resource-hub category lands on the hub page (uncommitted)

Asked whether Prismic preview works. The site side was probed live rather than
assumed: `/api/preview` with no token 307s to `/preview/`; a bogus token 500s
(Prismic rejects it inside `resolvePreviewURL`, expected); `/preview/about`
renders dynamically. With a fake `io.prismic.preview` cookie the layout mounts
the toolbar (`static.cdn.prismic.io/prismic.js?repo=revogen`) and the page 404s,
because the `[uid]` loader turns the invalid ref into a 404 — an expired preview
will look the same. Not verified: a real token end to end, and whether the
repository's preview setting points at `https://revogen.com/api/preview`; both
need a logged-in editor.

The gap was `resource_hub_category`. It had no route, so its documents had
`url: null` and a category preview fell back to `/`, where the categories do
not render. They only appear through the `distributor_login` slice on the
`distributor-resource-hub` page, whose loader already fetches them with the
preview cookie. A static route `resource_hub_category → /distributor-resource-hub`
was added to the resolver; the live API accepted it and all four categories
(wound-care, training, ocular-grafts, surgical) now resolve there. The sitemap
is unaffected — it builds paths from its own `TYPE_PATHS`, not `doc.url` — and
the slice's `doc.url` links are file links inside a category, not links to
categories. The hub is still behind the cosmetic password, so the previewer
types it before seeing the draft.

## 2026-09-23 — FeaturedProduct slice for the homepage RevoGro block; RevoGro brochure back on Synthetics (branch `feat/featured-product-slice`)

Erik approved the RevoGro block in a Figma comment on the Refinement page
(2026-09-23 16:51 UTC): "approved to incorporate into the live site as is.
Should link to https://revogen.com/surgical-grafts/synthetics", plus a request
to reactivate the RevoGro brochure on Synthetics. That comment exists only in
Figma — the Discord thread stops at Nicole's 09-16 prototype link. On 09-16 Erik
had asked Nicole for a second version (packaging gradient, blue type); **no such
frame exists anywhere in the file.** The only RevoGro-named frame is
`5608:295` "Homepage - revogro", and the block is `5608:493` inside it, so "as
is" is the white-type block.

**The static render lies about the background.** `get_screenshot` shows the
block on flat grey. The block lives in a 1552px container (`5608:429`) whose
blue-green gradient is a `position: sticky` 860px layer, so in the prototype the
block scrolls up _over_ the gradient; the grey is the canvas showing once the
sticky layer has scrolled off in a static render. The live site already paints
a fixed animated gradient behind every slice (`+layout.svelte`), so the slice is
transparent. The operator confirmed this over a dark band.

The slice is generic (`featured_product`: eyebrow, product name, wordmark
image, tagline, button, product image) because Erik called it a "rotating
feature section": the next product is content, not code. The wordmark is an
image of a serif the site does not load, so it sits in the `<h2>` with
`alt=""` and the name as `sr-only` text. The comp crops the product shot from
the left (a 592px image right-aligned in a 558px box), hence `object-right`.
Measured on a production build with the mock spliced into the homepage locally
(never committed): image box x=148, 558×310; wordmark x=836, 308×79; band
690px against the comp's 692. Mobile stacks with centered text. White text on the
gradient's light top-right corner is low-contrast, the same as the product-row
labels above it. Not fixed here.

Assets came from Figma image fills at 4096px (transparent PNGs) and were
uploaded to Prismic media straight from Figma's signed S3 URLs:
`lIJV9i8VGvkq4vbf` (product) and `vAWxz-T1dfdMnaez` (wordmark). They were not
routed through a temp file host. `prismicio-types.d.ts` was extended by hand
in Slice Machine's shape because no codegen is installed. The model reaches
Prismic through `prismic-models` on merge, so **the homepage content (slice
between `home_page_anim` and `screen_width_video`) can only be added after
merge.**

Brochure: the Synthetics `two_col` had both buttons empty and a single
published version, so there was no history to restore from. There were two
RevoGro PDFs: `RevoGrow_Brochure_081424D.pdf` (2024, 4pp, which the distributor
hub links) and `Surgical-Synthetics-RevoGro_Brochure.pdf` (2026, 2pp). The
second belongs to a 2026 set of per-page website brochures
(`Surgical-Allograft_CancellX_Brochure.pdf`, and others), so that is the one
that went up, as a "Download Brochure" file link. It was published by release
`arQHAREAAMmKI4PW` and verified live at 17:17 UTC.

`tests/smoke/rive-fallback.spec.ts` "show the product still when the .riv fails
to load" is flaky **on main**: it failed 2 of 5 on a clean main worktree and 2
of 3 on this branch. It is not caused by this change.

## 2026-09-28 — RevoGro block: larger shot, image and text centred as one group (branch `claude/erik-featured-changes-o97v91`)

Erik, in the #revogen "Website" thread on 2026-09-24, marked up a screenshot of
the live block: "increase the size of the image a little bit and then make the
two things together be in the middle of the page", with "even on both sides"
written against the outer margins and a centre line drawn between image and
text. Nothing in the main #revogen channel after 09-16 mentions the block; the
request exists only in that thread.

**Why it looked off-centre.** The 09-23 slice was a 1144px row with
`justify-between` and a fixed 456px text column, and the row itself was centred.
But the text inside that column is only as wide as the 308px wordmark, so 148px
of the column was empty on the right. Measured on a production build at a
1792px viewport: image box 324–882, text 1012–1320, so the margins were 324 on
the left and 472 on the right. The product shot added to it: the PNG is
4096×2144 and fully transparent for its first 550px (13.4%), so the visible
syringe tip sat about 45px inside the box's left edge.

The text column now hugs its content (`w-fit`, still capped at 39.9%), and the
row centres the pair (`justify-center`, 96px gap from `lg`). The box went from
558×310 to 600×357. Under `object-cover` pinned right, that aspect crops about
12% from the left instead of 5.7%, so the transparent strip is almost entirely
cropped and the syringe tip is ~10px from the box edge. The visible product
grew from ~506px to ~582px wide (+15%), which is the "little bit". The pair is
now vertically centred against the taller image rather than top-aligned; Erik's
sketch draws the text box sitting within the image's height. After the change:
margins of 394/394 at 1792, 218/218 at 1440, 138/138 at 1280; at 1024 the image
shrinks to 538×320 and the pair fills the content width; below `md` it still
stacks.

The crop is tuned to this particular PNG. A future product in this "rotating"
slot whose shot has no transparent left margin would lose ~12% of its left side;
if that happens, the aspect should become a model field rather than a constant.

`pnpm check` and `pnpm lint` pass. The Playwright smoke/axe suite could not run
in the cloud container: the pinned Playwright wants chromium-1243, the image
ships 1194, and the environment forbids `playwright install`. So that suite is
unproven here and left to CI. Measurements came from a hand-driven Chromium
against `vite preview`, with Prismic images fetched through Node, because the
container's Chromium does not trust the egress proxy's CA.

## 2026-09-28 — Mobile pass: hero wordmark centred on the visible screen, scroll arrow out from under the toolbar, menu icon aligned (branch `claude/erik-featured-changes-o97v91`)

The operator reported that on iOS the homepage logo "appears too low". The
logo in question is the hero wordmark, not the nav logo. It was low for two
stacked reasons.

**`100vh` is the toolbar-collapsed height, and this site's toolbar never
collapses.** `body` and `main` were `height: 100vh`, and `main` is the scroller,
so the document itself does not scroll and neither iOS Safari nor Android
Chrome ever hides its toolbar. Everything sized in `vh` was laid out for a taller
screen than the one on show. The wordmark is centred in an `h-screen` overlay,
so it sat half the toolbar height below the visible centre: about 43px on an
iPhone 15 (Safari with the bottom bar: 659px visible, 745px `lvh`) and 28px on
Android Chrome (56px URL bar). On top of that, an empty `<h2><br /></h2>` was
left above the wordmark when the hero copy came down in August. It pushed the
wordmark a further ~25px down on phones and 36px on desktop. svelte-check had
been flagging it as an empty heading the whole time.

The hero's scroll arrow had the same cause with a worse result. It sits at 50%
of a section that is `100lvh` (sticky backdrop) plus `100vh` (text block), i.e.
96px above the bottom of the _large_ viewport, so on an iPhone with the toolbar
showing it was drawn at 649–713px on a 659px screen and was almost entirely
behind the toolbar. On Android it was half hidden.

Fix: `body`/`main` get `height: 100dvh` (with `100vh` kept as the fallback), the
intro overlay and the hero's text block use `h-dvh`, the arrow is anchored at
`top-[100dvh]` (identical to the old position on desktop, where the section is
200vh tall), and the empty `<h2>` is gone. The sticky backdrops stay on `lvh`
on purpose: a background that overshoots the screen is harmless and does not
resize as the toolbar moves.

Separately, the menu icon was 12px lower than the nav logo at every width,
desktop included. The lucide icons are `absolute` with no offsets inside a
`h-10` button, so their static position hangs from the button's vertical centre.
They are now `inset-0 m-auto` in a `relative` button.

Measured (wordmark vs visible centre, arrow, icon vs logo), main vs this branch,
each built clean. **The before side is only valid from a separate worktree
build.** A first attempt re-used a `vite preview` process whose `build/` had
been overwritten underneath it, and produced nonsense (the logo and icon 57px
apart, the wordmark 168px _high_).

|                                  | before                               | after            |
| -------------------------------- | ------------------------------------ | ---------------- |
| iPhone 15, 659 visible / 745 lvh | +68.5px, arrow 54px hidden, icon +12 | −0.5, visible, 0 |
| Pixel 7, 839 / 895               | +53.5, arrow 24px hidden, icon +12   | −0.5, visible, 0 |
| 360px Android, 684 / 740         | +54, arrow 24px hidden, icon +12     | 0, visible, 0    |
| desktop 1440×900                 | +36, arrow visible, icon +12         | −1, visible, 0   |

Chromium device emulation cannot show a toolbar (`vh`, `lvh` and `dvh` are all
equal there), so "before" was rendered at the `lvh` height and measured against
the `svh` region, while "after" was rendered at `svh`, since every element the
fix touches now sizes itself from `dvh`. This is still emulation, not a real
Safari or Chrome. The viewport pairs are published figures, not measured on a
device. Page `scrollHeight` was identical between the two builds on all 11
routes at 393 and 360px.

Seen on the pass and **not** changed here:

- The labels drawn inside the Rive product graphics (e.g. "Single Layer Amniotic
  Disc", "Clinical application: …") render at ~6–7px on phones. They are text in
  the `.riv` artboard, scaled by `Fit.Contain`, so fixing them means a mobile
  artboard or larger type in the Rive file, not CSS.
- The Sports Medicine Grafts block on `/surgical-grafts` has no image or Rive
  file attached in Prismic, so it shows a heading over empty space at every
  width. That is content.
- The homepage has an empty `rich_text` slice (no text, `max_width: full`) between
  the testimonial video and "Distribution Opportunities", which leaves a ~170px
  gap on phones. Also content.

## 2026-09-28 — Nav logo hidden on phones while the hero wordmark is showing (branch `claude/erik-featured-changes-o97v91`)

The operator asked for the nav logo to be hidden on mobile while the hero
"Revogen" is visible: on a phone the two wordmarks stacked on the first screen
read as a duplicate.

This is plain CSS, with no scroll or intersection listener:
`main:has([data-hero-wordmark]) a.nav-logo` goes to `opacity: 0;
visibility: hidden` below 768px (Tailwind's `md`), with a 300ms fade.
`visibility` rather than opacity alone means the hidden link also leaves the tab
order and the accessibility tree, instead of being an invisible focusable link.
The CSS rule is exact because of the geometry. The nav is `absolute` inside the
scrolling `main`, not fixed, so it scrolls away with the page. It is only on
screen for the first ~68px of scroll, and the wordmark sits near the middle of
the first screen, so whenever the nav logo could be seen, the wordmark is in
view too. A JS observer would have added a flash on hydration (the server
cannot know what is in view) and bought nothing. If the nav ever becomes
fixed or sticky, this has to become an observer.

The logo comes back while the menu is open (`menu-open` on the link), since the
menu overlay covers the hero. On other pages there is no `[data-hero-wordmark]`,
so it never hides there. Checked in a built preview: hidden at 393px and 767px
on the homepage, at top and scrolled 60px; visible at 768px and 1440px, with
the menu open, on `/about` and `/ocular`, and after navigating home → About
through the menu. `:has()` needs Safari 15.4 / Chrome 105; older browsers
just keep the logo.

The previous entry's table and emphasis were reformatted by Prettier (no
wording changed). `pnpm lint` had been run before that entry was written, so
it went up failing the format check.

## 2026-09-28 — The intro's pulsing logo, centred on the visible screen too (branch `claude/erik-featured-changes-o97v91`)

The operator, checking PR #88's deploy preview on an iPhone: "the transition
logo still looks low when loading into the homepage". That is the pulsing
logo in `IntroAnimation.svelte`, not `TransitionOverlay` (a plain colour wash
with no logo). The first entry today missed it. It moved the intro's outer
containers to `h-dvh`, but this logo is positioned inside the noise background
layer, which is `125vh` tall and starts at `-10vh`, and it sat at `top-1/2` of
that layer. So its centre was at 52.5% of the _large_ viewport. That is 2.5vh
low even where `vh` is honest (22px on a 900px desktop), and on a phone it
added half the toolbar on top.

Measured mid-animation (t = 2.5s): +61px below the visible centre on iPhone 15,
+50 on Pixel 7, +46 on a 360px Android, +22 on desktop. It was also 6–7px off
horizontally everywhere, because `-translate-x-3/5` and the layer's `-10vw`
don't cancel. It is now `left-[60vw] top-[calc(10vh+50dvh)]` with
`-translate-1/2` on both axes: the `10vh`/`10vw` undo the layer's offset, and
`50dvh` is the middle of what is actually on screen. After the change it is
0px off on both axes at all four sizes, the same centre the hero wordmark
settles on. The same emulation caveat as the first entry applies: "before"
was rendered at `lvh` and measured against `svh`, and "after" at `svh`. On a
real phone the two `10vh` terms still cancel exactly, because both resolve
against the same viewport.
