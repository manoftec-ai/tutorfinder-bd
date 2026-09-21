import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "admin");
  if (!profile) return redirect("/login/");

  const f = await toFormData(request);
  const tutorId = truthyStr(f.get("tutorId"));
  const action = truthyStr(f.get("action"));
  const next: Record<string, string> = {
    approve: "active",
    suspend: "suspended",
  };
  const to = next[action];
  if (!tutorId || !to) return redirect("/admin/dashboard/");

  await sb.from(T.tutorProfiles).update({ status: to }).eq("id", tutorId);
  return redirect("/admin/dashboard/");
};