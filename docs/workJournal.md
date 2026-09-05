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
