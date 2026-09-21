import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { requireProfile } from "../../../lib/db";
import { truthyStr } from "../../../lib/directory";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "guardian");
  if (!profile) return redirect("/login/?error=" + encodeURIComponent("Please login as a guardian"));

  const f = await toFormData(request);
  const tutorSlug = truthyStr(f.get("tutorSlug"));
  const subjectSlug = truthyStr(f.get("subject"));
  const levelCode = truthyStr(f.get("level"));
  const areaSlug = truthyStr(f.get("area"));
  const message = truthyStr(f.get("message"));

  const { data: tutor } = await sb.from(T.tutorProfiles).select("id, slug, status").eq("slug", tutorSlug).single();
  if (!tutor) return redirect("/search/?error=" + encodeURIComponent("Tutor not found"));

  const { data: subj } = subjectSlug
    ? await sb.from(T.subjects).select("id, name").eq("slug", subjectSlug).single()
    : { data: null };
  const { data: lvl } = levelCode
    ? await sb.from(T.levels).select("id, label").eq("code", levelCode).single()
    : { data: null };
  const { data: ar } = areaSlug
    ? await sb.from(T.areas).select("id").eq("slug", areaSlug).single()
    : { data: null };

  // block duplicate open requests to the same tutor
  const { data: existing } = await sb
    .from(T.engagements)
    .select("id")
    .eq("guardian_id", profile.id)
    .eq("tutor_id", tutor.id)
    .in("status", ["requested", "contact_exchanged", "started"])
    .maybeSingle();
  if (existing) {
    return redirect(`/tutor/${tutor.slug}/?error=` + encodeURIComponent("You already have an open request with this tutor"));
  }

  const { error } = await sb.from(T.engagements).insert({
    guardian_id: profile.id,
    tutor_id: tutor.id,
    area_id: ar?.id ?? null,
    subject_note: subj?.name ?? subjectSlug,
    level_note: lvl?.label ?? levelCode,
    guardian_notes: message,
  });
  if (error) return redirect(`/tutor/${tutor.slug}/?error=` + encodeURIComponent(error.message));

  return redirect(`/tutor/${tutor.slug}/?sent=1`);
};