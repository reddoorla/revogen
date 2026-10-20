import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Revogen's only contact form is the distributor form on
// /distribution-opportunities (the TwoCol slice, `contactForm` variation). The
// fleet's form-e2e probe enters at /contact, so send it, and anyone else, there.
// This route outranks [[preview=preview]]/[uid], whose entries() skips the uid
// `contact`; a Prismic page with that uid would be hidden behind it, so delete
// this route if one is ever made.
export const prerender = false;

// The query string rides along, so a campaign link keeps its UTM parameters.
export const load: PageServerLoad = ({ url }) => {
  redirect(301, `/distribution-opportunities${url.search}`);
};
