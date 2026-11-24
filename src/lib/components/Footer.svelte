<script lang="ts">
  import ContentWidth from "./ContentWidth/ContentWidth.svelte";
  import DelayedLink from "./DelayedLink.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
  import script from "$lib/assets/icons/logos/Revogen Script-w.svg";
  import { quadOut } from "svelte/easing";

  import { page } from "$app/state";
  import { menuFromGroup, textLines, linkHref, type MenuEntry } from "$lib/settings";

  // Today's footer, shown when its `settings` field is empty (P1-120).
  const FOOTER_LINKS_FALLBACK: MenuEntry[] = [
    { lines: ["About"], href: "/about", is_sub_item: false },
    {
      lines: ["distribution", "opportunities"],
      href: "/distribution-opportunities",
      is_sub_item: false,
    },
    {
      lines: ["distributor resource hub"],
      href: "/distributor-resource-hub",
      is_sub_item: false,
    },
    { lines: ["ocular grafts"], href: "/ocular", is_sub_item: false },
    { lines: ["wound care grafts"], href: "/wound-care", is_sub_item: false },
    { lines: ["surgical grafts"], href: "/surgical-grafts/", is_sub_item: false },
    {
      lines: ["allografts"],
      href: "/surgical-grafts/allografts",
      is_sub_item: true,
    },
    {
      lines: ["sports medicine grafts"],
      href: "/surgical-grafts/sports-medicine",
      is_sub_item: true,
    },
    {
      lines: ["amnion patches"],
      href: "/surgical-grafts/amnion-patches",
      is_sub_item: true,
    },
    {
      lines: ["synthetics"],
      href: "/surgical-grafts/synthetics",
      is_sub_item: true,
    },
  ];
  const ADDRESS_FALLBACK = ["4903 Golden Quail,", "Suite 120", "San Antonio, TX 78240"];

  const settings = $derived(page.data.settings);
  const footerLinks = $derived(menuFromGroup(settings?.footer_links));
  const links = $derived(footerLinks.length > 0 ? footerLinks : FOOTER_LINKS_FALLBACK);
  const addressLines = $derived(textLines(settings?.address));
  const address = $derived(addressLines.length > 0 ? addressLines : ADDRESS_FALLBACK);
  const email = $derived(settings?.email || "sales@revogen.com");
  const phone = $derived(settings?.phone || "210.607.4037");
  const linkedinHref = $derived(
    linkHref(settings?.linkedin_url) || "https://www.linkedin.com/company/revogen-biologics",
  );
  // A name ending in a period ("…, Inc.") must not become "Inc.. All".
  const company = $derived((settings?.copyright_name || "RevoGen Biologics").replace(/\.$/, ""));
  const rights = $derived(settings?.rights_text || "All Rights Reserved");

  let showScript = $state(false);
  let footerElement: HTMLElement;

  const handleScroll = () => {
    if (!footerElement) {
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

<footer class="relative overflow-hidden" bind:this={footerElement}>
  <ContentWidth
    class="flex flex-col md:flex-row justify-between text-white footer relative border-t-[2px] border-white mt-20 mb-5"
  >
    <div class="flex flex-col justify-stretch mt-4 pb-4">
      <h4 class="">{settings?.footer_tagline || "Revolutionizing Bioregeneration"}</h4>
      <div class="hidden md:block copywright mt-auto">
        {"© " + new Date().getFullYear() + " " + company + ". " + rights.replace(/\.$/, "") + "."}
      </div>
    </div>
    <div class="flex flex-col gap-6 my-6 footer">
      {#each links as link, i (i)}
        <DelayedLink
          href={link.href}
          field={link.field}
          class="{link.is_sub_item
            ? 'ml-5 '
            : ''}hover:opacity-85 transition-opacity duration-300 uppercase "
        >
          {#each link.lines as line, j (j)}{#if j > 0}<br />{/if}{line}{/each}
        </DelayedLink>
      {/each}
      <div class="h-0.5 w-full bg-white rounded-full"></div>
      <div class="leading-normal">
        {#each address as line, i (i)}{line}<br />{/each}
        <a
          href="mailto:{email}"
          class="underline hover:opacity-85 transition-opacity duration-300 inline-block py-1"
        >
          {email}
        </a><br />
        <a
          href="tel:{phone}"
          class="underline hover:opacity-85 transition-opacity duration-300 inline-block py-1"
        >
          {phone}
        </a><br />
        <a
          href={linkedinHref}
          class="underline hover:opacity-85 transition-opacity duration-300 inline-block py-1"
        >
          {settings?.linkedin_label || "LinkedIn"}
        </a>
      </div>
    </div>
    <div class="md:hidden block copywright mt-6">
      {"© " + new Date().getFullYear() + " " + company}<br />{rights}
    </div>
  </ContentWidth>
  {#if showScript}
    <img
      src={script}
      alt=""
      aria-hidden="true"
      class="w-2/3 absolute bottom-0 left-4 opacity-10 translate-y-1/6 -translate-x-[6%]"
      transition:fly={{ y: 100, duration: 1200, opacity: 0, easing: quadOut }}
    />
  {/if}
</footer>
