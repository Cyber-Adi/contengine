# ECC Execution Plan: fond Carousel Engine — deterministic rendering + autonomous visual QA + a positioning layer

> **Role of this document.** ECC Orchestration Planner output. It translates the fond Content Strategy v2 design system, the Faceless Content OS pillar model, and Fable's Brand/GTM architecture into ECC-native moves: a boot, ten independently-shippable slices, and — per slice — a paste-ready block, a verification mode, subagents, and a worktree decision. **No code is written here.** Every block is an instruction for an ECC-equipped Claude Code instance.
>
> **Ceremony tier: 2 · Standard.** Not Tier 1, because the output is public-facing brand material, it writes to Notion state that four other automations read, and the design system is a *contract* that must be honored exactly — "looks fine" is not a passing condition. Not Tier 3, because there is no production DB, no money math, no migration, and every artifact is a file that can be deleted and re-rendered. Blocks are trimmed; the verification battery is where the ceremony actually goes.
>
> **How to use it.** Work top to bottom. Do Slice 0 once. Then run each slice through Plan → Build → Verify → Learn. Paste blocks into Claude Code as chat messages, not into a terminal. Track A (Slices 0–5) and Track B (Slices 6–9) are independent after Slice 0 — run them in parallel worktrees if you have the agent budget.
>
> **Source of truth.** Notion → *Content Strategy v2 + fond Design System (July 2026)*, Section 3, in full. If a block in this document and Section 3 disagree, **Section 3 wins** — fix the block. Secondary sources: *Faceless Content OS* (pillars, CTA tiers), *Content Engine × GTM Aggregation* (Reel adaptation tracker, value map), *Brand, GTM & Ad Engine — Post-Fable Architecture* (positioning line, angle matrix, free research stack).

---

## 0. Reading order & conventions

- Loop tags `[BOOT] [PLAN] [BUILD] [VERIFY] [LEARN]`. Commands: `/ecc:plan`, `/multi-execute`, `/quality-gate`, `/code-review`, `/learn`, `/checkpoint`.
- `pass@k` = ≥1 of k attempts works (exploratory, UI, copy). `pass^k` = **all k must work** (parsing, palette conformance, Notion writes).
- Subagents in play: `tdd-guide`, `code-reviewer`, `architect`, `doc-updater`. Not used: `database-reviewer`, `e2e-runner` (no DB, no app surface).
- **Worktree?** Only Slices 6–9, which touch no renderer code.
- **The scope fence lives in §1.1 and §8. Read both before Slice 1.**

### A note on prior art — checked, deliberately not adopted

Two open-source projects cover part of this and were evaluated before choosing to build:

| Project | What it is | Why not |
|---|---|---|
| [`Hainrixz/open-carrusel`](https://github.com/Hainrixz/open-carrusel) | MIT, 366★, Next.js + Puppeteer. Chat with Claude to design slides one at a time, export PNGs. Claude Code slash commands. | **Wrong shape.** It is an interactive single-slide design studio. We need an unattended batch renderer that turns 75 finished briefs into ~600 PNGs from a spec. Also pre-1.0 (6 commits, no releases). |
| [`DJ-vekariya/html-to-Instagram-carousel`](https://github.com/DJ-vekariya/html-to-Instagram-carousel) | Python + Playwright, HTML → 1080×1350 PNG CLI. | Closest match, but renders at 420×525 with `device_scale_factor≈2.57`, which softens fine type. No validation of any kind. |

**Three ideas worth stealing outright, and they are in the slices below:** open-carrusel's shared `wrapSlideHtml()` so preview and export are pixel-identical; its safe-zone overlay; and DJ-vekariya's explicit font-wait before capture. **Neither project validates its own output.** That gap — autonomous visual QA — is the actual novel work here and it is Slice 3.

### The honest read on the BOSS numbers (this shapes Slice 8)

Reported: 7 posts over 2 weeks → 354 followers, 2,295 content views, 1,848 profile views, ~19% profile-view-to-follow.

Adi's own skepticism is correct, but the interesting part is not new-account boost. **1,848 profile views against 2,295 content views is roughly 80%.** Organic content-to-profile click-through does not behave like that at any account size; typical is low single digits. That ratio says the profile traffic did **not** come from the posts — it came from people who already knew about the account and went looking for it, which is exactly what a live cohort program produces.

Two conclusions the plan is built on:

1. **The 19% profile-view-to-follow rate is real and it is good.** That is a bio-and-positioning metric measured on warm traffic. It says when someone lands on the profile, the proposition is clear enough to convert one in five. Keep the bio.
2. **The content's cold scroll-stopping power is untested.** Nothing in the BOSS data measures whether a stranger stops. So the first batch out of this engine is not "content" — it is an experiment with a measurement design, and that is Slice 8.

---

## 1. Project boot (do once)

- [ ] Create `CLAUDE.md` at repo root (§1.1 below).
- [ ] Confirm toolchain: Node 20+, Playwright with Chromium, Python 3.10+ with Pillow and numpy. **Do not run `playwright install`** if `PLAYWRIGHT_BROWSERS_PATH` is already set — use the existing Chromium.
- [ ] MCPs: **Notion** (read Content Calendar + design system; write Designed status). No others.
- [ ] Vendor the three brand fonts into `assets/fonts/` as local files — Playfair Display, DM Sans, Space Grotesk, all SIL Open Font License. **Never load fonts over the network at render time.** Rationale in §6.

### 1.1 CLAUDE.md

```markdown
# Project — fond Carousel Engine

## Mission
Turn finished carousel briefs into publishable, on-brand 1080x1350 PNGs without a human
designer in the loop, and prove they are on-brand mechanically rather than by eyeballing
them. The bar is "indistinguishable from the 8 hand-finished BOSS carousels," not
"absolutely stunning."

## Source of truth
Notion > Content Strategy v2 + fond Design System (July 2026), Section 3. Hex codes,
fonts, grid and the Never-Do list are a CONTRACT, not suggestions. If this repo and
Section 3 disagree, Section 3 wins.

## Guardrails (NON-NEGOTIABLE — from Design System 3.8)
- No stock photography, no photorealistic people/kitchens, no AI-photo renders.
- No gradients, drop shadows, bevels, glassmorphism.
- No pure #000 or #FFF. Backgrounds are Slate Black #14161A or Off-White #F5F2EC only.
- Signal Red #D64541 ONLY on loss/waste/cost figures. Never decorative.
- Max 40 words body copy per slide. Max 8 words per line on hooks.
- Never centered paragraph text. Never the same layout on two consecutive slides.
- The product is "fond". Never "PantryPal" in any rendered output.
- Never invent a statistic. Never promote a claim that is not in the brief.
- No app screenshots, no QR codes, no logo until launch.

## Hard stops — halt and ask Adi
- A brief's slide copy is missing or ambiguous. Do NOT write replacement copy.
- A render needs a colour outside the 7-token palette to look right.
- Any change to Section 3 itself.
- Anything that would post publicly. This repo renders files. It does not publish.

## Where things live
briefs/         source markdown briefs (read-only mirror)
specs/          normalized carousel.json per post
templates/      slide archetype HTML/CSS
assets/fonts/   vendored OFL font files
out/<post>/     rendered PNGs + qa-report.json
baseline/       the 8 BOSS carousels — the visual reference set
tokens.json     the machine-readable design system

## Done =
Every post whose brief has complete slide copy renders to 8 PNGs that pass all four QA
gates, scores >= threshold against the BOSS baseline, and is marked Designed in the
Notion Content Calendar.
```

---

## 2. Slice 0 — The design token contract (keystone) · pass^2 · no worktree

Everything downstream reads from this. The design system is currently prose in Notion, and prose cannot be verified. Turning it into a schema is the single move that makes "professional, not vibe-coded" mechanically enforceable rather than a matter of taste.

```text
[SLICE 0] Build the design token contract.

Read the fond Design System (Notion > Content Strategy v2, Section 3) in full.

Produce three artifacts:

1. tokens.json — the machine-readable design system:
   - colors: the 7 named tokens with exact hex, plus a `role` field and an
     `allowedOn` constraint (e.g. signalRed.allowedOn = ["loss","waste","cost"])
   - type: the 3 families with weight, role, and min/max pt size at 1080x1350
     (Playfair Display Bold 72-96 hooks / 56-72 reframes; DM Sans 32-40 body,
     28 labels, 20-22 citations; Space Grotesk Bold 80-140 hero numbers)
   - grid: canvas 1080x1350, margins 96 all sides, handle bottom-left,
     counter bottom-right, thread zone bottom 15% or one side rail
   - rules: maxBodyWords 40, maxHookWordsPerLine 8, maxAccentColorsPerSlide 3

2. carousel.schema.json — a JSON Schema for one carousel spec. Required per slide:
   index, archetype (hook|backupHook|value|reframe|cta), background (dark|light),
   copy (verbatim, never rewritten), visual element description, threadState,
   and citation when the slide carries a stat. Carousel level: postNumber, pillar,
   ctaTier, valueEncapsulated, threadElement with start/end state.

3. assets/fonts/ — download and vendor Playfair Display, DM Sans and Space Grotesk
   as local font files. Confirm each is SIL OFL licensed. Write assets/fonts/LICENSE.

VERIFY (pass^2 — run this twice, both must agree):
Write a validator that reads tokens.json and asserts: exactly 7 colors, no #000 or
#FFFFFF anywhere, every hex matches Section 3 character-for-character, all 3 font
files load from disk. Then hand-diff tokens.json against Section 3 line by line and
report any drift. Both runs must produce zero findings.

Do NOT proceed to Slice 1 until tokens.json is exact. Everything inherits from it.
```

`/checkpoint` after this slice — it is cheap to re-derive but expensive to have wrong.

---

## 3. Slice decomposition & dependency graph

| # | Slice | Verify | Subagents | Worktree? | Depends on |
|---|-------|--------|-----------|-----------|------------|
| 0 | Design token contract | pass^2 | `architect` | no | — |
| 1 | Brief → spec normalizer + coverage report | pass^2 | `tdd-guide` | no | 0 |
| 2 | The slide renderer | pass@2 | `tdd-guide` | no | 0, 1 |
| 3 | **The verification battery** | pass^3 | `tdd-guide`, `code-reviewer` | no | 2 |
| 4 | Vision critic + BOSS baseline | pass@2 | — | no | 2, 3 |
| 5 | Batch run + Notion writeback | pass^2 | `code-reviewer` | no | 3, 4 |
| 6 | Language Bank (content-market-fit mining) | pass@2 | — | **yes** | 0 |
| 7 | Positioning pass on the 75 existing hooks | pass@2 | — | **yes** | 6 |
| 8 | Cold-traffic test design + beta-mention ladder | pass@1 | — | **yes** | 7 |
| 9 | Fresh content from Language Bank gaps | pass@2 | — | **yes** | 6 |

**Critical path:** 0 → 1 → 2 → 3 → 5. Slice 4 branches off 3 and rejoins at 5.
**Parallel:** Track B (6 → 7 → 8, and 6 → 9) shares only Slice 0 and touches no renderer code. Run it in a second worktree from the start.

```ascii
                    ┌─────────────────────────── TRACK A · render ───┐
  [0] tokens ──┬──> [1] normalize ──> [2] render ──> [3] QA battery ──┬──> [5] batch + Notion
               │                                          │          │
               │                                          └──> [4] vision critic ─┘
               │
               └──> [6] Language Bank ──┬──> [7] hook re-score ──> [8] test design
                    └─ TRACK B · positioning │
                                             └──> [9] fresh content
```

---

## 4. Shared preamble for slices that write outside the repo

Paste at the top of Slices 5 and 7 only.

```text
This slice writes to Notion, which four scheduled automations read. Rules:
- RECONCILE IN PLACE. Update existing rows. Never append a duplicate row.
- Match rows by Post # first, then exact Title/Hook. If neither matches
  unambiguously, STOP and list the ambiguous cases rather than guessing.
- Dry-run first: print every row you would change and the before/after values.
  Wait for approval. Only then execute.
- Never touch: the Design System page, the Faceless Content OS page, any
  page under ED Sprint.
```

---

## 5. Per-slice blocks

### Slice 1 — Brief → spec normalizer + coverage report · pass^2 · no worktree

*Inherits tokens.json and carousel.schema.json from Slice 0.*

This is the reconciliation slice and it has to run before anything renders. The briefs are markdown files on the local machine; the Notion Content Calendar rows contain only ~153-character pointers to those filenames. There are also older pre-v2 script pages living in Notion. **Two sources exist and they disagree.**

```text
[SLICE 1] Normalize every brief into a validated spec, and tell me what we actually have.

Inputs, in priority order:
  1. The v2 markdown briefs on disk (files named like
     fond_Content_Brief_Posts_47-48-49_and_Kinetic_Reel_GraveyardFade.md).
     These are CURRENT and they win.
  2. Notion Content Calendar rows (130 rows) — for Post #, Pillar, CTA Tier,
     Format, Reel Type, Value Encapsulated, and the brief-file pointer in Notes.
  3. Older Notion carousel script pages (Posts 1-8, 9-16, 17-27, 18-30, 31-40,
     41-50, 51-63) — pre-v2, 6-7 slides, LOWER priority. Use only to fill gaps.

Build the parser. For every post, emit specs/post-<N>.json validated against
carousel.schema.json.

Then emit specs/COVERAGE.md — the thing I actually need from this slice:
  - READY: complete 8-slide copy, thread defined, citations present. Renderable now.
  - THIN: has a brief but is pre-v2 (6-7 slides) or missing thread/citations.
    List exactly what each is missing.
  - STUB: a calendar row with no usable copy anywhere.
  - ORPHAN: a brief file on disk with no matching Notion row.
  - CONFLICT: brief and Notion row disagree on pillar, tier or hook. List both values.

Report the counts. Do NOT write copy to fill gaps — flag them.
Do NOT modify Notion in this slice. Read only.

VERIFY (pass^2 — run the whole parse twice from clean, diff the two specs/ trees):
The two runs must be byte-identical. Any non-determinism in parsing is a bug, and it
is the kind that silently ships wrong slide copy. Additionally: every emitted spec
validates against the schema, and the READY count matches a hand-count of 5 randomly
sampled posts.
```

**Expected finding:** far fewer than 75 posts will come back READY. That number is the real input to everything downstream, and knowing it is worth more than the renderer.

---

### Slice 2 — The slide renderer · pass@2 · no worktree

```text
[SLICE 2] Build the renderer.

Architecture:
- One HTML template per slide archetype: hook, backupHook, value, reframe, cta.
  Templates read every colour, size and margin from tokens.json. NOTHING is
  hardcoded — a literal hex anywhere outside tokens.json is a build failure.
- Fonts load via @font-face from assets/fonts/ local files ONLY. No network.
- Playwright + Chromium. Render at 1080x1350 with deviceScaleFactor 2 (so the
  browser paints 2160x2700), then downsample to 1080x1350 with Lanczos in Pillow.
  Supersampling then downsampling is what makes Playfair at 96pt look typeset
  rather than aliased. This is the single biggest "does it look professional"
  lever in the whole build — do not skip it and do not render at 1x.
- Before every screenshot: await document.fonts.ready AND explicitly assert
  document.fonts.check() returns true for all three families. A silent fallback
  to a system serif is the #1 way this output looks amateur, and it fails quietly.
- ONE wrapper function produces the HTML for both the debug preview and the export,
  so what you inspect is pixel-identical to what ships. (Borrowed from open-carrusel.)
- Emit a debug overlay mode: safe margins, thread zone and text bounding boxes drawn
  on top. Off by default, on for QA.

The continuous thread (Design System 3.6) is a first-class feature, not decoration.
For the "follow the line" mechanic the line must exit the right edge of slide N and
re-enter the left edge of slide N+1 at the IDENTICAL vertical position. Implement it
as a single parameterised element positioned from the spec's threadState, not as
hand-placed art per slide.

Start with ONE carousel end to end — pick the highest-scoring READY post from
Slice 1's coverage report. Render all 8 slides. Show me the contact sheet before
building the batch path.

VERIFY (pass@2): render the same carousel twice from clean. The PNGs must be
byte-identical. Then open the contact sheet and confirm against Design System 3.8
by eye — this is the last eyeball check in the plan; Slice 3 replaces it.
```

---

### Slice 3 — The verification battery · pass^3 · no worktree

**This is the heart of the build and the thing neither GitHub project does.** It is what turns "trust me, it looks fine" into a gate. Four independent gates, all automated, all run on every render.

```text
[SLICE 3] Build the four-gate visual QA battery. Every gate emits structured
findings into out/<post>/qa-report.json. Any FAIL blocks the post from being
marked Designed.

GATE 1 — Structural (runs IN THE BROWSER, before the screenshot):
  1.1 Text overflow: for every text node, assert scrollHeight <= clientHeight and
      scrollWidth <= clientWidth. Overflowing or clipped text is the single most
      common way generated slides look broken. Hard fail.
  1.2 Safe margins: no element's bounding box intrudes into the 96px margin except
      elements tagged as thread.
  1.3 Fonts: document.fonts.check() true for Playfair Display, DM Sans and
      Space Grotesk. Hard fail on any fallback.
  1.4 Copy limits from tokens.json: body <= 40 words, hook lines <= 8 words,
      <= 3 accent colours in the DOM for that slide.
  1.5 Type role: assert every numeral glyph in a stat element computes to
      Space Grotesk. Numbers in the body font is an explicit Section 3 violation.

GATE 2 — Pixel conformance (runs on the exported PNG):
  2.1 Palette membership: cluster the PNG's colours. Every cluster centroid must be
      within a small deltaE of one of the 7 tokens, allowing an antialiasing band
      between any two adjacent tokens. An invented colour is a hard fail — this is
      the gate that catches drift into "vibe-coded".
  2.2 No pure black or pure white pixels above a negligible count.
  2.3 Contrast: compute WCAG ratio for each text-on-background pair from the DOM
      boxes. Require >= 4.5:1, warn below 7:1 for anything under 40pt.
  2.4 Signal Red discipline: if #D64541 appears above a trace pixel count, the
      spec for that slide MUST declare a loss/waste/cost figure. Otherwise fail.
      This enforces the one palette rule that is about meaning, not looks.
  2.5 Ink ratio: proportion of non-background pixels. Flag < 8% (empty, weak) and
      > 45% (cluttered) as warnings, not failures.

GATE 3 — Thread continuity (the signature mechanic, mechanically verified):
  For carousels using a line thread: sample the rightmost pixel column of slide N
  and the leftmost column of slide N+1. The vertical centroid of thread-coloured
  pixels must match within a few pixels. A thread that jumps is the tell that a
  carousel was assembled slide-by-slide instead of designed as one object.
  Also assert the thread completes on the final slide per the spec's end state.

GATE 4 — Thumbnail legibility (the scroll-stopping proxy):
  Instagram shows a carousel small before anyone decides to stop. So:
  4.1 Downsample slide 1 and slide 2 independently to 200px wide.
  4.2 Assert the hook is still readable at that size — run OCR and require the
      hook's key noun and number to be recovered. If OCR cannot read it at 200px,
      a scrolling stranger cannot either. Fail.
  4.3 Dominance: at thumbnail scale, assert one element occupies >= 25% of the
      visual weight. Slides with no dominant element do not stop scrolls.
  4.4 Run 4.1-4.3 on slide 2 SEPARATELY. Design System 2 says Instagram re-serves
      carousels showing slide 2 first, so slide 2 must survive this gate standing
      alone. A slide 2 that only makes sense after slide 1 is a fail, not a warning.

CROSS-SLIDE:
  Compute a perceptual hash per slide. Adjacent slides must differ beyond a
  threshold — Section 3.8 forbids the same layout twice in a row, and pHash
  distance is a fair proxy for "every swipe feels like arrival somewhere new."

VERIFY (pass^3 — this gate protects public brand output, so all three must pass):
  a) Build a fixtures set of deliberately BROKEN slides — overflowing text, a
     fallback font, an off-palette colour, decorative red, a broken thread, an
     illegible thumbnail, two identical layouts. Every gate must catch its own
     failure mode. A gate that passes a known-bad fixture is worthless.
  b) Run the full battery against the 8 BOSS carousels in baseline/. They were
     hand-finished and they performed, so they should pass. Any gate that fails
     them is mis-calibrated — loosen the GATE, do not edit the baseline.
  c) Run the battery 3x on the same render. Identical findings all three times.
```

`/checkpoint` here. This slice is the expensive one to rebuild.

---

### Slice 4 — Vision critic + BOSS baseline · pass@2 · no worktree

The gates in Slice 3 catch *wrong*. They cannot catch *boring*. This slice adds the judgment layer, and it is anchored to the only visual evidence that has ever earned a follower.

```text
[SLICE 4] Build the vision critic.

Setup: put the 8 hand-finished BOSS carousels in baseline/. These are the reference
set. They are not "good design" in the abstract — they are what this account looked
like when 7 posts produced 354 followers. That is the bar.

Build a step that assembles out/<post>/contact-sheet.png (all 8 slides in a grid)
plus out/<post>/thumbs.png (slides 1 and 2 at feed scale), then reads both with
vision and scores against this rubric, 1-5 each:

  1. STOP  — at thumbnail scale, does slide 1 create an open loop in under 2 seconds?
  2. STAND — does slide 2 work for someone who never saw slide 1?
  3. ARRIVE— does each swipe feel like a new place, or like more of the same slide?
  4. SAVE  — is there a slide someone would screenshot? (Section 3 says slide 7.)
  5. FAMILY— placed beside the 8 baseline carousels, does this look like the same
             account? Name the specific tell if not.

Rules for the critic:
- Cite the slide number and the concrete element for every score below 4.
  "Slide 4 feels cluttered" is useless. "Slide 4 has three competing focal points:
  the 62pt number, the icon row and the callout box" is actionable.
- Never suggest copy changes. Copy is the brief's job and the brief is verbatim.
- Never suggest anything on the Never-Do list, even if it would look better.
- Output out/<post>/critique.md and a mean score in qa-report.json.

Gate: mean < 3.5 OR any single dimension <= 2 routes the post back to render with
the critique attached. It does NOT get marked Designed.

VERIFY (pass@2): run the critic on all 8 baseline carousels. They should average
>= 4. If the critic scores the proven set low, the rubric is wrong — fix the rubric.
Then run it twice on the same new carousel and confirm scores land within 0.5.
```

---

### Slice 5 — Batch run + Notion writeback · pass^2 · no worktree

*Paste the §4 preamble at the top of this slice.*

```text
[SLICE 5] Render everything READY, then reconcile Notion.

1. Batch-render every post marked READY in specs/COVERAGE.md. Run the full QA
   battery and the critic on each. Write out/<post>/{slides,qa-report.json,
   critique.md,contact-sheet.png}.

2. Produce out/BATCH_REPORT.md: passed, failed by gate, critic scores, and the
   specific reason for every failure. Sort failures by gate so systematic problems
   (e.g. "every Pillar 2 slide fails ink ratio") surface as one fix, not forty.

3. Dry-run the Notion reconciliation. For every PASSED post, show the row you would
   update: Status Scripted -> Designed, Designed checkbox true, and a one-line QA
   verdict appended to Notes. Print the full before/after list. WAIT.

4. On approval, execute. Then re-read every row you wrote and confirm the value
   landed. Report any that did not.

Do NOT set Scheduled Date in this slice. Scheduling is a decision, not a render step.

VERIFY (pass^2): run step 3's dry-run twice — identical output both times. After
step 4, re-query the Content Calendar and assert the Designed count equals the
passed count exactly, and that total row count is UNCHANGED (no rows created).
```

---

### Slice 6 — Language Bank · pass@2 · **worktree**

Track B starts here. This is the positioning layer, and it is the answer to the content-market-fit point: find where the audience already talks about this, take their exact words, and put those words on the slides.

Fable already wrote a "Viral Research" prompt on the Brand/GTM page and it has never been run. This slice operationalizes it and makes its output persistent instead of a chat message.

```text
[SLICE 6] Build the Language Bank.

Goal: stop writing hooks in OUR words. Mine the audience's actual words and make
them a reusable asset. We are looking for content-market fit — evidence that
strangers already discuss this problem, and the exact vocabulary they use for it.

Sources (all free, per the Brand/GTM page's research stack):
  - Reddit: r/ZeroWaste, r/EatCheapAndHealthy, r/Frugal, r/MealPrepSunday,
    r/Cooking, r/budgetfood. Sort by top, past year.
  - TikTok Creative Center: top ads and organic in Food & Drink.
  - Meta Ad Library: live ads from Too Good To Go, NoWaste, Kitche, Samsung Food,
    Mealime, and any grocery-savings app running spend.
  - Amazon reviews of food-storage products (Rubbermaid Brilliance, produce savers,
    vacuum sealers) — filtered to 3-star, which is where real friction gets written.
  - YouTube autocomplete on "how to keep", "why does my", "food waste".

For every capture, record VERBATIM. Do not paraphrase, do not clean up grammar.
The paraphrase is the failure mode — the whole value is in their exact phrasing.

Create a Notion database "Language Bank" under Faceless Content OS with:
  Phrase (verbatim) | Source + URL | Date seen | Pain cluster | Frequency signal
  (upvotes/likes/how often it recurs) | Our current phrasing for this | Recommended
  swap | Pillar it maps to

Target 60+ rows minimum, clustered into no more than 8 pain clusters. Then write a
summary page answering four questions:
  - What words do they use that we never use?
  - What words do WE use that never appear in their language at all?
  - Which of our 4 pillars has the strongest natural language support, and which
    is us talking to ourselves?
  - 5 hooks currently working in this niche, 2 formats gaining, 1 format dying.

Flag honestly if a pain cluster we built a pillar on has weak evidence. That finding
is more valuable than a full table.

VERIFY (pass@2): spot-check 10 rows — each phrase must be findable at its cited URL
and must be verbatim. Any paraphrase invalidates the row.
```

---

### Slice 7 — Positioning pass on the 75 existing hooks · pass@2 · **worktree**

*Paste the §4 preamble — this writes to Notion.*

```text
[SLICE 7] Re-score every existing hook against the Language Bank.

For all 75 scripted carousels plus 8 Reels, score each hook 1-5 on:
  - Language match: does it use vocabulary that appears in the Language Bank?
  - Specificity: a number, a named food, a named place, a dollar figure?
  - Stakes in 8 words or fewer.
  - Loop: does it create a question the reader needs slide 2 to close?

Output a ranked table, worst first. For the bottom quartile ONLY, propose a rewrite
that swaps our vocabulary for theirs while keeping the underlying claim and its
citation completely unchanged.

Hard rules:
  - Never change a statistic, a source, or a factual claim. Language only.
  - Present rewrites as a DIFF: current hook, proposed hook, the Language Bank rows
    that justify it. Adi approves each one individually.
  - Do not touch the positioning line itself ("makes invisible things visible") —
    that comes from Identity Synthesis and is not up for revision here.
```

---

### Slice 8 — Cold-traffic test design + the beta-mention ladder · pass@1 · **worktree**

```text
[SLICE 8] Design the first batch as an experiment, not as content.

Context you must carry: the BOSS numbers came from warm traffic (1,848 profile views
against 2,295 content views is ~80%, which organic click-through never produces).
So cold scroll-stopping is UNMEASURED. The first batch's job is to measure it.

Produce a test plan:
  - 12 posts over 3 weeks on the existing Mon/Wed/Fri/Sun pillar cadence.
  - Within it, vary ONE thing deliberately: hook language sourced from the Language
    Bank vs our existing phrasing. Roughly half and half, balanced across pillars so
    pillar is not confounded with treatment.
  - Metrics, per Strategy v2 Section 2 which already names them and has never logged
    them: reach, swipe-through to slide 3, saves/reach, sends/reach, follows,
    and profile-view-to-follow.
  - The primary metric is swipe-through to slide 3. It is the closest available
    proxy for "a stranger stopped," and it is the re-serve trigger.
  - State the decision rule BEFORE the test runs: what result would make us keep
    Language Bank hooks, and what result would make us drop them. Write it down now
    so it cannot be rationalised later.
  - Build the Performance Log as a real Notion database with these columns. It is
    currently a static table with one blank row.

Then design the beta-mention ladder. The app is pre-launch and the CTA tiers (0-3)
already exist, so this is about WHEN a testing-phase mention earns its place:
  - Tier 0/1 posts stay clean. No product mention.
  - The Tier 2 CTA gains one optional line for later use, phrased honestly for
    pre-launch: testing phase, founding member, waitlist. Never "customers,"
    never "users," never a number we cannot verify.
  - Define the trigger condition for switching it on — e.g. TestFlight actually
    live AND a stated follower floor. Write the condition, not a date.
  - Draft the 3 candidate lines. Do not deploy any of them in this batch.
```

---

### Slice 9 — Fresh content from Language Bank gaps · pass@2 · **worktree**

```text
[SLICE 9] Generate genuinely new carousel concepts — sourced, not invented.

The current backlog was exhausted at Post 63 and the last two batches wrote fresh
hooks from a bank of our own ideas. That is how an account drifts generic. Source
the next ones from evidence instead.

Using the Language Bank: find pain clusters with strong audience signal and NO
existing carousel. Those gaps are the brief.

For each of 10 new concepts produce: the pain cluster and its evidence, the verbatim
audience phrasing it is built on, the pillar it belongs to, an 8-word hook using
their words, the 8-slide arc, the continuous thread element, the send-trigger line,
and the source for any statistic.

Constraints:
  - Every stat must survive a source check. Follow the existing editorial discipline
    from the Wednesday logs: if a number traces only to blogs or survey aggregation,
    render it as a qualitative claim, never as hero type. That rule already caught
    the misted-produce percentage and the egg-carton stat. Keep it.
  - Stay inside the 4 pillars. If a strong cluster fits no pillar, do not invent a
    fifth — flag it for Adi as a possible pillar revision and move on.
  - Write specs directly to specs/ in schema format so they render without a second
    briefing pass. This is the point: new ideas enter the pipeline render-ready.

VERIFY (pass@2): every stat independently verified at its primary source. Every
spec validates against carousel.schema.json and renders through the Slice 3 battery
clean before it is logged to Notion.
```

---

## 6. Cross-slice concerns

**Font determinism is a real trap.** Playwright's Chromium renders type differently across machines and OS font stacks, which quietly breaks any pixel baseline. Two mitigations, both mandatory: vendor the font files locally (Slice 0) so no system font can ever substitute, and treat baselines as valid only on the machine that generated them. If rendering ever moves to CI, regenerate baselines there rather than trusting the old ones.

**Supersample, always.** Render at 2× and downsample with Lanczos. At 1×, Playfair Display at 96pt shows aliasing on the thin strokes and that single detail is most of the difference between "designed" and "generated."

**Verification cost.** Gates 1–3 are cheap and deterministic — run them on every render, always. Gate 4's OCR and the Slice 4 vision critic cost real tokens, so run those once per carousel at the end of a batch, not per iteration while templates are still moving.

**Checkpoints:** after Slice 0 and after Slice 3. Both are expensive to rebuild and everything downstream assumes them.

**Model routing:** Slices 1, 2, 3, 5 are mechanical — run them at whatever your default builder is. Slices 4, 6, 7, 9 are judgment and language work; give those the stronger model. Slice 3's fixture design is the one mechanical slice worth the stronger model, because a gate that does not catch its own failure mode is worse than no gate.

**Parallelism:** Track B has no dependency on the renderer beyond tokens.json. Start it in a worktree the moment Slice 0 lands, and it will finish around the time Slice 3 does — which is exactly when you want the Language Bank ready for Slice 7.

---

## 7. Definition of Done

1. `tokens.json` is a character-exact machine-readable copy of Design System Section 3, and no hex literal exists anywhere else in the repo.
2. `specs/COVERAGE.md` states, with evidence, exactly how many posts are renderable and what every non-renderable one is missing.
3. Any READY post renders to 8 PNGs at 1080×1350 with no human in the loop.
4. All four QA gates run automatically, each one demonstrably catches its own failure mode against a deliberately broken fixture, and all four pass the 8 BOSS carousels.
5. The vision critic scores the BOSS baseline ≥ 4 average, and new output is gated at ≥ 3.5.
6. The Notion Content Calendar reflects true Designed status with zero rows created and zero duplicates.
7. The Language Bank holds 60+ verbatim, source-linked rows in 8 or fewer clusters.
8. Every one of the 75 existing hooks has a language-match score, and bottom-quartile rewrites are presented as approvable diffs.
9. A written test design exists with its decision rule stated **before** the first post goes out, and the Performance Log is a real database.
10. 10 new render-ready concepts exist, each traceable to audience evidence rather than to us.

---

## 8. Risk register — where to STOP and ask

| # | Risk | Trigger to STOP | Mitigation |
|---|------|-----------------|------------|
| 1 | Agent writes replacement slide copy to fill a gap | Any brief is missing copy for a slide | Slice 1 flags, never fills. Copy is Adi's. |
| 2 | Palette or type drift — the "vibe-coded" failure | A render needs a colour outside the 7 tokens to look right | Gate 2.1 hard-fails. Escalate; never widen the palette silently. |
| 3 | Notion row duplication | Any post cannot be matched unambiguously | §4 preamble: dry-run, reconcile in place, `pass^2` on the writeback. |
| 4 | A fabricated or unsourceable statistic ships | Any stat cannot be traced to a primary source | Render qualitatively, never as hero type. Existing editorial rule. |
| 5 | Scope creep into publishing | Anything proposes posting, scheduling or API integration | **This repo renders files. It does not publish.** Out of scope entirely. |
| 6 | Silent font fallback | `document.fonts.check()` returns false | Gate 1.3 hard-fails before screenshot. Fonts are local. |
| 7 | Baselines invalidated by an environment change | Machine, OS or Chromium version changes | Regenerate baselines; never edit the BOSS reference set to make a gate pass. |
| 8 | Over-fitting to BOSS numbers | Any decision cites 354 followers as proof content works | The 80% profile-view ratio says that traffic was warm. Cold performance is unmeasured until Slice 8 runs. |
| 9 | Pillar drift during Language Bank work | A strong cluster fits no existing pillar | Flag for Adi. Do not invent a fifth pillar autonomously. |
| 10 | The engine becomes the project | Renderer work extends past its slice budget while ED deadlines slip | Slices 0–5 are one weekend. If they aren't done, ship what passes and stop. |

---

## 9. Planner's done-check

Everything needed to execute is in this document: the ceremony tier and its justification, the boot and CLAUDE.md, a keystone slice that makes the design system machine-checkable, ten slices with verify modes and dependencies, a dependency graph with a real parallel track, the Notion-write preamble, a DoD mapped to the source's own standards, and ten STOP triggers seeded from the design system's Never-Do list.

**Two things this plan deliberately does not do.** It does not publish anything — rendering and publishing are separate concerns and mixing them is how a render bug becomes a public post. And it does not write a single line of carousel copy; the briefs are verbatim by design, and the only copy work in scope is Slice 7's approvable, evidence-backed language swaps.

**Start here:** Slice 0, then Slice 1's coverage report. That report tells you whether this is a 20-post engine or a 75-post one, and everything after it is sized by that number.
