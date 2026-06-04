<script lang="ts">
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import type { Content } from "@prismicio/client";
  import { PrismicImage, PrismicRichText, type SliceComponentProps } from "@prismicio/svelte";
  import { isFilled } from "@prismicio/client";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import * as rive from "@rive-app/canvas";
  import { onMount } from "svelte";

  type Props = SliceComponentProps<Content.TwoColSlice>;

  let formFirstName = $state("");
  let formLastName = $state("");
  let formCity = $state("");
  let formState = $state("");
  let formPhone = $state("");
  let formEmail = $state("");
  let formDistributorship = $state("");
  let formMessage = $state("");

  // State for Rive
  let riveCanvas: HTMLCanvasElement | undefined = $state();
  let riveInstance: rive.Rive | null = null;

  const triggerSubmitButton = () => {
    const hiddenForm = document.getElementById("netlifyContactForm") as HTMLFormElement;

    if (hiddenForm) {
      const hiddenFirstName = hiddenForm.querySelector('[name="first-name"]') as HTMLInputElement;
      const hiddenLastName = hiddenForm.querySelector('[name="last-name"]') as HTMLInputElement;
      const hiddenCity = hiddenForm.querySelector('[name="city"]') as HTMLInputElement;
      const hiddenState = hiddenForm.querySelector('[name="state"]') as HTMLInputElement;
      const hiddenPhone = hiddenForm.querySelector('[name="phone"]') as HTMLInputElement;
      const hiddenEmail = hiddenForm.querySelector('[name="email"]') as HTMLInputElement;
      const hiddenDistributorship = hiddenForm.querySelector(
        '[name="distributorship"]',
      ) as HTMLInputElement;
      const hiddenMessage = hiddenForm.querySelector('[name="message"]') as HTMLTextAreaElement;

      if (hiddenFirstName) hiddenFirstName.value = formFirstName;
      if (hiddenLastName) hiddenLastName.value = formLastName;
      if (hiddenCity) hiddenCity.value = formCity;
      if (hiddenState) hiddenState.value = formState;
      if (hiddenPhone) hiddenPhone.value = formPhone;
      if (hiddenEmail) hiddenEmail.value = formEmail;
      if (hiddenDistributorship) hiddenDistributorship.value = formDistributorship;
      if (hiddenMessage) hiddenMessage.value = formMessage;

      hiddenForm.submit();
    }
  };

  const { slice }: Props = $props();

  onMount(() => {
    let resizeObserver: ResizeObserver | null = null;

    // Initialize Rive if attachment exists (works for both 'default' and 'imageTableText' variations)
    if (
      riveCanvas &&
      (slice.variation === "imageTableText" || slice.variation === "default") &&
      isFilled.linkToMedia(slice.primary.rive)
    ) {
      riveInstance = new rive.Rive({
        src: slice.primary.rive.url,
        canvas: riveCanvas,
        autoplay: true,
        stateMachines: "State Machine 1",
        autoBind: true,
        layout: new rive.Layout({
          fit: rive.Fit.Contain,
          alignment: rive.Alignment.Center,
        }),
        onLoad: () => {
          riveInstance?.resizeDrawingSurfaceToCanvas();

          const vmi = riveInstance?.viewModelInstance;
          if (vmi) {
            const overridesRaw = (
              slice.primary as {
                rive_overrides?: Content.TwoColSliceDefaultPrimaryRiveOverridesItem[];
              }
            ).rive_overrides;
            const overrides: Partial<Content.TwoColSliceDefaultPrimaryRiveOverridesItem> =
              (Array.isArray(overridesRaw) ? overridesRaw[0] : overridesRaw) ?? {};
            const setText = (prop: string, value: string | null | undefined) => {
              if (!value) return;
              const p = vmi.string(prop);
              if (!p) return;
              p.value = value.trim().toLowerCase() === "hide" ? "" : value;
            };
            setText("textTopLeft", overrides.top_left_corner_text);
            setText("textTopRight", overrides.top_right_corner_text);
            setText("textBottomLeft", overrides.bottom_left_corner_text);
            setText("textBottomRight", overrides.bottom_right_corner_text);
            setText("textLeft", overrides.text_hover_left);
            setText("textRight", overrides.text_hover_right);
            setText("textUp", overrides.text_hover_top);
          }
        },
        onLoadError: (error) => {
          console.error("Failed to load Rive file:", error);
        },
      });

      resizeObserver = new ResizeObserver(() => {
        riveInstance?.resizeDrawingSurfaceToCanvas();
      });
      resizeObserver.observe(riveCanvas);
    }

    // Cleanup
    return () => {
      resizeObserver?.disconnect();
      riveInstance?.cleanup();
    };
  });
