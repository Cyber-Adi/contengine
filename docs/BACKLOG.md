# Backlog — what actually needs doing

> ⚠️ **READ CORRECTIONS.md FIRST.** Three course changes supersede parts of this file:
> C1 canvas moves to 1440 · C2 the vision critic drops the BOSS baseline (P2.2 is NO LONGER
> BLOCKED) · C3 a new `sync` item outranks most of P2 · C4 Slice 1 reads Notion first.

Written after building and verifying the current state. Grouped by whether it blocks
shipping, closes a real quality gap, completes the pipeline, or hardens it.

**Read ECC-PLAN-V2.md alongside this** — it records what was built, where the original plan
was wrong, and the paste-ready prompt for each item below.

**Current honest status:** two fixtures render at 0 fails, byte-identical, 6.3s each, fully
offline. 10/10 gate fixtures pass. Diagrams (P1.1) and the optical gate (Gate 5) are built.
TikTok 9:16 renders from the same spec. What remains is listed below.

---

## P0 — Blocking. Nothing ships until these are done.

### P0.1 · The schema is decorative — wire it in
`carousel.schema.json` exists and **nothing validates against it.** `render.mjs` does a
bare `JSON.parse`. A malformed spec renders silently wrong instead of failing loudly, which
is the exact class of bug this whole engine exists to prevent.

```
Add ajv. Validate every spec against carousel.schema.json before rendering, and fail with
the offending JSON path. Add `npm run validate` and call it from run.sh before render.
Add a fixture to test_gates.py: a spec with a bad archetype enum must be REJECTED, not
rendered. Right now package.json has no scripts at all — add validate / render / qa / test.
```
**Effort:** ~30 min. **Why P0:** it is the cheapest correctness win in the repo.

### P0.2 · Replace the fixture spec with the real brief
`specs/post-49.json` is `"provenance": "reconstructed-fixture"`. Structure, thread, editorial
ruling and send-trigger are real; **the slide copy is not.** The engine must never write copy.

```
Once the brief folder is shared: parse the real fond_Content_Brief_Posts_47-48-49_*.md,
replace post-49.json's copy verbatim, set provenance to "brief", re-render, re-run QA.
Add a gate: refuse to mark any post Designed while provenance == "reconstructed-fixture".
```
**Blocked on:** the folder being shared. **Effort:** 10 min once unblocked.

### P0.3 · Chromium resolution on your Mac
`render.mjs` hardcodes a Linux container path with a `FOND_CHROMIUM` env override. On your
machine that path does not exist.

```
Make browser resolution ordered: FOND_CHROMIUM env -> playwright's own resolver ->
a clear error naming both. Document `npx playwright install chromium` in the README.
```
**Effort:** 10 min.

---

## P1 — The real quality gap. This is the difference between handsome and on-brand.

### ~~P1.1 · There are no diagrams~~ — DONE
Design System **3.5 says "Diagrams are the hero"** — timelines, flow loops, bar comparisons,
floor plans, split-frames, before/afters, pie-on-a-plate — and names **metaphor objects**
(receipts, price tags, boarding passes, textbook covers) as *"the signature move for
reframing data."*

**The engine currently has zero diagram capability.** Grep the renderer for SVG primitives
and you get two hits, both the thread. Every slide is typography plus rectangles. That is
why the output reads handsome-but-generic rather than like investigative journalism about
your kitchen. It is the single largest gap between what was built and what the design
system actually asks for.

```
Build a diagram primitive layer as flat SVG driven by tokens (2px stroke, no gradients,
no shadows, per 3.5). Start with the five that the existing 75 briefs actually call for —
audit the briefs first and build to demand, not to a wishlist. Likely: bar comparison,
before/after split-frame, flow loop, fridge-shelf floor plan, and a receipt metaphor object.

Add `diagram: {kind, data}` to the slide schema. Add a Gate 1 check that a value slide
carrying a diagram has one, and a WARN when a whole carousel is text-only — the design
system says every slide has a visual element and right now none of them do.
```
**STATUS: BUILT.** `src/diagrams.mjs` ships five flat-vector primitives — `bar-compare`,
`before-after`, `shelf-map`, `flow-loop`, `receipt` — all token-driven, no hex literals.
Added alongside them, derived from the reference accounts: a **swipe affordance** on every
non-final slide (both references carry one; fond had none, and swipe-through to slide 3 is
the metric Strategy v2 optimises for), **one-word accent pops** via `**word**`, a
**hand-drawn circle annotation** via `((word))`, Playfair-italic accents via `//word//`,
a bracketed **micro-label**, a flat geometric **ornament**, and a **colour-split hero
number** (`heroNumber` + `heroNumberUnit`).

