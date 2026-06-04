<script lang="ts">
  import { hasIntroRun } from "$lib/stores/hasIntroRun";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";

  import ContentWidth from "./ContentWidth/ContentWidth.svelte";

  let isIntroRunning = $state(false);

  const preventScroll = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const preventScrollKeys = (e: KeyboardEvent) => {
    const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
    if (keys.includes(e.keyCode)) {
      e.preventDefault();
      return false;
    }
  };

  let originalBodyStyles: {
    overflow: string;
    position: string;
    width: string;
    height: string;
    pointerEvents: string;
  } | null = null;

  const enableScrollPrevention = () => {
    if (!browser) return;

    if (!originalBodyStyles) {
      originalBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        width: document.body.style.width,
        height: document.body.style.height,
        pointerEvents: document.body.style.pointerEvents,
      };
    }

    document.body.style.overflow = "hidden";
    document.body.style.pointerEvents = "none";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.documentElement.style.overflow = "hidden";

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("scroll", preventScroll, { passive: false });
    document.addEventListener("keydown", preventScrollKeys);
  };

  const disableScrollPrevention = () => {
    if (!browser) return;

    if (originalBodyStyles) {
      document.body.style.overflow = originalBodyStyles.overflow;
      document.body.style.position = originalBodyStyles.position;
      document.body.style.width = originalBodyStyles.width;
      document.body.style.height = originalBodyStyles.height;
      document.body.style.pointerEvents = originalBodyStyles.pointerEvents;
      document.documentElement.style.overflow = "";
    }

    window.removeEventListener("wheel", preventScroll);
    window.removeEventListener("touchmove", preventScroll);
    window.removeEventListener("scroll", preventScroll);
    document.removeEventListener("keydown", preventScrollKeys);
  };

  $effect(() => {
    if (!browser) return;

    if ($hasIntroRun) {
      disableScrollPrevention();
    } else if (!isIntroRunning) {
      enableScrollPrevention();
    }
  });

  onMount(() => {
    if ($hasIntroRun || isIntroRunning) {
      if ($hasIntroRun) {
        showIH = true;
        showIPO = true;
        showLogo = true; // Add this
        fillLogo = true;
        pulseLogo = false;
      }
      return;
    }

    window.scrollTo(0, 0);

    isIntroRunning = true;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timeouts.push(setTimeout(() => (showLogo = true), 300)); // Logo appears first
    timeouts.push(setTimeout(() => (fillLogo = true), 500)); // Then fills in after a pause
    timeouts.push(setTimeout(() => (pulseLogo = true), 1000));
    timeouts.push(setTimeout(() => (showIH = true), 6500));
    timeouts.push(setTimeout(() => (showIPO = true), 7000));
    timeouts.push(setTimeout(() => (showLogo = false), 5500));
    timeouts.push(setTimeout(() => (showBackground = false), 6000));

    timeouts.push(
      setTimeout(() => {
        hasIntroRun.set(true);
        isIntroRunning = false;
      }, 6500),
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      isIntroRunning = false;
    };
  });

  onDestroy(() => {
    disableScrollPrevention();
    isIntroRunning = false;
  });

  let showBackground = $state(true);
  let showIH = $state(false);
  let showIPO = $state(false);
  let fillLogo = $state(false);
  let pulseLogo = $state(false);
  let showLogo = $state(false);
</script>

