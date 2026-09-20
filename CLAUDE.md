# CLAUDE.md — read this first, every session

You are working on the **fond Carousel Engine**: a renderer that turns a JSON spec into
publishable Instagram (4:5) and TikTok (9:16) carousel images, and **proves they are
on-brand mechanically** rather than by anyone eyeballing them.

Owner: Adi, solo high-school founder. fond is a **pre-launch** iOS app that reduces
household food waste. The Instagram account @getfond is faceless and value-first — it earns
trust before the product is ever mentioned.

---

## 1 · The one-paragraph orientation

Adi's content operation had a specific failure: a scheduled task produced three carousel
briefs every week for six weeks. Scripted posts went 62 → 75. Posts actually *designed*
never moved off 8. Every weekly log correctly identified rendering as the bottleneck and
then produced more scripts anyway. **This repo is the fix.** It exists to drain that queue,
and every design decision in it serves that: deterministic, unattended, gated, and fast
(6.3s per carousel). If you ever find yourself adding to the queue instead of draining it,
you are working on the wrong thing.

---

## 2 · Read these, in this order

| # | File | What it is | When |
|---|------|-----------|------|
| -1 | **CORRECTIONS.md** | **THREE COURSE CHANGES. Supersedes parts of the docs below. Read before acting on them.** | Every session |
| 0 | **START-HERE.md** | The two prompts — boot and work. The whole interface | Copy the boot prompt every session |
| 0.5 | **AUTONOMOUS-ARCHITECTURE.md** | **The loop.** The decision ladder, `gtm.json`, the entropy guard, what stays manual and why | Every session, before choosing work |
| 1 | **CLAUDE.md** (this) | Orientation, guardrails, the verify loop | Every session |
| 2 | **ECC-PLAN-V2.md** | **The canonical build plan.** What's built, where v1 was wrong, paste-ready prompts per task | Every session |
| 3 | **BACKLOG.md** | Prioritised work items, P0 → P4 | Before picking work |
| 4 | **INITIALIZATION.md** | Folder contract, machine setup, session recipes | First session, or when something is missing |
| 5 | **CONTRAST-AUDIT.md** | Measured palette contrast + one open design decision for Adi | Before touching colour |
| 6 | **README.md** | User-facing summary | Skim once |
| 7 | `fond_Carousel_Engine_ECC_Execution_Plan.md` | **v1, SUPERSEDED.** Historical only | Only if v2 references it |

**When two documents disagree, precedence is:** Notion Design System §3 → `tokens.json` →
`gtm.json` →
ECC-PLAN-V2 → BACKLOG → everything else. Say so out loud when you hit a conflict.

---

## 3 · The differences that matter (why v2 exists)

The original plan was written before any code. Four things it got wrong, all corrected:

**3.1 · Diagrams must be HTML, not SVG text.** v1 said "build diagrams as flat SVG." I did,
and diagram labels got cut off. SVG `<text>` does not wrap and does not clip — it runs past
its shape or gets silently truncated by whatever character-count heuristic you hand-roll.
And no gate could see it, because there is no box for the browser to overflow.
**Rule: if it contains words, it is HTML.** SVG is only for arrows and the receipt's torn
edge. This is why Gate 1 now covers diagram labels for free.

**3.2 · v1 had no optical gate. That was the real hole.** Gates 1–4 prove text is contained,
on-palette, threaded, and legible at thumbnail scale. **None can tell you the slide looks
wrong.** Adi spotted cut-off words and undersized type in previews that every gate passed.
Gate 5 · Optical now measures the composition itself. It is canonical; do not remove it.

**3.3 · Bound the composition by content element boxes, not canvas pixels.** This took three
attempts. The micro-label, ornament, handle, counter and thread rail are chrome pinned to
the frame; the gap between them and the copy is structural, not a defect. Measuring raw
pixels produced six false failures at `y=121`, every one the gap under the micro-label.
**Do not "simplify" this back to a pixel scan.**

**3.4 · Canvas is a parameter.** v1 assumed Instagram only. Because layout is CSS and the
spec is data, `--canvas=tiktok` emits 1080×1920 from the same spec with no new brief and no
new copy. Two platforms, one source.

