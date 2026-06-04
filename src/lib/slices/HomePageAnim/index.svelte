<script lang="ts">
	import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
	import type { Content } from "@prismicio/client";
	import type { SliceComponentProps } from "@prismicio/svelte";
	import { gradientTheme, defaultGradientTheme } from "$lib/stores/gradientTheme";
	import surgical from "$lib/assets/images/surgical.png"
	import ocular from "$lib/assets/images/ocular.png"
	import woundCare from "$lib/assets/images/woundCare.png"
	import surgicalBefore from "$lib/assets/images/surgical-before.png"
	import ocularBefore from "$lib/assets/images/ocular-before.png"
	import woundCareBefore from "$lib/assets/images/wound-before.png"
  import { fade, slide } from "svelte/transition";
  import DelayedLink from "$lib/components/DelayedLink.svelte";
	import { onMount } from "svelte";
	import * as rive from '@rive-app/canvas'
	import puttyRive from '$lib/assets/rive/RevgroPutty.riv'

	type Props = SliceComponentProps<Content.HomePageAnimSlice>

	let viewportWidth=$state(1024);
	let puttyCanvas:HTMLCanvasElement|undefined= $state();
	let riveInstance: rive.Rive | null = null;

	const { slice }: Props = $props();

	// Preload images on mount
	onMount(() => {

		if(puttyCanvas)
			riveInstance = new rive.Rive({
				src: puttyRive,
				canvas: puttyCanvas||document.getElementById('puttycanvas'),
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
			threshold: 1.0 // Trigger when 100% of the element is visible
		}
	);

	if (puttyCanvas) {
		observer.observe(puttyCanvas);
	}

		const imagesToPreload = [
			surgical,
			ocular,
			woundCare,
			surgicalBefore,
			ocularBefore,
			woundCareBefore
		];

		imagesToPreload.forEach(src => {
			const img = new Image();
			img.src = src;
		});

		return () => {
        window.removeEventListener("resize", handleResize);
        observer.disconnect();
        riveInstance?.cleanup();
	}
});
</script>

<svelte:window bind:innerWidth={viewportWidth}/>

<!-- Hidden preload images -->
<div style="display: none;">
	<img src={surgical} alt="preload" />
	<img src={ocular} alt="preload" />
	<img src={woundCare} alt="preload" />
	<img src={surgicalBefore} alt="preload" />
	<img src={ocularBefore} alt="preload" />
	<img src={woundCareBefore} alt="preload" />
</div>

<section
	data-slice-type={slice.slice_type}
	data-slice-variation={slice.variation}
	class="min-h-screen w-screen py-8 md:py-0 relative"
>