<div class="h-screen w-screen absolute top-0 left-0 z-50 overflow-hidden pointer-events-none">
  <div
    class="absolute w-[125vw] h-[125vh] -top-[10vh] -left-[10vw] add-noise transition-opacity duration-800 delay-300 {showBackground &&
    !$hasIntroRun
      ? 'opacity-100'
      : 'opacity-0'}"
  >
    <div class="absolute w-full h-full top-0 left-0 option-0-layer1 will-change-transform"></div>
    <div class="absolute w-full h-full top-0 left-0 option-0-layer2 will-change-transform"></div>
    <div class="absolute w-full h-full top-0 left-0 option-0-layer3 will-change-transform"></div>

    <svg
      class="w-1/3 md:w-1/6 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-3/5 transition-all duration-400 {pulseLogo
        ? 'pulse'
        : ''}"
      class:opacity-0={!showLogo}
      data-name="Layer 2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1573.06 322.32"
    >
      <g id="Layer_1-2" data-name="Layer 1">
        <g>
          <g>
            <path
              class="logo-path {fillLogo ? 'filled' : ''}"
              d="M39.86,206c-16.94-16.94-29.94-34.95-39.86-53.19,4.48-10.3,9.49-20.28,15.05-29.88,25.89,44.72,63.16,81.99,107.88,107.88-9.66,5.56-19.58,10.57-29.88,15.05-18.23-9.93-36.25-22.92-53.19-39.86Z"
            />
            <path
              class="logo-path {fillLogo ? 'filled' : ''}"
              d="M122.93,15.05C78.21,40.94,40.94,78.21,15.05,122.93c-5.56-9.66-10.57-19.58-15.05-29.88,9.92-18.23,22.92-36.25,39.86-53.19C56.8,22.92,74.82,9.93,93.05,0c10.3,4.48,20.23,9.49,29.88,15.05Z"
            />
            <path
              class="logo-path {fillLogo ? 'filled' : ''}"
              d="M245.86,152.81c-9.92,18.23-22.92,36.25-39.86,53.19-16.94,16.94-34.95,29.94-53.19,39.86-10.3-4.48-20.28-9.49-29.88-15.05,22.33-12.95,42.88-28.75,61.01-46.87,18.12-18.12,33.93-38.68,46.87-61.01,5.56,9.6,10.57,19.58,15.05,29.88Z"
            />
            <path
              class="logo-path {fillLogo ? 'filled' : ''}"
              d="M183.94,61.92c-18.12-18.12-38.68-33.93-61.01-46.87,9.6-5.56,19.58-10.57,29.88-15.05,18.23,9.93,36.25,22.92,53.19,39.86,16.94,16.94,29.94,34.95,39.86,53.19-4.48,10.3-9.49,20.23-15.05,29.88-12.95-22.39-28.75-42.88-46.87-61.01Z"
            />
          </g>
          <g>
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M463.67,131.14v1.82c19.3,6.19,33.14,22.94,41.15,39.33,12.02,23.31,21.49,43.7,32.05,52.8,11.29,9.1,17.48,12.38,32.41,14.57v6.19h-42.24c-28.4,0-33.14-10.92-46.25-38.6l-20.03-41.88c-12.02-24.4-22.21-28.04-38.6-28.04h-13.84v95.77l36.05,6.55v6.19h-108.52v-6.19l36.05-6.55V26.63l-36.05-6.56v-6.19h105.61c55.35,0,87.76,23.67,87.76,59.36,0,27.68-24.03,49.53-65.55,57.9ZM433.44,23.35c-10.2,0-17.84.73-25.13,2.19v101.6h25.13c29.5,0,54.99-17.48,54.99-52.07s-25.49-51.71-54.99-51.71Z"
            />
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M595.03,147.53c0,48.43,16.39,81.57,57.54,81.57,17.84,0,32.77-4.01,53.53-14.57l2.19,4.37c-22.58,21.49-42.97,32.77-66.64,32.77-46.61,0-79.75-34.23-79.75-84.85s35.32-89.95,80.48-89.95,67.73,30.23,67.73,70.65h-115.07ZM675.14,137.33c-2.55-31.32-12.75-52.44-35.32-52.44s-42.24,21.85-44.43,54.99l79.75-2.55Z"
            />
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M811.92,208.34h1.46l18.57-47.7,22.21-62.64-23.31-10.56v-4.73h64.09v4.73l-26.58,11.29-61.91,151.13h-8.74l-64.82-154.77-22.58-7.65v-4.73h83.39v4.73l-25.49,7.65,43.7,113.25Z"
            />
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M965.45,251.68c-51.35,0-79.39-37.51-79.39-87.4,0-46.61,31.32-87.4,84.48-87.4s79.02,36.42,79.02,86.31c0,46.61-30.59,88.49-84.12,88.49ZM966.55,84.89c-25.13,0-45.16,25.85-45.16,80.48s22.21,78.29,47.7,78.29c26.95,0,45.16-25.85,45.16-80.48s-20.39-78.29-47.7-78.29Z"
            />
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M1133.37,189.41c-10.56,0-20.39-2.55-27.67-5.83-5.46,5.1-8.01,15.66-8.01,23.31,0,10.92,8.01,14.2,26.58,14.57l44.79.73c37.51.73,52.44,13.84,52.44,38.97,0,28.77-31.68,61.18-92.86,61.18-47.34,0-72.83-18.94-72.83-40.06,0-15.29,15.29-29.86,38.6-37.51l-.36-1.82c-14.57-4.73-22.94-14.2-22.94-25.49s8.74-24.03,28.4-35.69v-1.82c-18.57-9.1-30.59-23.67-30.59-46.25,0-34.96,30.95-56.44,68.1-56.44,16.75,0,31.68,4.37,42.24,12.02,17.48-11.29,30.59-16.39,41.88-16.39,12.02,0,18.21,7.28,18.21,16.39s-7.28,17.12-16.39,17.12-15.29-5.83-16.39-14.93l-21.12,2.55-.73,1.82c9.47,9.47,14.2,21.12,14.2,33.87,0,35.32-26.95,59.72-65.55,59.72ZM1162.51,247.67l-60.45-.73c-9.47,6.19-15.66,17.84-15.66,30.59,0,19.3,18.94,34.96,55.35,34.96s54.62-18.94,54.62-37.51c0-17.12-10.56-26.58-33.87-27.31ZM1132.28,84.53c-19.66,0-30.59,14.93-30.59,49.16,0,36.05,11.65,48.43,33.87,48.43,19.3,0,30.59-20.39,30.59-48.43s-12.02-49.16-33.87-49.16Z"
            />
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M1265.64,147.53c0,48.43,16.39,81.57,57.54,81.57,17.84,0,32.77-4.01,53.53-14.57l2.19,4.37c-22.58,21.49-42.97,32.77-66.64,32.77-46.61,0-79.75-34.23-79.75-84.85s35.32-89.95,80.48-89.95,67.73,30.23,67.73,70.65h-115.07ZM1345.75,137.33c-2.55-31.32-12.75-52.44-35.32-52.44s-42.24,21.85-44.43,54.99l79.75-2.55Z"
            />
            <path
              class="logo-text-path {fillLogo ? 'fill-white' : 'fill-transparent'}"
              stroke="white"
              stroke-width="2"
              d="M1549.03,234.56l24.04,6.55v4.73h-77.57v-4.73l22.94-6.55v-91.4c0-27.68-9.83-40.79-34.23-40.79-15.29,0-26.22,2.91-40.79,11.29v120.9l22.58,6.55v4.73h-77.56v-4.73l24.03-6.55v-126.36l-23.67-15.29v-3.28l50.98-13.11,1.46,1.09-.73,29.13,1.46.73c21.85-20.39,42.61-30.59,62.27-30.59,32.77,0,44.79,24.76,44.79,50.62v107.06Z"
            />
          </g>
        </g>
      </g>
    </svg>
  </div>
</div>
<div class="h-screen w-screen absolute top-0 left-0 z-30 overflow-hidden pointer-events-none">
  <ContentWidth
    class="h-full flex flex-col gap-4 py-12 justify-center text-center items-center text-white relative"
  >
    <h2><br /></h2>
    <h3 class="transition-opacity duration-700 ease-out {showIH ? 'opacity-100' : 'opacity-0'}">
      Innovative Healing
    </h3>
    <h2 class="transition-opacity duration-700 ease-out {showIPO ? 'opacity-100' : 'opacity-0'}">
      Improving Patient Outcomes via Cutting-Edge Biologics
    </h2>
  </ContentWidth>
</div>

<style>
  .logo-path {
    fill: transparent;
    stroke: white;
    stroke-width: 2;
    transition:
      fill 800ms ease-out,
      stroke-width 800ms ease-out,
      opacity 400ms ease-out;
  }

  .logo-path.filled {
    fill: white;
    stroke-width: 0;
  }

  .logo-text-path {
    transition:
      fill 800ms ease-out,
      opacity 400ms ease-out;
  }

  .pulse {
    animation: pulse 1500ms ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
</style>
