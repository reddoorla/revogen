<script lang="ts">
  import { page } from "$app/state";
  import { STATE_PLACEHOLDER, US_STATES } from "$lib/us-states";
  import VimeoGate from "$lib/components/VimeoGate.svelte";
  import ContentWidth from "$lib/components/ContentWidth/ContentWidth.svelte";
  import type { Content } from "@prismicio/client";
  import { PrismicImage, type SliceComponentProps } from "@prismicio/svelte";
  import RichText from "$lib/components/RichText/RichText.svelte";
  import { isFilled } from "@prismicio/client";
  import DefaultButton from "$lib/components/Buttons/DefaultButton.svelte";
  import ProductSpecTable from "$lib/components/ProductSpecTable.svelte";
  import TurnstileWidget from "$lib/components/TurnstileWidget.svelte";
  import * as rive from "@rive-app/canvas";
  import { onMount } from "svelte";
  import { cappedWidths } from "@reddoorla/maintenance/images";

  type Props = SliceComponentProps<Content.TwoColSlice>;

  // The media column is half the content width from `md` up, full width below.
  // Without this the browser assumes 100vw and picks a far wider srcset
  // candidate than the slot needs.
  const MEDIA_COLUMN_SIZES = "(min-width: 768px) 50vw, 100vw";

  let formFirstName = $state("");
  let formLastName = $state("");
  let formCity = $state("");
  let formState = $state("");
  let formPhone = $state("");
  let formEmail = $state("");
  let formDistributorship = $state("");
  let formMessage = $state("");
  let formBotField = $state("");
  // Optional Cloudflare Turnstile token from the visible widget; forwarded to
  // central verify as `cf-turnstile-response`. Empty until an operator sets
  // PUBLIC_TURNSTILE_SITE_KEY (widget stays dark) — ingest is fail-open.
  let turnstileToken = $state("");

  // Submission UI state for the contact / distributor form.
  let submitting = $state(false);
  let submitted = $state(false);
  let submitError = $state(false);

  // State for Rive
  let riveCanvas: HTMLCanvasElement | undefined = $state();
  let riveInstance: rive.Rive | null = null;
  // Flipped by Rive's onLoadError (blocked WASM, a failed .riv fetch, a corrupt
  // file). Only then does the product still render, in the canvas's place. It
  // must never sit *behind* a live canvas: the artboard is transparent outside
  // its artwork, so the still — with its own baked-in labels — shows straight
  // through. Guarded by tests/smoke/rive-fallback.spec.ts.
  let riveFailed = $state(false);

  const triggerSubmitButton = async (form: HTMLFormElement) => {
    // The central ingest is not idempotent — guard against double submits.
    if (submitting) return;
    submitting = true;
    submitError = false;

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          formType: "contact",
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          phone: formPhone,
          message: formMessage,
          city: formCity,
          state: formState,
          distributorship: formDistributorship,
          "bot-field": formBotField,
          "cf-turnstile-response": turnstileToken,
          sourceUrl: window.location.href,
          // The fleet form-e2e probe's marker: a hidden input it injects, so it is
          // read from the form element, not from the bound state above. Central
          // ingest drops a payload carrying it instead of emailing the client.
          ...(new FormData(form).get("testMode") === "true" ? { testMode: "true" } : {}),
        }),
      });
      const result: { ok?: boolean } = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        submitted = true;
      } else {
        submitError = true;
      }
    } catch {
      submitError = true;
    } finally {
      submitting = false;
    }
  };

  // Native form submit: the browser runs `required`/type validation first, so
  // this handler only fires once the form is valid.
  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    triggerSubmitButton(event.currentTarget as HTMLFormElement);
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
          riveFailed = true;
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
                sizes={MEDIA_COLUMN_SIZES}
                widths={cappedWidths(slice.primary.image)}
                loading="lazy"
                class="absolute w-full h-full object-cover"
              />
            {/if}
            <VimeoGate>
              <iframe
                title={page.data.settings?.video_title || "video"}
                src={`https://player.vimeo.com/video/${slice.primary.vimeo_id}?background=1&muted=1&loop=1&autoplay=1&dnt=1`}
                class="absolute w-full h-full contrast-[1.15]"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </VimeoGate>
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
            <!-- Fallback: the product still, rendered only once Rive has reported
                 a load error. Editors set both an image and a .riv on these
                 slices; without this, any Rive failure left an empty box. While
                 Rive is live the still is NOT rendered — see `riveFailed`. -->
            {#if riveFailed && isFilled.image(slice.primary.image)}
              <PrismicImage
                field={slice.primary.image}
                sizes={MEDIA_COLUMN_SIZES}
                widths={cappedWidths(slice.primary.image)}
                loading="lazy"
                class="absolute top-0 left-0 w-full h-full object-contain"
              />
            {/if}
            <canvas bind:this={riveCanvas} class="absolute top-0 left-0 w-full h-[calc(100%+12px)]"
            ></canvas>
          </div>
        {:else}
          <PrismicImage
            field={slice.primary.image}
            sizes={MEDIA_COLUMN_SIZES}
            widths={cappedWidths(slice.primary.image)}
            loading="lazy"
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
          ? 'md:pl-20 lg:pl-column-gap'
          : 'md:pr-20 lg:pr-column-gap'}"
      >
        <RichText field={slice.primary.text} />
        <div class="flex gap-5">
          {#if isFilled.link(slice.primary.button)}
            <DefaultButton href={slice.primary.button.url} field={slice.primary.button}>
              {slice.primary.button.text}
            </DefaultButton>
          {/if}
          {#if isFilled.link(slice.primary.button_two)}
            <DefaultButton href={slice.primary.button_two.url} field={slice.primary.button_two}>
              {slice.primary.button_two.text}
            </DefaultButton>
          {/if}
        </div>

        {#if slice.variation === "imageTableText"}
          <ProductSpecTable
            class="mt-16"
            products={slice.primary.products}
            tableColumn={slice.primary.table_column}
            colOneLabel={slice.primary.col_one_label}
            colTwoLabel={slice.primary.col_two_label}
            colThreeLabel={slice.primary.col_three_label}
            lastColLabel={slice.primary.last_col_label}
            ariaLabel={slice.primary.col_one_label || "Product specifications"}
          />
        {/if}
      </div>
    </ContentWidth>
  {/if}

  {#if slice.variation === "contactForm"}
    <ContentWidth class="flex relative pt-16 flex-col">
      <div class="w-full my-6">
        <RichText field={slice.primary.text} />

        <form class="mt-12 flex flex-col gap-6" onsubmit={handleSubmit}>
          <!-- First row - First Name and Last Name -->
          <div class="w-full flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/2">
              <label
                for="cf-first-name"
                class="block text-white mb-2 text-sm uppercase tracking-wide"
              >
                {slice.primary.first_name_label || "FIRST NAME*"}
              </label>
              <input
                id="cf-first-name"
                type="text"
                name="first-name"
                bind:value={formFirstName}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
            <div class="w-full md:w-1/2">
              <label
                for="cf-last-name"
                class="block text-white mb-2 text-sm uppercase tracking-wide"
              >
                {slice.primary.last_name_label || "LAST NAME*"}
              </label>
              <input
                id="cf-last-name"
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
              <label for="cf-city" class="block text-white mb-2 text-sm uppercase tracking-wide">
                {slice.primary.city_label || "CITY*"}
              </label>
              <input
                id="cf-city"
                type="text"
                name="city"
                bind:value={formCity}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
            <div class="w-full md:w-1/2">
              <label for="cf-state" class="block text-white mb-2 text-sm uppercase tracking-wide">
                {slice.primary.state_label || "STATE*"}
              </label>
              <select
                id="cf-state"
                name="state"
                bind:value={formState}
                required
                class="w-full bg-white/20 border border-white/30 p-3 text-white"
              >
                <option value="" class="bg-gray-800 text-white">{STATE_PLACEHOLDER}</option>
                {#each US_STATES as [code, name] (code)}
                  <option value={code} class="bg-gray-800 text-white">{name}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Third row - Email and Phone -->
          <div class="w-full flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-1/2">
              <label for="cf-email" class="block text-white mb-2 text-sm uppercase tracking-wide">
                {slice.primary.email_label || "EMAIL*"}
              </label>
              <input
                id="cf-email"
                type="email"
                name="email"
                bind:value={formEmail}
                required
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
            <div class="w-full md:w-1/2">
              <label for="cf-phone" class="block text-white mb-2 text-sm uppercase tracking-wide">
                {slice.primary.phone_label || "PHONE"}
              </label>
              <input
                id="cf-phone"
                type="tel"
                name="phone"
                bind:value={formPhone}
                placeholder=""
                class="w-full bg-white/20 border border-white/30 p-3 text-white placeholder-white/60"
              />
            </div>
          </div>

          <!-- Fourth row - Current Distributorship (full width) -->
          <div class="w-full">
            <label
              for="cf-distributorship"
              class="block text-white mb-2 text-sm uppercase tracking-wide"
            >
              {slice.primary.distributorship_label || "CURRENT DISTRIBUTORSHIP"}
            </label>
            <input
              id="cf-distributorship"
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
            <label for="cf-message" class="block text-white mb-2 text-sm uppercase tracking-wide">
              {slice.primary.message_label || "MESSAGE"}
            </label>
            <textarea
              id="cf-message"
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
              {slice.primary.honeypot_label || "Don't fill this out if you're human:"}
              <input name="bot-field" bind:value={formBotField} tabindex="-1" autocomplete="off" />
            </label>
          </p>

          <!-- Cloudflare Turnstile (visible so a challenge can run); dark until
               PUBLIC_TURNSTILE_SITE_KEY is set. Token forwarded to central verify. -->
          <TurnstileWidget onToken={(t) => (turnstileToken = t)} />

          <!-- Submit button. DefaultButton wraps itself in a `w-fit` div, which
               as a flex-column child would sit hard left under the full-width
               fields — so centre the submit block explicitly. -->
          <div class="flex flex-col items-center text-center">
            <!-- An always-present live region, empty until the thanks renders inside
                 it, so a screen reader announces it. It is also the success signal
                 the fleet's form-e2e probe waits for. -->
            <div role="status" aria-live="polite">
              {#if submitted}
                <p class="text-white">
                  {slice.primary.success_message || "Thanks — your message has been sent."}
                </p>
              {/if}
            </div>
            {#if !submitted}
              <DefaultButton type="submit" disabled={submitting}>
                {submitting
                  ? slice.primary.sending_label || "SENDING..."
                  : slice.primary.submit_label || "SUBMIT"}
              </DefaultButton>
              {#if submitError}
                <p class="text-white" role="alert">
                  {slice.primary.error_message ||
                    "Something went wrong sending your message. Please try again."}
                </p>
              {/if}
            {/if}
          </div>
        </form>
      </div>
    </ContentWidth>
  {/if}

  {#if slice.variation === "tableText"}
    <!-- The column gap applies from lg up only; below that the text and the
         table sit edge to edge at md and stack on phones. -->
    <ContentWidth
      class="flex relative pt-16 lg:gap-column-gap {!slice.primary.isTableFirst
        ? 'flex-col md:flex-row'
        : 'flex-col-reverse md:flex-row-reverse'}"
    >
      {#if slice.primary.showTopBorder}
        <div class="absolute w-full h-0.5 top-0 left-0 bg-white"></div>
      {/if}
      <div class="w-full md:w-1/2 flex flex-col gap-6 mt-6 md:mt-0">
        <RichText field={slice.primary.text} />
        <div class="flex gap-5">
          {#if isFilled.link(slice.primary.button)}
            <DefaultButton href={slice.primary.button.url} field={slice.primary.button}>
              {slice.primary.button.text}
            </DefaultButton>
          {/if}
          {#if isFilled.link(slice.primary.button_two)}
            <DefaultButton href={slice.primary.button_two.url} field={slice.primary.button_two}>
              {slice.primary.button_two.text}
            </DefaultButton>
          {/if}
        </div>
      </div>
      <div class="w-full md:w-1/2 flex flex-col gap-6 mt-6 md:mt-0">
        <ProductSpecTable
          products={slice.primary.products}
          tableColumn={slice.primary.table_column}
          colOneLabel={slice.primary.col_one_label}
          colTwoLabel={slice.primary.col_two_label}
          colThreeLabel={slice.primary.col_three_label}
          lastColLabel={slice.primary.last_col_label}
          ariaLabel={slice.primary.col_one_label || "Product specifications"}
        />
      </div>
    </ContentWidth>
  {/if}
</section>
