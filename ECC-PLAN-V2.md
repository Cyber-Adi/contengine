# ECC Plan v2 — the delta

Supersedes `fond_Carousel_Engine_ECC_Execution_Plan.md` wherever the two disagree. The
original plan is still the reference for ceremony tier, the Notion-write preamble, and the
positioning track (Slices 6–9). **This document records what actually got built, where the
original plan was wrong, and what is left.**

Ceremony tier is unchanged: **2 · Standard.**

---

## 1 · What is now BUILT (was Slices 0, 2, 3 + P1.1)

| Was | Now |
|---|---|
| Slice 0 · token contract | ✅ `tokens.json`, `carousel.schema.json`, 11 vendored OFL faces |
| Slice 2 · renderer | ✅ 8 layouts, thread engine, 2× supersample → Lanczos, **fully offline** |
| Slice 3 · QA battery | ✅ Gates 1–4 + cross-slide, **10/10 fixtures caught** |
| P1.1 · diagrams | ✅ 5 primitives, **HTML/CSS-first** (see §2.1) |
| — | ✅ **Gate 5 · Optical** — new, not in the original plan (§2.2) |
| — | ✅ **Multi-canvas** — IG 4:5 and TikTok 9:16 from one spec (§4) |

Two fixtures render at **0 fails**, byte-identical across runs, **6.3s per carousel**:
`post-49` (meter thread, Signal Red forbidden by its own argument) and `post-5` (all five
diagrams, every chrome feature).

---

## 2 · Where the original plan was WRONG

### 2.1 · Diagrams as SVG `<text>` was the wrong architecture
The original plan said "build a diagram primitive layer as flat SVG." I did, and it was a
mistake. **SVG text does not wrap and does not clip.** It either runs past its shape or gets
silently truncated by whatever character-count heuristic you hand-roll. Both happened, and
Adi caught it in the previews before any gate did — because there is no box for the browser
to overflow, so the structural gate was blind to it.

**Corrected architecture:** every text-bearing part of a diagram is real HTML in a real box.
SVG is used only for marks that need vector geometry — arrows, the receipt's torn edge. The
payoff is that Gate 1's existing overflow measurement now covers diagram labels for free,
and CSS wraps with true glyph metrics instead of a guess.

**Rule going forward, add it to any new primitive:** if it contains words, it is HTML.

### 2.2 · The original plan had no optical gate. That was the real hole.
Gates 1–4 prove text is *contained*, on-palette, threaded, and legible at thumbnail scale.
None of them can tell you the slide **looks wrong** — a paragraph stranded above 300px of
nothing, a label smaller than anyone reads on a phone, a headline ending on an orphan. Those
are the defects a human spots instantly and a containment check never will.

**Gate 5 · Optical** is new and now canonical:

| Check | What it catches | Level |
|---|---|---|
| **5.1 dead band** | a hole *between* content elements | FAIL |
| **5.2 balance** | ink centre-of-mass outside 34–62% of height | WARN |
| **5.3 type floor** | anything set below 22px | FAIL |
| **5.4 orphan** | headline's last line is one short word | WARN |
| **5.5 fill ratio** | composition uses < 55% of its own box | WARN |

The measurement subtlety that took three attempts to get right, so don't undo it:
**bound the composition by the actual content element boxes, not by canvas pixels.** The
micro-label, ornament, handle, counter and thread rail are chrome pinned to the frame. The
gap between them and the copy is structural, not a design defect. Measuring raw pixels
reported six false failures at `y=121` — every one of them the gap under the micro-label.

5.5 is a WARN and must stay one. A sparse poster slide is a legitimate choice; the gate
tells you the frame is under-used and lets the author decide.

### 2.3 · Three more gate bugs the fixtures and the previews found
- Word count ran on the 80-char **preview string**, not the real text. A 55-word paragraph
  measured as 16 words.
- The contrast gate read CSS `color` on SVG text, which paints with `fill`. It reported
  1.2:1 on perfectly legible labels.
