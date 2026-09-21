import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";
import { truthyStr } from "../../../lib/directory";

const ALLOWED = ["contact_exchanged", "started", "completed", "cancelled"] as const;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "tutor");
  if (!profile) return redirect("/login/");

  const f = await toFormData(request);
  const id = parseInt(f.get("engagementId")?.toString() ?? "", 10);
  const status = truthyStr(f.get("status"));
  if (!Number.isInteger(id) || !ALLOWED.includes(status as any)) return redirect("/tutor/dashboard/");

  await sb
    .from(T.engagements)
    .update({ status })
    .eq("id", id)
    .eq("tutor_id", profile.id);

  return redirect("/tutor/dashboard/");
};