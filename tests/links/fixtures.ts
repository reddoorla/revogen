import type { LinkField } from "@prismicio/client";

export const mediaPdf = {
  link_type: "Media",
  key: "media-pdf",
  kind: "document",
  id: "media-pdf",
  url: "https://revogen.cdn.prismic.io/revogen/96f-CpUVnQomC6k4_Allograft_Combined-1009.pdf",
  name: "Allograft_Combined-1009.pdf",
  size: "1",
  text: "Multi-Product Brochure",
} as unknown as LinkField;

export const mediaPdfNoExtension = {
  link_type: "Media",
  key: "media-pdf-bare",
  kind: "document",
  id: "media-pdf-bare",
  url: "https://revogen.cdn.prismic.io/revogen/abc_brochure",
  name: "brochure.pdf",
  size: "1",
  text: "Bare media PDF",
} as unknown as LinkField;

export const webPdfWithQuery = {
  link_type: "Web",
  key: "web-pdf",
  url: "https://example.com/files/Spec-Sheet.PDF?version=3#page=2",
  text: "Spec sheet",
} as unknown as LinkField;

export const dropboxPdf = {
  link_type: "Web",
  key: "dropbox-pdf",
  url: "https://www.dropbox.com/scl/fi/abc123/Allograft_Combined-1009.pdf?rlkey=xyz789&dl=0",
  text: "Dropbox brochure",
} as unknown as LinkField;

export const nonPdf = {
  link_type: "Web",
  key: "non-pdf",
  url: "https://example.com/pdf-guide?format=pdf",
  text: "Not a PDF",
} as unknown as LinkField;

export const internalPage = {
  link_type: "Web",
  key: "internal",
  url: "/about",
  text: "About",
} as unknown as LinkField;

export const editorBlankNonPdf = {
  link_type: "Web",
  key: "editor-blank",
  url: "https://example.com/partners",
  target: "_blank",
  text: "Partners",
} as unknown as LinkField;