- Boldness was guessed from **class-name substrings**, so every new class silently fell back
  to the stricter normal-text threshold. Now reads computed `font-weight >= 600`.
- Contrast compared text against the **slide** background, not the local surface. The
  receipt card is Off-White on a dark slide; its black text scored 1.0:1. Surfaces now
  declare themselves with `data-surface`.

**The lesson worth carrying:** every one of these was a gate that was *wrong*, not output
that was wrong. When a gate fires, decide whether the gate got stricter or the output got
worse. Never loosen a gate to make a render pass without saying which it was.

### 2.4 · Still not built, still specified — carried forward unchanged
- **Gate 3 edge continuity** (P1.2). The "follow the line" thread still renders inside a
  bottom rail and never touches the slide edges, and Gate 3 still only checks that progress
  increases and completes. Specified, unimplemented, unverified.
- **Gate 4 OCR** (P1.3). Legibility is still proxied by ink coverage and dominance, not
  measured. Slide 2 of both fixtures trips the dominance warning; until OCR lands you do not
  know whether that is real.

---

## 3 · Revised slice table

| # | Slice | State | Verify | Blocked on |
|---|-------|-------|--------|------------|
| 0 | Token contract | ✅ done | pass^2 | — |
| 1 | Brief parser + coverage | ⛔ | pass^2 | `briefs/` |
| 2 | Renderer | ✅ done | pass@2 | — |
| 3 | QA battery, Gates 1–5 | ✅ done | pass^3 | — |
| 3b | Gate 3 edge continuity | ⛔ | pass@2 | — |
| 3c | Gate 4 OCR | ⛔ | pass@2 | — |
| 4 | Vision critic | ⛔ | pass@2 | `baseline/` |
| 5 | Batch + Notion writeback | ⛔ | pass^2 | Slice 1 |
| 6–9 | Positioning track | 🟡 partly live as scheduled tasks | pass@2 | — |
| **10** | **TikTok variant** | 🟡 renderer done, publish not | pass@2 | audit (§4) |
| 11 | IG publish + metrics | ⛔ | pass^2 | Meta app |

**Critical path is unchanged:** Slice 1 is still the most decision-relevant thing left,
because it tells you whether this is a 20-post engine or a 75-post one.

---

## 4 · TikTok — yes, with one real catch

**Verdict: the same carousels can run on TikTok, and the renderer already produces them.**

`node src/render.mjs specs/post-5.json --canvas=tiktok` emits 1080×1920 into
`out/post-N/slides-tiktok/`. Because layout is CSS and the spec is data, **the canvas is a
parameter, not a redesign** — the same eight slides reflow into 9:16 with no new brief and
no new copy. This is the single cheapest distribution win available.

Verified facts on the posting side:
- TikTok's Content Posting API publishes photo carousels via
  `POST /v2/post/publish/content/init/` with `media_type: PHOTO`, **1–35 images**.
- Images must be pulled from **HTTPS URLs on a domain verified for your developer app**.
  Same Supabase Storage requirement as Instagram, plus a domain-verification step.
- Rate limit: **6 requests/minute** per user token.

**The catch, and it is the whole story:** unaudited apps are **limited to private viewing**.
Public posting requires passing TikTok's Content Posting API audit. For a solo builder that
is a real gate, not a formality.

