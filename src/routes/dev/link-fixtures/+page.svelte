<script lang="ts">
  import type { RichTextField } from "@prismicio/client";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import RichText from "$lib/components/RichText/RichText.svelte";
  import * as fixtures from "../../../../tests/links/fixtures";

  const cases = Object.entries(fixtures);

  const richText = cases.map(([, field]) => {
    const text = "text" in field ? String(field.text) : "";
    return {
      type: "paragraph",
      text,
      spans: [{ type: "hyperlink", start: 0, end: text.length, data: field }],
    };
  }) as unknown as RichTextField;
</script>

<svelte:head>
  <title>link fixtures — Reddoor</title>
</svelte:head>

<main class="min-h-screen bg-black p-8 text-white">
  <h1>Link fixtures</h1>
  <section data-testid="buttons">
    {#each cases as [name, field] (name)}
      <div data-case={name}>
        <DefaultButton href={"url" in field ? field.url : ""} {field}>{name}</DefaultButton>
      </div>
    {/each}
  </section>
  <section data-testid="rich-text">
    <RichText field={richText} />
  </section>
</main>
