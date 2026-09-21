import { SUPABASE_URL } from "./env";

export const MODE_LABELS: Record<string, string> = {
  home: "Home",
  online: "Online",
  group: "Group",
};

export function modeLabels(modes: string[]): string[] {
  if (!modes?.length) return [];
  return modes.map((m) => MODE_LABELS[m] ?? m);
}

export function formatFee(min: number, max: number, currency = "BDT"): string {
  if (!min && !max) return "Negotiable";
  const fmt = (n: number) =>
    currency === "BDT"
      ? "৳" + n.toLocaleString("en-BD")
      : n.toLocaleString("en-BD");
  if (!min) return fmt(max);
  if (!max) return fmt(min) + "+";
  return `${fmt(min)}–${fmt(max)}`;
}

export function expLabel(months: number): string {
  if (!months) return "Just starting";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y}y ${m}m` : `${y} year${y === 1 ? "" : "s"}`;
}

export function initials(name: string): string {
  return (name || "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function photoUrl(url: string): string {
  if (!SUPABASE_URL || !url) return "";
  if (url.startsWith("http")) return url;
  return `${SUPABASE_URL}/storage/v1/object/public/${url}`;
}

export function maskName(name: string): string {
  const first = (name || "").split(/\s+/)[0] ?? "";
  if (!first) return "Guardian";
  if (first.length <= 2) return first + "***";
  return first.slice(0, 2) + "***";
}

export function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function randomSalt(len = 4): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function truthyStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}