**So the sequencing is:**
1. Render the 9:16 variant now — free, already works.
2. Post to TikTok **manually** at first. Strategy v2 already called for this ("TikTok =
   repost carousels as photo-mode posts"); the engine finally makes it zero extra work.
3. If it earns reach, use `video.upload` (draft-to-inbox) rather than direct post — it
   sends the carousel into the TikTok app for you to publish, and sidesteps the audit.
4. Only pursue the audit if TikTok becomes a real channel.

**Do not build TikTok publishing before Instagram publishing works.** Two half-finished
integrations is worse than one finished one.

---

## 5 · The prompts

Everything paste-ready. `INITIALIZATION.md` has the boot prompt and folder contract; these
are the per-task blocks.

### 5.1 · P0 sweep — do this first, ~50 min
```
Work BACKLOG items P0.1 and P0.3 together.

P0.1: add ajv, validate every spec against carousel.schema.json before rendering, fail with
the offending JSON path. Wire `npm run validate` and call it from run.sh. Add a fixture to
test_gates.py: a spec with an invalid archetype enum must be REJECTED, not rendered.

P0.3: make Chromium resolution ordered — FOND_CHROMIUM env, then playwright's own resolver,
then a clear error naming both.

When done, re-run `npm test` (must be 11/11 with the new fixture) and ./run.sh on BOTH
fixture specs. Report the counts before telling me it works.
```

### 5.2 · Gate 3 edge continuity (P1.2)
```
Implement the follow-the-line thread properly. The line must exit slide N's right edge and
re-enter slide N+1's left edge at the IDENTICAL vertical position — right now it renders
inside a bottom rail and never touches an edge.

Then implement the Gate 3 check: sample the rightmost pixel column of slide N and the
leftmost of slide N+1, assert the vertical centroid of thread-coloured pixels matches within
a few px. Add a fixture that breaks continuity and confirm the gate fires. It must fail
before your fix and pass after — show me both runs.
```

### 5.3 · Gate 4 OCR (P1.3)
```
Add pytesseract to Gate 4. At 200px wide, OCR slides 1 and 2 and require the hook's longest
word and any number to be recovered. Keep ink coverage and dominance as cheap pre-filters
and run OCR only at end-of-batch.

Then settle the open question: slide 2 of both fixtures currently trips the dominance
warning. Tell me whether OCR can read those hooks at 200px. If it can, the dominance proxy
is mis-calibrated and you should loosen it. If it cannot, the slides need bigger type. Say
which — do not silently do both.
```

### 5.4 · Slice 1, the moment `briefs/` lands
```
Run Slice 1. Parse every brief in briefs/, emit specs/*.json validated against
carousel.schema.json, and write specs/COVERAGE.md classifying each post as
READY / THIN / STUB / ORPHAN / CONFLICT.

Priority order when sources disagree: the v2 markdown briefs win, then Notion Content
Calendar row properties, then older Notion script pages.

Do NOT write copy to fill gaps — flag them. Report the counts before doing anything else.
Then audit which diagram kinds the briefs actually demand and tell me which of the five
existing primitives are unused and what is missing. Build to demand, not to a wishlist.
```

### 5.5 · Vision critic, the moment `baseline/` lands
```
Build Slice 4. Assemble out/post-N/contact-sheet.png and thumbs.png, read both with vision,
score 1-5 on: STOP (does slide 1 open a loop at thumbnail scale), STAND (does slide 2 work
alone), ARRIVE (does each swipe feel like a new place), SAVE (is there a screenshot slide),
FAMILY (does it look like the same account as baseline/).

Calibrate against baseline/ FIRST — those 7 posts earned 354 followers, so they should
average >= 4. If the critic scores them low, the rubric is wrong; fix the rubric, never the
baseline. Cite slide number and concrete element for every score below 4.
```

### 5.6 · TikTok variant into the batch
```
Add --canvas to run.sh and to the batch runner so every post renders both ig and tiktok.
Run the full QA battery against the 9:16 variant too — the fill ratio will differ and I want
to see where 9:16 needs different type scaling than 4:5. Report which slides pass at 4:5 but
warn at 9:16.

Do NOT build TikTok publishing. Rendering only.
```

---

## 6 · Standing rules, unchanged

- `tokens.json` is a contract. No hex literal anywhere else.
- The engine never writes or rewrites slide copy.
- Never invent a statistic; unsourceable figures never get hero treatment.
- **This repo renders files. It does not publish.**
- After any change to `src/` or `tools/`, re-run `npm test` and both fixtures before
  reporting success.
- When a gate starts failing something it used to pass, say whether the gate got stricter or
  the output got worse.