</script>

<section
  data-slice-type={slice.slice_type}
  data-slice-variation={slice.variation}
  style="padding-top:{parseInt(slice.primary.vertical_padding) * 4}px;padding-bottom:{parseInt(
    slice.primary.vertical_padding,
  ) * 4}px;"
  class="text-white"
>
  {#if slice.variation === "default" || slice.variation === "imageTableText"}
    <ContentWidth
      class="flex relative pt-16 {slice.primary.isMediaFirst
        ? 'flex-col md:flex-row'
        : 'flex-col-reverse md:flex-row-reverse'}"
    >
      {#if slice.primary.showTopBorder}
        <div class="absolute w-full h-0.5 top-0 left-0 bg-white"></div>
      {/if}

      <div class="w-full my-6 md:w-1/2">
        {#if slice.primary.vimeo_id}
          <div
            class="relative w-full overflow-clip {slice.primary.image_aspect === '4:3'
              ? 'aspect-4/3'
              : slice.primary.image_aspect === '3:4'
                ? 'aspect-3/4'
                : slice.primary.image_aspect === '16:9'
                  ? 'aspect-video'
                  : slice.primary.image_aspect === '9:16'
                    ? 'aspect-9/16'
                    : slice.primary.image_aspect === 'square'
                      ? 'aspect-square'
                      : ''}"
          >
            {#if isFilled.image(slice.primary.image)}
              <PrismicImage
                field={slice.primary.image}
                class="absolute w-full h-full object-cover"
              />
            {/if}
            <iframe
              title="video"
              src={`https://player.vimeo.com/video/${slice.primary.vimeo_id}?background=1&muted=1&loop=1&autoplay=1`}
              class="absolute w-full h-full contrast-[1.15]"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        {:else if isFilled.linkToMedia(slice.primary.rive)}
          <div
            class="relative w-full {slice.primary.image_aspect === '4:3'
              ? 'aspect-4/3'
              : slice.primary.image_aspect === '3:4'
                ? 'aspect-3/4'
                : slice.primary.image_aspect === '16:9'
                  ? 'aspect-video'
                  : slice.primary.image_aspect === '9:16'
                    ? 'aspect-9/16'
                    : slice.primary.image_aspect === 'square'
                      ? 'aspect-square'
                      : ''}"
          >
            <canvas bind:this={riveCanvas} class="absolute top-0 left-0 w-full h-[calc(100%+12px)]"
            ></canvas>
          </div>
        {:else}
          <PrismicImage
            field={slice.primary.image}
            class="w-full object-cover {slice.primary.image_aspect === '4:3'
              ? 'aspect-4/3'
              : slice.primary.image_aspect === '3:4'
                ? 'aspect-3/4'
                : slice.primary.image_aspect === '16:9'
                  ? 'aspect-video'
                  : slice.primary.image_aspect === '9:16'
                    ? 'aspect-9/16'
                    : slice.primary.image_aspect === 'square'
                      ? 'aspect-square'
                      : ''}"
          />
        {/if}
      </div>

      <div
        class="w-full md:w-1/2 flex flex-col gap-6 my-6 md:mt-0 {slice.primary.isMediaFirst
          ? 'md:pl-20'
          : 'md:pr-20'}"
      >
        <PrismicRichText field={slice.primary.text} />
        <div class="flex gap-5">
          {#if isFilled.link(slice.primary.button)}
            <DefaultButton href={slice.primary.button.url}
              >{slice.primary.button.text}</DefaultButton
            >
          {/if}
          {#if isFilled.link(slice.primary.button_two)}
            <DefaultButton href={slice.primary.button_two.url}
              >{slice.primary.button_two.text}</DefaultButton
            >
          {/if}
        </div>

        {#if slice.variation === "imageTableText"}
          <div class="w-full mt-16 flex flex-col gap-2">
            <div class="w-full flex flex-row">
              <p
                class="uppercase {slice.primary.table_column === 'desc & #, no sizes'
                  ? 'w-2/3'
                  : 'w-1/3'}"
              >
                {slice.primary.col_one_label || "description"}
              </p>
              {#if slice.primary.table_column !== "desc & #, no sizes"}
                <p class="uppercase w-1/6">{slice.primary.col_three_label || "size"}</p>
              {/if}
              {#if slice.primary.table_column === "desc and two sizes and #"}
                <p class="uppercase w-1/6">{slice.primary.col_three_label || "size"}</p>
              {/if}
              <p class="uppercase w-1/3 ml-auto">{slice.primary.last_col_label || "part number"}</p>
            </div>
            <div class="h-[1px] w-full bg-white"></div>
            {#each slice.primary.products as product, productIndex (productIndex)}
              <div class="w-full flex flex-row">
                <p
                  class="{slice.primary.table_column === 'desc & #, no sizes'
                    ? 'w-2/3'
                    : 'w-1/3'} pr-4"
                >
                  {product.description}
                </p>
                {#if slice.primary.table_column !== "desc & #, no sizes"}
                  <p class="w-1/6 pr-4">{product.size_one}</p>
                {/if}
                {#if slice.primary.table_column === "desc and two sizes and #"}
                  <p class="w-1/6 pr-4">{product.size_two}</p>
                {/if}
                <p class="w-1/3 ml-auto">{product.product_number}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </ContentWidth>
  {/if}

  {#if slice.variation === "contactForm"}
    <ContentWidth class="flex relative pt-16 flex-col">
      <div class="w-full my-6">
        <PrismicRichText field={slice.primary.text} />

        <div class="mt-12 flex flex-col gap-6">
          <!-- First row - First Name and Last Name -->
          <div class="w-full flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/2">
              <p class="text-white mb-2 text-sm uppercase tracking-wide">FIRST NAME*</p>
              <input
                type="text"
                name="first-name"
                bind:value={formFirstName}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
            <div class="w-full md:w-1/2">
              <p class="text-white mb-2 text-sm uppercase tracking-wide">LAST NAME*</p>
              <input
                type="text"
                name="last-name"
                bind:value={formLastName}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
          </div>

          <!-- Second row - City and State -->
          <div class="w-full flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/2">
              <p class="text-white mb-2 text-sm uppercase tracking-wide">CITY*</p>
              <input
                type="text"
                name="city"
                bind:value={formCity}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
            <div class="w-full md:w-1/2">
              <p class="text-white mb-2 text-sm uppercase tracking-wide">STATE*</p>
              <select
                name="state"
                bind:value={formState}
                required
                class="w-full bg-white/20 border border-white/30 p-3 text-white"
              >
                <option value="" class="bg-gray-800 text-white">Select a state</option>
                <option value="AL" class="bg-gray-800 text-white">Alabama</option>
                <option value="AK" class="bg-gray-800 text-white">Alaska</option>
                <option value="AZ" class="bg-gray-800 text-white">Arizona</option>
                <option value="AR" class="bg-gray-800 text-white">Arkansas</option>
                <option value="CA" class="bg-gray-800 text-white">California</option>
                <option value="CO" class="bg-gray-800 text-white">Colorado</option>
                <option value="CT" class="bg-gray-800 text-white">Connecticut</option>
                <option value="DE" class="bg-gray-800 text-white">Delaware</option>
                <option value="FL" class="bg-gray-800 text-white">Florida</option>
                <option value="GA" class="bg-gray-800 text-white">Georgia</option>
                <option value="HI" class="bg-gray-800 text-white">Hawaii</option>
                <option value="ID" class="bg-gray-800 text-white">Idaho</option>
                <option value="IL" class="bg-gray-800 text-white">Illinois</option>
                <option value="IN" class="bg-gray-800 text-white">Indiana</option>
                <option value="IA" class="bg-gray-800 text-white">Iowa</option>
                <option value="KS" class="bg-gray-800 text-white">Kansas</option>
                <option value="KY" class="bg-gray-800 text-white">Kentucky</option>
                <option value="LA" class="bg-gray-800 text-white">Louisiana</option>
                <option value="ME" class="bg-gray-800 text-white">Maine</option>
                <option value="MD" class="bg-gray-800 text-white">Maryland</option>
                <option value="MA" class="bg-gray-800 text-white">Massachusetts</option>
                <option value="MI" class="bg-gray-800 text-white">Michigan</option>
                <option value="MN" class="bg-gray-800 text-white">Minnesota</option>
                <option value="MS" class="bg-gray-800 text-white">Mississippi</option>
                <option value="MO" class="bg-gray-800 text-white">Missouri</option>
                <option value="MT" class="bg-gray-800 text-white">Montana</option>
                <option value="NE" class="bg-gray-800 text-white">Nebraska</option>
                <option value="NV" class="bg-gray-800 text-white">Nevada</option>
                <option value="NH" class="bg-gray-800 text-white">New Hampshire</option>
                <option value="NJ" class="bg-gray-800 text-white">New Jersey</option>
                <option value="NM" class="bg-gray-800 text-white">New Mexico</option>
                <option value="NY" class="bg-gray-800 text-white">New York</option>
                <option value="NC" class="bg-gray-800 text-white">North Carolina</option>
                <option value="ND" class="bg-gray-800 text-white">North Dakota</option>
                <option value="OH" class="bg-gray-800 text-white">Ohio</option>
                <option value="OK" class="bg-gray-800 text-white">Oklahoma</option>
                <option value="OR" class="bg-gray-800 text-white">Oregon</option>
                <option value="PA" class="bg-gray-800 text-white">Pennsylvania</option>
                <option value="RI" class="bg-gray-800 text-white">Rhode Island</option>
                <option value="SC" class="bg-gray-800 text-white">South Carolina</option>
                <option value="SD" class="bg-gray-800 text-white">South Dakota</option>
                <option value="TN" class="bg-gray-800 text-white">Tennessee</option>
                <option value="TX" class="bg-gray-800 text-white">Texas</option>
                <option value="UT" class="bg-gray-800 text-white">Utah</option>
                <option value="VT" class="bg-gray-800 text-white">Vermont</option>
                <option value="VA" class="bg-gray-800 text-white">Virginia</option>
                <option value="WA" class="bg-gray-800 text-white">Washington</option>
                <option value="WV" class="bg-gray-800 text-white">West Virginia</option>
                <option value="WI" class="bg-gray-800 text-white">Wisconsin</option>
                <option value="WY" class="bg-gray-800 text-white">Wyoming</option>
              </select>
            </div>
          </div>

          <!-- Third row - Email and Phone -->
          <div class="w-full flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/2">
              <p class="text-white mb-2 text-sm uppercase tracking-wide">EMAIL*</p>
              <input
                type="email"
                name="email"
                bind:value={formEmail}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
            <div class="w-full md:w-1/2">
              <p class="text-white mb-2 text-sm uppercase tracking-wide">PHONE</p>
              <input
                type="phone"
                name="phone"
                bind:value={formPhone}
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
          </div>

          <!-- Fourth row - Current Distributorship (full width) -->
          <div class="w-full">
            <p class="text-white mb-2 text-sm uppercase tracking-wide">CURRENT DISTRIBUTORSHIP</p>
            <input
              type="text"
              name="distributorship"
              bind:value={formDistributorship}
              required
              placeholder=""
              class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
            />
          </div>

          <!-- Message field (full width) -->
          <div class="w-full">
            <p class="text-white mb-2 text-sm uppercase tracking-wide">MESSAGE</p>
            <textarea
              name="message"
              bind:value={formMessage}
              required
              placeholder=""
              class="min-h-32 w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60 resize-vertical"
            ></textarea>
          </div>

          <!-- Hidden honeypot field -->
          <p class="hidden">
            <label>
              Don't fill this out if you're human: <input name="bot-field" />
            </label>
          </p>

          <!-- Submit button -->
          <DefaultButton onclick={triggerSubmitButton}>SUBMIT</DefaultButton>
        </div>
      </div>
    </ContentWidth>
  {/if}

  {#if slice.variation === "tableText"}
    <ContentWidth
      class="flex relative pt-16 {!slice.primary.isTableFirst
        ? 'flex-col md:flex-row'
        : 'flex-col-reverse md:flex-row-reverse'}"
    >
      {#if slice.primary.showTopBorder}
        <div class="absolute w-full h-0.5 top-0 left-0 bg-white"></div>
      {/if}
      <div class="w-full md:w-1/2 flex flex-col gap-6 mt-6 md:mt-0">
        <PrismicRichText field={slice.primary.text} />
        <div class="flex gap-5">
          {#if isFilled.link(slice.primary.button)}
            <DefaultButton href={slice.primary.button.url}
              >{slice.primary.button.text}</DefaultButton
            >
          {/if}
          {#if isFilled.link(slice.primary.button_two)}
            <DefaultButton href={slice.primary.button_two.url}
              >{slice.primary.button_two.text}</DefaultButton
            >
          {/if}
        </div>
      </div>
      <div class="w-full md:w-1/2 flex flex-col gap-6 mt-6 md:mt-0">
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex flex-row">
            <p
              class="uppercase {slice.primary.table_column === 'desc & #, no sizes'
                ? 'w-2/3'
                : 'w-1/3'}"
            >
              {slice.primary.col_one_label || "description"}
            </p>
            {#if slice.primary.table_column !== "desc & #, no sizes"}
              <p class="uppercase w-1/6">{slice.primary.col_two_label || "size"}</p>
            {/if}
            {#if slice.primary.table_column === "desc and two sizes and #"}
              <p class="uppercase w-1/6">{slice.primary.col_three_label || "size"}</p>
            {/if}
            <p class="uppercase w-1/3 ml-auto">{slice.primary.last_col_label || "part number"}</p>
          </div>
          <div class="h-[1px] w-full bg-white"></div>
          {#each slice.primary.products as product, productIndex (productIndex)}
            <div class="w-full flex flex-row">
              <p
                class=" {slice.primary.table_column === 'desc & #, no sizes'
                  ? 'w-2/3'
                  : 'w-1/3'} pr-4"
              >
                {product.description}
              </p>
              {#if slice.primary.table_column !== "desc & #, no sizes"}
                <p class="w-1/6 pr-4">{product.size_one}</p>
              {/if}
              {#if slice.primary.table_column === "desc and two sizes and #"}
                <p class="w-1/6 pr-4">{product.size_two}</p>
              {/if}
              <p class="w-1/3 ml-auto">{product.product_number}</p>
            </div>
          {/each}
        </div>
      </div>
    </ContentWidth>
  {/if}
</section>
