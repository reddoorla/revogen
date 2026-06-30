# Lighthouse baseline & real-page CI gate — 2026-06-30

## Why this exists

Before today, **nothing in CI ran Lighthouse**. The shared `reddoorla/.github` reusable
workflow does lint → `svelte-check` → `pnpm build` → `reddoor-maint audit --only a11y`
(an axe-core gate that only scans `/dev/a11y-fixtures`) → optional tests. The repo's
`lighthouserc.json` (`extends @reddoorla/maintenance/configs/lighthouse`) was **dead config** —
no job executed it. Any performance number on the Netlify dashboard came from Netlify's
own UI-enabled Lighthouse plugin, not from anything version-controlled or gating.

This change adds a **real, codified Lighthouse gate** in CI:

- **`.github/workflows/ci.yml`** (`lighthouse` job) — builds the site and runs LHCI
  (`lighthouserc.real.json`, Lighthouse 12, mobile, median of 3) against the home + a
  representative product page on the exact PR build, deterministically, and **fails the PR
  check** on a per-route regression. No wait on the Netlify deploy. Confirmed passing in real
  CI on the PR that introduced it.

### Why not a Netlify-side gate too

We evaluated `@netlify/plugin-lighthouse` in `netlify.toml` and **dropped it**. On this deploy
it did not run (the deploy finished in ~build time and wrote no report), and even working it
was the wrong tool: it pins **Lighthouse 9** (2022-era scoring — different metric weights from
the LH12 gate above, so the two would disagree), pulls in `puppeteer`/Chromium (heavy per
deploy), and doesn't reliably auto-install under pnpm. It would be a heavier, inconsistent,
**redundant** second gate. To block regressions from reaching production, make the GitHub
`lighthouse (real pages)` check a **required status check** on `main` (branch protection) —
then a regression can't merge, so it never deploys.

## Measured baseline

Production build, Lighthouse 12.6.x. Desktop = `--preset=desktop`; mobile = default
(simulated slow-4G + 4× CPU, which is what the Netlify dashboard reports).

| Route                         | Form factor | perf      | a11y | best-practices | seo |
| ----------------------------- | ----------- | --------- | ---- | -------------- | --- |
| `/` (home)                    | desktop     | 99        | 98   | 77             | 92  |
| `/` (home)                    | **mobile**  | **63–64** | 98   | **77**         | 92  |
| `/surgical-grafts/allografts` | desktop     | 99        | 100  | 77             | 92  |
| `/surgical-grafts/allografts` | **mobile**  | **96**    | 100  | **77**         | 92  |
| `/` (home) — **live deploy**  | mobile      | **63**    | 98   | 77             | 92  |

Local and live agree (home mobile ≈ 63). A dashboard reading of "84" was most likely an
aggregate across pages (home 63 + product/content pages in the 90s) or an older/luckier run.

## What actually drives the numbers

- **Home mobile perf (63) is a paint-timing problem, not main-thread.** FCP ≈ 4.9s,
  LCP ≈ 7.2s, but **TBT only ~20ms and CLS 0**. The ~7s LCP tracks the **IntroAnimation
  overlay** (its `setTimeout` reveal is ~6.5–7s, wall-clock, so it's machine-independent and
  reproducible). This means the "pause Rive off-screen" idea from the code review would _not_
  move this score — TBT is already tiny. The lever is the intro reveal / LCP element, not JS.
- **Product pages are healthy (mobile 96).** Image optimization (#22) and the a11y work (#23)
  show — a11y is 98–100.
- **best-practices = 77 on every page** is two structural items: `third-party-cookies`
  (embeds, e.g. Vimeo) and `inspector-issues`. Neither is a quick win, so the gate floor is
  set below it rather than at the fleet 0.90.

## Gate thresholds (per route, mobile)

Calibrated as **regression floors that pass today**, with headroom for run-to-run /
cross-runner variance — not aspirational targets. Defined in `lighthouserc.real.json`.

| Route                         | perf     | a11y | best-practices | seo  |
| ----------------------------- | -------- | ---- | -------------- | ---- |
| `/` (home)                    | **0.55** | 0.95 | 0.70           | 0.90 |
| `/surgical-grafts/allografts` | **0.85** | 0.95 | 0.70           | 0.90 |

Validated locally with `lhci autorun` (median of 3) — all assertions pass against the
current build.

## The two real improvement targets

The gate protects the floor; these are the things to actually _raise_:

1. **Home mobile perf (63 → ~85).** Attack the intro-animation-driven LCP: shorten or skip
   the intro on repeat visits (cookie/localStorage), render the LCP hero _before/behind_ the
   overlay so it paints early, and add `fetchpriority="high"` to the LCP image. Then ratchet
   the home `performance` floor up toward 0.80–0.85.
2. **best-practices (77 → 90).** Address `third-party-cookies` (lazy-load / facade the Vimeo
   embed so it only loads on interaction) and resolve the logged `inspector-issues`. Then
   raise the `best-practices` floor to 0.90.

## How to change the gate

- **Add a route:** add its prerendered path to `lighthouserc.real.json` `collect.url` **and**
  a matching `assertMatrix` entry.
- **Ratchet a floor up:** bump the `minScore` in the route's `assertMatrix` entry in
  `lighthouserc.real.json`.
- The sync-managed `lighthouserc.json` (fleet a11y-fixtures config) is left untouched on
  purpose; `reddoor-maint sync-configs` owns it.
