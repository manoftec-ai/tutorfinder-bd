# BLUEPRINT — TutorFinder BD (v2, DocTime-style free review directory)

> Version: 2.0 — 2026-09-21
> Status: BLUEPRINT (approved direction by user). Supersedes v1 "SEO content + directory page"
> as the primary product model. SEO remains the acquisition channel, not the product.
> Reference: RESEARCH.md (market evidence), DocTime model (studied 2026-09-21).

## 1. CONCEPT (the thinking)

**Analogy = DocTime, for tutors.**
DocTime proved in Bangladesh that a **free, verified, reviewable directory** wins trust:
patients search doctors by specialty / area / gender / ratings, read real reviews, pick, and act.
No one has done this properly for the tutoring market, where trust is the #1 broken thing.

**Product**: a free directory where:
- **Tutors enlist themselves** (free) with full profile: subjects, class levels, curriculum
  (Bangla-medium / English-version / English-medium / Madrasa), areas served, mode (home /
  online / group), fee expectation, qualifications, experience, bio, verified badge.
- **Students / guardians search & filter** by area, subject, class level, curriculum, mode,
  gender preference, fee range, rating — the "perfect match".
- **Reviewed by real users**: only guardians who actually engaged a tutor through the platform
  can rate/review (star dimensions + written review). Reviews are the trust engine.
- **Free directory, always.** Monetization (later) stays optional and non-extractive for the
  directory itself (premium visibility, verification, match-service fees).

**Why this beats a Caretutors clone**: we compete on the unstructured, trust-hungry informal
market (word-of-mouth, Facebook, tuition media), not on scale. The directory + reviews is the
same wedge DocTime used against established hospital-brand habits.

## 2. USERS & ROLES

| Role | Who | What they do | Needs |
|---|---|---|---|
| Guest | anyone | browses directory, sees profiles/reviews | no signup to read (SEO + trust) |
| Guardian (student/parent) | family needing tutor | search/filter, read reviews, shortlist, request contact, write review | trust, relevance, ease, verified info |
| Tutor | university student, fresh grad, professional teacher | create/maintain profile, receive contact requests, reply to reviews, get verified | leads, credibility, fair treatment |
| Admin/moderator (us) | operator | approve listings, verify docs, moderate reviews, resolve disputes, later: featured placements | safety, quality, fraud control |

## 3. CORE OBJECTS & RELATIONSHIPS

```
User ──1..1── TutorProfile            (profiles for tutors only; reviewers can be guardians)
Guardian ──requests── TutorProfile ──1..N── Review        (open request → engagement → review)
Area (upazila/thana container) ──1..N── TutorProfile      (serves multiple areas)
Subject ──1..N── TutorProfile        (teaches multiple subjects)
ClassLevel/Category ──1..N── TutorProfile
Review ──1..1── Engagement ticket    (proves the reviewer actually used the tutor)
TutorProfile ──1..N── VerificationDocument
```

## 4. DATA MODEL (Postgres/Supabase suggested)

**users** — id, email (unique), phone (unique), password_hash (Supabase Auth), name, role
(tutor|guardian|admin), created_at, last_seen.

**tutor_profiles** — id, user_id FK, slug, headline (e.g. "BUET grad · HSC physics"),
institution (study/work), qualification, years_experience, bio, fee_min, fee_max, currency,
verification_status (pending|not_verified|verified), profile_photo_url, is_featured (later),
status (draft|active|suspended), ratings_avg (cached), review_count (cached), created_at.

**tutor_subjects** — id, tutor_id FK, subject_id FK (join table).
**subjects** — id, name, bengali_name, category (academic|language|quran-arabic|skills|admission).

**tutor_areas** — id, tutor_id FK, area_id FK (join table).
**areas** — id, name, bengali_name, division, district, thana, slug.

**tutor_levels** — id, tutor_id FK, level_id FK.
**levels** — id, code (primary|ssc|hsc|admission|university|testprep), curriculum
(bangla|english_version|english_medium|madrasa|online).

**teaching_modes** — enum on profile: home | online | group | home_online.

**verification_documents** — id, tutor_id FK, doc_type (nid|institution_id|certificate),
file_url, status, admin_note, validated_at.

**engagements** — id, guardian_user_id FK, tutor_id FK, area_id FK, subject needed, level
needed, status (requested|contact_exchanged|started|completed|cancelled), tutor_confirmed,
notes, created_at. (Proves real connection → unlocks review.)

