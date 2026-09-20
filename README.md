# fond Carousel Engine

Turns a carousel spec into publishable 1080×1350 PNGs, and **proves they are on-brand
mechanically** rather than by eyeballing them.

Built against Notion → *Content Strategy v2 + fond Design System (July 2026)*, Section 3.
That document is the source of truth. If this repo disagrees with it, Section 3 wins.

```bash
npm install
npx playwright install chromium # one-time; if it fails, see below
brew install tesseract           # one-time; Gate 4's OCR check needs the binary
python3 -m pip install --user pytesseract
./run.sh specs/post-49.json     # validate → render → contact sheet → QA
python3 tools/test_gates.py     # prove every gate catches its own failure mode
python3 tools/contrast_audit.py # reproduce the palette contrast table
```

## Chromium

The renderer needs a real Chromium/Chrome binary. Resolution order:

1. `FOND_CHROMIUM` env var, if set — must point at an existing executable.
2. Playwright's own resolver (its managed browser from `npx playwright install chromium`).
3. If both fail, the renderer throws one error naming both attempts.

If `npx playwright install chromium` can't reach its CDN (some networks block it), point at
a Chrome you already have instead:

```bash
FOND_CHROMIUM="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ./run.sh specs/post-5.json
```

## What works right now

| | |
|---|---|
| Slice 0 · token contract | ✅ `tokens.json` + `carousel.schema.json` + 9 vendored OFL font files |
| Slice 2 · renderer | ✅ 5 layouts, parameterised thread, 2× supersample → Lanczos |
| Slice 3 · QA battery | ✅ **5 gates** + cross-slide, 10/10 fixtures caught |
| Gate 5 · optical | ✅ dead band, balance, type floor, orphan, fill ratio |
| TikTok 9:16 | ✅ `--canvas=tiktok`, same spec, no redesign |
| Diagrams (P1.1) | ✅ 5 flat-vector primitives, token-driven |
| Scroll-stop chrome | ✅ swipe affordance, accent pops, circle annotation, ornament, micro-label |
| Slice 1 · brief parser | ⛔ blocked — needs the `fond_Content_Brief_*.md` files |
| Slice 4 · vision critic | ⛔ needs the 8 BOSS carousels in `baseline/` |
| Slice 5 · Notion writeback | ⛔ after Slice 1 |

Two fixtures render clean at **0 fails, 1 warning**, byte-identical across runs:
`post-49` (eggs, meter thread, no Signal Red anywhere) and `post-5` (exercises all five
diagrams and every chrome feature).

**Read INITIALIZATION.md first** — it lists exactly what has to be in the folder and the
boot prompt to paste.

## Why it looks typeset and not generated

- **Fonts are inlined as base64 data URIs.** No network, no `file://` origin boundary, no
  silent fallback to a system serif — which is the single most common way generated slides
  look amateur, and it fails quietly. Gate 1.3 hard-fails before the screenshot if any of
  the three faces did not activate.
- **2× supersample, then Lanczos downsample.** Chromium paints 2160×2700; Pillow resamples to
  1080×1350. At 1× Playfair's thin strokes alias visibly at 96pt. This is the biggest single
  quality lever in the pipeline.
- **No hex literal exists outside `tokens.json`.** Colour drift is structurally impossible,
  not merely discouraged.
- **`text-wrap: balance` on every headline**, so hooks never orphan a word on its own line.

## The four gates

Everything lands in `out/post-N/qa-report.json`. Any FAIL blocks the post from being marked
Designed.

**Gate 1 · Structural** — measured in the live DOM *before* the screenshot. Real clipping
(an ancestor hides overflow, or text escapes the canvas), margin intrusion, font activation,
word limits, banned words, and stat elements that aren't Space Grotesk.

**Gate 2 · Pixel conformance** — on the exported PNG. Every dominant colour must be a palette
token or an antialias blend between two of them, so an invented colour is a hard fail. No pure
black or white. WCAG 2.1 AA contrast with the correct large-text allowance. Ink ratio.
And **Signal Red discipline**: red above a trace threshold on a slide whose spec doesn't
declare a loss/waste/cost figure fails — the one palette rule that is about meaning, not looks.

