import type { LinkField } from "@prismicio/client";

export interface LinkTargetAttrs {
  target?: string;
  rel?: string;
}

const NEW_WINDOW_REL = "noopener noreferrer";

export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url, "https://revogen.invalid").pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

function fieldUrl(field: LinkField | null | undefined): string | undefined {
  return field && "url" in field && typeof field.url === "string" ? field.url : undefined;
}

export function isPdfLink(field: LinkField | null | undefined, href?: string | null): boolean {
  if (isPdfUrl(href) || isPdfUrl(fieldUrl(field))) return true;
  if (!field || field.link_type !== "Media" || !("url" in field)) return false;
  const name = "name" in field && typeof field.name === "string" ? field.name : "";
  const kind = "kind" in field && typeof field.kind === "string" ? field.kind : "";
  return name.toLowerCase().endsWith(".pdf") || kind === "document";
}

export function linkTargetAttrs(
  href: string | null | undefined,
  field?: LinkField | null,
  explicitTarget?: string | null,
): LinkTargetAttrs {
  const editorTarget =
    explicitTarget ||
    (field && "target" in field && typeof field.target === "string" ? field.target : undefined);
  if (editorTarget) {
    return editorTarget === "_blank"
      ? { target: editorTarget, rel: NEW_WINDOW_REL }
      : { target: editorTarget };
  }
  if (isPdfLink(field, href)) return { target: "_blank", rel: NEW_WINDOW_REL };
  return {};
}
