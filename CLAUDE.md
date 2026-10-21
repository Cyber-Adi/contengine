# CLAUDE.md - read this first, every session

You are working on the **fond Carousel Engine**: a renderer that turns a JSON spec into
publishable Instagram (4:5) and TikTok (9:16) carousel images and **proves they are
on-brand mechanically**, not by anyone eyeballing them. Owner: Adi, solo high-school
founder. fond is a **pre-launch** iOS app that reduces household food waste; the
Instagram account @getfond is faceless and value-first.

**Why this repo exists:** six weeks of weekly briefs grew the script queue while posts
actually designed stayed flat. Rendering was the bottleneck and nobody drained it. This repo
is the fix: deterministic, unattended, gated, fast. If you are adding to the queue instead
of draining it, you are working on the wrong thing.

## Read order

CLAUDE.md (this), then WEEKLY.md (Adi's ritual). Before choosing work:
`docs/AUTONOMOUS-ARCHITECTURE.md` (the loop), `docs/BACKLOG.md`. Before touching publishing:
`docs/HANDOFF.md`. Scheduling and measuring: `docs/META-SCHEDULING-AGENT.md`,
`docs/META-INSIGHTS-AGENT.md`. Growth plan: `docs/GROWTH-WAVES-PLAN.md`. Refinery lane:
`docs/CAROUSEL-REFINERY-PLAN.md`. Colour: `docs/CONTRAST-AUDIT.md`. Action:
`docs/GITHUB-SETUP.md`. Other docs are dated history; `docs/archive/` is superseded.

**Precedence when documents disagree:** Notion Design System section 3, then `tokens.json`,
then `gtm.json`, then docs/BACKLOG, then everything else. Say so out loud on a conflict.

## Hard-won rules (do not "simplify" these away)

- Diagrams are HTML, not SVG text. If it contains words, it is HTML. SVG is only arrows and
  the receipt's torn edge.
- Gate 5 (Optical) is canonical. It bounds composition by content element boxes, never a
  canvas pixel scan (chrome gaps caused six false failures).
- Canvas is a parameter: `--canvas=tiktok` emits 1440x2560 from the same spec.
- Fonts are inlined base64 and the renderer blocks the network; Gate 1.3 fails if a face
  did not activate. Render at 2x then Lanczos-downsample. Illegible tokens are substituted
  and the substitution is reported, never silent.

## Guardrails - NON-NEGOTIABLE

Violating any is a build failure. From Notion Design System section 3.8.

- No photography, photorealistic renders, gradients, shadows, bevels, glassmorphism.
- No pure black or white. Backgrounds are Slate Black or Off-White only.
- **Signal Red only on loss / waste / cost figures.** Gate 2.4 enforces it against the
  spec's `declaresLoss` flag.
- Max 40 words body per slide. Max 8 words per hook line. Never centred paragraph text.
- Never the same layout on two consecutive slides (diagram kinds count as distinct).
- The product is **fond**. Never "PantryPal" in rendered output.
- **Never write or rewrite slide copy.** Copy comes from the brief, verbatim.
- **Never invent a statistic.** A figure that traces only to blogs or survey aggregation is
  rendered qualitatively ("roughly three in four"), never as hero type.
- fond is pre-launch: no user counts, no "customers", no traction claims.
- **Setup-phase CTA:** while `state/launch.json` phase is `setup`, there is no waitlist,
  pre-order or "link in bio" claim. `tools/setup-cta.mjs` swaps those final-slide CTAs for the
  rotated `gtm.ctas.setup` line and logs it in `spec.ctaSwap`. At launch run it with
  `--restore` (reverses the swap byte-for-byte), then flip the phase in `state/launch.json`.
- **No hex literal anywhere outside `tokens.json`.**

### Hard stops - halt and ask Adi
- A brief is missing slide copy: flag it, do NOT write replacement copy.
- A render needs a colour outside the 7 tokens to look right.
- Any change to Notion Design System section 3.
- Anything that would post publicly. **This repo renders files. It does not publish.**
  Adi (or the Meta scheduling agent he runs) schedules.

### Refinery amendments (Oct 1 2026)

Each invariant stays in force for its original scope.

| Repo invariant | Amendment |
|---|---|
| **Copy is verbatim; the engine never writes or rewrites copy** | **Kept for the renderer.** A separate **Refinery lane** (`tools/refine-copy.mjs`) may *propose* a copy variant **B** beside the verbatim **A**, with per-slide diff and rationale. B must pass **Gate 7 Fidelity** and **never ships without Adi's pick**. Design changes (layout, diagram, background, emphasis markup, thread) are not copy. |
| **HOLD at >=6 ready-unscheduled** | **Kept for `READY-TO-POST/`.** The Refinery writes to `VAULT/`, which HOLD does not block. (The count-based rule is being replaced by a scheduling-window rule: see docs/GROWTH-WAVES-PLAN.md.) |
| **No new scheduled tasks** | **Kept.** The Refinery runs on demand, never on a schedule. |
| **No new top-level docs** | **Kept.** Plans go to `docs/`. |
| **Never publishes** | **Kept.** It renders files. You schedule. |

## Verify loop - after ANY change to `src/` or `tools/`

```bash
npm run test:all     # = npm test (24 gates catch their own failures) + test:autonomy (53+)
                     #   + test:fidelity (26) + test:package (10)
./run.sh specs/fixtures/post-9005.json   # all 5 diagrams + every chrome feature
./run.sh specs/post-49.json              # meter thread, Signal Red forbidden by its argument
node src/render.mjs specs/post-9005.json --canvas=tiktok   # 9:16 still renders
```

(`npm run test:schedule` joins test:all when the scheduling worker lands.) Both fixtures
must report **verdict: PASS**. Warnings are fine; fails are not. Fixtures `post-9xxx` are
git-ignored and filtered out of the queue (`n < 9000`).

**When a gate starts failing something it used to pass, say whether the gate got stricter or
the output got worse.** Never loosen a gate to make a render pass without stating which. Four
gate bugs were found this way; every one was the gate being wrong. **A gate that passes a
known-bad fixture is worse than no gate.** If you add a gate, add its fixture to
`tools/test_gates.py`.

## The gates (src/ and tools/qa.py)

| Gate | Proves |
|---|---|
| 1 Structural | Text contained, fonts loaded, copy within limits, stats in Space Grotesk |
| 2 Pixel | Every colour a palette token; WCAG AA contrast; Signal Red only where a loss is declared |
| 3 Thread | Progress never reverses, completes on the last slide, uses no forbidden token |
| 4 Thumbnail | Slides 1 and 2 survive at 200px; slide 2 checked alone |
| 5 Optical | Holes, ink balance, 22px type floor, orphans, frame use |
| 6 GTM | Message: pre-launch honesty, sourced hero numbers, CTA tier and angle exist in `gtm.json`. Runs before the renderer |
| 7 Fidelity | A refined copy variant B changes only what it may versus verbatim A (`src/fidelity.mjs`) |

## File map

```
tokens.json  refinery.config.json  gtm.json  carousel.schema.json   contracts and config
state/launch.json                      phase (setup/launch); ctaSwap authority
state/*.json                           ledger, freshness, waiting-since, critic scores
src/tokens.mjs        single token load point (keeps imports acyclic)
src/slide-html.mjs    the ONE place slide HTML is produced (preview == export)
src/diagrams.mjs      5 HTML-first diagram primitives
src/render.mjs        Playwright capture, in-DOM measurement, 2x supersample
src/normalize.mjs     spec normalisation        src/rhythm-core.mjs  layout rhythm rules
src/fidelity.mjs      Gate 7                    src/package.mjs      per-post PUBLISH package
src/decide.mjs        npm run decide: names the binding constraint
tools/tap.mjs         THE entry point (npm run tap): validate, render, QA, export, reconcile
tools/qa.py  test_gates.py  contact_sheet.py  downsample.py  contrast_audit.py
tools/ready.mjs       builds READY-TO-POST/ (git-ignored; run tap locally to see it)
tools/log-post.mjs    log scheduled/published and Insights numbers
tools/rhythm.mjs  refine-copy.mjs  setup-cta.mjs  critic.mjs  export-post.mjs
specs/post-N.json     one carousel each (52 present)    briefs/  source briefs (non-empty)
out/post-N/           slides, slides-tiktok, qa-report, measurements, contact sheet, thumbs
docs/META-SCHEDULING-AGENT.md  META-INSIGHTS-AGENT.md  GROWTH-WAVES-PLAN.md
```

## Where this sits

Two cloud scheduled tasks write only to Notion: Sunday 22:00 UTC language mining (cap 12
rows/week, stops past 150 unused) and Wednesday 11:00 UTC hook + script, which has a **drain
gate** (refuses to write if undesigned scripts exceed 12). If Adi asks to remove that gate,
push back first. This repo READS Notion for specs and WRITES BACK render status (C3,
2026-09-06). It never publishes and never writes slide copy. Publishing (Instagram, then
TikTok) is BACKLOG P4 and deliberately unbuilt.

The daily GitHub Action runs `npm run test:all` then `npm run tap` and pushes what it made;
`git pull` before looking.

## Start-of-session checklist

Confirm out loud before proposing work, then wait for Adi:

0. `npm run decide`: what is the binding constraint? Do this FIRST; do not contradict it
   without saying why.
1. `npm run test:all` green?
2. `./run.sh specs/fixtures/post-9005.json` PASS?
3. `ls briefs | wc -l` and `ls specs | wc -l` (52 specs currently; briefs is populated).
4. `node tools/critic.mjs status`: approved posts with no critique yet?
5. Which BACKLOG item is next given what is actually present?

## Done =

Every post with complete brief copy renders 8 images at both canvases, passes every gate,
is scheduled, is measured within a week, and is marked Designed in Notion, with zero rows
created and zero copy written by you. The loop is done when `npm run decide` alone chooses
the week's work.
