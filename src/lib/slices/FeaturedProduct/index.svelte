<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import { isFilled } from "@prismicio/client";
  import type { Content } from "@prismicio/client";
  import { PrismicImage, type SliceComponentProps } from "@prismicio/svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  type Props = SliceComponentProps<Content.FeaturedProductSlice>;

  // Figma 5608:493 — a 1144px row: a 558×310 product shot and a 456px text
  // column. The band itself is transparent on purpose: in the comp the
  // blue-green gradient is sticky behind it, which on the live site is the
  // layout's fixed gradient. The static Figma render shows grey there only
  // because the canvas shows through once the sticky layer scrolls off.
  const WORDMARK_WIDTHS = [308, 616, 924];
  const PRODUCT_WIDTHS = [558, 828, 1116, 1674];

  const { slice }: Props = $props();

  // The wordmark is an image of the name, so the heading carries the name as
  // text for screen readers and the image itself is decorative.
  const name = $derived(slice.primary.product_name || slice.primary.wordmark.alt || "");
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="text-white py-16 md:py-[190px]"
>
  <ContentWidth>
    <div
      class="w-full max-w-[1144px] flex flex-col md:flex-row items-center md:items-start md:justify-between gap-10 md:gap-12"
    >
      {#if isFilled.image(slice.primary.image)}
        <div class="w-full md:w-[48.8%] aspect-[558/310] overflow-hidden rounded-md shrink-0">
          <!-- The comp crops this shot from the left (the image is 592px wide,
             right-aligned in the 558px box), so pin cover to the right edge. -->
          <PrismicImage
            field={slice.primary.image}
            sizes="(min-width: 1220px) 558px, (min-width: 768px) 49vw, 92vw"
            widths={cappedWidths(slice.primary.image, PRODUCT_WIDTHS)}
            loading="lazy"
            class="w-full h-full object-cover object-right"
          />
        </div>
      {/if}

      <div
        class="w-full md:w-[39.9%] flex flex-col gap-6 items-center text-center md:items-start md:text-left"
      >
        {#if slice.primary.eyebrow}
          <p class="eyebrow uppercase">{slice.primary.eyebrow}</p>
        {/if}

        {#if isFilled.image(slice.primary.wordmark)}
          <h2>
            {#if name}<span class="sr-only">{name}</span>{/if}
            <PrismicImage
              field={slice.primary.wordmark}
              alt=""
              sizes="308px"
              widths={cappedWidths(slice.primary.wordmark, WORDMARK_WIDTHS)}
              loading="lazy"
              class="w-[308px] max-w-full h-auto"
            />
          </h2>
        {:else if name}
          <h2>{name}</h2>
        {/if}

        {#if slice.primary.tagline}
          <p>{slice.primary.tagline}</p>
        {/if}

        {#if isFilled.link(slice.primary.button)}
          <!-- DefaultButton wraps itself in a my-2 div; cancel it so the comp's
             24px gap is the only space above the button. -->
          <div class="-my-2">
            <DefaultButton href={slice.primary.button.url}
              >{slice.primary.button.text || "Learn More"}</DefaultButton
            >
          </div>
        {/if}
      </div>
    </div>
  </ContentWidth>
</section>

<style>
  /* The comp's eyebrow is the H3 text style (20px, uppercase), but it is not a
     heading — the product name is. Mirror app.css's h3 sizes, mobile included. */
  .eyebrow {
    font-size: 20px;
    line-height: normal;
  }
  @media only screen and (max-width: 786px) {
    .eyebrow {
      font-size: 15px;
    }
  }
</style>
