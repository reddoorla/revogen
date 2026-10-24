<script lang="ts">
  import { goto } from "$app/navigation";
  import { isTransitioning } from "$lib/stores/isTransitioning";
  import { isFilled, type LinkField } from "@prismicio/client";
  import { linkTargetAttrs } from "$lib/links";
  import { onMount, type Snippet } from "svelte";
  import type { HTMLAnchorAttributes, MouseEventHandler } from "svelte/elements";

  interface DelayedLinkProps extends Omit<HTMLAnchorAttributes, "onclick"> {
    href: string;
    delay?: number;
    children: Snippet;
    beforeNavigate?: (event: MouseEvent) => void | Promise<void>;
    onclick?: MouseEventHandler<HTMLAnchorElement>;
    field?: LinkField;
  }

  let {
    href,
    field,
    delay = 400,
    children,
    beforeNavigate,
    onclick,
    target,
    rel,
    ...props
  }: DelayedLinkProps = $props();

  const targetAttrs = $derived(linkTargetAttrs(href, field, target));

  const isInternalLink = (url: string): boolean => {
    if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
      return true;
    }

    if (url.startsWith("#")) {
      return true;
    }

    try {
      const linkUrl = new URL(url, window.location.origin);
      return linkUrl.origin === window.location.origin;
    } catch {
      return true;
    }
  };

  const handleClick: MouseEventHandler<HTMLAnchorElement> = async (event) => {
    // Only apply delayed navigation to internal links that open in this window
    if (isInternalLink(href) && !targetAttrs.target) {
      isTransitioning.set(true);

      if (onclick) {
        await onclick(event);
        if (event.defaultPrevented) {
          return;
        }
      }

      if (beforeNavigate) {
        await beforeNavigate(event);
      }

      event.preventDefault();
      setTimeout(() => {
        // Kit 3 rejects goto() for a path with no page route
        // (navigation_route_missing), where kit 2 fell back to a full page
        // load, and for a URL outside the app such as "//other.host/x"
        // (navigation_external_url). Either way the transition overlay is
        // already up, so load the page the way a plain link would.
        goto(href).catch((error) => {
          console.warn("DelayedLink: goto failed, loading the page instead", error);
          window.location.href = href;
        });
      }, delay);
    } else {
      if (onclick) {
        await onclick(event);
      }
    }
  };

  onMount(() => {
    if (isFilled.link(field) && field.url) href = field.url;
  });
</script>

<a {href} target={targetAttrs.target} rel={rel ?? targetAttrs.rel} onclick={handleClick} {...props}>
  {@render children()}
</a>