**Still open here:** the five primitives were built to the four pillars, not to an audit of
what the 75 briefs actually demand. Once `briefs/` lands, audit demand and build only what
is missing. Do not add primitives speculatively.

### P1.2 · The "follow the line" thread is not actually implemented
Strategy v2 calls the follow-the-line mechanic *"one of the biggest carousel trends of
mid-2026"* and says to double down. The ECC plan specified pixel-level edge continuity:
the line exits slide N's right edge and re-enters slide N+1's left edge **at the identical
vertical position.**

What exists: `t.kind === 'line'` draws a horizontal line inside a bottom rail. It never
touches the slide edges. And **Gate 3 does not check edge continuity at all** — grep for
`rightmost|leftmost|edge` in qa.py returns zero. Gate 3 only checks that progress increases
and completes. The signature mechanic is specified, unimplemented, and unverified.

```
Implement the line thread so it genuinely exits the right edge and re-enters the left edge
at the same y. Then implement the Gate 3 check the plan already specifies: sample the
rightmost pixel column of slide N and the leftmost of slide N+1, assert the vertical
centroid of thread-coloured pixels matches within a few px. Add a fixture that breaks the
continuity and confirm the gate fires.
```
**Effort:** ~1 hour. **Why it matters:** it is the mechanic that makes a carousel feel like
one designed object rather than eight separate images.

### ~~P1.4 · Optical defects invisible to the gates~~ — DONE (Gate 5)
Adi spotted cut-off words and undersized type in previews that every gate passed. Root
cause: diagram labels were SVG `<text>`, which does not wrap or clip, so there was no box
for the structural gate to see overflow in. Diagrams are now HTML/CSS-first and **Gate 5 ·
Optical** was added: internal dead band (FAIL), balance (WARN), 22px type floor (FAIL),
headline orphan (WARN), fill ratio (WARN). See ECC-PLAN-V2 §2.1–2.2.

### P1.3 · Gate 4 has no OCR — legibility is proxied, not measured
The plan specified OCR at 200px: recover the hook's key noun and number, or fail. What
shipped measures ink coverage and a smoothed dominance band. Those catch a *blank* slide;
they cannot tell you whether the hook is **readable**.

```
Add tesseract (pytesseract). At 200px, OCR slides 1 and 2 and require the hook's longest
word and any number to be recovered. Keep the existing ink/dominance checks as cheap
pre-filters. Gate the OCR pass to end-of-batch — it is slow.
```
**Effort:** ~45 min. **Note:** slide 2 currently trips the dominance warning. Once OCR is in,
you will know whether that is a real legibility problem or a mis-calibrated proxy.

---

## P2 — Completing the pipeline (the unbuilt ECC slices)

### P2.1 · Slice 1 — brief parser + coverage report
**The most decision-relevant thing left.** Tells you whether this is a 20-post engine or a
75-post one, and everything downstream is sized by that number.
**Blocked on:** the brief folder. **Effort:** a session.

### P2.2 · Slice 4 — vision critic
Contact sheet + thumbs scored against the 5-dimension rubric, calibrated so the 8 BOSS
carousels average ≥4. **Blocked on:** the BOSS PNGs in `baseline/`.
Also add the perceptual-regression baseline the plan called for: once a slide is approved,
diff future renders against it so drift is caught.
**Effort:** ~1 hour once unblocked.

### P2.3 · Slice 5 — batch runner + Notion writeback
Currently `run.sh` handles one spec. Needs the batch path, `BATCH_REPORT.md` sorted by gate
so systematic failures surface as one fix, and the dry-run-then-reconcile Notion writeback
with `pass^2` on the write.
**Effort:** ~1 hour.

### P2.4 · Captions and hashtags
Nothing generates them. The existing bank covers posts 1–14 of 75. Strategy v2's rules are
specific: max 3–5 hashtags, and the caption's first sentence carries the searchable keyword,
because caption SEO replaced hashtag walls.
**Effort:** ~45 min. Pure text generation, no rendering.

