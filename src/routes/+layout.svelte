<script lang='ts'>
	import { PrismicPreview } from '@prismicio/svelte/kit';
	import { page } from '$app/state';
	import { repositoryName } from '$lib/prismicio';
	import "../app.css";
	import LandscapeModal from '$lib/components/LandscapeModal.svelte';
	import Nav from '$lib/components/Nav.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import { gradientTheme } from '$lib/stores/gradientTheme';
  import { fade } from 'svelte/transition';
  import TransitionOverlay from '$lib/components/TransitionOverlay.svelte';
  import { onNavigate } from '$app/navigation';
  import { onMount } from 'svelte';


	let { children } = $props();
	const scrollAllToTop = () => {
  // Reset window scroll
  window.scrollTo(0, 0);
  
  // Find and reset all scrollable elements
  const scrollableElements = document.querySelectorAll('*');
  
  scrollableElements.forEach(element => {
    if (element.scrollTop > 0 || element.scrollLeft > 0) {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    }
  });
};

	onNavigate(scrollAllToTop);
	onMount(scrollAllToTop);
	
</script>

<svelte:head>
	<title>{page.data.title ?? "Revogen"}</title>
	{#if page.data.meta_description}
		<meta name="description" content={page.data.meta_description} />
	{/if}
	{#if page.data.meta_title}
		<meta name="og:title" content={page.data.meta_title} />
	{/if}
	{#if page.data.meta_image}
		<meta name="og:image" content={page.data.meta_image.url} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
	<meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no">
	<script async defer src="https://static.cdn.prismic.io/prismic.js?new=true&repo=revogen"></script>
</svelte:head>

<style>



</style>

<div class='fixed w-screen h-screen top-0 left-0 -z-10'>

	
	<!-- Option 0 - Blue -->
	<div class='absolute w-[125vw] h-[125vh] -top-[10vh] -left-[10vw] add-noise transition-opacity delay-200 duration-2400 {$gradientTheme===0?"opacity-100":"opacity-0"}'>
		<div class='absolute w-full h-full top-0 left-0 option-0-layer1 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0 option-0-layer2 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0 option-0-layer3 will-change-transform'></div>
	</div>
	
	<!-- Option 1 - Pink -->
	<div class='absolute w-[125vw] h-[125vh] -top-[10vh] -left-[10vw] transition-opacity add-noise  duration-2400 {$gradientTheme===1?"opacity-100":"opacity-0"}'>
		<div class='absolute w-full h-full top-0 left-0  option-1-layer1 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0  option-1-layer2 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0  option-1-layer3 will-change-transform'></div>
	</div>
	
	<!-- Option 2 - Deep Blue -->
	<div class='absolute w-[125vw] h-[125vh] -top-[10vh] -left-[10vw] add-noise transition-opacity duration-2400 {$gradientTheme===2?"opacity-100":"opacity-0"}'>
		<div class='absolute w-full h-full top-0 left-0  option-2-layer1 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0  option-2-layer2 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0  option-2-layer3 will-change-transform'></div>
	</div>
	
	<!-- Option 3 - Teal -->
	<div class='absolute w-[125vw] h-[125vh] -top-[10vh] -left-[10vw] add-noise transition-opacity duration-2400 {$gradientTheme===3?"opacity-100":"opacity-0"}'>
		<div class='absolute w-full h-full top-0 left-0  option-3-layer1 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0  option-3-layer2 will-change-transform'></div>
		<div class='absolute w-full h-full top-0 left-0  option-3-layer3 will-change-transform'></div>
	</div>
	
</div>

<main class="-translate-y-[0.5px]">
	<Nav />
	{#key children}
	<div transition:fade>
		{@render children?.()}
	</div>
	{/key}
	<Footer />
</main>
<LandscapeModal />
<TransitionOverlay />
<PrismicPreview {repositoryName} />

<form class="hidden" name="contact" method="post" data-netlify="true" data-netlify-honeypot="bot-field" id="netlifyContactForm">
	<input type="hidden" name="form-name" value="contact" />
	<input type="text" name="first-name" required placeholder="first and last name"  />
	<input type="text" name="last-name" required placeholder="last name"  />
	<input type="text" name="city" placeholder="city" />
	<input type="text" name="state" />
	<input type="phone" name="phone" placeholder="000-000-0000"  />
	<input type="email" name="email" required placeholder="you@domain.com"  />
	<input type="text" name="distributorship" required placeholder="last name" />
	<p class="hidden">
	  <label>
		Don't fill this out if you're human: <input name="bot-field" />
	  </label>
	</p>
	<p>Message</p>
	<textarea name="message" required placeholder="how can we help?"></textarea>
	<button id="hiddenSubmitButton" type="submit"  >Connect</button>
</form>