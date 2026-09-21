# PRODUCT PLAN — TutorFinder BD

> Status: **SUPERSEDED as the primary product model** (2026-09-21). The user chose a
> DocTime-style model: a **complete FREE review directory** where tutors enlist and students
> find their perfect match by location/subject with user reviews. See
> **docs/BLUEPRINT.md** (v2) for the authoritative architecture. This file's SEO strategy is
> **kept, but repositioned**: SEO is the ACQUISITION channel, not the product itself.
> Evidence base: docs/RESEARCH.md.

## 1. Positioning
TutorFinder BD = a **trust-first directory + lead site** for finding home/online tutors in
Bangladesh, **Dhaka-first**. NOT a Caretutors clone: we win on underserved segments + organic
search, at ~zero cost.

Guiding truth from research: the market has plenty of tutors and plenty of families; what's
missing is a **trustworthy middle**. So the site's job is: quality signals, verification hint,
transparency about fees (vs predatory "tuition media"), and clean UX.

## 2. SEO architecture (the engine)
Search demand to capture (all zero-cost, manual keyword targeting):
- **Area hubs**: "home tutor in Dhanmondi", "Uttara", "Gulshan", "Bashundhara R/A", "Mirpur",
  "Banani", "Mohammadpur", "Motijheel", "Dhaka Cantonment", "Keraniganj", "Savar".
- **Subject × level**: "physics tutor SSC", "math tutor HSC", "English tutor admission test",
  "chemistry tutor", "higher math tutor", "madrasa stream tutor", "IELTS teacher Dhaka",
  "Arabic / Quran tutor online", "coding tutor for kids".
- **Money / guide content** (rank for informational queries, drive trust + links):
  "average home tutor fees in Dhaka 2026", "how to choose a home tutor", "tuition media fees —
  what you should pay", "female tutor for female student", "how to find a good tutor".
- Every page: unique title/H1, meta description, JSON-LD (WebSite + Service/BreadcrumbList),
  internal links between area/subject hub pages, static sitemap.xml + robots.txt.

Directory structure (data-driven, generated — mirror newsdesk-bd events pattern):
`src/data/` JSON lists (areas, subjects/levels) → paginated hub pages via Astro `getStaticPaths`.

## 3. Trust & conversion path (guardian side)
1. Land on area/subject hub → see curated guide + "How to find a tutor here" checklist.
2. Submit a requirement form (free): class, subject, area, days, budget, tutor preference
   (male/female/any, institution).
3. Match: earliest phase = manually connect with vetted tutors from OUR own small list, or
   forward leads to local tutors (lead-gen fee, flat price). Later = self-serve marketplace.
4. Include safety guidance: trial class, verification of institution, agree terms in writing.

Tutor side (later): free basic profile → featured/verified listing (paid) → confirmed placement
commission (compare: Caretutors 55% — our wedge can undercut for core segments).

## 4. Monetization roadmap
- Phase 1 (now): no revenue; build SEO + trust.
- Phase 2 (when traffic arrives, ~2-3k visitors/mo): **lead-gen fee** (flat, e.g. Tk 200-500/lead
  to tutors) + **featured listings** (Tk 500-1,000/mo). Accept via bKash/Nagad/manual.
- Phase 3 (scale): commission marketplace on confirmed placements (low %, e.g. 15-25% vs
  Caretutors' 55%), post-pay model (tutor pays after first salary) — keeps incentives aligned.
- Optional: affiliate for edtech courses/guidebooks.

## 5. Competitive edge vs Caretutors/vendors
- Honesty & transparency about all fees (their pain point: 55%).
- Underserved segments: English-medium premium, female-tutor-only, special needs, online/diaspora.
- Zero middleman drama: direct contact after opt-in; no opaque job-board gatekeeping early on.
- SEO long-tail (their app is app-first; Google listings are thinner).

## 6. Roadmap
- **Phase 1 — Foundation (now)**: repo + site skeleton, homepage, sitemap/robots, 2-3 seed
  content pages, JSON-LD, deploy.
- **Phase 2 — Directory engine**: data-driven area × subject hub pages (30-60 pages), fee guide,
  "how to choose" guide, internal linking, manual keyword refinement.
- **Phase 3 — Lead capture & monetization**: guardian request form + manual/lead-gen matching,
  featured tutor listings, bKash/Nagad payment notes.
- **Phase 4 — Marketplace (later, only if traction)**: tutor profiles, verification, post-pay
  commission model.

## 7. Content policy
- NO fabricated facts/figures. Fee ranges must be sourced (see RESEARCH.md) or marked as
  "typical range, verify directly".
- All published tutort/fee data: source + date when possible.
- Volume approach for SEO hubs is fine (templated) — but each must have at least unique,
  genuinely useful 1-2 paragraphs or structured data; never blank spam.

## 8. Metrics to watch
- Indexing: pages in Google, sitemap health.
- Visits + queries (GSC once / install later).
- Guardian lead-form submissions; tutor listing requests.
- Core Web Vitals kept green (static, no heavy JS).