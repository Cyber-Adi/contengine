# CORRECTIONS.md — three course changes, 2026-09-06

Adi pushed back on three things after the first Claude Code session. Two were my design
errors. This file supersedes the relevant parts of CLAUDE.md, ECC-PLAN-V2 and BACKLOG.
**Read this before acting on those three documents.**

---

## C1 · Resolution — the 200px image was an inspection artifact, but bump to 1440 anyway

**What happened:** I showed a 200px thumbnail upscaled 4× with NEAREST sampling to inspect
what Gate 4 actually sees. That image is deliberately blocky — it shows the literal pixels
present at 200px and adds nothing. It is not what the render looks like. Judging output
from it is like judging a photograph through a loupe at the grain level.

**But the adjacent concern is real.** The canvas is 1080×1350. Modern iPhones have 3×
displays; a 4:5 image in-feed occupies roughly 1170–1290 physical pixels. A 1080px render
gets *upscaled by the phone* before Instagram's compression even runs. For a text-heavy
editorial carousel that is a genuine sharpness tax.

Current guidance confirms it: **higher source resolution (1440px) survives Instagram's
compression better**, though 1080 remains the accepted minimum.

**ACTION — do this, it is a one-line change:**
```
The canvas is already a parameter in tokens.json (grid.canvases). Change the `ig` canvas
from 1080x1350 to 1440x1800 and the `tiktok` canvas from 1080x1920 to 1440x2560.

Everything downstream is proportional except values expressed in raw px. Audit for
hardcoded pixel assumptions — grid.margin (96), the type scale, diagram sizes, Gate 5's
minTypePx floor, and Gate 4's thumbnail width. Either scale them by 1.333 or, better,
express them as a ratio of canvas width so this never has to be done again. The ratio
approach is correct; do that.

Then re-run npm test and both fixtures. Report any gate whose threshold needed changing
and WHY — a threshold that was calibrated against 1080 may be wrong at 1440.
```

**Keep the 2× supersample on top of this.** At 1440 the browser paints 2880 wide. That is
the combination that makes Playfair's thin strokes hold up.

---

## C2 · The BOSS baseline was the wrong quality bar — MY ERROR

**What I got wrong:** I designed the vision critic (Slice 4 / P2.2) to calibrate against the
7 BOSS carousels, with the rule "a gate that fails the baseline is mis-calibrated."

Adi's correction: **those carousels were made sloppily and are not visually pleasant. The
entire reason this engine exists is to be better than them.** Calibrating a quality critic
against them caps quality at the level we are trying to escape.

He is right. I conflated two different things:
- **Performance reference** — those 7 posts earned 354 followers. Valid, and still useful
  for what *topics and hooks* got engagement.
- **Quality reference** — what the output should look like. The BOSS set is NOT this.

**REVISED SLICE 4. Replaces the version in ECC-PLAN-V2 §5.5:**
```
Build the vision critic WITHOUT an image baseline. baseline/ is no longer a blocker and no
longer needs BOSS exports.

Score each carousel 1-5 on:
  STOP    — at 200px, does slide 1 open a loop in under 2 seconds?
  STAND   — does slide 2 work for someone who never saw slide 1?
  ARRIVE  — does each swipe feel like a new place, or more of the same slide?
  SAVE    — is there a slide someone would screenshot? (Design System says slide 7)
  SYSTEM  — does it read as one designed object, or eight images that share a palette?

Calibrate against the DESIGN SYSTEM (Notion §3) and the structural moves in reference/,
not against any existing fond post. The bar is "investigative journalism about your
kitchen" — §3.1's own words — not "looks like what we posted in July".

Cite slide number and concrete element for every score below 4. Never suggest copy changes.
Never suggest anything on the Never-Do list.

Gate: mean < 3.5 or any dimension <= 2 routes back to render.

REGRESSION BASELINE: once Adi approves a carousel, ITS renders become the reference for
perceptual diffing — so the bar ratchets upward from our own best work rather than being
anchored to the old account.
```

`baseline/README.txt` is now wrong. Rewrite it to say the folder holds approved renders
from this engine, not Instagram exports.

---

## C3 · The pipeline is still manual — MY GUARDRAIL, OVER-APPLIED

