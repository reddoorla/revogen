<script lang="ts">
  import logo from "$lib/assets/icons/logos/revogen_white.svg";
  import { fade } from "svelte/transition";
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import { browser } from "$app/env";
  import DelayedLink from "./DelayedLink.svelte";
  import { Menu, X } from "@lucide/svelte";

  import { page } from "$app/state";
  import { menuFromGroup } from "$lib/settings";

  // Today's menu, shown when `settings.nav_items` is empty (P1-120).
  const NAV_ITEMS_FALLBACK = [
    { lines: ["About"], href: "/about", column: "left", is_sub_item: false },
    {
      lines: ["Distribution ", " Opportunities"],
      href: "/distribution-opportunities",
      column: "left",
      is_sub_item: false,
    },
    {
      lines: ["Distributor Resource Hub"],
      href: "/distributor-resource-hub",
      column: "left",
      is_sub_item: false,
    },
    { lines: ["Surgical Grafts"], href: "/surgical-grafts", column: "right", is_sub_item: false },
    {
      lines: ["Allografts"],
      href: "/surgical-grafts/allografts",
      column: "right",
      is_sub_item: true,
    },
    {
      lines: ["Sports Medicine Grafts"],
      href: "/surgical-grafts/sports-medicine",
      column: "right",
      is_sub_item: true,
    },
    {
      lines: ["Amnion Patches"],
      href: "/surgical-grafts/amnion-patches",
      column: "right",
      is_sub_item: true,
    },
    {
      lines: ["Synthetics"],
      href: "/surgical-grafts/synthetics",
      column: "right",
      is_sub_item: true,
    },
    { lines: ["Wound Care Grafts"], href: "/wound-care", column: "right", is_sub_item: false },
    { lines: ["Ocular Grafts"], href: "/ocular", column: "right", is_sub_item: false },
  ];

  const settings = $derived(page.data.settings);
  const navItems = $derived(menuFromGroup(settings?.nav_items));
  const items = $derived(navItems.length > 0 ? navItems : NAV_ITEMS_FALLBACK);
  const leftItems = $derived(items.filter((item) => item.column !== "right"));
  const rightItems = $derived(items.filter((item) => item.column === "right"));

  let isNavModalOpen = $state(false);

  $effect(() => {
    if (browser && document.body) {
      document.body.style.overflowY = isNavModalOpen ? "hidden" : "auto";
    }
  });
</script>

{#snippet navLink(item: { lines: string[]; href: string; is_sub_item: boolean })}
  <DelayedLink
    href={item.href}
    class="bump w-fit{item.is_sub_item ? ' ml-8 md:ml-0 opacity-75' : ''}"
    onclick={() => (isNavModalOpen = false)}
  >
    <h2 class="hover:text-white/80 transition duration-300 ease-out">
      {#each item.lines as line, j (j)}{#if j > 0}<br />{/if}{line}{/each}
    </h2>
  </DelayedLink>
{/snippet}

{#if isNavModalOpen}
  <div class="fixed w-screen h-screen top-0 left-0 z-50" in:fade out:fade={{ delay: 200 }}>
    <div class="w-full h-full absolute -z-10 menu-background will-change-transform"></div>
    <ContentWidth class="my-20 md:my-48 md:px-24">
      <div class="h-0.5 bg-white w-full"></div>
      <div class="flex flex-col md:flex-row gap-6 md:gap-10 mt-10 text-white">
        <div class="w-full md:w-1/2 flex flex-col gap-6 md:gap-10 nav">
          {#each leftItems as item, i (i)}{@render navLink(item)}{/each}
        </div>
        <div class="w-full md:w-1/2 flex flex-col gap-6">
          {#each rightItems as item, i (i)}{@render navLink(item)}{/each}
        </div>
      </div>
    </ContentWidth>
  </div>
{/if}
<div class="absolute top-0 left-0 w-screen z-50">
  <ContentWidth class="h-24 flex flex-row justify-between items-center">
    <DelayedLink href="/" class="bump nav-logo" onclick={() => (isNavModalOpen = false)}>
      <img
        src={settings?.logo?.url || logo}
        class="h-10 drop-shadow hover:opacity-90 transition duration-300"
        alt={settings?.logo_alt || settings?.logo?.alt || "RevoGen Biologics"}
      />
    </DelayedLink>
    <button
      onclick={() => {
        isNavModalOpen = !isNavModalOpen;
      }}
      aria-label={settings?.menu_toggle_label || "toggle menu"}
      aria-expanded={isNavModalOpen}
      class="bump relative h-10 w-10"
    >
      <Menu
        class="absolute inset-0 m-auto size-[2em] drop-shadow text-white hover:text-white/85 transition duration-200 {!isNavModalOpen
          ? ''
          : 'opacity-0'}"
        strokeWidth={2}
      />
      <X
        class="absolute inset-0 m-auto size-[2em] scale-125 drop-shadow text-white hover:text-white/85 transition duration-200 {isNavModalOpen
          ? ''
          : 'opacity-0'}"
        strokeWidth={1.75}
      />
    </button>
  </ContentWidth>
</div>

<style>
  :global(a.nav-logo) {
    transition: transform 200ms ease-out;
  }

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
