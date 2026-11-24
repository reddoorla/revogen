import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

/**
 * Item in *form replies → replies*
 */
export interface FormRepliesDocumentDataRepliesItem {
	/**
	 * form field in *form replies → replies*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Pick the form this reply answers — one row per form
	 * - **API ID Path**: form_replies.replies[].form_type
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	form_type: prismic.SelectField<"contact" | "inquiry" | "newsletter" | "rsvp" | "reserve">;
	
	/**
	 * subject field in *form replies → replies*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Subject line of the email the visitor receives
	 * - **API ID Path**: form_replies.replies[].subject
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	subject: prismic.KeyTextField;
	
	/**
	 * body field in *form replies → replies*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: What the visitor reads. Bold, italic, links and lists are sent; other formatting is not.
	 * - **API ID Path**: form_replies.replies[].body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
}

/**
 * Content for form replies documents
 */
interface FormRepliesDocumentData {
	/**
	 * replies field in *form replies*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: form_replies.replies[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	replies: prismic.GroupField<Simplify<FormRepliesDocumentDataRepliesItem>>;
	
	/**
	 * signature field in *form replies*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Sign-off appended to every reply, whatever the form
	 * - **API ID Path**: form_replies.signature
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	signature: prismic.RichTextField;
}

/**
 * form replies document from Prismic
 *
 * - **API ID**: `form_replies`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FormRepliesDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<FormRepliesDocumentData>, "form_replies", Lang>;

type PageDocumentDataSlicesSlice = HomeHeroSlice | DistributorLoginSlice | ScreenWidthVideoSlice | TwoColSlice | ImageRowSlice | HomePageAnimSlice | RichTextSlice | FeaturedProductSlice

/**
 * Content for Page documents
 */
interface PageDocumentData {
	/**
	 * default background field in *Page*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: light_blue
	 * - **API ID Path**: page.default_background
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	default_background: prismic.SelectField<"light_blue" | "pink" | "dark_blue" | "teal", "filled">;
	
	/**
	 * Slice Zone field in *Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<PageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Page document from Prismic
 *
 * - **API ID**: `page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<PageDocumentData>, "page", Lang>;

/**
 * Item in *resourceHubCategory → headers*
 */
export interface ResourceHubCategoryDocumentDataHeadersItem {
	/**
	 * name field in *resourceHubCategory → headers*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.headers[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * general field in *resourceHubCategory → headers*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.headers[].general
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	general: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * documents field in *resourceHubCategory → headers*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.headers[].distributor_documents
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	distributor_documents: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * papers  field in *resourceHubCategory → headers*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.headers[].white_papers
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	white_papers: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
	
	/**
	 * videos field in *resourceHubCategory → headers*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.headers[].videos
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	videos: prismic.Repeatable<prismic.LinkField<string, string, unknown, prismic.FieldState, never>>;
}

/**
 * Content for resourceHubCategory documents
 */
interface ResourceHubCategoryDocumentData {
	/**
	 * name field in *resourceHubCategory*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * image field in *resourceHubCategory*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.image
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * headers field in *resourceHubCategory*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: resource_hub_category.headers[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	headers: prismic.GroupField<Simplify<ResourceHubCategoryDocumentDataHeadersItem>>;
}

/**
 * resourceHubCategory document from Prismic
 *
 * - **API ID**: `resource_hub_category`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ResourceHubCategoryDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<ResourceHubCategoryDocumentData>, "resource_hub_category", Lang>;

/**
 * Item in *Site settings → menu items*
 */
export interface SettingsDocumentDataNavItemsItem {
	/**
	 * label field in *Site settings → menu items*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Shift+Enter for a line break.
	 * - **API ID Path**: settings.nav_items[].label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	label: prismic.RichTextField;
	
	/**
	 * link field in *Site settings → menu items*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav_items[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * column field in *Site settings → menu items*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: left
	 * - **API ID Path**: settings.nav_items[].column
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	column: prismic.SelectField<"left" | "right", "filled">;
	
	/**
	 * sub-item (indented under the one above) field in *Site settings → menu items*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: settings.nav_items[].is_sub_item
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	is_sub_item: prismic.BooleanField;
}

/**
 * Item in *Site settings → footer links*
 */
export interface SettingsDocumentDataFooterLinksItem {
	/**
	 * label field in *Site settings → footer links*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Shift+Enter for a line break.
	 * - **API ID Path**: settings.footer_links[].label
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	label: prismic.RichTextField;
	
	/**
	 * link field in *Site settings → footer links*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_links[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * sub-item (indented under the one above) field in *Site settings → footer links*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: settings.footer_links[].is_sub_item
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	is_sub_item: prismic.BooleanField;
}

/**
 * Content for Site settings documents
 */
interface SettingsDocumentData {
	/**
	 * site name field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Brand name in browser tab titles, e.g. RevoGen Biologics. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.site_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	site_name: prismic.KeyTextField;
	
	/**
	 * header logo field in *Site settings*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.logo
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * footer tagline field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Line at the top of the footer. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.footer_tagline
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	footer_tagline: prismic.KeyTextField;
	
	/**
	 * copyright name field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Company name after the © year. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.copyright_name
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	copyright_name: prismic.KeyTextField;
	
	/**
	 * rights text field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Words after the company name, e.g. All Rights Reserved. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.rights_text
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	rights_text: prismic.KeyTextField;
	
	/**
	 * address field in *Site settings*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Footer address. Press Shift+Enter between lines. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.address
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	address: prismic.RichTextField;
	
	/**
	 * email field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Footer email address. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.email
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	email: prismic.KeyTextField;
	
	/**
	 * phone field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Footer phone number, as it should read. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.phone
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	phone: prismic.KeyTextField;
	
	/**
	 * LinkedIn link field in *Site settings*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.linkedin_url
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	linkedin_url: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * LinkedIn label field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Words shown for the LinkedIn link. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.linkedin_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	linkedin_label: prismic.KeyTextField;/**
	 * menu items field in *Site settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.nav_items[]
	 * - **Tab**: Menus
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	nav_items: prismic.GroupField<Simplify<SettingsDocumentDataNavItemsItem>>;
	
	/**
	 * footer links field in *Site settings*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: settings.footer_links[]
	 * - **Tab**: Menus
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	footer_links: prismic.GroupField<Simplify<SettingsDocumentDataFooterLinksItem>>;/**
	 * intro eyebrow field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Small line above the home intro tagline. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.intro_eyebrow
	 * - **Tab**: Home intro
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	intro_eyebrow: prismic.KeyTextField;
	
	/**
	 * intro tagline field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: The home intro's large line. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.intro_tagline
	 * - **Tab**: Home intro
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	intro_tagline: prismic.KeyTextField;/**
	 * menu button label field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Read by screen readers for the menu button. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.menu_toggle_label
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	menu_toggle_label: prismic.KeyTextField;
	
	/**
	 * logo description field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Read by screen readers for the header logo. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.logo_alt
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	logo_alt: prismic.KeyTextField;
	
	/**
	 * scroll button label field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Read by screen readers for the scroll-down arrow. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.scroll_label
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	scroll_label: prismic.KeyTextField;
	
	/**
	 * scroll arrow description field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Description of the scroll-down arrow image. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.scroll_arrow_alt
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	scroll_arrow_alt: prismic.KeyTextField;
	
	/**
	 * background image description field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Description of full-width background images. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.background_image_alt
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	background_image_alt: prismic.KeyTextField;
	
	/**
	 * background video title field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Title read for full-width background videos. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.background_video_title
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	background_video_title: prismic.KeyTextField;
	
	/**
	 * video title field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Title read for videos in two-column sections. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.video_title
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	video_title: prismic.KeyTextField;
	
	/**
	 * portrait notice field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Shown on phones held sideways. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.portrait_notice
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	portrait_notice: prismic.KeyTextField;
	
	/**
	 * page-not-found message field in *Site settings*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Shown when a page does not exist. {page} is replaced by the address asked for. Leave empty to keep today's wording.
	 * - **API ID Path**: settings.not_found_message
	 * - **Tab**: Interface text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	not_found_message: prismic.KeyTextField;
}

/**
 * Site settings document from Prismic
 *
 * - **API ID**: `settings`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SettingsDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<SettingsDocumentData>, "settings", Lang>;

type SurgicalGraftsDocumentDataSlicesSlice = TwoColSlice | HomePageAnimSlice | ImageRowSlice | ScreenWidthVideoSlice | RichTextSlice

/**
 * Content for surgical grafts documents
 */
interface SurgicalGraftsDocumentData {
	/**
	 * default background field in *surgical grafts*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: light_blue
	 * - **API ID Path**: surgical_grafts.default_background
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	default_background: prismic.SelectField<"light_blue" | "pink" | "dark_blue" | "teal", "filled">;
	
	/**
	 * Slice Zone field in *surgical grafts*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: surgical_grafts.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<SurgicalGraftsDocumentDataSlicesSlice>;/**
	 * Meta Title field in *surgical grafts*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: surgical_grafts.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *surgical grafts*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: surgical_grafts.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *surgical grafts*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: surgical_grafts.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * surgical grafts document from Prismic
 *
 * - **API ID**: `surgical_grafts`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type SurgicalGraftsDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<SurgicalGraftsDocumentData>, "surgical_grafts", Lang>;

export type AllDocumentTypes = FormRepliesDocument | PageDocument | ResourceHubCategoryDocument | SettingsDocument | SurgicalGraftsDocument;

/**
 * Primary content in *DistributorLogin → Default → Primary*
 */
export interface DistributorLoginSliceDefaultPrimary {
	/**
	 * vertical padding field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: distributor_login.default.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20", "filled">;
	
	/**
	 * password prompt field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Above the password box. Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.prompt
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	prompt: prismic.KeyTextField;
	
	/**
	 * password label field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.password_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	password_label: prismic.KeyTextField;
	
	/**
	 * help text field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Under the password box. Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.help_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	help_text: prismic.KeyTextField;
	
	/**
	 * wrong password message field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.error_message
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_message: prismic.KeyTextField;
	
	/**
	 * submit button label field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Read by screen readers for the arrow button. Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.submit_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	submit_label: prismic.KeyTextField;
	
	/**
	 * intro field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Paragraph shown once signed in. Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	intro: prismic.KeyTextField;
	
	/**
	 * topics heading field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Above the topic circles. Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.topics_heading
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	topics_heading: prismic.KeyTextField;
	
	/**
	 * general heading field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.general_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	general_label: prismic.KeyTextField;
	
	/**
	 * documents heading field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.documents_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	documents_label: prismic.KeyTextField;
	
	/**
	 * papers heading field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.papers_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	papers_label: prismic.KeyTextField;
	
	/**
	 * videos heading field in *DistributorLogin → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: distributor_login.default.primary.videos_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	videos_label: prismic.KeyTextField;
}

/**
 * Default variation for DistributorLogin Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type DistributorLoginSliceDefault = prismic.SharedSliceVariation<"default", Simplify<DistributorLoginSliceDefaultPrimary>, never>;

/**
 * Slice variation for *DistributorLogin*
 */
type DistributorLoginSliceVariation = DistributorLoginSliceDefault

/**
 * DistributorLogin Shared Slice
 *
 * - **API ID**: `distributor_login`
 * - **Description**: DistributorLogin
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type DistributorLoginSlice = prismic.SharedSlice<"distributor_login", DistributorLoginSliceVariation>;

/**
 * Primary content in *FeaturedProduct → Default → Primary*
 */
export interface FeaturedProductSliceDefaultPrimary {
	/**
	 * eyebrow field in *FeaturedProduct → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Featuring
	 * - **API ID Path**: featured_product.default.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * product name field in *FeaturedProduct → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: RevoGro™ — shown as text when there is no wordmark, and read aloud as the wordmark's name
	 * - **API ID Path**: featured_product.default.primary.product_name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	product_name: prismic.KeyTextField;
	
	/**
	 * wordmark field in *FeaturedProduct → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_product.default.primary.wordmark
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	wordmark: prismic.ImageField<never>;
	
	/**
	 * tagline field in *FeaturedProduct → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Bone Substitute Bioactive Moldable
	 * - **API ID Path**: featured_product.default.primary.tagline
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	tagline: prismic.KeyTextField;
	
	/**
	 * button field in *FeaturedProduct → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_product.default.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * product image field in *FeaturedProduct → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_product.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
}

/**
 * Default variation for FeaturedProduct Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturedProductSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FeaturedProductSliceDefaultPrimary>, never>;

/**
 * Slice variation for *FeaturedProduct*
 */
type FeaturedProductSliceVariation = FeaturedProductSliceDefault

/**
 * FeaturedProduct Shared Slice
 *
 * - **API ID**: `featured_product`
 * - **Description**: Product feature band: product shot beside an eyebrow, wordmark, tagline and button
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturedProductSlice = prismic.SharedSlice<"featured_product", FeaturedProductSliceVariation>;

/**
 * Primary content in *HomeHero → Default → Primary*
 */
export interface HomeHeroSliceDefaultPrimary {
	/**
	 * placeholder image field in *HomeHero → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_hero.default.primary.placeholder_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	placeholder_image: prismic.ImageField<never>;
	
	/**
	 * vimeo Id field in *HomeHero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_hero.default.primary.vimeo_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vimeo_id: prismic.KeyTextField;
	
	/**
	 * show scroll arrow field in *HomeHero → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: home_hero.default.primary.show_scroll_arrow
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	show_scroll_arrow: prismic.BooleanField;
	
	/**
	 * text field in *HomeHero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_hero.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * button field in *HomeHero → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_hero.default.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Default variation for HomeHero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HomeHeroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HomeHeroSliceDefaultPrimary>, never>;

/**
 * Slice variation for *HomeHero*
 */
type HomeHeroSliceVariation = HomeHeroSliceDefault

/**
 * HomeHero Shared Slice
 *
 * - **API ID**: `home_hero`
 * - **Description**: HomeHero
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HomeHeroSlice = prismic.SharedSlice<"home_hero", HomeHeroSliceVariation>;

/**
 * Item in *HomePageAnim → Default → Primary → cards*
 */
export interface HomePageAnimSliceDefaultPrimaryCardsItem {
	/**
	 * title field in *HomePageAnim → Default → Primary → cards*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page_anim.default.primary.cards[].title
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * pitch field in *HomePageAnim → Default → Primary → cards*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Line shown under the title on phones and on hover.
	 * - **API ID Path**: home_page_anim.default.primary.cards[].pitch
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	pitch: prismic.KeyTextField;
	
	/**
	 * link field in *HomePageAnim → Default → Primary → cards*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page_anim.default.primary.cards[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * image field in *HomePageAnim → Default → Primary → cards*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page_anim.default.primary.cards[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * outline image field in *HomePageAnim → Default → Primary → cards*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page_anim.default.primary.cards[].hover_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	hover_image: prismic.ImageField<never>;
}

/**
 * Primary content in *HomePageAnim → Default → Primary*
 */
export interface HomePageAnimSliceDefaultPrimary {
	/**
	 * cards field in *HomePageAnim → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page_anim.default.primary.cards[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	cards: prismic.GroupField<Simplify<HomePageAnimSliceDefaultPrimaryCardsItem>>;
}

/**
 * Default variation for HomePageAnim Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HomePageAnimSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HomePageAnimSliceDefaultPrimary>, never>;

/**
 * Slice variation for *HomePageAnim*
 */
type HomePageAnimSliceVariation = HomePageAnimSliceDefault

/**
 * HomePageAnim Shared Slice
 *
 * - **API ID**: `home_page_anim`
 * - **Description**: HomePageAnim
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HomePageAnimSlice = prismic.SharedSlice<"home_page_anim", HomePageAnimSliceVariation>;

/**
 * Item in *ImageRow → Default → Primary → images*
 */
export interface ImageRowSliceDefaultPrimaryImagesItem {
	/**
	 * image field in *ImageRow → Default → Primary → images*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_row.default.primary.images[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * label field in *ImageRow → Default → Primary → images*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_row.default.primary.images[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
}

/**
 * Primary content in *ImageRow → Default → Primary*
 */
export interface ImageRowSliceDefaultPrimary {
	/**
	 * images field in *ImageRow → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: image_row.default.primary.images[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	images: prismic.GroupField<Simplify<ImageRowSliceDefaultPrimaryImagesItem>>;
	
	/**
	 * vertical padding field in *ImageRow → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: image_row.default.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20", "filled">;
}

/**
 * Default variation for ImageRow Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageRowSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ImageRowSliceDefaultPrimary>, never>;

/**
 * Slice variation for *ImageRow*
 */
type ImageRowSliceVariation = ImageRowSliceDefault

/**
 * ImageRow Shared Slice
 *
 * - **API ID**: `image_row`
 * - **Description**: ImageRow
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ImageRowSlice = prismic.SharedSlice<"image_row", ImageRowSliceVariation>;

/**
 * Primary content in *RichText → Default → Primary*
 */
export interface RichTextSliceDefaultPrimary {
	/**
	 * text field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * button field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text.default.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * show scroll arrow field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: rich_text.default.primary.show_scroll_arrow
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	show_scroll_arrow: prismic.BooleanField;
	
	/**
	 * vertical padding field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: rich_text.default.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20" | "40", "filled">;
	
	/**
	 * max width field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: full
	 * - **API ID Path**: rich_text.default.primary.max_width
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	max_width: prismic.SelectField<"full" | "limited", "filled">;
	
	/**
	 * float field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: rich_text.default.primary.floatCenter
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	floatCenter: prismic.BooleanField;
	
	/**
	 * button two field in *RichText → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text.default.primary.button_two
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button_two: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
}

/**
 * Default variation for RichText Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSliceDefaultPrimary>, never>;

/**
 * Slice variation for *RichText*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * RichText Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: RichText
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

/**
 * Primary content in *ScreenWidthMedia → Default → Primary*
 */
export interface ScreenWidthVideoSliceDefaultPrimary {
	/**
	 * vimeo Id field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: screen_width_video.default.primary.vimeo_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vimeo_id: prismic.KeyTextField;
	
	/**
	 * placeholder Image field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: screen_width_video.default.primary.placeholder_image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	placeholder_image: prismic.ImageField<never>;
	
	/**
	 * text field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: screen_width_video.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * button field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: screen_width_video.default.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * text float field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: center
	 * - **API ID Path**: screen_width_video.default.primary.text_float
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	text_float: prismic.SelectField<"center" | "bottom", "filled">;
	
	/**
	 * height field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: screen
	 * - **API ID Path**: screen_width_video.default.primary.height
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	height: prismic.SelectField<"screen" | "half screen", "filled">;
	
	/**
	 * darken image field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: screen_width_video.default.primary.darken
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	darken: prismic.BooleanField;
	
	/**
	 * max width field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: full
	 * - **API ID Path**: screen_width_video.default.primary.max_width
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	max_width: prismic.SelectField<"full" | "limited", "filled">;
	
	/**
	 * show scroll arrow field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: screen_width_video.default.primary.show_scroll_arrow
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	show_scroll_arrow: prismic.BooleanField;
	
	/**
	 * button two field in *ScreenWidthMedia → Default → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: screen_width_video.default.primary.button_two
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button_two: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
}

/**
 * Default variation for ScreenWidthMedia Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ScreenWidthVideoSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ScreenWidthVideoSliceDefaultPrimary>, never>;

/**
 * Slice variation for *ScreenWidthMedia*
 */
type ScreenWidthVideoSliceVariation = ScreenWidthVideoSliceDefault

/**
 * ScreenWidthMedia Shared Slice
 *
 * - **API ID**: `screen_width_video`
 * - **Description**: ScreenWidthVideo
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ScreenWidthVideoSlice = prismic.SharedSlice<"screen_width_video", ScreenWidthVideoSliceVariation>;

/**
 * Item in *TwoCol → media text → Primary → rive overrides*
 */
export interface TwoColSliceDefaultPrimaryRiveOverridesItem {
	/**
	 * top left corner text field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].top_left_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	top_left_corner_text: prismic.KeyTextField;
	
	/**
	 * top right corner text field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].top_right_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	top_right_corner_text: prismic.KeyTextField;
	
	/**
	 * bottom left corner text field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].bottom_left_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bottom_left_corner_text: prismic.KeyTextField;
	
	/**
	 * bottom right corner text field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].bottom_right_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bottom_right_corner_text: prismic.KeyTextField;
	
	/**
	 * text hover top field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].text_hover_top
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_hover_top: prismic.KeyTextField;
	
	/**
	 * text hover right field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].text_hover_right
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_hover_right: prismic.KeyTextField;
	
	/**
	 * text hover left field in *TwoCol → media text → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[].text_hover_left
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_hover_left: prismic.KeyTextField;
}

/**
 * Item in *TwoCol → imageTableText → Primary → products*
 */
export interface TwoColSliceImageTableTextPrimaryProductsItem {
	/**
	 * description field in *TwoCol → imageTableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.products[].description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
	
	/**
	 * size one field in *TwoCol → imageTableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.products[].size_one
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	size_one: prismic.KeyTextField;
	
	/**
	 * size_two field in *TwoCol → imageTableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.products[].size_two
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	size_two: prismic.KeyTextField;
	
	/**
	 * product number field in *TwoCol → imageTableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.products[].product_number
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	product_number: prismic.KeyTextField;
}

/**
 * Item in *TwoCol → imageTableText → Primary → rive overrides*
 */
export interface TwoColSliceImageTableTextPrimaryRiveOverridesItem {
	/**
	 * top left corner text field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].top_left_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	top_left_corner_text: prismic.KeyTextField;
	
	/**
	 * top right corner text field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].top_right_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	top_right_corner_text: prismic.KeyTextField;
	
	/**
	 * bottom left corner text field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].bottom_left_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bottom_left_corner_text: prismic.KeyTextField;
	
	/**
	 * bottom right corner text field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].bottom_right_corner_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	bottom_right_corner_text: prismic.KeyTextField;
	
	/**
	 * text hover top field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].text_hover_top
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_hover_top: prismic.KeyTextField;
	
	/**
	 * text hover right field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].text_hover_right
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_hover_right: prismic.KeyTextField;
	
	/**
	 * text hover left field in *TwoCol → imageTableText → Primary → rive overrides*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[].text_hover_left
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	text_hover_left: prismic.KeyTextField;
}

/**
 * Item in *TwoCol → tableText → Primary → products*
 */
export interface TwoColSliceTableTextPrimaryProductsItem {
	/**
	 * description field in *TwoCol → tableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.products[].description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
	
	/**
	 * size one field in *TwoCol → tableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.products[].size_one
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	size_one: prismic.KeyTextField;
	
	/**
	 * size_two field in *TwoCol → tableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.products[].size_two
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	size_two: prismic.KeyTextField;
	
	/**
	 * product number field in *TwoCol → tableText → Primary → products*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.products[].product_number
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	product_number: prismic.KeyTextField;
}

/**
 * Primary content in *TwoCol → media text → Primary*
 */
export interface TwoColSliceDefaultPrimary {
	/**
	 * image field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * image aspect field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: square
	 * - **API ID Path**: two_col.default.primary.image_aspect
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_aspect: prismic.SelectField<"square" | "4:3" | "16:9" | "3:4" | "9:16", "filled">;
	
	/**
	 * text field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * button field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * button two field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.button_two
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button_two: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * order field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: two_col.default.primary.isMediaFirst
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	isMediaFirst: prismic.BooleanField;
	
	/**
	 * border top field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: two_col.default.primary.showTopBorder
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	showTopBorder: prismic.BooleanField;
	
	/**
	 * vimeo Id field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.vimeo_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vimeo_id: prismic.KeyTextField;
	
	/**
	 * vertical padding field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: two_col.default.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20", "filled">;
	
	/**
	 * rive field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	rive: prismic.LinkToMediaField<prismic.FieldState, never>;
	
	/**
	 * rive overrides field in *TwoCol → media text → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.default.primary.rive_overrides[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	rive_overrides: prismic.GroupField<Simplify<TwoColSliceDefaultPrimaryRiveOverridesItem>>;
}

/**
 * media text variation for TwoCol Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TwoColSliceDefault = prismic.SharedSliceVariation<"default", Simplify<TwoColSliceDefaultPrimary>, never>;

/**
 * Primary content in *TwoCol → Contact Form → Primary*
 */
export interface TwoColSliceContactFormPrimary {
	/**
	 * text field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.contactForm.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * vertical padding field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: two_col.contactForm.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20", "filled">;
	
	/**
	 * first name label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.first_name_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	first_name_label: prismic.KeyTextField;
	
	/**
	 * last name label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.last_name_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	last_name_label: prismic.KeyTextField;
	
	/**
	 * city label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.city_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	city_label: prismic.KeyTextField;
	
	/**
	 * state label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.state_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	state_label: prismic.KeyTextField;
	
	/**
	 * email label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.email_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	email_label: prismic.KeyTextField;
	
	/**
	 * phone label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.phone_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	phone_label: prismic.KeyTextField;
	
	/**
	 * distributorship label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.distributorship_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	distributorship_label: prismic.KeyTextField;
	
	/**
	 * message label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.message_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	message_label: prismic.KeyTextField;
	
	/**
	 * spam-trap label field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Hidden from visitors; read only by bots. Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.honeypot_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	honeypot_label: prismic.KeyTextField;
	
	/**
	 * submit button field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.submit_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	submit_label: prismic.KeyTextField;
	
	/**
	 * submit button while sending field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.sending_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	sending_label: prismic.KeyTextField;
	
	/**
	 * thank-you message field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.success_message
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	success_message: prismic.KeyTextField;
	
	/**
	 * error message field in *TwoCol → Contact Form → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Leave empty to keep today's wording.
	 * - **API ID Path**: two_col.contactForm.primary.error_message
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	error_message: prismic.KeyTextField;
}

/**
 * Contact Form variation for TwoCol Slice
 *
 * - **API ID**: `contactForm`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TwoColSliceContactForm = prismic.SharedSliceVariation<"contactForm", Simplify<TwoColSliceContactFormPrimary>, never>;

/**
 * Primary content in *TwoCol → imageTableText → Primary*
 */
export interface TwoColSliceImageTableTextPrimary {
	/**
	 * image field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * image aspect field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: square
	 * - **API ID Path**: two_col.imageTableText.primary.image_aspect
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	image_aspect: prismic.SelectField<"square" | "4:3" | "16:9" | "3:4" | "9:16", "filled">;
	
	/**
	 * text field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * button field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * button two field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.button_two
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button_two: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * order field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: two_col.imageTableText.primary.isMediaFirst
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	isMediaFirst: prismic.BooleanField;
	
	/**
	 * border top field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: two_col.imageTableText.primary.showTopBorder
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	showTopBorder: prismic.BooleanField;
	
	/**
	 * vimeo Id field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.vimeo_id
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	vimeo_id: prismic.KeyTextField;
	
	/**
	 * vertical padding field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: two_col.imageTableText.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20", "filled">;
	
	/**
	 * col one label field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: default is description
	 * - **API ID Path**: two_col.imageTableText.primary.col_one_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	col_one_label: prismic.KeyTextField;
	
	/**
	 * col two label field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: if present: default is size
	 * - **API ID Path**: two_col.imageTableText.primary.col_two_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	col_two_label: prismic.KeyTextField;
	
	/**
	 * col three label field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: if present: default is size
	 * - **API ID Path**: two_col.imageTableText.primary.col_three_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	col_three_label: prismic.KeyTextField;
	
	/**
	 * last col label field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: default is part number
	 * - **API ID Path**: two_col.imageTableText.primary.last_col_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	last_col_label: prismic.KeyTextField;
	
	/**
	 * table column field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: desc & #, no sizes
	 * - **API ID Path**: two_col.imageTableText.primary.table_column
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	table_column: prismic.SelectField<"desc & #, no sizes" | "desc and one size and #" | "desc and two sizes and #", "filled">;
	
	/**
	 * products field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.products[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	products: prismic.GroupField<Simplify<TwoColSliceImageTableTextPrimaryProductsItem>>;
	
	/**
	 * rive field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	rive: prismic.LinkToMediaField<prismic.FieldState, never>;
	
	/**
	 * rive overrides field in *TwoCol → imageTableText → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.imageTableText.primary.rive_overrides[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	rive_overrides: prismic.GroupField<Simplify<TwoColSliceImageTableTextPrimaryRiveOverridesItem>>;
}

/**
 * imageTableText variation for TwoCol Slice
 *
 * - **API ID**: `imageTableText`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TwoColSliceImageTableText = prismic.SharedSliceVariation<"imageTableText", Simplify<TwoColSliceImageTableTextPrimary>, never>;

/**
 * Primary content in *TwoCol → tableText → Primary*
 */
export interface TwoColSliceTableTextPrimary {
	/**
	 * text field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
	
	/**
	 * button field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.button
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * button two field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.button_two
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	button_two: prismic.LinkField<string, string, unknown, prismic.FieldState, "Primary" | "Secondary">;
	
	/**
	 * order field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: two_col.tableText.primary.isTableFirst
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	isTableFirst: prismic.BooleanField;
	
	/**
	 * border top field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: two_col.tableText.primary.showTopBorder
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	showTopBorder: prismic.BooleanField;
	
	/**
	 * vertical padding field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: 0
	 * - **API ID Path**: two_col.tableText.primary.vertical_padding
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	vertical_padding: prismic.SelectField<"0" | "5" | "10" | "20", "filled">;
	
	/**
	 * table column field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: *None*
	 * - **Default Value**: desc & #, no sizes
	 * - **API ID Path**: two_col.tableText.primary.table_column
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	table_column: prismic.SelectField<"desc & #, no sizes" | "desc and one size and #" | "desc and two sizes and #", "filled">;
	
	/**
	 * col one label field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: default is description
	 * - **API ID Path**: two_col.tableText.primary.col_one_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	col_one_label: prismic.KeyTextField;
	
	/**
	 * col two label field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: if present: default is size
	 * - **API ID Path**: two_col.tableText.primary.col_two_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	col_two_label: prismic.KeyTextField;
	
	/**
	 * col three label field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: if present: default is size
	 * - **API ID Path**: two_col.tableText.primary.col_three_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	col_three_label: prismic.KeyTextField;
	
	/**
	 * last col label field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: default is part number
	 * - **API ID Path**: two_col.tableText.primary.last_col_label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	last_col_label: prismic.KeyTextField;
	
	/**
	 * products field in *TwoCol → tableText → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: two_col.tableText.primary.products[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	products: prismic.GroupField<Simplify<TwoColSliceTableTextPrimaryProductsItem>>;
}

/**
 * tableText variation for TwoCol Slice
 *
 * - **API ID**: `tableText`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TwoColSliceTableText = prismic.SharedSliceVariation<"tableText", Simplify<TwoColSliceTableTextPrimary>, never>;

/**
 * Slice variation for *TwoCol*
 */
type TwoColSliceVariation = TwoColSliceDefault | TwoColSliceContactForm | TwoColSliceImageTableText | TwoColSliceTableText

/**
 * TwoCol Shared Slice
 *
 * - **API ID**: `two_col`
 * - **Description**: TwoCol
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type TwoColSlice = prismic.SharedSlice<"two_col", TwoColSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			FormRepliesDocument,
			FormRepliesDocumentData,
			FormRepliesDocumentDataRepliesItem,
			PageDocument,
			PageDocumentData,
			PageDocumentDataSlicesSlice,
			ResourceHubCategoryDocument,
			ResourceHubCategoryDocumentData,
			ResourceHubCategoryDocumentDataHeadersItem,
			SettingsDocument,
			SettingsDocumentData,
			SettingsDocumentDataNavItemsItem,
			SettingsDocumentDataFooterLinksItem,
			SurgicalGraftsDocument,
			SurgicalGraftsDocumentData,
			SurgicalGraftsDocumentDataSlicesSlice,
			AllDocumentTypes,
			DistributorLoginSlice,
			DistributorLoginSliceDefaultPrimary,
			DistributorLoginSliceVariation,
			DistributorLoginSliceDefault,
			FeaturedProductSlice,
			FeaturedProductSliceDefaultPrimary,
			FeaturedProductSliceVariation,
			FeaturedProductSliceDefault,
			HomeHeroSlice,
			HomeHeroSliceDefaultPrimary,
			HomeHeroSliceVariation,
			HomeHeroSliceDefault,
			HomePageAnimSlice,
			HomePageAnimSliceDefaultPrimaryCardsItem,
			HomePageAnimSliceDefaultPrimary,
			HomePageAnimSliceVariation,
			HomePageAnimSliceDefault,
			ImageRowSlice,
			ImageRowSliceDefaultPrimaryImagesItem,
			ImageRowSliceDefaultPrimary,
			ImageRowSliceVariation,
			ImageRowSliceDefault,
			RichTextSlice,
			RichTextSliceDefaultPrimary,
			RichTextSliceVariation,
			RichTextSliceDefault,
			ScreenWidthVideoSlice,
			ScreenWidthVideoSliceDefaultPrimary,
			ScreenWidthVideoSliceVariation,
			ScreenWidthVideoSliceDefault,
			TwoColSlice,
			TwoColSliceDefaultPrimaryRiveOverridesItem,
			TwoColSliceDefaultPrimary,
			TwoColSliceContactFormPrimary,
			TwoColSliceImageTableTextPrimaryProductsItem,
			TwoColSliceImageTableTextPrimaryRiveOverridesItem,
			TwoColSliceImageTableTextPrimary,
			TwoColSliceTableTextPrimaryProductsItem,
			TwoColSliceTableTextPrimary,
			TwoColSliceVariation,
			TwoColSliceDefault,
			TwoColSliceContactForm,
			TwoColSliceImageTableText,
			TwoColSliceTableText
		}
	}
}