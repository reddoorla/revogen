// The `settings` singleton (P1-120 phase 3): site-wide words, menus and
// interface text an editor can change in Prismic. Every field is optional:
// each component renders today's wording when its field is empty, and the
// whole site renders today's wording when there is no `settings` document at
// all (the operator's 2026-11-21 answer: keep code fallbacks).
import * as prismic from "@prismicio/client";
import type { SettingsDocument } from "../../prismicio-types";

export type Settings = SettingsDocument["data"];

/**
 * The `settings` document's data, or null when there is none.
 *
 * Only "no such document" is quiet. Any other failure (Prismic down, a bad
 * token) is rethrown while prerendering, so a build never ships the code
 * wording in place of an editor's, and is quiet at request time, so an expired
 * preview cookie cannot turn every server-rendered page into a 500 (MSOT's
 * 2026-11-05 lesson).
 */
export async function loadSettings(
  client: prismic.Client,
  building: boolean,
): Promise<Settings | null> {
  try {
    const doc = await client.getSingle<SettingsDocument>("settings");
    return doc.data;
  } catch (e) {
    if (e instanceof prismic.NotFoundError) return null;
    if (building) throw e;
    return null;
  }
}

/** A one-paragraph rich-text field as its lines (Shift+Enter breaks), or [] when empty. */
export function textLines(field: prismic.RichTextField | null | undefined): string[] {
  if (!prismic.isFilled.richText(field)) return [];
  return prismic.asText(field).split("\n");
}

/** A link field's href, or "" when the field is empty. */
export function linkHref(field: prismic.LinkField | null | undefined): string {
  return (prismic.isFilled.link(field) && prismic.asLink(field)) || "";
}

/** One menu entry, as the nav and footer render it. */
export type MenuEntry = { lines: string[]; href: string; column: string; is_sub_item: boolean };

type MenuRow = {
  label: prismic.RichTextField;
  link: prismic.LinkField;
  column?: prismic.SelectField;
  is_sub_item?: prismic.BooleanField;
};

/** A menu group's rows as entries; a row with no label or no link is skipped. */
export function menuFromGroup(rows: prismic.GroupField<MenuRow> | null | undefined): MenuEntry[] {
  return (rows ?? [])
    .map((row) => ({
      lines: textLines(row.label),
      href: linkHref(row.link),
      column: row.column ?? "left",
      is_sub_item: row.is_sub_item === true,
    }))
    .filter((entry) => entry.lines.length > 0 && entry.href !== "");
}
