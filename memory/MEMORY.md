# Project Memory — TutorFinder BD

> Last updated: 2026-09-21 (session 2 — built + deployed MVP v2)
> Sessions count: 2

## User
- Name / handle: Zulfikar Rahman (see GLOBAL memory — single source of truth for the USER)
- Communication preference: English in Termux (D46 — Bengali glyphs don't render; Bengali OK in published content)
- Working style: broad vision → phased development → incremental with memory save between steps; competent technical operator, not a programmer

## Goals
### Active
| ID | Goal | Priority | Status | Notes |
|----|------|----------|--------|-------|
| G2 | Build TutorFinder BD (DocTime-style FREE review directory) | high | active | **MVP code built + deployed to Vercel (shell)**; needs Supabase provisioning + seed to go live |
| G3 | Monetize later (featured/verified/match-service — keeps directory free) | medium | active | Phase 3, optional — docs/BLUEPRINT.md §10 |

### Completed
| ID | Goal | Date completed |
|----|------|----------------|
| G1 | Market research + opportunity verdict | 2026-09-21 |
| G4 | Study DocTime model + write real architecture/blueprint (v2) | 2026-09-21 |
| G5 | Build full MVP codebase (schema + SSR app + endpoints) & deploy shell to Vercel | 2026-09-21 |

## Decisions
| Date | Decision | Rationale / context |
|------|----------|---------------------|
| 2026-09-21 | **Stack: Astro + Supabase** (SSR on Vercel; Supabase free = Postgres + Auth + Storage + RLS) | User picked recommended A/B |
| 2026-09-21 | **MVP scope: Full** — enlist + public search/directory + contact flow + gated reviews | User picked recommended A/B |
| 2026-09-21 | **PIVOT (v2): DocTime-style FREE review directory** — docs/BLUEPRINT.md authoritative | User request; blueprint-first |
| 2026-09-21 | **Astro pinned to v5 (+ @astrojs/vercel 8, vite 6)** | Astro 7 uses rolldown w/o Android support; v5 + esbuild has Android binaries → keeps possible local dev; both build fine on Vercel |
| 2026-09-21 | Supabase cookie adapter uses get/set/remove interface | Astro 5 cookies have no getAll (Astro 6+); @supabase/ssr supports deprecated interface |
| 2026-09-21 | `profiles_public` view does NOT use security_invoker | Must bypass RLS (owner privileges) so public names + admin role-check via view work; profiles table itself stays locked (select deny) |
| 2026-09-21 | Deployed to Vercel as project `tutor-finder` with GitHub auto-deploy | Push to main triggers deploy; production alias `tutor-finder-six.vercel.app`; latest deploy URL log: `tutor-finder-oavfd0okj-man-of-technology.vercel.app` |
| 2026-09-21 | Working brand "TutorFinder BD"; repo `manoftec-ai/tutorfinder-bd` | Created (public) |

## Preferences & Constraints
- Zero/very-low budget; free tools only; no paid services without explicit approval.
- SEO-first: fast static HTML, JSON-LD, sitemap, no heavy JS. Never fabricate data.
- State assumptions; proceed; don't over-ask.
- Git standing rule: commit + push after any modification (global §5.6).

## Project Context
- Tech stack: **Astro 5 (SSR, output server) + Tailwind 4 + MDX** on Vercel (Node 24), Supabase free (not yet provisioned), GitHub `manoftec-ai/tutorfinder-bd` (public, main).
- Structure (code at repo root, NOT `site/`):
  ```
  tutor-finder/
    AGENTS.md   memory/   docs/   src/   supabase/migrations/   public/
  ```
  `supabase/migrations/0001_schema.sql` (schema+RLS+triggers, verified) + `0002_seed.sql` (17 areas, 31 subjects, 18 levels, storage bucket+policies).
- App: pages/ = home, search, tutor/[slug], areas (index/[area]), subjects (index/[subject]), how-it-works, privacy, terms, join, login, dashboards (guardian/tutor/tutor edit/admin). api/ POST endpoints: auth signup/login/logout, tutor save-profile (+photo upload to `tutor-photos` bucket), guardian request/cancel, tutor engagement-status, reviews create/reply, admin decide-tutor/moderate-review.
- Environment quirks (IMPORTANT): 
  - **Android external storage cannot dlopen native addons** (rollup/esbuild/oxide) → NO local build/dev in Termux; builds run ONLY on Vercel (git push) — verified error origin. `astro check` also blocked (rollup). tsc on plain `.ts` works (`node node_modules/typescript/bin/tsc ...`).
  - `npm config set bin-links false` (global, Termux) — shared-storage FUSE can't create .bin symlinks.
  - Git on this dir needs `safe.directory` exception (added globally).
  - Local committer email: `manoftec-ai@users.noreply.github.com`.

## Recurring Instructions
- Commands: `vercel deploy --prod --yes --token "$VERCEL_TOKEN"`; token at `~/.config/opencode/.secrets/vercel.env`; GitHub token at `~/.config/opencode/.secrets/github.env`.
- On build/deploy red: read the deploy log (`vercel inspect <url> --logs`) — failures so far were import-depth bugs in .astro files; verify with the node import-resolver script before committing.
- After any src change: run the import-resolver script (`node -e ... walk src, resolve relative imports`) to catch depth regressions.

## Work in Progress
- MVP app fully coded + TypeScript-clean (plain .ts) + deployed; runtime unverified because Supabase not provisioned and Vercel Deploy Protection (SSO) is ON for the team (public URLs redirect to SSO).

## Next Steps / Open Questions
- [ ] **User: create free Supabase account + project**, then provide: project URL + anon key + service-role key (+ DB password) → apply migrations (`supabase link` + `db push` or SQL editor) + set Vercel env vars (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).
- [ ] **Vercel Deployment Protection (SSO)**: decide to disable for production or add custom domain (protection currently 302-redirects all *.vercel.app traffic to SSO login). Team setting in Vercel.
- [ ] After Supabase live: e2e-verify register→tutor edit→admin approve→search→guardian request→tutor respond→review→moderation loop; promote first admin role in SQL.
- [ ] Seed 20-50 real tutors (DocTime-style founder-driven onboarding).
- [ ] Domain candidates: tutorfinderbd.com / dhakatutor.com — decide before purchase; set SITE_URL env.
- [ ] Ambient SEO extras later: sitemap, blog via MDX, JSON-LD per area/subject.

## Archived / Superseded
| Date | Item | Replaced by |
|------|------|-------------|
| 2026-09-21 | PRODUCT_PLAN as primary plan | BLUEPRINT v2 authoritative; PRODUCT_PLAN superseded (SEO = channel) |
| 2026-09-21 | Astro 7 / @astrojs/vercel 11 | Astro 5 / @astrojs/vercel 8 (Android-compatible; same Vercel behavior) |