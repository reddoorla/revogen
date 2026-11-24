<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import type { Content } from "@prismicio/client";
  import type { SliceComponentProps } from "@prismicio/svelte";
  import { gradientTheme, defaultGradientTheme } from "$lib/stores/gradientTheme";
  import surgical from "$lib/assets/images/surgical.png?as=run";
  import ocular from "$lib/assets/images/ocular.png?as=run";
  import woundCare from "$lib/assets/images/woundCare.png?as=run";
  import surgicalBefore from "$lib/assets/images/surgical-before.png?as=run";
  import ocularBefore from "$lib/assets/images/ocular-before.png?as=run";
  import woundCareBefore from "$lib/assets/images/wound-before.png?as=run";
  import Img from "@zerodevx/svelte-img";
  import { fade, slide } from "svelte/transition";
  import DelayedLink from "$lib/components/DelayedLink.svelte";
  import { onMount } from "svelte";
  import * as rive from "@rive-app/canvas";
  import puttyRive from "$lib/assets/rive/RevgroPutty.riv";
  import { ChevronRight, Plus } from "@lucide/svelte";
  import { isFilled, type ImageField, type LinkField } from "@prismicio/client";
  import { PrismicImage } from "@prismicio/svelte";
  import { linkHref } from "$lib/settings";

  type Props = SliceComponentProps<Content.HomePageAnimSlice>;

  let viewportWidth = $state(1024);
  let puttyCanvas: HTMLCanvasElement | undefined = $state();
  let riveInstance: rive.Rive | null = null;

  const { slice }: Props = $props();

  type CardImage = { field: ImageField; alt: string } | { src: typeof surgical; alt: string };
  type Card = {
    title: string;
    pitch: string;
    href: string;
    link?: LinkField;
    image: CardImage;
    hover: CardImage;
  };

  // Each position keeps the classes it had when the cards were written out by
  // hand; a fourth card takes the third's.
  const CARD_STYLES = [
    {
      off: "opacity-10 brightness-0 invert",
      ease: "ease-out",
      hover: " transition duration-700 ease-out absolute top-1/2 left-1/2 -translate-1/2",
    },
    {
      off: "brightness-0 invert opacity-10",
      ease: "ease-fast-slow",
      hover: "absolute top-1/2 left-1/2 -translate-1/2",
    },
    {
      off: "brightness-0 invert opacity-10",
      ease: "ease-fast-slow",
      hover: "absolute top-1/2 left-1/2 -translate-1/2",
    },
  ];

  const prismicCards: Card[] = $derived(
    (slice.primary.cards ?? [])
      // A card needs a title, a link and an image; a half-filled row is skipped.
      .filter(
        (card) =>
          isFilled.keyText(card.title) && linkHref(card.link) !== "" && isFilled.image(card.image),
      )
      .map((card) => ({
        title: card.title ?? "",
        pitch: card.pitch ?? "",
        href: linkHref(card.link),
        link: card.link,
        // The media library's alt wins; otherwise the card's title, as the code's alts were.
        image: { field: card.image, alt: card.image.alt || (card.title ?? "").toLowerCase() },
        hover: { field: card.hover_image, alt: "" },
      })),
  );
  // Today's three cards are the fallback when the slice's `cards` group is empty (P1-120).
  const cards: Card[] = $derived(
    prismicCards.length > 0
      ? prismicCards
      : [
          {
            title: "Surgical Grafts",
            pitch: "Empowering Surgeons with Advanced Allograft Solutions.",
            href: "/surgical-grafts",
            image: { src: surgical, alt: "surgical grafts" },
            hover: { src: surgicalBefore, alt: "" },
          },
          {
            title: "Wound Care Grafts",
            pitch: "Acute or Chronic Wound Covering",
            href: "/wound-care",
            image: { src: woundCare, alt: "wound care grafts" },
            hover: { src: woundCareBefore, alt: "" },
          },
          {
            title: "Ocular Grafts",
            pitch: "Easy to Apply. Multiple Indications.",
            href: "/ocular",
            image: { src: ocular, alt: "ocular grafts" },
            hover: { src: ocularBefore, alt: "" },
          },
        ],
  );

  // Preload images on mount
  onMount(() => {
    if (puttyCanvas)
      riveInstance = new rive.Rive({
        src: puttyRive,
        canvas: puttyCanvas || document.getElementById("puttycanvas"),
        autoplay: false,
        stateMachines: "State Machine 1",
        onLoad: () => {
          riveInstance?.resizeDrawingSurfaceToCanvas();
        },
      });

    const handleResize = () => {
      riveInstance?.resizeDrawingSurfaceToCanvas();
    };

    window.addEventListener("resize", handleResize);

    // Intersection Observer to detect when canvas is fully in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 1) {
            // Fully in viewport
            riveInstance?.play();
          } else {
            // Not fully in viewport
            riveInstance?.pause();
          }
        });
      },
      {
        threshold: 1.0, // Trigger when 100% of the element is visible
      },
    );

    if (puttyCanvas) {
      observer.observe(puttyCanvas);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      riveInstance?.cleanup();
    };
  });
