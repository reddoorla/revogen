import { env } from "$env/dynamic/private";
import { createIngestEndpoint, type SubmissionPayload } from "@reddoorla/maintenance/forms";
import { replyCopyFor } from "$lib/server/reply-copy";
import type { RequestHandler } from "./$types";

// POST-only ingest endpoint; never prerendered.
export const prerender = false;

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

// The distributor / contact form sends its fields top-level; the typed keys map
// to first-class SubmissionPayload fields and the site-specific ones
// (city, state, distributorship) are bundled into `extra` for the dashboard's
// Extra fields JSON. formType is derived from the body (the client sends "contact").
export const POST: RequestHandler = createIngestEndpoint({
  getConfig: () => ({ url: env.FORMS_INGEST_URL, token: env.FORMS_INGEST_TOKEN }),
  buildPayload: async (body, event): Promise<SubmissionPayload> => {
    const extra: Record<string, unknown> = {};
    const city = str(body.city);
    const state = str(body.state);
    const distributorship = str(body.distributorship);
    if (city) extra.city = city;
    if (state) extra.state = state;
    if (distributorship) extra.distributorship = distributorship;

    const formType = str(body.formType);
    // Confirmation-email copy the client wrote in Prismic, resolved server-side
    // from the form type alone — never from the request body, so nothing a
    // visitor supplies can reach an outbound email. Undefined until the `form
    // replies` document is written, and the shared package then sends the same
    // per-form-type default it sends today.
    const reply = formType ? await replyCopyFor(event, formType) : undefined;

    return {
      formType,
      firstName: str(body["first-name"]) ?? str(body.firstName),
      lastName: str(body["last-name"]) ?? str(body.lastName),
      email: str(body.email),
      phone: str(body.phone),
      message: str(body.message),
      sourceUrl: str(body.sourceUrl),
      ...(Object.keys(extra).length ? { extra } : {}),
      ...(reply ? { _reply: reply } : {}),
    };
  },
});
