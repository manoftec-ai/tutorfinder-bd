import type { APIRoute } from "astro";
import { supabaseFromCookies, toFormData, T } from "../../../lib/supabase";
import { PHOTO_BUCKET, hasSupabase } from "../../../lib/env";
import { requireProfile } from "../../../lib/db";
import { slugify, randomSalt, truthyStr } from "../../../lib/directory";

const JOIN_TABLES: Record<string, { table: string; idCol: string }> = {
  subjectIds: { table: T.tutorSubjects, idCol: "subject_id" },
  areaIds: { table: T.tutorAreas, idCol: "area_id" },
  levelIds: { table: T.tutorLevels, idCol: "level_id" },
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sb = supabaseFromCookies(cookies);
  const profile = await requireProfile(sb, "tutor");
  if (!profile) return redirect("/login/?error=" + encodeURIComponent("Please login as a tutor"));

  if (!hasSupabase) return redirect("/tutor/edit/?error=" + encodeURIComponent("Database not configured yet"));

  const f = await toFormData(request);
  const headline = truthyStr(f.get("headline"));
  const institution = truthyStr(f.get("institution"));
  const qualification = truthyStr(f.get("qualification"));
  const bio = truthyStr(f.get("bio"));
  const gender = truthyStr(f.get("gender"));
  const existingSlug = truthyStr(f.get("existingSlug"));
  const experienceMonths = Math.max(0, parseInt(f.get("experience_months")?.toString() ?? "0", 10) || 0);
  const feeMin = Math.max(0, parseInt(f.get("fee_min")?.toString() ?? "0", 10) || 0);
  const feeMax = Math.max(0, parseInt(f.get("fee_max")?.toString() ?? "0", 10) || 0);
  const modes = (f.getAll("modes") as string[]).filter((m) => ["home", "online", "group"].includes(m));

  if (!headline) return redirect("/tutor/edit/?error=" + encodeURIComponent("Headline is required"));

  // photo upload (optional)
  let photoUrl = "";
  const photo = f.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return redirect("/tutor/edit/?error=" + encodeURIComponent("Photo must be an image"));
    }
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const path = `${profile.id}/${slugify(existingSlug || headline)}-${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage.from(PHOTO_BUCKET).upload(path, photo, {
      upsert: true,
      contentType: photo.type,
    });
    if (upErr) return redirect("/tutor/edit/?error=" + encodeURIComponent("Photo upload failed: " + upErr.message));
    photoUrl = `${PHOTO_BUCKET}/${path}`;
  }

  const base = {
    id: profile.id,
    headline,
    institution,
    qualification,
    experience_months: experienceMonths,
    bio,
    gender,
    modes,
    fee_min: feeMin,
    fee_max: feeMax,
    currency: "BDT",
    verification_status: existingSlug ? undefined : "unverified",
    updated_at: new Date().toISOString(),
  };

  let slug = existingSlug || `${slugify(profile.name) || "tutor"}-${randomSalt(4)}`;
  let { error } = await sb.from(T.tutorProfiles).upsert(
    { ...base, slug, photo_url: photoUrl },
    { onConflict: "id" },
  );

  if (error && /duplicate key/i.test(error.message) && !existingSlug) {
    slug = `${slugify(profile.name) || "tutor"}-${randomSalt(6)}`;
    const retry = await sb.from(T.tutorProfiles).upsert(
      { ...base, slug, photo_url: photoUrl },
      { onConflict: "id" },
    );
    if (retry.error) return redirect("/tutor/edit/?error=" + encodeURIComponent(retry.error.message));
    error = retry.error;
  }
  if (error) return redirect("/tutor/edit/?error=" + encodeURIComponent(error.message));

  // sync join tables
  for (const [field, cfg] of Object.entries(JOIN_TABLES)) {
    const ids = (f.getAll(field) as string[]).map((v) => parseInt(v, 10)).filter((v) => Number.isInteger(v));
    await sb.from(cfg.table).delete().eq("tutor_id", profile.id);
    if (ids.length) {
      const rows = ids.map((id) => ({ tutor_id: profile.id, [cfg.idCol]: id }));
      await sb.from(cfg.table).insert(rows);
    }
  }

  return redirect("/tutor/dashboard/");
};