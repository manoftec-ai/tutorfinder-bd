import type { SupabaseClient } from "@supabase/supabase-js";
import { T } from "./supabase";

export type Role = "tutor" | "guardian" | "admin";

export interface Profile {
  id: string;
  role: Role;
  name: string;
  created_at: string;
}

export interface Area {
  id: number;
  slug: string;
  name: string;
  bengali_name: string;
  thana: string;
}

export interface Subject {
  id: number;
  slug: string;
  name: string;
  bengali_name: string;
  category: string;
}

export interface Level {
  id: number;
  code: string;
  label: string;
}

export interface TutorProfile {
  id: string;
  slug: string;
  headline: string;
  institution: string;
  qualification: string;
  experience_months: number;
  bio: string;
  fee_min: number;
  fee_max: number;
  currency: string;
  gender: string;
  modes: string[];
  verification_status: "unverified" | "pending" | "verified";
  status: "pending" | "active" | "suspended";
  is_featured: boolean;
  photo_url: string;
  ratings_avg: number;
  review_count: number;
  created_at: string;
}

export interface TutorWithRelations extends TutorProfile {
  name: string;
  subjects: Subject[];
  areas: Area[];
  levels: Level[];
}

export interface ReviewRow {
  id: number;
  engagement_id: number;
  guardian_id: string;
  tutor_id: string;
  rating_overall: number;
  rating_teaching: number;
  rating_punctuality: number;
  rating_communication: number;
  comment: string;
  tutor_reply: string;
  moderation_status: "pending" | "approved" | "removed";
  created_at: string;
}

export interface EngagementRow {
  id: number;
  guardian_id: string;
  tutor_id: string;
  area_id: number | null;
  subject_note: string;
  level_note: string;
  status: "requested" | "contact_exchanged" | "started" | "completed" | "cancelled";
  guardian_notes: string;
  decided_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export async function getProfile(supabase: SupabaseClient, userId: string): Promise<Profile | null> {
  if (!userId) return null;
  const { data } = await supabase.from(T.profilesPublic).select("id, role, name, created_at").eq("id", userId).single();
  return (data as Profile | null) ?? null;
}

export async function requireProfile(
  supabase: SupabaseClient,
  role?: Role,
): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) return null;
  const profile = await getProfile(supabase, uid);
  if (role && profile?.role !== role) return null;
  return profile;
}

export async function getTutorBySlug(supabase: SupabaseClient, slug: string): Promise<TutorWithRelations | null> {
  const { data: tutor } = await supabase
    .from(T.tutorProfiles)
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();
  if (!tutor) return null;
  return await hydrateTutor(supabase, tutor as TutorProfile);
}

