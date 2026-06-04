<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import type { Content } from "@prismicio/client";
  import { PrismicImage, type SliceComponentProps } from "@prismicio/svelte";

  type Props = SliceComponentProps<Content.ImageRowSlice>;

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
            class="w-full h-full rounded-full scale-[92%] object-cover"
          />
        </div>
        <p class="body-3 text-center drop-shadow-sm">{item.label}</p>
      </div>
    {/each}
  </ContentWidth>
</section>
