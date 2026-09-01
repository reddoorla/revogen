import type { ImageField } from "@prismicio/client";

/**
 * The srcset widths `<PrismicImage>` emits by default. Prismic offers every one
 * of these regardless of how big the source asset actually is, so a small image
 * ends up advertising candidates far wider than it.
 */
const DEFAULT_WIDTHS = [640, 828, 1200, 2048, 3840];

/**
 * Build a srcset width list that never exceeds the image's own pixel width.
 *
 * Without this, a 558x471 photo still advertises a 3840w candidate — and because
 * the site sets `sizes`/`100vw`, browsers on wide or retina screens genuinely
 * pick it. Prismic (imgix) then has to upscale ~7x on demand. Those variants are
 * always a cache MISS, are expensive to generate, and are the ones that show up
 * slow or failed in production while the same image's smaller variants are fine.
 * Capping at the native width keeps the visual result identical — upscaling adds
 * no detail — while removing the expensive transforms entirely.
 *
 * @param field - The Prismic image field being rendered.
 * @param widths - Candidate widths to filter; defaults to Prismic's own list.
 * @returns Widths no larger than the source, always including its native width.
 */
export function cappedWidths(
  field: ImageField | null | undefined,
  widths: number[] = DEFAULT_WIDTHS,
): number[] {
  const native = field?.dimensions?.width;
  if (!native) return widths;

  // Source is at least as wide as every candidate, so nothing upscales — leave
  // the list alone. Appending the native width here would *add* a candidate
  // wider than any we offered before, making large images heavier, not lighter.
  if (native >= Math.max(...widths)) return widths;

  return [...widths.filter((w) => w < native), native];
}
