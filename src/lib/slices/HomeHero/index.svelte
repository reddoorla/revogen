<script lang="ts">
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import ScreenWidthMedia from "$lib/components/ScreenWidth/ScreenWidthMedia.svelte";
  import { isFilled, type Content } from "@prismicio/client";
  import { PrismicRichText, type SliceComponentProps } from "@prismicio/svelte";
  import downArrow from "$lib/assets/icons/downArrow.svg";
  import gridlines from "$lib/assets/icons/linework.svg";

  import { onMount } from "svelte";

  type Props = SliceComponentProps<Content.HomeHeroSlice>;

  let section: HTMLElement;
  let viewportHeight = $state(1024);
  let showSecondSection = $state(false);

  const scrollToNext = () => {
    document
      .getElementsByTagName("main")[0]
      .scrollTo({
        left: 0,
        top: section.getBoundingClientRect().height / 2,
        behavior: "smooth",
      });
    setTimeout(handleScroll, 500);
  };

  const { slice }: Props = $props();

  const handleScroll = () => {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.bottom < (rect.height * 3) / 4){ 
		showSecondSection = true;
	} else{
		showSecondSection=false;
	}
    console.log(showSecondSection);
  };

  onMount(() => {
    if (!window || !document) return;

    document
      .getElementsByTagName("main")[0]
      .addEventListener("scroll", handleScroll);
  });
</script>

<svelte:window bind:innerHeight={viewportHeight} />

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  class="text-white relative overflow-clip"
  bind:this={section}
>
  <button
    class="absolute top-1/2 -translate-y-[150%] left-1/2 -translate-x-1/2"
    onclick={scrollToNext}
  >
    <img src={downArrow} alt="down" class="h-16 negative-bump" />
  </button>
  <ScreenWidthMedia
    field={isFilled.image(slice.primary.placeholder_image)
      ? slice.primary.placeholder_image
      : null}
    vimeoId={(slice.primary.vimeo_id as string) || ""}
    darken
    backdrop
    percentHeight={100}
  ></ScreenWidthMedia>
  <div class="w-screen h-screen">
    <ContentWidth
      class="flex flex-col gap-2 md:gap-6 py-6 md:py-12 justify-center text-center items-center h-full"
    >
      <div
        class="w-full max-w-[600px] mt-12 transition ease-fast-slow duration-700 {showSecondSection
          ? ''
          : 'opacity-0 translate-y-8'}"
      >
        <PrismicRichText field={slice.primary.text} />
      </div>

      {#if isFilled.link(slice.primary.button)}
        <div class="transition ease-fast-slow duration-700 delay-200 {showSecondSection?"":"opacity-0 translate-y-8"}">
          <DefaultButton
            transitionDelayMax={0}
            transitionDuration={1200}
            href={slice.primary.button.url}
            >{slice.primary.button.text}</DefaultButton
          >
        </div>
      {/if}
    </ContentWidth>
  </div>
  <div class="absolute top-5/6 -left-8 w-screen origin-top-left transition-transform duration-2000 delay-100 {showSecondSection?"":"rotate-90"}">
    <img
      src={gridlines}
      class="rotate-270 w-full"
      alt="decorative gridlines"
    />
  </div>
  <div class="absolute top-5/6 -right-8 w-screen origin-top-right transition-transform duration-2000 delay-100 {showSecondSection?"":"-rotate-90"}">
    <img
      src={gridlines}
      class="w-full"
      alt="decorative gridlines"
    />
  </div>
</section>