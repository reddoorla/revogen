<script lang="ts">
  // Shared product spec table for the TwoCol `imageTableText` and `tableText`
  // variations. Renders an ARIA table (role="table"/row/columnheader/cell) so
  // screen readers get row/column association, while keeping the existing flex
  // layout (column widths + whitespace-nowrap on size cells) intact.
  interface ProductRow {
    description?: string | null;
    size_one?: string | null;
    size_two?: string | null;
    product_number?: string | null;
  }

  let {
    products = [],
    tableColumn = null,
    colOneLabel = null,
    colTwoLabel = null,
    colThreeLabel = null,
    lastColLabel = null,
    ariaLabel = "Product specifications",
    class: passedClass = "",
  }: {
    products: ProductRow[];
    tableColumn?: string | null;
    colOneLabel?: string | null;
    colTwoLabel?: string | null;
    colThreeLabel?: string | null;
    lastColLabel?: string | null;
    ariaLabel?: string;
    class?: string;
  } = $props();

  const noSizes = $derived(tableColumn === "desc & #, no sizes");
  const twoSizes = $derived(tableColumn === "desc and two sizes and #");
  const descWidth = $derived(noSizes ? "w-2/3" : "w-1/3");
</script>

<!--
  Roles intentionally turn this flex layout into an accessible table. Svelte's
  a11y linter flags `columnheader`/`cell` as "interactive" roles on a <p>, which
  is a false positive for table roles — hence the per-element svelte-ignore.
-->
<div class="w-full flex flex-col gap-2 {passedClass}" role="table" aria-label={ariaLabel}>
  <div role="row" class="w-full flex flex-row border-b border-white pb-2">
    <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
    <p role="columnheader" class="uppercase {descWidth}">{colOneLabel || "description"}</p>
    {#if !noSizes}
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <p role="columnheader" class="uppercase w-1/5">{colTwoLabel || "size"}</p>
    {/if}
    {#if twoSizes}
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <p role="columnheader" class="uppercase w-1/5">{colThreeLabel || "size"}</p>
    {/if}
    <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
    <p role="columnheader" class="uppercase w-1/3 ml-auto">{lastColLabel || "part number"}</p>
  </div>
  {#each products as product, productIndex (productIndex)}
    <div role="row" class="w-full flex flex-row">
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <p role="cell" class="{descWidth} pr-4">{product.description}</p>
      {#if !noSizes}
        <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
        <p role="cell" class="w-1/5 pr-2 md:pr-4 whitespace-nowrap">{product.size_one}</p>
      {/if}
      {#if twoSizes}
        <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
        <p role="cell" class="w-1/5 pr-2 md:pr-4 whitespace-nowrap">{product.size_two}</p>
      {/if}
      <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
      <p role="cell" class="w-1/3 ml-auto">{product.product_number}</p>
    </div>
  {/each}
</div>
