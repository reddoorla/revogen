<script lang="ts">
    import { afterNavigate } from "$app/navigation";
    import { fade } from "svelte/transition";
    import { isTransitioning } from "$lib/stores/isTransitioning";

    afterNavigate(()=>{
        isTransitioning.set(false)
    })


</script>
{#if $isTransitioning}
    <div class="h-screen w-screen fixed z-50 bg-light-blue top-0 left-0" transition:fade={{duration:300}}></div>
{/if}
