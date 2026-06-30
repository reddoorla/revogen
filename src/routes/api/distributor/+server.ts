import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { createHash } from "node:crypto";
import { createClient } from "$lib/prismicio";
import type { RequestHandler } from "./$types";

// Server-side gate for the Distributor Resource Hub. The category documents are
// NOT included in the (prerendered) page payload anymore — they are only ever
// returned from here, and only to a request that supplies the correct password
// or carries a valid auth cookie. Never prerendered.
export const prerender = false;

const COOKIE = "distributor_auth";
const WEEK = 60 * 60 * 24 * 7;

// Cookie value is a salted hash of the configured password, so the raw password
// is never stored client-side and the cookie can be validated server-side
// without a separate secret. Fails closed when DISTRIBUTOR_PASSWORD is unset.
const authToken = (): string | null =>
  env.DISTRIBUTOR_PASSWORD
    ? createHash("sha256")
        .update(`revogen-distributor-v1:${env.DISTRIBUTOR_PASSWORD}`)
        .digest("hex")
    : null;

async function getCategories(fetch: typeof globalThis.fetch) {
  const client = createClient({ fetch });
  return client.getAllByType("resource_hub_category");
}

// POST { password } -> validate, set auth cookie, return the documents.
export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
  const body = (await request.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  const token = authToken();

  if (!token || password !== env.DISTRIBUTOR_PASSWORD) {
    return json({ ok: false }, { status: 401 });
  }

  cookies.set(COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: WEEK,
  });

  return json({ ok: true, docs: await getCategories(fetch) });
};

// GET -> return the documents only if the request already carries a valid
// auth cookie (returning visitor). 401 otherwise.
export const GET: RequestHandler = async ({ cookies, fetch }) => {
  const token = authToken();
  if (!token || cookies.get(COOKIE) !== token) {
    return json({ ok: false }, { status: 401 });
  }
  return json({ ok: true, docs: await getCategories(fetch) });
};