<ContentWidth class="h-full min-h-screen flex flex-col gap-12 md:gap-0 md:flex-row items-center justify-evenly text-white">
		<DelayedLink 
			class='hover:cursor-pointer md:w-1/4 flex flex-col items-center justify-center' 
			onmouseenter={()=>gradientTheme.set(1)} 
			onmouseleave={()=>gradientTheme.set($defaultGradientTheme)}
			href="/surgical-grafts"
		
		>	
		<div class="relative w-full aspect-square">
			<img src={surgical} alt="surgical" class="{viewportWidth<768||$gradientTheme===1?"":"opacity-10 brightness-0 invert"} transition duration-700 ease-out absolute top-1/2 left-1/2 -translate-1/2" />
			

				
					
				<img src={surgicalBefore} alt="surgical" class=" transition duration-700 ease-out absolute top-1/2 left-1/2 -translate-1/2" />
			

			</div>
			<h4>Surgical Grafts</h4>
			{#if viewportWidth<768||$gradientTheme===1}
				<p transition:slide class="text-center mt-4">Surgical allografts, derived from human donor tissue or synthetic sources, are used to repair, replace, or protect damaged tissues and organs such as bone, skin, tendons, ligaments, and cartilage.</p>
			{/if}
			<div class="w-8 h-8  border-[1.5px] border-white rounded-full relative mt-4 hover:opacity-80 bump">
				{#if viewportWidth<768||$gradientTheme===1}
					<i in:fade={{delay:400}} out:fade class=" absolute left-1/2 top-1/2 -translate-1/2 fa-sharp fa-light fa-chevron-right fa-lg"></i>
				{:else}
					<i in:fade={{delay:400}} out:fade class=" absolute left-1/2 top-1/2 -translate-1/2 fa-sharp fa-light fa-plus fa-lg"></i>
				{/if}
			</div>
		</DelayedLink>
		<DelayedLink 
			class='hover:cursor-pointer md:w-1/4 flex flex-col items-center justify-center'  
			onmouseenter={()=>gradientTheme.set(2)} 
			onmouseleave={()=>gradientTheme.set($defaultGradientTheme)}
			href="/wound-care"
			
		>
			<div class="relative w-full aspect-square">

					<img transition:fade src={woundCare} alt="wound care" class="{viewportWidth<768||$gradientTheme===2?"":"brightness-0 invert opacity-10"} transition duration-700 ease-fast-slow absolute top-1/2 left-1/2 -translate-1/2" />

					<img transition:fade src={woundCareBefore} alt="wound care" class="absolute top-1/2 left-1/2 -translate-1/2" />

			</div>
			<h4>Wound Care Grafts</h4>
			{#if viewportWidth<768||$gradientTheme===2}
				<p transition:slide class="text-center mt-4">RevoGen Biologics provides high-quality allograft grafts for chronic or acute wound care, serving as protective barriers and scaffolds for tissue reconstruction.</p>
			{/if}
			<div class="w-8 h-8  border-[1.5px] border-white rounded-full relative mt-4 hover:opacity-80 bump">
				{#if viewportWidth<768||$gradientTheme===2}
					<i in:fade={{delay:400}} out:fade class=" absolute left-1/2 top-1/2 -translate-1/2 fa-sharp fa-light fa-chevron-right fa-lg"></i>
				{:else}
					<i in:fade={{delay:400}} out:fade class=" absolute left-1/2 top-1/2 -translate-1/2 fa-sharp fa-light fa-plus fa-lg"></i>
				{/if}
			</div>
		
		</DelayedLink>
		<DelayedLink 
			class='hover:cursor-pointer md:w-1/4 flex flex-col items-center justify-center'  
			onmouseenter={()=>gradientTheme.set(3)} 
			onmouseleave={()=>gradientTheme.set($defaultGradientTheme)}
			href="/ocular"
			
		>
			<div class="relative w-full aspect-square">
				
					<img src={ocular} alt="ocular" class="{viewportWidth<768||$gradientTheme===3?"":"brightness-0 invert opacity-10"} transition duration-700 ease-fast-slow absolute top-1/2 left-1/2 -translate-1/2" />				
					<img src={ocularBefore} alt="ocular" class="absolute top-1/2 left-1/2 -translate-1/2" />
				
			</div>
			<h4>Ocular Grafts</h4>
			{#if viewportWidth<768||$gradientTheme===3}
				<p transition:slide class="text-center mt-4">RevoGen Biologics offers customizable ocular amnion grafts in a variety of cuts and sizes to support diverse ocular applications.</p>
			{/if}
			<div class="w-8 h-8  border-[1.5px] border-white rounded-full relative mt-4 hover:opacity-80 bump">
				{#if viewportWidth<768||$gradientTheme===3}
					<i in:fade={{delay:400}} out:fade class=" absolute left-1/2 top-1/2 -translate-1/2 fa-sharp fa-light fa-chevron-right fa-lg"></i>
				{:else}
					<i in:fade={{delay:400}} out:fade class=" absolute left-1/2 top-1/2 -translate-1/2 fa-sharp fa-light fa-plus fa-lg"></i>
				{/if}
			</div>
		</DelayedLink>
</ContentWidth>

</section>