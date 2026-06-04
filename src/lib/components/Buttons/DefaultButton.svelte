<script lang="ts">
  import type { Snippet } from "svelte";
  import DelayedLink from "../DelayedLink.svelte";
    interface ButtonProps {
   href?: string;
   onclick?: (event: MouseEvent ) => void;
   class?: string;
   children?: Snippet;
   [key: string]: unknown;
 }
    let { href = "", onclick = () => {}, class:passedClasses = '', children = undefined, ..._others } : ButtonProps = $props();

    const baseClasses = "rounded-sm border-[1px] border-solid border-white text-white px-[10px] py-2 uppercase transition hover:text-black hover:bg-white active:bg-white/50"

</script>

<div class="bump w-fit my-2 default-button">
    {#if href}
        <DelayedLink 
            {href} 
            {onclick} 
            class="{baseClasses} {passedClasses}">
                {@render children?.()}
        </DelayedLink>
    {:else}
    <button {onclick}
            class="{baseClasses} {passedClasses}">
            {@render children?.()}
    </button>
    {/if}
</div>