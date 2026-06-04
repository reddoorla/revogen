<script lang="ts">
  import logo from "$lib/assets/icons/logos/revogen_white.svg";
  import { fade } from "svelte/transition";
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import { browser } from "$app/environment";
  import DelayedLink from "./DelayedLink.svelte";

  let isNavModalOpen = $state(false);

  $effect(() => {
    if (browser && document.body) {
      document.body.style.overflowY = isNavModalOpen ? "hidden" : "auto";
    }
  });
</script>

{#if isNavModalOpen}
  <div class="fixed w-screen h-screen top-0 left-0 z-50" in:fade out:fade={{ delay: 200 }}>
    <div class="w-full h-full absolute -z-10 menu-background will-change-transform"></div>
    <ContentWidth class="my-20 md:my-48 md:px-24">
      <div class="h-0.5 bg-white w-full"></div>
      <div class="flex flex-col md:flex-row gap-6 md:gap-10 mt-10 text-white">
        <div class="w-full md:w-1/2 flex flex-col gap-6 md:gap-10 nav">
          <DelayedLink href="/about" class="bump w-fit" onclick={() => (isNavModalOpen = false)}>
            <h2 class="hover:text-white/80 transition duration-300 ease-out">About</h2>
          </DelayedLink>
          <DelayedLink
            href="/distribution-opportunities"
            class="bump w-fit"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">
              Distribution <br /> Opportunities
            </h2>
          </DelayedLink>
          <DelayedLink
            href="/distributor-resource-hub"
            class="bump w-fit"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">
              Distributor Resource Hub
            </h2>
          </DelayedLink>
        </div>
        <div class="w-full md:w-1/2 flex flex-col gap-6">
          <DelayedLink
            href="/surgical-grafts"
            class="bump w-fit"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">Surgical Grafts</h2>
          </DelayedLink>
          <DelayedLink
            href="/surgical-grafts/allografts"
            class="bump w-fit ml-8 md:ml-0"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out opacity-75">
              Allografts
            </h2>
          </DelayedLink>
          <DelayedLink
            href="/surgical-grafts/sports-medicine"
            class="bump w-fit ml-8 md:ml-0 opacity-75"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">
              Sports Medicine Grafts
            </h2>
          </DelayedLink>
          <DelayedLink
            href="/surgical-grafts/amnion-patches"
            class="bump w-fit ml-8 md:ml-0 opacity-75"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">Amnion Patches</h2>
          </DelayedLink>
          <DelayedLink
            href="/surgical-grafts/synthetics"
            class="bump w-fit ml-8 md:ml-0 opacity-75"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">Synthetics</h2>
          </DelayedLink>
          <DelayedLink
            href="/wound-care"
            class="bump w-fit"
            onclick={() => (isNavModalOpen = false)}
          >
            <h2 class="hover:text-white/80 transition duration-300 ease-out">Wound Care Grafts</h2>
          </DelayedLink>
          <DelayedLink href="/ocular" class="bump w-fit" onclick={() => (isNavModalOpen = false)}>
            <h2 class="hover:text-white/80 transition duration-300 ease-out">Ocular Grafts</h2>
          </DelayedLink>
        </div>
      </div>
    </ContentWidth>
  </div>
{/if}
<div class="absolute top-0 left-0 w-screen z-50">
  <ContentWidth class="h-24 flex flex-row justify-between items-center">
    <DelayedLink href="/" class="bump" onclick={() => (isNavModalOpen = false)}>
      <img
        src={logo}
        class="h-10 drop-shadow hover:opacity-90 transition duration-300"
        alt="revogen logo"
      />
    </DelayedLink>
    <button
      onclick={() => {
        isNavModalOpen = !isNavModalOpen;
      }}
      aria-label="toggle menu"
      class="bump h-10 w-10"
    >
      <i
        class="absolute fa-sharp fa-bars drop-shadow text-white hover:text-white/85 fa-2xl transition duration-200 {!isNavModalOpen
          ? ''
          : 'opacity-0'}"
      ></i>
      <i
        class="absolute scale-125 fa-sharp fa-regular fa-close drop-shadow text-white hover:text-white/85 fa-2xl transition duration-200 {isNavModalOpen
          ? ''
          : 'opacity-0'}"
      ></i>
    </button>
  </ContentWidth>
</div>

<style>
  .menu-background {
    background: radial-gradient(
      290.67% 131.61% at 97.4% 4.48%,
      #b7d3ee 0%,
      #95b7e1 8%,
      #0e69b2 40.38%,
      #243c7b 72.6%,
      #0d1987 100%
    );
    animation: pulse 8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.4);
    }
    50% {
      transform: scale(1);
    }
    75% {
      transform: scale(1.1);
    }
  }

  @media only screen and (max-width: 786px) {
    h2 {
      font-size: 15px;
    }
  }
</style>