### P2.5 · Reels are entirely out of scope right now
8 Mono-Text Reels are scripted and 0 animated. This engine is carousel-only. Reels need a
different pipeline (kinetic type → video). Strategy v2 wants one Reel per week minimum.
**Decide:** build it after carousels are flowing, or keep Reels manual for now. Do not start
it before P1.1.

---

## P3 — Hardening

- **Font subset is latin-only.** Fine for current copy; will silently drop a character
  outside it. Add a Gate 1 check that every rendered glyph exists in the loaded face.
- **pHash uses an FFT rather than a true DCT.** It works and the fixture catches duplicate
  layouts, but it is not a standard perceptual hash. Swap to a real DCT if you ever tune the
  distance threshold.
- **No CI.** Add a GitHub Action running `test_gates.py` on every push, so a gate can never
  silently regress. Regenerate baselines on the CI machine — Chromium font rendering differs
  across machines, which quietly invalidates pixel baselines.
- **`run.sh` has no batch mode or `--debug` passthrough.** The renderer supports a debug
  overlay (margins, thread zone, text boxes) that nothing currently exposes.
- **Slide 5's timeline layout still under-fills vertically.** Cosmetic, not a gate failure.

---

## Suggested order

1. **P0.1 + P0.3** — half an hour, makes everything after it trustworthy.
2. **P2.1** — the coverage report, the moment the folder is shared. It sizes the project.
3. **P1.1 diagrams** — the biggest quality unlock, and the reason output looks generic today.
4. **P1.2 thread + its gate**, then **P1.3 OCR**.
5. **P2.2 critic**, **P2.3 batch + Notion**, **P2.4 captions**.
6. P3 whenever.

**Two things gate almost everything:** the brief folder (P0.2, P2.1) and the 8 BOSS
carousels in `baseline/` (P2.2). Neither is work — both are a file copy.

**And the standing rule from CLAUDE.md, which none of this changes:** this repo renders
files. It does not publish, and it never writes slide copy.


---

## P4 — The publish and measure loop (added after the render half landed)

This is the back end of the pipeline. **Do not start it until posts are actually rendering
and the account has a manual posting cadence that holds for a month.** Automating a cadence
you have never run means debugging an API instead of posting.

### P4.1 · Instagram publishing
Two-step Content Publishing API: create a media container per image, then publish the
container. Carousels take 2–10 items, so an 8-slide post fits without redesign.

