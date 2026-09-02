<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import type { Content } from "@prismicio/client";
  import { PrismicImage, type SliceComponentProps } from "@prismicio/svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  type Props = SliceComponentProps<Content.ImageRowSlice>;

  // These avatars render in a fixed 176px circle (w-44), but Prismic's smallest
  // default candidate is 640w — so even a 1x display downloaded an image 3.6x
  // wider than the box. Offer 1x/2x/3x of the real slot instead; cappedWidths
  // still trims anything wider than the source.
  const AVATAR_WIDTHS = [176, 352, 528];

  const { slice }: Props = $props();
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  style="padding-top:{parseInt(slice.primary.vertical_padding) * 4}px;padding-bottom:{parseInt(
    slice.primary.vertical_padding,
  ) * 4}px;"
  class="text-white"
>
  <ContentWidth class="flex flex-wrap justify-center gap-6 md:gap-12">
    {#each slice.primary.images as item, i (i)}
      <div class="flex flex-col gap-2 items-center justify-center">
        <div class="w-44 h-44 border-[1px] rounded-full border-white drop-shadow-sm">
          <PrismicImage
            field={item.image}
            sizes="176px"
            widths={cappedWidths(item.image, AVATAR_WIDTHS)}
            loading="lazy"
            class="w-full h-full rounded-full scale-[92%] object-cover"
          />
        </div>
        <p class="body-3 text-center drop-shadow-sm">{item.label}</p>
      </div>
    {/each}
  </ContentWidth>
</section>
