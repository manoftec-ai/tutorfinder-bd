import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "guardian");
  if (!profile) return redirect("/login/");

  const f = await toFormData(request);
  const id = parseInt(f.get("engagementId")?.toString() ?? "", 10);
  if (!Number.isInteger(id)) return redirect("/guardian/dashboard/");

  await sb
    .from(T.engagements)
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("guardian_id", profile.id)
    .eq("status", "requested");

  return redirect("/guardian/dashboard/");
};