**Setup you must do once (~45 min, mostly Meta's console):** convert @getfond to a Business
or Creator account, create a Meta app, generate a long-lived token, and open a public
Supabase Storage bucket for the PNGs — images must sit at publicly reachable URLs, and you
already pay for Supabase. Verify current rate limits against Meta's own developer docs;
the publishing cap sits on top of the general budget and figures shift between versions.

There is no native "post at 9am Tuesday" — a scheduled task supplies the timing.

```
Build src/publish.mjs: read out/post-N/, upload slides to Supabase Storage, create the
carousel container, publish it. NEVER auto-publish. It must require an explicit
--confirm flag and refuse outright on any post whose qa-report.json verdict is not PASS
or whose spec provenance is still "reconstructed-fixture".
```

### P4.2 · The metrics loop — this is the part that compounds
Pull per-post insights (reach, saves, shares, profile visits, follows) and write them to the
Notion Performance Log, which today is one blank row. Then the loop closes: rendered post →
published → measured → **the measurement feeds the next hook.**

The metrics that matter, per Strategy v2 and never once logged: **swipe-through to slide 3**
(the closest proxy for "a stranger stopped"), saves/reach, sends/reach. Sends are weighted
3–5× likes.

**Create this as a third scheduled task once publishing works** — weekly, reads the last 7
days of insights, writes the Performance Log, and reports which hooks over- and
under-performed the account median. Kill criterion already exists in Strategy v2: any
recurring format whose save-rate underperforms the median for 3 consecutive posts gets
redesigned or retired. Wire that in as an actual gate, not a note.

**The honest framing:** until this runs, every claim about what works on this account is a
guess. The BOSS numbers measured warm traffic (1,848 profile views against 2,295 content
views is ~80%, which organic click-through never produces). Cold performance is unmeasured.
P4.2 is what makes it measured.

---

## P5 — The autonomous loop (added 2026-09-12)

Built this pass, tested at 18/18 (`npm run test:autonomy`): the unified ledger
(`src/state.mjs`), the decision ladder (`src/decide.mjs`), the entropy guard
(`src/entropy.mjs`), the GTM contract (`gtm.json` + `src/gtm.mjs`) and **Gate 6 · GTM
conformance** (`src/gtm-check.mjs`, wired into `run.sh` ahead of the renderer).
Full rationale in **AUTONOMOUS-ARCHITECTURE.md**. What remains:

### P5.1 · post-49 fails its gates right now — `npm run decide` says so
The loop's first output on a real board is `FIX_QA`. `out/post-49/qa-report.json` has
a non-PASS verdict. Read it and say **whether the gate got stricter or the output got
worse** before changing either.
**Effort:** unknown until read. **Why first:** the ladder puts it first.

### P5.2 · Convert the 57 scripted posts into specs
`specs/COVERAGE.md` says 59 of 69 are renderable and only 2 have specs. This is the
drain. Batch it; `provenance: "converted-from-notion-script"` is now a legal schema
value for the 40 Notion-sourced posts. PantryPal→fond is a mechanical substitution
and nothing else is. Set `gtmAngle` on each — Gate 6 warns without it, and it is what
lets the Ad Bank adapt the post later instead of originating a new angle.
**Effort:** a session. **Unblocks:** everything downstream, including the first
honest answer to "does any of this work."

### P5.3 · First harvest into `state/freshness.json`
Until this runs the entropy guard refuses every new concept, by design. Sources are
the GTM free stack. Deliverable: 5 hooks working, 2 formats gaining, 1 dying format.
**Effort:** ~30 min, mostly web search.

### P5.4 · Re-point the scheduled tasks
Wednesday stops being "write a script" and becomes "run `npm run decide`, then do what
it says." Sunday widens from ICP language to the full research stack. Add a monthly
angle-matrix challenge. See AUTONOMOUS-ARCHITECTURE.md §6.
**Effort:** ~20 min of prompt editing. **Why it matters:** without this the loop
exists but nothing calls it.

### P5.5 · Start measuring before the API exists
`state/performance.json` accepts manual entry. Three measured posts is the minimum
before any claim about what works is anything but a guess. Do not wait for P4.2.

### P5.6 · Re-render everything, then re-read G5.3 — two real defects found 2026-09-12
`npm run decide` said `FIX_QA` on post-49. Reading it produced three separate findings,
and the discipline of naming *which* thing was wrong mattered in every one:

1. **G4.5 OCR — the gate was stricter than reality.** Tesseract read the hero
   "3–5 WEEKS" as "5-5 WEEKS" and the gate failed for a missing `3`. Inspecting the
   actual 200px thumbnail settled it: the 3 is unmistakable. Fixed by separating two
   findings that were being conflated — wrong digit COUNT (or an unrecoverable word)
   stays a FAIL, while digits differing only within an OCR confusion class (3/5/8,
   6/9/0, 1/7) becomes a WARN that says the instrument cannot tell. Dash variants are
   normalised first. Pure-function fixture added: `test_gates.py::ocr_matcher_calibration`.

2. **G5.3 type floor — the gate made a category error.** It applied the content floor
   to chrome, so every slide failed on its own page number. The handle and counter are
   a signature, identified rather than read. `minChromeTypePx: 18` added to
   `tokens.json`. This is the *same* distinction G5.1 already makes when it bounds the
   composition by content boxes and excludes chrome — the error was making it in one
   place and not the other.

3. **The output genuinely got worse, too.** Chrome font sizes were never scaled when
   C1 moved the canvas to 1440, so `@getfond`, the counter, the micro-label and the
   thread label rendered proportionally *smaller* than designed. Now multiplied by `S`
   in `slide-html.mjs` like every other calibrated px constant.

**What you must do:** (3) needs a re-render — Chromium will not launch in the bridge VM,
so run `./run.sh` on both fixture specs natively. Then re-read G5.3. **Any remaining
typefloor FAIL on a non-chrome element is a real undersized-type defect**, and there is
already one visible: post-49 slide 5's body copy ("The float test measures the air
cell...") measures 24px against a 29px floor. Decide whether that layout's body size is
wrong or the floor is, and say which.
