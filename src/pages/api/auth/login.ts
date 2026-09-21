import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const f = await toFormData(request);
  const email = truthyStr(f.get("email"));
  const password = f.get("password")?.toString() ?? "";
  const next = truthyStr(f.get("next"));

  let back = "/guardian/dashboard/";
  if (next.startsWith("/")) back = next;

  const sb = supabaseFromCookies(cookies);
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return redirect("/login/?error=" + encodeURIComponent(error.message));

  const { data: user } = await sb.auth.getUser();
  if (user?.user) {
    const { data: row } = await sb.from(T.profilesPublic).select("role").eq("id", user.user.id).single();
    if (row?.role === "tutor") {
      return redirect(back === "/login/" || back === "/join/" ? "/tutor/dashboard/" : back);
    }
    if (row?.role === "admin") return redirect("/admin/dashboard/");
  }
  return redirect(back);
};