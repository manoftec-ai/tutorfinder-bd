// Environment + public constants.
// Vercel env: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY (safe to expose),
// SUPABASE_SERVICE_ROLE_KEY (server-only, for admin endpoints).

export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const PHOTO_BUCKET = "tutor-photos";
export const SITE_NAME = "TutorFinder BD";

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);