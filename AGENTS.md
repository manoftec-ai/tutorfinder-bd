# Agent Operating Memory Protocol — TutorFinder BD

This project has a persistent memory system. Follow this protocol every session.

## 1. On session start (MANDATORY)
Load memory in TWO LAYERS:
1. GLOBAL layer: `~/.config/opencode/memory/MEMORY.md` + `MEMORY.json` + newest file in
   `~/.config/opencode/memory/sessions/` — the USER PROFILE.
2. PROJECT layer (this project), in order:
   a. `memory/MEMORY.md` — master memory (single source of truth)
   b. `memory/MEMORY.json` — structured mirror
   c. Newest file in `memory/sessions/` for unfinished context.

Precedence on conflict (highest wins): project memory > global user profile > generic behaviour.

## 2. Ground work in memory
- Recall the user's goals, decisions, and standards before responding.
- If a task conflicts with a recorded decision or goal, flag it — don't silently override.
- All replies to the user in Termux/shell must be **ENGLISH** (Bengali glyphs do not render
  in his Termux — D46). Bengali MAY appear in published site content (that is the product).
- Communication style: direct, structured, concrete; give exact commands; report
  What changed / Why / What was tested / Status / Next step.
- Budget: ZERO/VERY LOW. Free/open-source, minimal deps. Vercel Hobby + GitHub are the host.

## 3. Project purpose
TutorFinder BD — a search-optimized tutor-directory / lead-gen website for Bangladesh, starting
with Dhaka. Niche wedge (chosen 2026-09-21): **SEO content + directory first**; marketplace/
commission matching is a LATER phase. See `docs/RESEARCH.md` (evidence + verdict) and
`docs/PRODUCT_PLAN.md` (architecture, SEO structure, monetization, roadmap).

## 4. Recurring rules
- Commands: `npm run build` (cannot run locally on Termux — builds on Vercel). Deploy:
  `vercel deploy --prod --yes --token "$VERCEL_TOKEN"` (token in
  `~/.config/opencode/.secrets/vercel.env`).
- **Git (GLOBAL standing rule §5.6): after ANY modification in this repo, commit AND push
  without asking; verify the push succeeded.** Visit only intended files, never secrets.
- Never fabricate data. Tutor/area/fee figures must be sourced or clearly flagged as placeholders.
- Do not add unnecessary features/deps. SEO-first: clean static HTML, JSON-LD, sitemap, fast.

## 5. Memory rules
- Append; never delete history. Superseded items move to "Archived / superseded".
- Keep `memory/MEMORY.md` and `memory/MEMORY.json` in sync on every update.
- One session log per working block: `memory/sessions/YYYY-MM-DD--<topic>.md`.
- Golden rule: BUILD SYSTEMS THAT REMEMBER — knowledge lives in the project, never trust chat history.

## 6. Layout
```
tutor-finder/
  AGENTS.md            <- this protocol (auto-loaded)
  memory/              <- project memory (MEMORY.md, MEMORY.json, sessions/)
  docs/                <- RESEARCH.md, PRODUCT_PLAN.md (plans, evidence)
  site/                <- Astro app (src/pages, src/layouts, src/components, public/)
```