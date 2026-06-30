<script lang="ts">
  import type { Snippet } from "svelte";
  import DelayedLink from "../DelayedLink.svelte";
  interface ButtonProps {
    href?: string;
    onclick?: (event: MouseEvent) => void;
    class?: string;
    disabled?: boolean;
    children?: Snippet;
    [key: string]: unknown;
  }
  let {
    href = "",
    onclick = () => {},
    class: passedClasses = "",
    disabled = false,
    children = undefined,
    ..._others
  }: ButtonProps = $props();

  // Guard the handler for both branches (an anchor ignores the native `disabled`
  // attribute, so the JS guard is what actually blocks a disabled link/button).
  function handleClick(event: MouseEvent) {
    if (disabled) return;
    onclick(event);
  }

  const baseClasses =
    "rounded-sm border-[1px] border-solid border-white text-white px-[10px] py-2 uppercase transition hover:text-black hover:bg-white active:bg-white/50";
  const disabledClasses =
    "disabled:opacity-60 disabled:cursor-not-allowed aria-disabled:opacity-60";
</script>

<div class="bump w-fit my-2 default-button">
  {#if href}
    <DelayedLink
      {href}
      onclick={handleClick}
      class="{baseClasses} {disabledClasses} {passedClasses}"
    >
      {@render children?.()}
    </DelayedLink>
  {:else}
    <button
      onclick={handleClick}
      {disabled}
      class="{baseClasses} {disabledClasses} {passedClasses}"
      {..._others}
    >
      {@render children?.()}
    </button>
  {/if}
</div>
