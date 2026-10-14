<script lang="ts">
  import { asLinkAttrs } from "@prismicio/client";
  import type { RichTextComponentProps } from "@prismicio/svelte";
  import { linkTargetAttrs } from "$lib/links";

  const { node, children }: RichTextComponentProps = $props();

  const field = $derived(node.type === "hyperlink" ? node.data : undefined);
  const base = $derived(asLinkAttrs(field));
  const targetAttrs = $derived(linkTargetAttrs(base.href, field));
</script>

<a href={base.href} target={targetAttrs.target ?? base.target} rel={targetAttrs.rel ?? base.rel}
  >{@render children()}</a
>
