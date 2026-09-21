import type { APIRoute } from "astro";
import { supabaseFromCookies } from "../../../lib/supabase";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  await sb.auth.signOut();
  return redirect("/");
};