export async function hydrateTutor(
  supabase: SupabaseClient,
  tutor: TutorProfile,
): Promise<TutorWithRelations> {
  const [sp, subLink, areaLink, levelLink] = await Promise.all([
    supabase.from(T.profilesPublic).select("id, name").eq("id", tutor.id).single(),
    supabase.from(T.tutorSubjects).select("subject_id").eq("tutor_id", tutor.id),
    supabase.from(T.tutorAreas).select("area_id").eq("tutor_id", tutor.id),
    supabase.from(T.tutorLevels).select("level_id").eq("tutor_id", tutor.id),
  ]);
  const subjectIds = (subLink.data ?? []).map((r: any) => r.subject_id);
  const areaIds = (areaLink.data ?? []).map((r: any) => r.area_id);
  const levelIds = (levelLink.data ?? []).map((r: any) => r.level_id);
  const [subjects, areas, levels] = subjectIds.length
    ? await Promise.all([
        supabase.from(T.subjects).select("id, slug, name, bengali_name, category").in("id", subjectIds),
        areaIds.length ? supabase.from(T.areas).select("id, slug, name, bengali_name, thana").in("id", areaIds) : Promise.resolve({ data: [] }),
        levelIds.length ? supabase.from(T.levels).select("id, code, label").in("id", levelIds) : Promise.resolve({ data: [] }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];
  return {
    ...tutor,
    name: sp.data?.name ?? "",
    subjects: (subjects.data as Subject[]) ?? [],
    areas: (areas.data as Area[]) ?? [],
    levels: (levels.data as Level[]) ?? [],
  };
}

/** Hydrate many tutors in parallel (for dashboards). */
export async function getTutorsByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Record<string, TutorWithRelations>> {
  const out: Record<string, TutorWithRelations> = {};
  const uniq = [...new Set(ids.filter(Boolean))];
  const { data } = await supabase.from(T.tutorProfiles).select("*").in("id", uniq);
  for (const t of (data as TutorProfile[]) ?? []) {
    out[t.id] = await hydrateTutor(supabase, t);
  }
  return out;
}

export interface TutorFilters {
  area?: string;
  subject?: string;
  level?: string;
  mode?: string;
  q?: string;
  minRating?: number;
  page?: number;
  perPage?: number;
}

export async function listTutors(supabase: SupabaseClient, f: TutorFilters = {}): Promise<{
  tutors: TutorWithRelations[];
  count: number;
}> {
  const page = f.page ?? 1;
  const perPage = Math.min(f.perPage ?? 20, 50);
  let query = supabase.from(T.tutorProfiles).select("*", { count: "exact" }).eq("status", "active");

  if (f.mode && ["home", "online", "group"].includes(f.mode)) {
    query = query.contains("modes", [f.mode]);
  }
  if (f.minRating && f.minRating > 0) {
    query = query.gte("ratings_avg", f.minRating);
  }
  if (f.q) {
    query = query.or(`headline.ilike.%${f.q}%,bio.ilike.%${f.q}%,institution.ilike.%${f.q}%`);
  }
  if (f.area) {
    query = query.in("id", (await supabase.from(T.tutorAreas).select("tutor_id").in(
      "area_id",
      (await supabase.from(T.areas).select("id").eq("slug", f.area)).data?.map((r: any) => r.id) ?? [],
    )).data?.map((r: any) => r.tutor_id) ?? []);
  }
  if (f.subject) {
    query = query.in("id", (await supabase.from(T.tutorSubjects).select("tutor_id").in(
      "subject_id",
      (await supabase.from(T.subjects).select("id").eq("slug", f.subject)).data?.map((r: any) => r.id) ?? [],
    )).data?.map((r: any) => r.tutor_id) ?? []);
  }
  if (f.level) {
    query = query.in("id", (await supabase.from(T.tutorLevels).select("tutor_id").in(
      "level_id",
      (await supabase.from(T.levels).select("id").eq("code", f.level)).data?.map((r: any) => r.id) ?? [],
    )).data?.map((r: any) => r.tutor_id) ?? []);
  }

  const from = (page - 1) * perPage;
  const { data, count } = await query
    .order("is_featured", { ascending: false })
    .order("ratings_avg", { ascending: false })
    .order("review_count", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  const tutors: TutorWithRelations[] = [];
  for (const t of (data as TutorProfile[]) ?? []) {
    tutors.push(await hydrateTutor(supabase, t));
  }
  return { tutors, count: count ?? 0 };
}

export async function listTutorIds(supabase: SupabaseClient, column: "subject" | "area" | "level", value: string): Promise<string[]> {
  const idTable = column === "subject" ? T.subjects : column === "area" ? T.areas : T.levels;
  const slugCol = column === "subject" ? "slug" : column === "area" ? "slug" : "code";
  const { data: refRow } = await supabase.from(idTable).select("id").eq(slugCol, value).single();
  const joinTable =
    column === "subject" ? T.tutorSubjects : column === "area" ? T.tutorAreas : T.tutorLevels;
  const idCol = column === "subject" ? "subject_id" : column === "area" ? "area_id" : "level_id";
  if (!refRow) return [];
  const { data } = await supabase.from(joinTable).select("tutor_id").eq(idCol, refRow.id);
  return (data ?? []).map((r: any) => r.tutor_id);
}

export async function getApprovedReviews(supabase: SupabaseClient, tutorId: string): Promise<ReviewRow[]> {
  const { data } = await supabase
    .from(T.reviews)
    .select("*")
    .eq("tutor_id", tutorId)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });
  return (data as ReviewRow[]) ?? [];
}

export async function getReviewsForGuardian(supabase: SupabaseClient, guardianId: string): Promise<ReviewRow[]> {
  const { data } = await supabase
    .from(T.reviews)
    .select("*")
    .eq("guardian_id", guardianId);
  return (data as ReviewRow[]) ?? [];
}