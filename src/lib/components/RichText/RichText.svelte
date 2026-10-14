<script lang="ts">
  import type { RichTextField } from "@prismicio/client";
  import { PrismicRichText, type RichTextComponents } from "@prismicio/svelte";
  import Hyperlink from "./Hyperlink.svelte";

  const { field, components = {} }: { field: RichTextField; components?: RichTextComponents } =
    $props();
</script>

<PrismicRichText {field} components={{ hyperlink: Hyperlink, ...components }} />