</script>

{#snippet cardImage(image: CardImage, className: string)}
  {#if "field" in image}
    {#if isFilled.image(image.field)}
      <PrismicImage
        field={image.field}
        alt={image.alt as ""}
        sizes="(min-width: 768px) 25vw, 70vw"
        class={className}
      />
    {/if}
  {:else}
    <Img src={image.src} alt={image.alt} sizes="(min-width: 768px) 25vw, 70vw" class={className} />
  {/if}
{/snippet}

<svelte:window bind:innerWidth={viewportWidth} />

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="min-h-screen w-screen py-8 md:py-0 relative"
>
  <ContentWidth
    class="h-full min-h-screen flex flex-col gap-12 md:gap-0 md:flex-row items-center justify-evenly text-white"
  >
    {#each cards as card, i (i)}
      {@const style = CARD_STYLES[Math.min(i, CARD_STYLES.length - 1)]}
      {@const theme = Math.min(i, CARD_STYLES.length - 1) + 1}
      {@const open = viewportWidth < 768 || $gradientTheme === theme}
      <DelayedLink
        class="hover:cursor-pointer md:w-1/4 flex flex-col items-center justify-center"
        onmouseenter={() => gradientTheme.set(theme)}
        onmouseleave={() => gradientTheme.set($defaultGradientTheme)}
        href={card.href}
        field={card.link}
      >
        <div class="relative w-full aspect-square">
          {@render cardImage(
            card.image,
            (open ? "" : style.off) +
              " transition duration-700 " +
              style.ease +
              " absolute top-1/2 left-1/2 -translate-1/2",
          )}
          {@render cardImage(card.hover, style.hover)}
        </div>
        <h4>{card.title}</h4>
        {#if open && card.pitch}
          <p transition:slide class="text-center mt-4">{card.pitch}</p>
        {/if}
        <div
          class="w-8 h-8 border-[1.5px] border-white rounded-full relative mt-4 hover:opacity-80 bump"
        >
          {#if open}
            <span
              in:fade={{ delay: 400 }}
              out:fade
              class="absolute left-1/2 top-1/2 -translate-1/2"
            >
              <ChevronRight class="size-[1.25em]" strokeWidth={1.5} />
            </span>
          {:else}
            <span
              in:fade={{ delay: 400 }}
              out:fade
              class="absolute left-1/2 top-1/2 -translate-1/2"
            >
              <Plus class="size-[1.25em]" strokeWidth={1.5} />
            </span>
          {/if}
        </div>
      </DelayedLink>
    {/each}
  </ContentWidth>
</section>

<style>
  /* svelte-img bakes a blurred low-quality placeholder into each <img>'s inline
     `background`. These graft PNGs are transparent (subject cut out), so that
     placeholder bleeds through the cut-out as fuzzy "pixelation" around each
     graft. The images are small, optimized and sit on the gradient, so no
     placeholder is needed — suppress it for every image in this section. */
  section :global(img) {
    background: none !important;
  }
</style>
