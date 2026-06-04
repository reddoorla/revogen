<script lang="ts">
 import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
import { type Content, type Repeatable, type LinkField, type FieldState, isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/svelte";
  import { fade,fly, slide } from "svelte/transition";
  import { PrismicImage } from "@prismicio/svelte";
  import { onMount } from "svelte";

  import { distributorData } from "$lib/stores/distributorData";

type Props = SliceComponentProps<Content.DistributorLoginSlice>;
const { slice }: Props = $props();

let isAuthenticated = $state(false);
let password = $state("");
let showError = $state(false);
let shakeButton = $state(false);
let activeCategory = $state(0)

// Mobile slider state
let sliderContainer =$state<HTMLElement>();
let isDragging = $state(false);
let startX = $state(0);
let scrollLeft = $state(0);

// New state variables for height management
let categoryRefs: HTMLElement[] = $state([]);
let containerHeight = $state(0);

// Set your desired password here
const CORRECT_PASSWORD = "Revogenreps";

function handleSubmit() {
  if (password === CORRECT_PASSWORD) {
    isAuthenticated = true;
    showError = false;
  } else {
    showError = true;
	shakeButton = true;

	setTimeout(() => {
      shakeButton = false;
    }, 600);
  
    
    setTimeout(() => {
      showError = false;
    }, 3000);
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSubmit();
  }
}

// Mobile slider functions
function handleMouseDown(e: MouseEvent) {
  if (!sliderContainer) return;
  isDragging = true;
  startX = e.pageX - sliderContainer.offsetLeft;
  scrollLeft = sliderContainer.scrollLeft;
}

function handleMouseUp() {
  isDragging = false;
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging || !sliderContainer) return;
  e.preventDefault();
  const x = e.pageX - sliderContainer.offsetLeft;
  const walk = (x - startX) * 2;
  sliderContainer.scrollLeft = scrollLeft - walk;
}

function handleTouchStart(e: TouchEvent) {
  if (!sliderContainer) return;
  isDragging = true;
  startX = e.touches[0].pageX - sliderContainer.offsetLeft;
  scrollLeft = sliderContainer.scrollLeft;
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging || !sliderContainer) return;
  const x = e.touches[0].pageX - sliderContainer.offsetLeft;
  const walk = (x - startX) * 2;
  sliderContainer.scrollLeft = scrollLeft - walk;
}

function handleTouchEnd() {
  isDragging = false;
}

// Function to calculate the tallest category height
function calculateTallestHeight() {
  if (!$distributorData || $distributorData.length === 0) return;
  
  let maxHeight = 0;
  
  // Go through each category in distributorData (max 6-7 items)
  for (let i = 0; i < $distributorData.length; i++) {
    if (categoryRefs[i]) {
      const height = categoryRefs[i].scrollHeight;
      if (height > maxHeight) {
        maxHeight = height;
      }
    }
  }
  
  containerHeight = Math.max(maxHeight, 600); // Minimum height of 600px
}

// Watch for changes in distributorData and recalculate height
$effect(() => {
  if ($distributorData && categoryRefs.length > 0) {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      calculateTallestHeight();
    }, 100);
  }
});

// Calculate height immediately on mount
onMount(() => {
  // Initial calculation
  setTimeout(() => {
    calculateTallestHeight();
  }, 50);
  
  // Additional calculation after a longer delay to ensure all content is loaded
  setTimeout(() => {
    calculateTallestHeight();
  }, 500);
});

