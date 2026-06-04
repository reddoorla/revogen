<script lang="ts">
  import { SliceZone } from "@prismicio/svelte";
  import { components } from "$lib/slices/index.js";
  import { defaultGradientColor } from "$lib/stores/gradientTheme.js";
  import { onMount } from "svelte";
  import { distributorData } from "$lib/stores/distributorData.js";

  let { data } = $props();
  let viewportWidth = $state(1024);

  let content = $derived(data.page.data);

  $effect(() => {
    if (content?.default_background) {
      defaultGradientColor(content.default_background);
    }
  });

  onMount(() => distributorData.set(data.distributorCategories));
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#key data}
  <SliceZone slices={content.slices} {components} />
{/key}
