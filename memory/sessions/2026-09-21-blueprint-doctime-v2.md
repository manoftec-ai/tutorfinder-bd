# Session 2026-09-21 — TutorFinder BD: research → pivot to DocTime-style directory (blueprint v2)

## What happened
1. **Research completed** (docs/RESEARCH.md): BD/Dhaka tutor market = excellent demand
   (92% tutoring prevalence, ~38-40M students, <1% served, Tk14bn coaching/year, teacher
   shortage ~20%), trust gap in informal "tuition media" = the real opportunity.
   Verdict: Conditional GO — generic Caretutors clone NO-GO; win via niche + trust + SEO.
2. **Original direction chosen** (before v2): "SEO content + directory first" (Astro+Vercel,
   zero budget) — scaffolded AGENTS.md, memory/, docs, initial Astro skeleton at
   `/storage/emulated/0/OpenCode Work/projects/Website Development/sites/tutor-finder/`.
3. **USER PIVOT**: wants **DocTime-style complete FREE review directory** for tutors —
   teachers enlist easily, students find perfect match by location/subject, real user reviews,
   "make a real architecture of our thinking and make a blueprint first".
4. **Studied DocTime** (2026-09-21): free verified doctor directory; search by
   specialty/area/gender/ratings; user reviews; monetizes consultations/premium, not listings.
   BMDC-style verification = trust engine.
5. **Wrote docs/BLUEPRINT.md v2** — the authoritative architecture: users/roles, ER objects,
   full Postgres data model, feature map (MVP→P3), 4 core journeys, review & trust model
   (engagement-gated reviews = anti-astroturf), search/matching logic, system architecture
   (Astro SSR on Vercel + Supabase Postgres/Auth/Storage/RLS; PocketBase-on-VPS fallback),
   monetization principle (directory permanently free), SEO-as-acquisition, risks &
   mitigations, roadmap M0-M5, 5 open questions (§15).

## Decisions recorded (memory/MEMORY.*)
- PIVOT to v2 DocTime-model (free review directory); SEO repositioned to acquisition channel.
- Blueprint = authoritative doc; PRODUCT_PLAN.md marked superseded-as-primary (strategy kept).
- Working brand TutorFinder BD; repo placeholder manoftec-ai/tutorfinder-bd (not yet created).

## Next step
User to answer BLUEPRINT §15 (stack/Auth/MVP scope/brand/seed policy) → M0 build (repo +
Supabase + migrations + skeleton). Note: initial Astro skeleton needs re-validation against v2.

## Testing
No code built in this session (blueprint-only by user request). Docs written & memory updated.