---

## 4 · Guardrails — NON-NEGOTIABLE

From Notion Design System §3.8. Violating any of these is a build failure, not a style note.

- No photography, no photorealistic renders, no gradients, shadows, bevels, glassmorphism.
- No pure `#000` or `#FFF`. Backgrounds are Slate Black or Off-White only.
- **Signal Red only on loss / waste / cost figures.** Never decorative. Gate 2.4 enforces it
  against the spec's `declaresLoss` flag — the one palette rule about meaning, not looks.
- Max 40 words body per slide. Max 8 words per hook line. Never centred paragraph text.
- Never the same layout on two consecutive slides (diagram kinds count as distinct).
- The product is **fond**. Never "PantryPal" in rendered output.
- **Never write or rewrite slide copy.** Copy comes from the brief, verbatim.
- **Never invent a statistic.** A figure that traces only to blogs or survey aggregation is
  rendered qualitatively ("roughly three in four"), never as hero type. This rule already
  caught the misted-produce percentage and the egg-carton stat.
- fond is pre-launch: no user counts, no "customers", no traction claims. Waitlist only.
- **No hex literal anywhere outside `tokens.json`.** Colour drift must be structurally
  impossible, not merely discouraged.

### Hard stops — halt and ask Adi
- A brief is missing slide copy → flag it, do NOT write replacement copy.
- A render needs a colour outside the 7 tokens to look right.
- Any change to Notion Design System §3 itself.
- Anything that would post publicly. **This repo renders files. It does not publish.**

---

## 5 · The verify loop — run this after ANY change to `src/` or `tools/`

```bash
npm test                                  # must be 10/10 gates catching their own failures
./run.sh specs/post-5.json                # all 5 diagrams + every chrome feature
./run.sh specs/post-49.json               # meter thread, Signal Red forbidden by its argument
node src/render.mjs specs/post-5.json --canvas=tiktok   # 9:16 still renders
```

Both fixtures must report **verdict: PASS**. Warnings are fine and informative; fails are not.

**The rule that keeps this honest:** when a gate starts failing something it used to pass,
say whether **the gate got stricter or the output got worse.** Never loosen a gate to make a
render pass without stating which it was. Four gate bugs were found this way — word count
running on a truncated preview string, contrast reading CSS `color` on SVG text that paints
with `fill`, boldness guessed from class-name substrings, and contrast comparing against the
slide background instead of a local surface. Every one was the *gate* being wrong.

**A gate that passes a known-bad fixture is worse than no gate**, because it manufactures
confidence. That is what `tools/test_gates.py` is for. If you add a gate, add its fixture.

---

## 6 · Architecture in one screen

```
tokens.json          THE CONTRACT. Mirror of Notion Design System §3. Colours, type,
                     grid, both canvases, and every gate threshold live here.
carousel.schema.json Spec shape. Copy is verbatim, never rewritten.
assets/fonts/        11 vendored OFL faces, inlined as base64 data URIs at render time.

src/tokens.mjs       Single load point. Both renderer and diagrams import from here so
                     neither imports the other (this broke a circular import — keep it).
src/slide-html.mjs   The ONE place slide HTML is produced. Preview == export, always.
src/diagrams.mjs     5 primitives + their CSS. HTML-first (see §3.1).
src/render.mjs       Playwright capture, in-DOM measurement, 2x supersample.

tools/qa.py          Gates 1-5 + cross-slide.
tools/test_gates.py  10 deliberately broken slides. Every gate must catch its own.
tools/contact_sheet.py  Contact sheet + feed-scale thumbs (Gate 4 reads these).
tools/downsample.py  The Lanczos pass.
tools/contrast_audit.py  Reproduces CONTRAST-AUDIT.md from tokens.json.

specs/post-N.json    One carousel.
out/post-N/          slides/, slides-tiktok/, qa-report.json, measurements.json,
                     contact-sheet.png, thumbs.png
briefs/              ⛔ EMPTY — Adi must add. Blocks Slice 1.
baseline/            ⛔ EMPTY — Adi must add. Blocks the vision critic.
```

