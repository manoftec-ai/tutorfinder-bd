import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "tutor");
  if (!profile) return redirect("/login/");

  const f = await toFormData(request);
  const reviewId = parseInt(f.get("reviewId")?.toString() ?? "", 10);
  const reply = truthyStr(f.get("reply"));

  if (!Number.isInteger(reviewId)) return redirect("/tutor/dashboard/");

  const { error } = await sb
    .from(T.reviews)
    .update({ tutor_reply: reply })
    .eq("id", reviewId)
    .eq("tutor_id", profile.id);

  return redirect("/tutor/dashboard/" + (error ? `?error=${encodeURIComponent(error.message)}` : ""));
};