</script>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-2px); }
    40%, 80% { transform: translateX(2px); }
  }
  
  .animate-shake {
    animation: shake 0.4s ease-in-out;
  }

  .mobile-slider {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .mobile-slider::-webkit-scrollbar {
    display: none;
  }
</style>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  style="padding-top:{parseInt(slice.primary.vertical_padding)*4}px;padding-bottom:{parseInt(slice.primary.vertical_padding)*4}px;"
  class="text-white"
>
  <ContentWidth>
    {#if !isAuthenticated}
      <!-- Password Form -->
	   <div out:fade class="flex flex-col items-center">
      <p class="max-w-lg text-center">Enter password to access the Distributor Resource Hub:</p>
      <div class="flex flex-col mt-16 items-center gap-2">
        <p>PASSWORD</p>
        <input 
          type="password" 
          class="h-10 md:w-128 max-w-sm rounded-sm bg-white/30 text-black px-2 placeholder-black/40 text-center"
          bind:value={password}
          onkeypress={handleKeyPress}
        />
		<div class="h-16 w-full">
        {#if showError}
          <p class="text-red-300 text-sm text-center mt-2 absolute left-1/2 -translate-x-1/2 w-full" in:fade={{delay:600}} out:fade>Incorrect password. Please try again.</p>
		  {:else}
		  <p class="text-xs max-w-sm text-center absolute left-1/2 -translate-x-1/2 w-full" in:fade={{delay:600}} out:fade>This portal is password protected, please contact your RevoGen administrator for access.</p>
        {/if}
		</div>
        
      </div>
      <button 
        aria-label="submit password" 
        class="h-8 w-8 border-2 border-white rounded-full mt-16 hover:border-light-blue hover:bg-white hover:text-light-blue transition duration-500 active:duration-200 active:text-white active:border-white {shakeButton ? 'animate-shake' : ''}"
        onclick={handleSubmit}
      >
        <i class="fa-regular fa-chevron-right fa-xl bump"></i>
      </button>
	   </div>
    {:else}
 
      <div class="w-full border-t-2 border-white text-white flex flex-col items-center" in:fly={{delay:400, x:"-100%"}}>
        <p class=" mt-12 md:mt-32 text-center max-w-lg">At RevoGen Biologics, we are deeply committed to supporting the success of our partners/distributors. Use the links below to access important resources and download collateral designed to help you service your existing clients and win new business!</p>
        <h5 class=" mt-12 mb-4 md:my-16">Select a Topic to View Resources</h5>
        
        <!-- Desktop Layout (unchanged) -->
        <div class="w-full justify-center flex-wrap gap-12 hidden md:flex">
          {#if $distributorData}
            {#each $distributorData as category, i (i)}
            <div class="flex flex-col gap-2 items-center justify-center">
            <button class="w-44 h-44 border-[1px] rounded-full border-white drop-shadow-sm hover:grayscale-0 hover:opacity-100 transition {activeCategory===i?"pointer-events-none cursor-regular":"opacity-80 grayscale"}" onclick={()=>activeCategory=i}>
              <PrismicImage field={category.data.image} class="w-full h-full rounded-full scale-[92%] object-cover" />
            </button>
            <button onclick={()=>activeCategory=i} class="{activeCategory===i?"pointer-events-none cursor-regular":""}">
				      <p class="body-3 text-center drop-shadow-sm">{category.data.name}</p>
            </button>
			    </div>
           
            {/each}
          {/if}
        </div>

        <!-- Mobile Slider Layout -->
        <div class="w-screen md:hidden">
          <div 
            bind:this={sliderContainer}
            class="mobile-slider flex gap-6 overflow-x-auto pb-4 px-4 cursor-grab active:cursor-grabbing"
            style="scroll-snap-type: x mandatory;"
            onmousedown={handleMouseDown}
            onmouseup={handleMouseUp}
            onmousemove={handleMouseMove}
            onmouseleave={handleMouseUp}
            ontouchstart={handleTouchStart}
            ontouchmove={handleTouchMove}
            ontouchend={handleTouchEnd}
            role="slider"
            tabindex="0"
            aria-valuenow={activeCategory}
          >
            {#if $distributorData}
              {#each $distributorData as category, i (i)}
                <div class="flex flex-col gap-2 items-center justify-center flex-shrink-0" style="scroll-snap-align: center;">
                  <button 
                    class="w-32 h-32 border-[1px] rounded-full border-white drop-shadow-sm hover:grayscale-0 hover:opacity-100 transition {activeCategory===i?"pointer-events-none cursor-regular":"opacity-80 grayscale"}" 
                    onclick={()=>{activeCategory=i; if (sliderContainer) {
                      const itemWidth = 144; // 128px + 16px gap
                      const containerWidth = sliderContainer.offsetWidth;
                      const scrollPosition = (i * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
                      sliderContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
                    }
                  }}
                  >
                    <PrismicImage field={category.data.image} class="w-full h-full rounded-full scale-[92%] object-cover" />
                  </button>
                  <button 
                    onclick={()=>{activeCategory=i; if (sliderContainer) {
                      const itemWidth = 144; // 128px + 16px gap
                      const containerWidth = sliderContainer.offsetWidth;
                      const scrollPosition = (i * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
                      sliderContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
                    }
                  }}
                    class="w-32 {activeCategory===i?"pointer-events-none cursor-regular":""}"
                  >
                    <p class="body-3 text-center drop-shadow-sm text-sm leading-tight">{category.data.name}</p>
                  </button>
                </div>
              {/each}
            {/if}
          </div>
          
          
        </div>
        
      </div>

      {#snippet hubDocs(docs:Repeatable<LinkField<string, string, unknown, FieldState, never>>, title:string)}
         {#if docs.length>0&&isFilled.link(docs[0])}
                <h5 class="mt-6 md:mt-10 uppercase">{title}</h5>
                <div class="h-0.5 w-full bg-white my-4"></div>
                {#each docs as doc, i (i)}
                  {#if isFilled.link(doc)}
                  <a class="flex flex-row gap-3 items-center mt-4 hover:opacity-80 active:opacity-100 transition-opacity active:transition-none" href={doc.url} target="_blank">
                    <svg class="h-3 translate-y-[1px]" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.464777 0.807787H10.5359C10.7223 0.807787 10.8728 0.958372 10.8728 1.1447V14.8556C10.8728 15.0419 10.7223 15.1925 10.5359 15.1925H4.49318C4.39884 15.1925 4.3133 15.1533 4.25177 15.0906L0.226367 11.0652C0.160742 10.9995 0.12793 10.9128 0.12793 10.8267V1.14404C0.12793 0.957714 0.278515 0.807129 0.464845 0.807129L0.464777 0.807787ZM2.54363 6.71929C2.3573 6.71929 2.20671 6.5687 2.20671 6.38237C2.20671 6.19604 2.3573 6.04546 2.54363 6.04546H6.71603C6.90236 6.04546 7.05294 6.19604 7.05294 6.38237C7.05294 6.5687 6.90236 6.71929 6.71603 6.71929H2.54363ZM2.54363 4.25899C2.3573 4.25899 2.20671 4.1084 2.20671 3.92207C2.20671 3.73574 2.3573 3.58516 2.54363 3.58516H8.45693C8.64326 3.58516 8.79384 3.73574 8.79384 3.92207C8.79384 4.1084 8.64326 4.25899 8.45693 4.25899H2.54363ZM0.801677 10.4904H4.49303C4.67936 10.4904 4.82994 10.641 4.82994 10.8274V14.5181H10.1983V1.4816H0.801092V10.4905L0.801677 10.4904ZM4.15613 14.0424V11.1648H1.27853L4.15613 14.0424Z" fill="white"/>
                    </svg>
                    <p class="underline">{doc.text}</p>
                  </a>
                  {/if}
                {/each}
              {/if}
      {/snippet}
      
      {#if activeCategory>-1}
      <!-- Updated container with dynamic height -->
      <div class="w-full mt-6 md:mt-32 relative transition-all duration-300 ease-in-out mb-32" style="height: {containerHeight}px" in:slide>
        {#key activeCategory}
           <div class="absolute top-0 left-0 w-full flex flex-col gap-16" in:fade={{delay:700}} out:fade>
            {#each $distributorData[activeCategory].data.headers as header, i (i) }
            <div>
              <h2>
                {header.name}
              </h2>
            {@render hubDocs(header.general ,"General")}

            {@render hubDocs(header.distributor_documents ,"Documents")}

            {@render hubDocs(header.white_papers, "Papers")}

            {@render hubDocs(header.videos, "Videos")}

              
            </div>
              
            {/each}
           </div>
        {/key}
        
        <!-- Hidden elements for measuring each category's height -->
        <div class="absolute top-0 left-0 w-full pointer-events-none opacity-0 z-[-1]">
          {#if $distributorData}
            {#each $distributorData as category, categoryIndex (categoryIndex)}
              <div bind:this={categoryRefs[categoryIndex]} class="flex flex-col gap-16">
                {#each category.data.headers as header, headerIndex (headerIndex)}
                  <div>
                    <h2>{header.name}</h2>
                    {#if header.distributor_documents.length !== 0}
                      <h5 class="mt-10 uppercase">Distributor Documents</h5>
                      <div class="h-0.5 w-full bg-white my-4"></div>
                      {#each header.distributor_documents as doc, docIndex (docIndex)}
                        {#if isFilled.link(doc)}
                          <div class="flex flex-row gap-3 items-center mt-4">
                            <svg class="h-3 translate-y-[1px]" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.464777 0.807787H10.5359C10.7223 0.807787 10.8728 0.958372 10.8728 1.1447V14.8556C10.8728 15.0419 10.7223 15.1925 10.5359 15.1925H4.49318C4.39884 15.1925 4.3133 15.1533 4.25177 15.0906L0.226367 11.0652C0.160742 10.9995 0.12793 10.9128 0.12793 10.8267V1.14404C0.12793 0.957714 0.278515 0.807129 0.464845 0.807129L0.464777 0.807787ZM2.54363 6.71929C2.3573 6.71929 2.20671 6.5687 2.20671 6.38237C2.20671 6.19604 2.3573 6.04546 2.54363 6.04546H6.71603C6.90236 6.04546 7.05294 6.19604 7.05294 6.38237C7.05294 6.5687 6.90236 6.71929 6.71603 6.71929H2.54363ZM2.54363 4.25899C2.3573 4.25899 2.20671 4.1084 2.20671 3.92207C2.20671 3.73574 2.3573 3.58516 2.54363 3.58516H8.45693C8.64326 3.58516 8.79384 3.73574 8.79384 3.92207C8.79384 4.1084 8.64326 4.25899 8.45693 4.25899H2.54363ZM0.801677 10.4904H4.49303C4.67936 10.4904 4.82994 10.641 4.82994 10.8274V14.5181H10.1983V1.4816H0.801092V10.4905L0.801677 10.4904ZM4.15613 14.0424V11.1648H1.27853L4.15613 14.0424Z" fill="white"/>
                            </svg>
                            <p class="underline">{doc.text}</p>
                          </div>
                        {/if}
                      {/each}
                    {/if}

                    {#if header.white_papers.length !== 0}
                      <h5 class="mt-10 uppercase">White paper / case studies</h5>
                      <div class="h-0.5 w-full bg-white my-4"></div>
                      {#each header.white_papers as doc, docIndex (docIndex)}
                        {#if isFilled.link(doc)}
                          <div class="flex flex-row gap-3 items-center mt-4">
                            <svg class="h-3 translate-y-[1px]" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M0.464777 0.807787H10.5359C10.7223 0.807787 10.8728 0.958372 10.8728 1.1447V14.8556C10.8728 15.0419 10.7223 15.1925 10.5359 15.1925H4.49318C4.39884 15.1925 4.3133 15.1533 4.25177 15.0906L0.226367 11.0652C0.160742 10.9995 0.12793 10.9128 0.12793 10.8267V1.14404C0.12793 0.957714 0.278515 0.807129 0.464845 0.807129L0.464777 0.807787ZM2.54363 6.71929C2.3573 6.71929 2.20671 6.5687 2.20671 6.38237C2.20671 6.19604 2.3573 6.04546 2.54363 6.04546H6.71603C6.90236 6.04546 7.05294 6.19604 7.05294 6.38237C7.05294 6.5687 6.90236 6.71929 6.71603 6.71929H2.54363ZM2.54363 4.25899C2.3573 4.25899 2.20671 4.1084 2.20671 3.92207C2.20671 3.73574 2.3573 3.58516 2.54363 3.58516H8.45693C8.64326 3.58516 8.79384 3.73574 8.79384 3.92207C8.79384 4.1084 8.64326 4.25899 8.45693 4.25899H2.54363ZM0.801677 10.4904H4.49303C4.67936 10.4904 4.82994 10.641 4.82994 10.8274V14.5181H10.1983V1.4816H0.801092V10.4905L0.801677 10.4904ZM4.15613 14.0424V11.1648H1.27853L4.15613 14.0424Z" fill="white"/>
                            </svg>
                            <p class="underline">{doc.text}</p>
                          </div>
                        {/if}
                      {/each}
                    {/if}
                  </div>
                {/each}
              </div>
            {/each}
          {/if}
        </div>
      </div>
      {/if}
      
      
    {/if}

  </ContentWidth>
</section>