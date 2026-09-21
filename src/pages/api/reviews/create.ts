import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "guardian");
  if (!profile) return redirect("/login/");

  const f = await toFormData(request);
  const engagementId = parseInt(f.get("engagementId")?.toString() ?? "", 10);
  const rating = (name: string) => {
    const v = parseInt(f.get(name)?.toString() ?? "0", 10);
    return v >= 1 && v <= 5 ? v : 0;
  };
  const overall = rating("rating_overall");
  const teaching = rating("rating_teaching");
  const punctuality = rating("rating_punctuality");
  const communication = rating("rating_communication");
  const comment = truthyStr(f.get("comment"));

  if (!Number.isInteger(engagementId) || !overall) return redirect("/guardian/dashboard/");

  const { data: eng } = await sb
    .from(T.engagements)
    .select("guardian_id, tutor_id, status")
    .eq("id", engagementId)
    .single();
  if (!eng || eng.guardian_id !== profile.id || eng.status !== "completed") {
    return redirect("/guardian/dashboard/?error=" + encodeURIComponent("Only completed lessons can be reviewed"));
  }

  // RLS enforces this too; catch duplicate review per engagement
  const existing = await sb.from(T.reviews).select("id").eq("engagement_id", engagementId).maybeSingle();
  if (existing.data) return redirect("/guardian/dashboard/?error=" + encodeURIComponent("You already reviewed this tutor"));

  const { error } = await sb.from(T.reviews).insert({
    engagement_id: engagementId,
    guardian_id: profile.id,
    tutor_id: eng.tutor_id,
    rating_overall: overall,
    rating_teaching: teaching || overall,
    rating_punctuality: punctuality || overall,
    rating_communication: communication || overall,
    comment,
  });
  if (error) return redirect("/guardian/dashboard/?error=" + encodeURIComponent(error.message));

  return redirect("/guardian/dashboard/?reviewed=1");
};