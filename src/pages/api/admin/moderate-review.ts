import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "admin");
  if (!profile) return redirect("/login/");

  const f = await toFormData(request);
  const reviewId = parseInt(f.get("reviewId")?.toString() ?? "", 10);
  const action = truthyStr(f.get("action"));
  const to = action === "approve" ? "approved" : action === "remove" ? "removed" : "";
  if (!Number.isInteger(reviewId) || !to) return redirect("/admin/dashboard/");

  await sb.from(T.reviews).update({ moderation_status: to }).eq("id", reviewId);
  return redirect("/admin/dashboard/");
};