**contact_requests** — id, guardian_user_id FK, tutor_id FK, area, subject, level, message,
status (pending|accepted|declined|expired), created_at, decided_at. (Guardian asks → tutor
accepts → both see each other's contact.)

**reviews** — id, engagement_id FK UNIQUE, guardian_user_id FK, tutor_id FK, rating_overall
(1–5), rating_teaching, rating_punctuality, rating_communication, comment, tutor_reply,
moderation_status (pending|approved|removed), created_at. ONE review per engagement.

**reports / blocks** — id, reporter_user_id, reported_user_id, type, reason, status, created_at.

**adlogs** (later) — featured placements, payments, bKash/Nagad refs.

### Integrity & search
- Reviewer data: only users with an `engagement` of status completed/started can review.
- Derived aggregates (ratings_avg, review_count) cached on profule, recompute on review insert.
- Full-text search: Postgres `tsvector` over headline, bio, subject names, area names +
  structured filter columns (levels, curriculum, mode, fee range, gender, verified, ratings).

## 5. FEATURE MAP

**MVP (v1) — get the flywheel turning**
1. Tutor self-registration + profile builder (photo, subjects, levels, areas, modes, fees, bio).
2. Public directory: browsable + searchable by area, subject, level, mode, fee, gender,
   verified-only toggle, rating sort.
3. Detailed tutor profile pages (SEO-friendly URLs `/tutor/<slug>`, JSON-LD).
4. Guardian contact request flow (guardian → tutor → accept → contacts exchanged).
5. Review system (gated by engagement, 3 star dimensions + comment, tutor reply, moderation).
6. Admin area: approve profiles, verify docs, moderate reviews, block users.
7. SEO: sitemap.xml of all tutor/directory pages, area+subject directory hubs, robots.txt.

**Phase 2 — trust & match depth**
- Performance score / match ranking (relevance: exact area+subject+level, then rating).
- "Verified" badge roll-out with NID/institution doc upload (MVP = manual verify, optional).
- Guardian can write reviews only for completed engagements; disputes & reply moderation.
- Email/notifications (engage immediately on contact request).
- Bengali UI option (later — content first in English+bilingual headings).

**Phase 3 — monetization (optional, keeps directory free)**
- Featured/booster listings (tutor pays, clearly labelled, never corrupts organic order).
- One-time verification-service fee (optional, manual service).
- Match-service: on-demand curated shortlist for guardians (flat fee) — paid AFTER match.

## 6. CORE USER JOURNEYS

**J1 Tutor enlists**: signup → build profile (subjects/levels/areas/fees/bio/photo) → submit →
admin approves → profile live → receives contact requests → accepts → engagement created →
student later reviews → tutor can reply.

**J2 Guardian searches**: search "HSC physics tutor Dhanmondi" → filter (English-version, female,
Tk 5k-8k, 4★+) → open profiles → read reviews → shortlist → send contact request → tutor accepts
→ contact exchanged → trial/demo class → decide → engagement started/completed.

**J3 Review after engagement**: engagement marked completed → guardian sees "review" prompt →
rates teaching/punctuality/communication + comment → moderation → live on profile.

**J4 Admin quality loop**: new tutor → approve; doc upload → verify; review → moderate; report →
resolve/block. Fraud prevention: no public scraping of phones; contact-only via platform until
both agree.

## 7. REVIEW & TRUST MODEL (the DocTime secret — get this right)
- Reviews gated to verified engagements ⇒ no astroturfed reviews; each reviewer = real user.
- One review per engagement (no stacking).
- Multi-dimension stars (teaching / punctuality / communication) + overall + comment.
- Tutor gets one public reply (fair response mechanic).
- Moderation: auto-flag profanity/spam heuristics + admin review; report/block system.
- Display: average + count, most-recent-weighted, verified-badge filters.
- Anti-fake: reviews anonymously to tutor? No — show guardian first-name only; keep full
  identity private by default.

## 8. SEARCH & MATCHING LOGIC
1. Structured filters: area (thana), subject, class level, curriculum, mode, gender, fee max
   (guardian budget), verified only, min rating.
2. Scoring: (exact area) > (subject exact) > (level exact) > fee within budget > rating >
   review_count. Non-extractive ordering (boosting is labelled).
3. Ranking signal honesty: organic sort default; paid boosters clearly separate/badged.

## 9. SYSTEM ARCHITECTURE (recommended — zero budget)

```
                ┌──────────────┐
  Browser ─────►│  FRONTEND    │
  (mobile in first)  Astro (SSR on Vercel, Tailwind 4)
                │  /tutor/<slug> static-ish, search pages SSR
                └──────┬───────┘
                       │ HTTPS
                ┌──────▼───────┐
                │  SUPABASE    │  free tier
                │  Postgres    │  tables + Postgres FTS (tsvector) + RLS
                │  Auth        │  email/phone (OTP) — tutors & guardians
                │  Storage     │  photos, verification docs
                │  RLS rules   │  public read: profiles; write: own profile/request
                └──────────────┘
```

- **Why Astro not Next.js**: matches the user's proven stack; great static SEO; SSR works on
  Vercel free; no heavy framework lock-in.
- **Why Supabase**: Postgres = real search + constraints + RLS for safety; Auth + Storage built
  in; generous free tier; zero ops (no server to run). Database is replaceable/portable later.
- **Alternative (kept in back pocket)**: self-host **PocketBase** on the user's Servarica VPS —
  zero-cost too, full control, but adds ops to a box already running WordPress + n8n. Choose
  Supabase for MVP; revisit only if free limits ever bind.
- **Payments (later)**: bKash/Nagad manual + receipts; gate on VPS n8n or Supabase Edge Function.

Deployment: frontend → Vercel (git push), DB → Supabase (CLI-driven schema in repo,
`supabase/` migrations), secrets → Vercel env + Supabase.

## 10. MONETIZATION PRINCIPLE
The directory is **permanently free** for listing, searching, reading reviews, and contacting.
Revenue (Phase 3) is opt-in visibility/services:
1. Featured/boosted placement (flat monthly, clearly labelled).
2. Optional verification service (manual, one-time).
3. Curated shortlist match-service (guardian pays a flat fee AFTER service; transparent).
This mirrors DocTime: free listing + reviews for trust, premium for reach.

## 11. SEO STRATEGY (aligned to directory)
- Every directory/list page URL is a keyword page: `/tutors/dhaka/hsc-physics/`,
  `/tutors/dhanmondi/`, `/tutor/<slug>/`.
- Area+subject hub pages (the "content" engine) aggregate matching tutors + a small
  genuinely-written guide blurb each.
- Reviews create unique long-tail content per tutor.
- JSON-LD (WebSite, ItemList/BreadcrumbList, EducationalOrganization/Person-professional),
  sitemap.xml of all pages, robots.txt, fast static shell (100-performance goal).
- IndexNow optional (not news content; skip unless needed).

## 12. RISKS & MITIGATION
| Risk | Mitigation |
|---|---|
| Cold start: no tutors → no value | Manual curation seed: recruit 20-50 real tutors first (campus/known networks — same trick Caretutors/DocTime used); enable invites early; admins can create profiles for them |
| Fake/astroturfed reviews | Engagement-gated reviews, 1/engagement, moderation, report/block |
| Fraud/scam tutors or guardians | Verified badge via docs; contact hidden until mutual opt-in; block + public complaint path |
| Quality mismatch | Trial-class guidance content; meaningful profile fields (institution, experience); rating floor |
| Legal/Educational Act 2026 (coaching phase-out) | Home/online tutoring + skills categories are least-affected; avoid messaging around "coaching centre" |
| Free-tier growth limits | Schema is portable (Postgres); move to PocketBase/VPS or paid later if it ever matters |
| Termux can't build Astro | Vercel builds on git push (proven pipeline) |

## 13. NON-FUNCTIONAL REQUIREMENTS
- Speed: static shell + SSR pages; image `width/height`, lazy loading; Lighthouse 90+ target.
- Privacy: phone/email NOT exposed publicly; contact only after mutual approval; GDPR-lite
  (Bangladesh DP bill awareness): minimal collection, clear privacy page.
- Security: RLS on all tables; Supabase anon key with row-level policies; no secrets in repo.
- Reliability: schema migrations committed (`supabase/`); every change tested in a staging
  project before prod push.

## 14. ROADMAP
- **M0 (this week)**: blueprint sign-off + stack decision → repo + Supabase project + migrations
  + auth skeleton.
- **M1 (MVP-1)**: tutor registration + profile + admin approve + public directory (search/
  filter) + profile pages. Seed 20-50 tutors manually.
- **M2 (MVP-2)**: guardian contact-request flow + engagement + reviews (gated) + moderation.
- **M3 (Trust)**: verification badges + doc upload, report/block, dispute handling.
- **M4 (Grow)**: SEO hub pages ramp, Bengali UI option, notifications.
- **M5 (Monetize)** optional: featured placements + match-service.

## 15. OPEN QUESTIONS (confirm before building)
1. Stack: Supabase (recommended) vs self-hosted PocketBase on VPS vs Firebase?
2. Auth: phone OTP + email, or email only first?
3. Scope of MVP-1: include guardian contact-request + reviews in first build, or only
   tutor-enlist + public directory first (faster)?
4. Brand/domain: keep "TutorFinder BD"; domain candidates tutorfinderbd.com / dhakatutor.com?
5. Seed policy: OK to manually onboard first 20-50 tutors (founder-driven, DocTime-style)?