**Gate 3 · Thread continuity** — progress never goes backwards, always completes on the final
slide, and never uses a token the carousel forbids. Post 49 forbids Signal Red because its
thesis is that the eggs are fine; a red week meter would argue against its own copy. The gate
samples the thread band and enforces it.

**Gate 4 · Thumbnail legibility — the scroll-stopping proxy.** Instagram shows a carousel small
before anyone decides to stop, so slides 1 and 2 are downsampled to 200px and measured there:
ink coverage, and whether one element dominates. Slide 2 is checked *independently*, because
Instagram re-serves carousels showing slide 2 first — a slide 2 that only makes sense after
slide 1 fails.

**Gate 5 · Optical — what a viewer sees.** Gates 1–4 prove text is contained, on-palette,
threaded and legible small. None can tell you the slide *looks* wrong. Gate 5 measures the
composition itself: a hole between elements, ink piling into one half, type under a 22px
floor, a headline ending on an orphan, and whether the content uses the frame it was given.
It is bounded by the actual content element boxes, not canvas pixels — the gap under the
micro-label and above the thread rail is chrome, not a defect.

**Cross-slide** — adjacent slides must differ by perceptual hash and must not share a
layout (diagram kinds count as distinct layouts).

## Two platforms, one spec

```bash
node src/render.mjs specs/post-5.json                  # 1080x1350  Instagram
node src/render.mjs specs/post-5.json --canvas=tiktok  # 1080x1920  TikTok photo mode
```
Layout is CSS and the spec is data, so the canvas is a parameter. No new brief, no new copy.
See ECC-PLAN-V2 §4 for the TikTok API audit gate before you plan on publishing there.

## The renderer refuses to ship something illegible

Harvest Gold is 2.01:1 on Off-White. When a spec asks for a caution tone on a light slide, the
renderer substitutes a legal token instead of painting something unreadable — and the gate
reports the substitution so it is visible rather than silent. `test_gates.py` asserts both
halves: that G2.6 catches gold-on-light in a synthetic image, and that the renderer prevents it
from ever reaching one.

See **CONTRAST-AUDIT.md** — four of the seven tokens fail AA on at least one legal background,
and the palette currently has no legible way to express "caution" on a light slide. Two cheap
fixes are proposed there. That is a decision for Adi, not for this repo.

## Fixture status — read this before publishing anything

`specs/post-49.json` is marked `"provenance": "reconstructed-fixture"`. Its structure, thread,
editorial ruling and send-trigger are lifted from the real Notion row. **Its slide copy was
reconstructed to exercise the pipeline and is not the verbatim brief.** Copy is the brief's job;
the engine never writes it. Replace this file from the real markdown brief before it ships.

The editorial ruling carried through: the "73% of consumers" figure traces to survey
aggregation rather than one citable study, so it renders as "roughly three in four" in body
copy and is never set as hero type.

## Layout

```
tokens.json            the design system, machine-readable — the contract
carousel.schema.json   spec shape; copy is verbatim, never rewritten
assets/fonts/          9 OFL font files, vendored for determinism
src/slide-html.mjs     the ONE place slide HTML is produced (preview == export)
src/render.mjs         Playwright + DOM measurement + supersampled capture
tools/qa.py            the four gates
tools/test_gates.py    fixtures — every gate must catch its own failure
tools/contact_sheet.py contact sheet + feed-scale thumbnails
tools/downsample.py    Lanczos pass
out/post-N/            slides/, qa-report.json, measurements.json, contact-sheet.png
```

## Next

1. Share the folder holding `fond_Content_Brief_*.md` → unblocks Slice 1's coverage report,
   which tells you whether this is a 20-post engine or a 75-post one.
2. Drop the 8 BOSS carousels into `baseline/` → unblocks the vision critic, which needs them
   to calibrate against something that actually earned followers.
3. Decide the Harvest Gold question in CONTRAST-AUDIT.md.

Chromium path is overridable: `FOND_CHROMIUM=/path/to/chrome ./run.sh ...`
