import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// Revogen's only contact form is the distributor form on
// /distribution-opportunities (the TwoCol slice, `contactForm` variation). The
// fleet's form-e2e probe enters at /contact, so send it, and anyone else, there.
export const prerender = false;

export const load: PageServerLoad = () => {
  redirect(301, "/distribution-opportunities");
};
