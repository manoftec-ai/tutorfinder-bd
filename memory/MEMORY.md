# Project Memory — TutorFinder BD

> Last updated: 2026-09-21
> Sessions count: 1

## User
- Name / handle: Zulfikar Rahman (see GLOBAL memory — single source of truth for the USER)
- Communication preference: English in Termux (D46 — Bengali glyphs don't render; Bengali OK in published content)
- Working style: broad vision → phased development → incremental with memory save between steps; competent technical operator, not a programmer

## Goals
### Active
| ID | Goal | Priority | Status | Notes |
|----|------|----------|--------|-------|
| G2 | Build TutorFinder BD (DocTime-style FREE review directory) | high | active | v2 blueprint = docs/BLUEPRINT.md; Astro+Vercel; check Open Questions §15 before build |
| G3 | Monetize later (featured/verified/match-service — keeps directory free) | medium | active | Phase 3, optional — docs/BLUEPRINT.md §10 |

### Completed
| ID | Goal | Date completed |
|----|------|----------------|
| G1 | Market research + opportunity verdict | 2026-09-21 |
| G4 | Study DocTime model + write real architecture/blueprint (v2) | 2026-09-21 |

## Decisions
| Date | Decision | Rationale / context |
|------|----------|---------------------|
| 2026-09-21 | **Stack: Astro + Supabase** (SSR on Vercel; Supabase free = Postgres + Auth + Storage + RLS) | User picked recommended A/B |
| 2026-09-21 | **MVP scope: Full** — enlist + public search/directory + contact flow + gated reviews, before shareable live | User picked recommended A/B |
| 2026-09-21 | **PIVOT (v2): DocTime-style FREE review directory** | User: "build something like DocTime... complete free directory... easy for teachers to enlisted... perfect match... blueprint first" → docs/BLUEPRINT.md authoritative |
| 2026-09-21 | SEO remains the acquisition channel, not the product | Directory pages per area/subject ARE the SEO; keep the v1 strategy aligned |
| 2026-09-21 | Niche wedge = SEO content + directory FIRST (not a Caretutors clone) | Research verdict; kept as SEA + v2 mechanisms; superseded as primary by v2 |
| 2026-09-21 | Stack = Astro 7 + Tailwind 4 + MDX on Vercel Hobby, mirroring newsdesk-bd conventions | Proven free stack, local Termux build impossible (Vercel builds) |
| 2026-09-21 | Working brand "TutorFinder BD"; repo `manoftec-ai/tutorfinder-bd` | User's own framing "Tutor Finder"; name/domain adjustable before domain purchase |

## Preferences & Constraints
- Zero/very-low budget; free tools only; no paid services without explicit approval.
- SEO-first: fast static HTML, JSON-LD, sitemap, no heavy JS. Never fabricate data.
- State assumptions; proceed; don't over-ask.
- Git standing rule: commit + push after any modification (global §5.6).

## Project Context
- Tech stack: Astro 7 static site (`site/`), Tailwind CSS 4, MDX, Vercel Hobby, GitHub `manoftec-ai/tutorfinder-bd`.
- Structure:
  ```
  tutor-finder/
    AGENTS.md    memory/    docs/    site/
  ```
- Environment quirks: Astro cannot build locally in Termux → Vercel does the build (git-push
  deploys). `vercel` CLI needs `--token`.

## Recurring Instructions
- Commands: `vercel deploy --prod --yes --token "$VERCEL_TOKEN"`; load token from
  `~/.config/opencode/.secrets/vercel.env`.
- On build/deploy red: check the failing job log + content frontmatter before editing.

## Work in Progress
- Project scaffolded 2026-09-21: AGENTS.md, memory/, docs/RESEARCH.md, docs/PRODUCT_PLAN.md,
  docs/BLUEPRINT.md (v2 = authoritative), minimal Astro site skeleton (initial only).

## Next Steps / Open Questions
- [ ] Confirm BLUEPRINT §15 open questions (stack, auth, MVP scope, brand/domain, seed policy).
- [ ] M0: stack sign-off → Supabase project + migrations + auth skeleton + repo cleanup.
- [ ] M1: tutor registration + profile + admin approve + public directory search/filter + profile
      pages; seed 20-50 tutors manually (DocTime-style founder-driven onboarding).
- [ ] M2: guardian contact-request flow + engagement + gated reviews + moderation.
- [ ] Domain candidates: tutorfinderbd.com, dhakatutor.com — decide before purchase.
- [ ] Manually re-validate the initial Astro page templates once direction confirmed.

## Archived / Superseded
| Date | Item | Replaced by |
|------|------|-------------|
| —    | —    | —           |