**What Adi said:** we designed an autonomous loop — research → copywriting → visual
carousels → analytics → repeat. What exists still requires him to hand-carry work between
stages.

He is right. Honest map of where it stands:

| Stage | Today | Should be |
|---|---|---|
| Research (ICP language) | ✅ auto — Sunday scheduled task → Notion | unchanged |
| Copywriting (hook + script) | ✅ auto — Wednesday task → spec JSON in Notion | unchanged |
| **Spec → repo** | ❌ **Adi pastes JSON into specs/** | **auto** |
| **Render** | ❌ **Adi runs ./run.sh per spec** | **auto, batched** |
| QA gates | ✅ auto inside render | unchanged |
| Approval | ❌ manual | **stays manual — 1 click, deliberately** |
| Publish | ❌ not built | auto after approval (P4) |
| Analytics → research | ❌ not built | auto weekly, feeds the Sunday task (P4.2) |

**The break is the Notion ↔ repo bridge, and I caused it.** CLAUDE.md says "this repo never
reads Notion." That rule was meant to stop the repo from PUBLISHING. I over-applied it to
reading, and that is what makes every cycle hand-carried.

**AMENDED RULE, replaces the CLAUDE.md line:**
> This repo READS Notion to pull specs and WRITES BACK render status. It never publishes to
> any social platform, and it never writes slide copy. Publishing stays gated behind Adi's
> explicit approval.

**NEW — build this. It is now the highest-leverage item after P0:**
```
Build `npm run sync` (src/sync.mjs):

  1. Query the Notion Content Calendar for rows whose page body contains a spec code block
     and whose Status is Scripted.
  2. Validate each against carousel.schema.json. Reject loudly with the JSON path on failure
     — do not silently skip.
  3. Write valid ones to specs/post-N.json. Reconcile in place; never duplicate.
  4. Batch render every new/changed spec at BOTH canvases.
  5. Run the full gate battery + the critic.
  6. Write back to the Notion row: Status -> Designed on pass, the QA verdict in Notes, and
     the critic score. On FAIL, leave Status alone and write the specific findings so the
     Wednesday task can see why.
  7. Emit out/BATCH_REPORT.md sorted BY GATE, so systematic failures surface as one fix
     rather than forty.

Dry-run first: print every Notion row you would change, before/after. Wait for approval.
Then execute and re-read every row to confirm the write landed.

NEVER post to any platform. NEVER write slide copy. If a spec is malformed, report it —
do not repair it.
```

Then make it a scheduled task: **Thursday**, one day after the Wednesday script task, so
each week's script is rendered and QA'd without Adi touching anything. He wakes up to
finished PNGs and a report.

---

## C4 · Slice 1's source priority was wrong — the scripts are in Notion

Verified directly: the Notion page **"Carousel Scripts — Posts 31–40 (Visual-First)"**
contains complete slide-by-slide copy — verbatim text per slide, DARK/LIGHT background,
per-slide visual direction, pillar, CTA tier, slide count, and the emotional arc. Sibling
pages cover Posts 1–8, 9–16, 17–27, 41–50 and 51–63.

**So the majority of usable content is already in Notion**, not in the .md files on the Mac.
ECC-PLAN-V2 §5.4 has the priority backwards.

**CORRECTED SOURCE PRIORITY for Slice 1:**

| Source | Covers | Structure | Priority |
|---|---|---|---|
| Notion carousel script pages | Posts 1–63 | pre-v2, 6–8 slides, says "PantryPal" | **PRIMARY — most coverage** |
| Mac `fond_Content_Brief_*.md` | ~Posts 41–66 | v2 8-slide, current design system | **WINS where it overlaps** |
| Notion Content Calendar rows | all 130 | properties only, no copy | metadata layer |

Rule: **v2 briefs win on any post they cover. Notion script pages fill everything else.**
Notion pages need a conversion pass — 6–7 slides to the v2 8-slide skeleton, PantryPal to
fond, and a slide 2 promoted to a standalone backup hook. Flag every converted post as
`provenance: "converted-from-notion-script"` so it is never confused with a real v2 brief.

This likely means far MORE renderable posts than the "briefs/ is empty" reading suggested.
Run Slice 1 against Notion first and report the real number before assuming anything.
