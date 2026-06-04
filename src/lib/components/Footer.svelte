<script lang="ts">
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import DelayedLink from "./DelayedLink.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import script from "$lib/assets/icons/logos/Revogen Script-w.svg";
  import { quadOut } from "svelte/easing";

  let showScript = $state(false);
  let footerElement: HTMLElement;

  const handleScroll = () => {
    if (!footerElement) {
      console.log("no footer");
      return;
    }

    const rect = footerElement.getBoundingClientRect();

    showScript = rect.bottom < window.innerHeight * 1.2;
  };

  onMount(() => {
    document.getElementsByTagName("main")[0].addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => {
      document.getElementsByTagName("main")[0].removeEventListener("scroll", handleScroll);
    };
  });
</script>

<section class="relative overflow-hidden" bind:this={footerElement}>
  <ContentWidth
    class="flex flex-col md:flex-row justify-between text-white footer relative border-t-[2px] border-white mt-20 mb-5"
  >
    <div class="flex flex-col justify-stretch mt-4 pb-4">
      <h4 class="">Revolutionizing Bioregeneration</h4>
      <div class="hidden md:block copywright mt-auto">
        {"© " + new Date().getFullYear() + " RevoGen Biologics®. All Rights Reserved."}
      </div>
    </div>
    <div class="flex flex-col gap-6 my-6 footer">
      <DelayedLink href="/about" class="hover:opacity-85 transition-opacity duration-300 uppercase "
        >About</DelayedLink
      >
      <DelayedLink
        href="/distribution-opportunities"
        class="hover:opacity-85 transition-opacity duration-300 uppercase "
        >distribution<br />opportunities</DelayedLink
      >
      <DelayedLink
        href="/distributor-resource-hub"
        class="hover:opacity-85 transition-opacity duration-300 uppercase "
        >distributor resource hub</DelayedLink
      >
      <DelayedLink
        href="/ocular"
        class="hover:opacity-85 transition-opacity duration-300 uppercase "
        >ocular grafts</DelayedLink
      >
      <DelayedLink
        href="/wound-care"
        class="hover:opacity-85 transition-opacity duration-300 uppercase "
        >wound care grafts</DelayedLink
      >
      <DelayedLink
        href="/surgical-grafts/"
        class="hover:opacity-85 transition-opacity duration-300 uppercase "
        >surgical grafts</DelayedLink
      >
      <DelayedLink
        href="/surgical-grafts/allografts"
        class="ml-5 hover:opacity-85 transition-opacity duration-300 uppercase "
        >allografts</DelayedLink
      >
      <DelayedLink
        href="/surgical-grafts/sports-medicine"
        class="ml-5 hover:opacity-85 transition-opacity duration-300 uppercase "
        >sports medicine grafts</DelayedLink
      >
      <DelayedLink
        href="/surgical-grafts/amnion-patches"
        class="ml-5 hover:opacity-85 transition-opacity duration-300 uppercase "
        >amnion patches</DelayedLink
      >
      <DelayedLink
        href="/surgical-grafts/synthetics"
        class="ml-5 hover:opacity-85 transition-opacity duration-300 uppercase "
        >synthetics</DelayedLink
      >
      <div class="h-0.5 w-full bg-white rounded-full"></div>
      <div class="leading-normal">
        4903 Golden Quail,<br />
        Suite 120<br />
        San Antonio, TX 78240 <br />
        <a
          href="mailto:sales@revogen.com"
          class="underline hover:opacity-85 transition-opacity duration-300">sales@revogen.com</a
        ><br />
        <a
          href="tel:210.607.4037"
          class="underline hover:opacity-85 transition-opacity duration-300">210.607.4037</a
        ><br />
        <a
          href="https://www.linkedin.com/company/revogen-biologics"
          class="underline hover:opacity-85 transition-opacity duration-300">LinkedIn</a
        >
      </div>
    </div>
    <div class="md:hidden block copywright mt-6">
      {"© " + new Date().getFullYear() + " RevoGen Biologics®"}<br />All Rights Reserved
    </div>
  </ContentWidth>
  {#if showScript}
    <img
      src={script}
      alt="revogen script"
      class="w-2/3 absolute bottom-0 left-4 opacity-10 translate-y-1/6 -translate-x-[6%]"
      transition:fly={{ y: 100, duration: 1200, opacity: 0, easing: quadOut }}
    />
  {/if}
</section>
