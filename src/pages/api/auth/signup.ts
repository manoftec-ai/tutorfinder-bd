import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData } from "../../../lib/supabase";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const f = await toFormData(request);
  const name = truthyStr(f.get("name"));
  const email = truthyStr(f.get("email"));
  const password = f.get("password")?.toString() ?? "";
  const role = truthyStr(f.get("role")) === "tutor" ? "tutor" : "guardian";
  const phone = truthyStr(f.get("phone"));

  if (!name) return redirect("/join/?error=" + encodeURIComponent("Full name is required"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return redirect("/join/?error=" + encodeURIComponent("Enter a valid email"));
  if (password.length < 6) return redirect("/join/?error=" + encodeURIComponent("Password must be at least 6 characters"));

  const sb = supabaseFromCookies(cookies);
  const origin = new URL(request.url).origin;
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { role, name, phone },
      emailRedirectTo: `${origin}/login`,
    },
  });

  if (error) return redirect("/join/?error=" + encodeURIComponent(error.message));

  if (data.session) {
    return redirect(role === "tutor" ? "/tutor/edit/" : "/guardian/dashboard/");
  }
  return redirect("/login/?registered=1");
};