### Three implementation details that look optional and are not

- **Fonts are inlined as base64 data URIs**, and the renderer blocks all network. A silent
  fallback to a system serif is the single most common way generated slides look amateur,
  and it fails quietly. Gate 1.3 hard-fails before the screenshot if any face did not
  activate.
- **Render at 2× then Lanczos-downsample.** At 1×, Playfair's thin strokes alias visibly at
  96pt. This is the biggest single quality lever in the pipeline.
- **The renderer substitutes an illegible token rather than painting it, and the gate reports
  the substitution.** Harvest Gold is 2.01:1 on Off-White. Output must never be unreadable,
  and a substitution must never be silent.

---

## 7 · The six gates, in one line each

| Gate | Proves |
|---|---|
| **1 · Structural** | Text is contained, fonts really loaded, copy within limits, stats in Space Grotesk |
| **2 · Pixel** | Every colour is a palette token or an antialias blend; contrast meets WCAG AA; Signal Red only where a loss is declared |
| **3 · Thread** | Progress never reverses, completes on the final slide, never uses a token the carousel forbids |
| **4 · Thumbnail** | Slides 1 and 2 survive at 200px — the scroll-stopping proxy. Slide 2 checked *alone*, because Instagram re-serves carousels showing it first |
| **5 · Optical** | The composition itself: holes between elements, ink balance, a 22px type floor, headline orphans, whether content uses its frame |
| **6 · GTM** | The *message*: pre-launch honesty, sourced hero numbers, a CTA tier and angle that exist in `gtm.json`. Gates 1–5 prove a slide is well made; none can tell you it is off-message. Runs before the renderer, so a violation costs zero pixels |

---

## 8 · Where this sits in the wider system

Two **cloud scheduled tasks** run outside this repo and write only to Notion:

- **Sunday 22:00 UTC — ICP language mining.** Verbatim audience phrasing into a Notion
  Language Bank. Hard cap 12 rows/week; stops adding entirely past 150 unused rows.
- **Wednesday 11:00 UTC — hook + carousel script.** Outputs a spec in this repo's schema.
  **It has a drain gate:** if undesigned scripts exceed 12, it refuses to write one and logs
  the queue counts instead. That gate exists because of the six-week failure in §1. If Adi
  asks you to remove it, push back first.

**AMENDED — see CORRECTIONS.md C3.** This repo READS Notion to pull specs and WRITES BACK
render status. It never publishes to any social platform and never writes slide copy.
The old rule ('never reads Notion') was meant to prevent publishing; over-applying it to
reading is what kept the pipeline manual.

Publishing (Instagram, then TikTok) is **BACKLOG P4 and deliberately unbuilt.** Automating a
posting cadence nobody has run yet means debugging an API instead of posting. TikTok has an
additional gate: unaudited apps are limited to private viewing (ECC-PLAN-V2 §4).

---

## 9 · Start-of-session checklist

**Read `SETUP-STATUS.md` first** — it records what was actually verified on this machine and
the one known blocker (Chromium). Do not re-diagnose what is already written there.

Confirm these out loud before proposing work:

0. `npm run decide` → **what is the binding constraint?** Do this FIRST. It reads the whole
   board and names the one action worth taking. Do not propose work that contradicts it
   without saying why.
1. `npm test` → 10/10?  ·  `npm run test:autonomy` → 18/18?
2. `./run.sh specs/post-5.json` → PASS?
3. How many `.md` files in `briefs/`? (0 = Slice 1 blocked)
4. How many `.png` files in `baseline/`? (0 = vision critic blocked)
5. Which BACKLOG item is next **given what is actually present**?

Then wait. Do not start work before Adi confirms.

## 10 · Done =

Every post with complete brief copy renders 8 images at both canvases, passes all six
gates, is published, is measured within a week, and is marked Designed in Notion — with
zero rows created and zero copy written by you.

And the loop itself is done when `npm run decide` is the only thing that chooses the
week's work. See AUTONOMOUS-ARCHITECTURE.md §9.
