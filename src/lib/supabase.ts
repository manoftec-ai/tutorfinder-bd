import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from "./env";

/** Astro 5's cookie bag: get/set/delete per name (no getAll before Astro 6). */
type AstroCookiesLike = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string | Record<string, any>, opts?: CookieOptions): void;
  delete(name: string, opts?: CookieOptions): void;
};

/**
 * SSR Supabase client bound to Astro cookies. Works for guests (anon RLS) and
 * authenticated sessions restored from cookies. Uses the get/set/remove cookie
 * interface (supported by @supabase/ssr, recommended for middlewares like this).
 */
export function supabaseFromCookies(cookies: AstroCookiesLike) {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        const c = cookies.get(name);
        return c ? { name, value: c.value } : undefined;
      },
      set(name: string, value: string, options?: CookieOptions) {
        cookies.set(name, value, options);
      },
      remove(name: string, options?: CookieOptions) {
        cookies.delete(name, options);
      },
    },
  });
}

/** Admin (service-role) client — SERVER ONLY. Never import into pages that render for clients. */
export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Low-privilege anon client usable for public read-only data fetching. */
export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Parse a form request body (multipart or urlencoded) and return FormData. */
export async function toFormData(request: Request): Promise<FormData> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    return request.formData();
  }
  const text = await request.text();
  const params = new URLSearchParams(text);
  const fd = new FormData();
  params.forEach((v, k) => fd.set(k, v));
  return fd;
}

export function redirect(location: string, status = 302): Response {
  return new Response(null, { status, headers: { location } });
}

export function back(response: Response, fallback: string): Response {
  const loc = response.headers.get("location");
  return redirect(loc && loc.startsWith("/") ? loc : fallback);
}

/** Small helper for common table naming. */
export const T = {
  profiles: "profiles" as const,
  profilesPublic: "profiles_public" as const,
  tutorProfiles: "tutor_profiles" as const,
  tutorSubjects: "tutor_subjects" as const,
  tutorAreas: "tutor_areas" as const,
  tutorLevels: "tutor_levels" as const,
  areas: "areas" as const,
  subjects: "subjects" as const,
  levels: "levels" as const,
  engagements: "engagements" as const,
  reviews: "reviews" as const,
  verificationDocs: "verification_documents" as const,
};