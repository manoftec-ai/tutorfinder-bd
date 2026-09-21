# 2026-09-21 — MVP built & deployed (session 2)

## What happened
- Wrote Supabase migrations: `0001_schema.sql` (profiles, refs, tutor_profiles, join
  tables, verification_documents, engagements, reviews, reports, full RLS policies,
  aggregate/trigger functions) and `0002_seed.sql` (17 Dhaka areas, 31 subjects across
  categories, 18 levels, `tutor-photos` storage bucket + policies).
- Fixed `0001`: removed `security_invoker = true` from `profiles_public` (it made the
  view return nothing for everyone and broke the admin role check).
- Built the SSR app under `src/`: lib (env, supabase cookie client, db helpers,
  formatting), components (Header, Footer, SearchForm, TutorCard, ReviewCard, Stars,
  Pagination), layouts/Base, all public pages, auth + guardian/tutor/admin dashboards,
  tutor profile editor, and 11 POST API endpoints (auth, tutor save + photo upload,
  guardian request/cancel, engagement status, reviews create/reply, admin moderation).
- Deleted stale static data JSONs; DB is the single source of truth for refs.
- Dependency churn: Astro ^7 + @astrojs/vercel ^8 peer conflict → bumped vercel to 11;
  then Astro 7's rolldown couldn't load native bindings on Android → **pinned Astro 5
  + @astrojs/vercel 8 + vite 6** (final).
- Android/external-storage constraint discovered and documented: **native addons
  (rollup/esbuild/tailwind-oxide) cannot be dlopen'd from shared storage**, so NO local
  build/dev is possible in Termux — builds run only on Vercel. `astro check` also
  blocked. Plain `.ts` typecheck works (`tsc`); all lib + api .ts files pass strict.
- Set `npm config set bin-links false` (Termux global) — FUSE can't create .bin symlinks.
- Astro 5 cookies have no `getAll()` → Supabase cookie adapter switched to the
  get/set/remove interface (supported by @supabase/ssr).
- Import-depth bugs in .astro files found via Vercel build failures (root pages need
  `../`, two-level pages `../../`); added a node import-resolver script to catch them.
- `git init` + created public GitHub repo `manoftec-ai/tutorfinder-bd` (POST /user/repos
  — the /repos/{owner}/{repo} route 404s) + first push (local committer email set).
- Vercel: project `tutor-finder` already existed; deployed — **Build Completed, status
  Ready**. Production alias `tutor-finder-six.vercel.app`; latest deploy
  `tutor-finder-oavfd0okj-man-of-technology.vercel.app` (permanent URL).
- Runtime NOT verified: Supabase not provisioned; **Vercel Deploy Protection (SSO) is ON**
  (team/account setting) — anonymous *.vercel.app traffic gets 302 → SSO login page.

## Issues / gotchas encountered
- `@astrojs/vercel@8` peer = astro ^5 (conflict if astro ^7) → use matching pair.
- GitHub create-repo route is `POST /user/repos` (not `/repos/{owner}/{repo}`).
- `vercel deploy` log buffering: use `vercel inspect <url> --logs` for the real error.
- Deploy failures were always import depth (`../` vs `../../`) in .astro frontmatter.

## Decisions recorded
- Astro pinned at v5 (Android local dev possible on paper; still can't build natively).
- `profiles_public` view bypasses RLS (no security_invoker); profiles stays locked.
- Supabase cookie adapter = get/set/remove interface.
- Deploy protection/domain decision deferred to user (security setting).

## What's next
1. User: create free Supabase project → get project URL + anon + service-role keys →
   apply migrations → set Vercel env vars.
2. Decide Vercel Deploy Protection (SSO) vs custom domain.
3. E2E verify the full loop; set first admin role; seed ~20-50 real tutors.