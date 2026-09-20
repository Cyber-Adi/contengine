# fond — Carousel Design Brief: Posts 60–62
**Batch generated:** Jul 22, 2026 (Wed lane, ED Sprint Engine)
**Status:** Next unbuilt slots per the Faceless Content OS cadence. Posts 1–59 are fully scripted; every post through 59 already has a design brief on file. This batch is genuinely new content — nothing existed for Posts 60–62 before this run.
**Covers:** Wed (P2), Fri (P3), Sun (P4) — the three cadence slots between this run and the weekend.

---

## Section 1 — Brand System (Recap, self-contained)

**Brand character:** fond's faceless account reads as investigative journalism about your kitchen — the authority of a financial broadsheet, the warmth of a well-lit pantry. Every slide is information design (a diagram, a number, a comparison, a reference card), never decoration. If a slide could appear in a food blogger's feed, it's wrong. If it could appear in a print explainer from *The Economist* about grocery stores, it's right.

**Color palette (exact hex — no substitutions):**

| Token | Hex | Role |
|---|---|---|
| Slate Black | `#14161A` | Dark slide backgrounds. Near-black, cool undertone. Never pure `#000`. |
| Off-White | `#F5F2EC` | Light slide backgrounds + primary text on dark. Warm paper tone. Never pure `#FFF`. |
| fond Green | `#2E5E4E` | Brand color. CTA cards, the word "fond," positive/solution states, checkmarks. |
| Steel Blue | `#4A7BA6` | Secondary accent. Safe/good data states, key reframe terms, CTA text on dark. |
| Signal Red | `#D64541` | Loss, waste, cost ONLY. Never decorative. If it isn't a negative number or a warning, it isn't red. |
| Harvest Gold | `#D9A441` | Warm highlight. One emotional word per carousel max, thread elements, caution states. |
| Ink Gray | `#6B7280` | Captions, source citations, secondary labels. |

Max 3 accent colors per slide. Backgrounds are always Slate Black or Off-White — no gradients, no photo backgrounds, no textures (except reserved Origin Story parchment tone, not used in this batch).

**Typography:**

| Font | Weight | Role | Size @ 1080×1350 |
|---|---|---|---|
| Playfair Display | Bold | Hooks (slide 1–2) and reframes (final 1–2 slides). The editorial voice. | 72–96pt hooks; 56–72pt reframes |
| DM Sans | Regular / Medium | All body copy, labels, CTAs. | 32–40pt body; 28pt labels |
| Space Grotesk | Bold | Every number, stat, dollar amount, percentage. Numbers never sit in the body font. | 80–140pt hero numbers |
| DM Sans | Regular, Ink Gray | Source citations, bottom of stat slides. | 20–22pt |

Line length ≤ 8 words per line on hooks. Body copy ≤ 40 words per slide, ragged-left, never justified, never centered except hero numbers and CTA cards.

**Layout grid:** Canvas 1080×1350px (4:5 portrait), export PNG, sRGB. Margins 96px all sides. Handle `@getfond.app` bottom-left inside margin, DM Sans 24pt Ink Gray. Slide counter ("1/8") bottom-right, same spec.

**Illustration style:** Flat vector only. 2px consistent stroke or filled shapes. No 3D, no drop shadows, no gradients, no skeuomorphism, no photorealistic renders, no stock photography, no lifestyle imagery. Icons geometric, single-weight, one visual family per carousel. Diagrams are the hero: timelines, flow loops, bar comparisons, floor plans, split-frames, before/afters. Every diagram readable in under 2 seconds at phone size. Metaphor objects (receipts, boarding passes, textbook covers) are the signature reframing move — one per carousel where the script calls for it.

**The fond CTA card (final slide, standardized):** Background fond Green `#2E5E4E`. "fond" lowercase, DM Sans Medium, Off-White, centered. One line of CTA copy. One send-trigger line in Ink Gray→Off-White 70%. "Join the waitlist — link in bio" + down-arrow glyph. No logo, no app screenshots, no QR codes.

**Never do:** stock photography or photorealistic people/kitchens; gradients, drop shadows, bevels, glassmorphism; pure black or pure white backgrounds; Signal Red used decoratively; more than 40 words of body copy on a slide; centered paragraph text; the same visual layout on two consecutive slides; "PantryPal" anywhere — the product is fond.

---

## Section 2 — Continuous Visual Thread System

Every carousel has one design element that progresses across all slides and completes on the final slide. Threads stay ≤15–20% of slide area, never compete with text, and their completion coincides with the fond CTA. No thread type repeats within this batch.

| Post | Thread element | Type |
|---|---|---|
| #60 | Shrinking grocery bag vs. static waste tag | Object transforming (shrink) + counter (static) |
| #61 | Fridge cutaway illustration, filling in zone by zone | Illustration building piece by piece |
| #62 | Jar filling with peel pieces | Collection growing |

---

## Section 3 — The Carousels

---

### CAROUSEL #60 — "The Shrinking Cart, The Same Trash Can"
**Pillar:** The $2,913 Problem
**CTA Tier:** Tier 2
**Format:** Carousel · 8 slides
**Slot:** Wednesday, Jul 22, 2026 (this week)
**Platforms:** Instagram, TikTok

**THE ARC:** The trend → the number → the mechanism → why habit beats appetite → the universal version of the problem → the cheat sheet reframe → the verdict → CTA.

**CONTINUOUS THREAD:** A grocery bag icon (line-art, Steel Blue) that visibly shrinks in size on each slide — full-size on Slide 1, roughly two-thirds on Slide 4, one-third by Slide 7. Beside it, a small tag reading "waste: unchanged" in Signal Red stays the exact same size on every slide. Position: bottom-right corner, 15% of slide area. On Slide 8, the shrinking bag is replaced by the fond CTA card; the red tag is replaced by a Steel Blue checkmark.

**Slide 1 — DARK BG (`#14161A`)**
> GLP-1 households cut grocery spending 6%.
> Their food waste percentage didn't move.

*Typography:* Playfair Display Bold, Off-White, 88pt, 2 lines.
*Visual:* Centered hero layout. "6%" rendered separately in Space Grotesk Bold, Harvest Gold `#D9A441`, 120pt, positioned above the two lines of Playfair text like a floating stat. No icon yet — this slide is pure typography, letting the number do the work before any diagram appears.
*Thread state:* Full-size grocery bag icon, bottom-right, Steel Blue outline. Red "waste: unchanged" tag at matching size beside it.
*Source:* Numerator GLP-1 Consumer Spending Tracker (2023–2024); category-level grocery spend decline widely reported across major retailers.

**Slide 2 — LIGHT BG (`#F5F2EC`)**
> Smaller appetite. Same shopping list.
> That gap is where the money goes.

*Typography:* Playfair Display Bold, Slate Black, 64pt (backup hook — must stand alone for someone seeing this slide first on re-serve).
*Visual:* A simple two-column "before/after" comparison, not photographic — two identical grocery list icons (5 line items each: bread, greens, milk, cheese, eggs) rendered in Ink Gray. No items are crossed out. The point of this slide is that the list looks *identical* — the visual absence of change is the argument.
*Thread state:* Bag slightly smaller (~90%), red tag unchanged.

**Slide 3 — LIGHT BG**
> Retailers report GLP-1 households buying fewer snacks and impulse items — but the core weekly list (produce, dairy, bread) barely shrinks. The habit purchases keep coming regardless of how much gets eaten.

*Typography:* DM Sans Regular, Slate Black, 36pt body.
*Visual:* A simple bar comparison: "Impulse/snack spend" bar (Steel Blue, short) vs. "Core list spend" bar (Ink Gray, long, barely shorter than a baseline "before" ghost bar behind it in 20% opacity). The ghost bar shows how little the core list moved.
*Thread state:* Bag ~80%, tag unchanged.

**Slide 4 — DARK BG**
> The bag of spinach doesn't know your appetite changed. It gets bought on the same Tuesday, out of the same habit, whether or not you'll actually eat it this week.

*Typography:* DM Sans Regular, Off-White, 36pt.
*Visual:* A single illustrated spinach-bag icon with a small clock icon beside it reading "Tuesday" — representing autopilot routine-buying. No data here, just the mechanism made visual and human-scale.
*Thread state:* Bag ~65%, tag unchanged.

**Slide 5 — LIGHT BG**
> This isn't a GLP-1-only problem. Anyone whose eating pattern changes — a new job schedule, kids moving out, a diet, a busy month — keeps shopping for the person they used to be. The cart lags behind the appetite every time.

*Typography:* DM Sans Regular, Slate Black, 34pt.
*Visual:* Three small silhouette icons in a row (a person with a briefcase, a person with a suitcase, a person mid-run) each with a small unchanged grocery-list icon beneath them — showing the pattern generalizes beyond one trend. Muted Ink Gray tones, no color emphasis — this slide deliberately underplays itself to broaden the claim without overclaiming data for the general case.
*Thread state:* Bag ~55%, tag unchanged.

**Slide 6 — LIGHT BG**
> The fix was never "buy less." Buying less just shrinks the bag. The fix is knowing what's actually in the fridge before the next trip — so the list matches this week's real appetite, not last year's.

*Typography:* DM Sans Medium, Slate Black, 34pt.
*Visual:* A simple two-state cheat-sheet card: "Old habit → buy the usual list" (Ink Gray, crossed arrow) vs. "New habit → check what's left, then buy" (Steel Blue, checkmark arrow). Screenshot-friendly reference format.
*Thread state:* Bag ~40%, tag unchanged — the gap between the shrinking bag and the static tag is now visually obvious.

**Slide 7 — LIGHT BG (Reframe)**
> The problem was never the size of your appetite.
> It's the gap between your cart and your actual eating pattern.

*Typography:* Playfair Display Bold, Slate Black, 60pt. "gap" set in Harvest Gold — the one emotional word for this carousel.
*Visual:* The shrinking-bag/static-tag thread visual, enlarged and centered as the hero image for this slide — the two elements from the corner thread are brought into the main frame together for the first time, side by side, making the "gap" between them the literal subject of the slide.
*Thread state:* Bag ~25%, tag unchanged, both now center-stage.

**Slide 8 — DARK BG (CTA)**
> Whatever changed your appetite, fond tracks what's actually being eaten — not what the list says you always buy. Send this to whoever does the groceries.

*Typography:* Playfair Display for "fond tracks what's actually being eaten" fragment; DM Sans Medium for the rest; standardized fond CTA card, fond Green `#2E5E4E` background.
*Visual:* Standard fond CTA card per Section 3.7 of the design system. "fond" centered, Off-White. Send-trigger line in Ink Gray→Off-White 70%. "Join the waitlist — link in bio" + down-arrow.
*Thread state:* Bag replaced by fond wordmark; red tag replaced by a Steel Blue checkmark — the "unchanged waste" problem visually resolved by the CTA.

---

### CAROUSEL #61 — "The Fridge Map Nobody Reads"
**Pillar:** Store It Right
**CTA Tier:** Tier 2
**Format:** Carousel · 8 slides
**Slot:** Friday, Jul 24, 2026
**Platforms:** Instagram, Pinterest

**THE ARC:** The myth (egg door) → why it's wrong (temperature gradient) → the real map, zone by zone → the crisper drawer half of the map → the full cheat sheet → the reframe → CTA.

**CONTINUOUS THREAD:** A simple line-art fridge cutaway (four shelves + door + two crisper drawers) that fills in one zone per slide with its correct color-coded label, building into a complete, saveable fridge map by Slide 6. Position: right-edge vertical rail, ~18% of slide width. On Slide 8, the completed fridge diagram compresses into the corner as the fond CTA card takes over the main frame.

**Slide 1 — DARK BG**
> Your fridge came with a place to put everything.
> Most of those places are wrong.

*Typography:* Playfair Display Bold, Off-White, 84pt.
*Visual:* A single outlined fridge silhouette, empty, centered — no shelves filled in yet. This is the thread element in its starting "empty" state, shown large for the first time before it moves to its permanent right-edge position on Slide 2.
*Thread state:* Empty fridge outline, no zones filled.

**Slide 2 — DARK BG (Backup hook — must work standalone)**
> The egg holder is built into your door.
> That's the worst spot in the whole fridge for eggs.

*Typography:* Playfair Display Bold, Off-White, 68pt.
*Visual:* A close-up illustrated door egg-tray, with a small thermometer icon beside it reading a fluctuating range in Signal Red. The specificity of "eggs, the door, wrong" is a stronger cold-open than a generic claim — matches the design system's "second hook must stop a cold scroller" rule.
*Thread state:* Fridge icon moves to right-edge rail; door zone highlighted in Signal Red (marked "wrong," not yet relabeled).

**Slide 3 — LIGHT BG**
> The door opens dozens of times a day. Every open lets warm kitchen air in. The door runs 7–10°F warmer than the back of the fridge — closer to room temperature than to "cold storage."

*Typography:* DM Sans Regular, Slate Black, 34pt. "7–10°F" in Space Grotesk Bold.
*Visual:* A simple horizontal temperature gradient bar spanning the full fridge width — warmest (Signal Red) at the door end, coldest (Steel Blue) at the back-bottom end. This single diagram is the mechanism the rest of the carousel builds on.
*Thread state:* Door zone on the rail fridge recolored Steel Blue with label "condiments, juice, butter only."

**Slide 4 — LIGHT BG**
> **Bottom shelf, back:** the coldest zone in the fridge — this is where raw meat and fish belong. It also keeps any drips contained below everything else, instead of dripping onto food you won't cook first.

*Typography:* DM Sans Regular, Slate Black, 34pt. "Bottom shelf, back" in DM Sans Medium as a label header.
*Visual:* Zoomed illustration of the bottom shelf with a raw-meat-package icon and a small downward drip-containment arrow. Steel Blue accent (this is a "correct/safe" zone, not a warning).
*Thread state:* Bottom shelf on the rail fridge fills in Steel Blue, labeled "raw meat, fish."

**Slide 5 — LIGHT BG**
> **Middle shelf:** dairy, eggs, leftovers. Consistent mid-range cold, easy to see, easy to rotate. **Top shelf:** the least perishable stuff — drinks, ready-to-eat items, leftovers you'll finish today.

*Typography:* DM Sans Regular, Slate Black, 34pt.
*Visual:* Two stacked mini-illustrations (middle shelf with egg carton + milk + leftover container; top shelf with a drink can + a takeout-style container). Both in Steel Blue.
*Thread state:* Middle and top shelves fill in on the rail fridge, labeled accordingly.

**Slide 6 — DARK BG**
> **Crisper drawers** aren't interchangeable. High-humidity setting = leafy greens and herbs (they wilt when they lose moisture). Low-humidity setting = fruit (it rots faster in trapped moisture). Same drawer shape, opposite jobs.

*Typography:* DM Sans Regular, Off-White, 34pt.
*Visual:* Two drawer icons side by side — left drawer with visible "moisture lines" and leafy greens (labeled "high humidity"), right drawer with a vent icon and apple/berry icons (labeled "low humidity"). This is the most information-dense slide and the highest save-potential.
*Thread state:* Both crisper drawers fill in on the rail fridge — the diagram is now complete.

**Slide 7 — LIGHT BG (Reframe / Cheat sheet)**
> The fridge isn't one temperature.
> It's five zones. You've been using one.

*Typography:* Playfair Display Bold, Slate Black, 60pt. "five zones" in Harvest Gold.
*Visual:* The completed fridge-map diagram, pulled from the corner rail into full center-frame as the hero visual — the entire zone map, fully labeled and color-coded, formatted as a clean reference card designed explicitly for screenshotting. This is the slide most likely to be saved.
*Thread state:* Full diagram, centered, complete — highest-detail version of the thread.

**Slide 8 — DARK BG (CTA)**
> fond tracks shelf life by what's actually in each zone of your fridge — not a generic countdown. Save this for your next fridge clean-out.

*Typography:* Standardized fond CTA card, fond Green `#2E5E4E`.
*Visual:* Standard CTA layout per Section 3.7. The completed fridge-map diagram shrinks to a small corner icon (bottom-left) as a final callback, mostly replaced by the fond wordmark and CTA text.
*Thread state:* Diagram compresses to a small badge; fond CTA card takes over the frame.

---

### CAROUSEL #62 — "Citrus Peels Aren't Trash"
**Pillar:** Waste Hacks
**CTA Tier:** Tier 2
**Format:** Carousel · 6 slides (short, punchy — per cadence spec, Sunday Pillar 4 posts run 5–6 slides)
**Slot:** Sunday, Jul 26, 2026
**Platforms:** Instagram, Pinterest, TikTok

**THE ARC:** The reveal → zest → candied peel → cleaning spray → the final count → CTA.

**CONTINUOUS THREAD:** A simple glass jar icon (line-art, Off-White outline on dark / Slate Black outline on light) that fills with a new type of peel piece on each slide — empty on Slide 1, one-quarter full after zest, half after candied peel, three-quarters after cleaner — until it's completely full on Slide 5. Position: bottom-left corner, ~15% of slide area. On Slide 6, the full jar is replaced by the fond CTA card.

**Slide 1 — DARK BG**
> You're throwing away the most versatile ingredient in your kitchen.
> It's the peel.

*Typography:* Playfair Display Bold, Off-White, 84pt.
*Visual:* A single orange, illustrated in flat vector style, with a dotted outline showing where the peel separates from the fruit — like an exploded-view diagram. The peel section is highlighted in Harvest Gold to mark it as the subject, not the fruit itself.
*Thread state:* Empty jar icon, bottom-left.

**Slide 2 — LIGHT BG**
> **Zest first, always.** Before you juice or peel for cooking, zest the whole thing into a small container. It freezes indefinitely and adds instant flavor to baking, cocktails, or finishing a dish — with zero prep next time.

*Typography:* DM Sans Regular, Slate Black, 36pt. "Zest first, always" in DM Sans Medium as a lead-in label.
*Visual:* A microplane/zester icon shaving curls off a citrus peel into a small open container, with a small snowflake icon indicating "freezes indefinitely." Steel Blue accents.
*Thread state:* Jar fills to ~25% with fine zest-colored texture (Harvest Gold flecks).

**Slide 3 — LIGHT BG**
> **Candied peel.** Simmer strips in a simple sugar syrup until translucent, roll in sugar, let dry. Keeps for weeks at room temperature. A free garnish or snack from what would've gone in the trash with the juice.

*Typography:* DM Sans Regular, Slate Black, 36pt.
*Visual:* A simple 3-step process row: raw peel strips → simmering pot icon → finished candied strips on a small plate. Warm Harvest Gold accents on the finished product to signal "treat," contrasted with muted Ink Gray raw peel at the start.
*Thread state:* Jar fills to ~50% with candied-peel-colored pieces.

**Slide 4 — DARK BG**
> **All-purpose cleaner.** Steep peels in white vinegar for two weeks, strain, dilute. A natural degreaser that replaces a $4–6 bottle of store-bought spray — made entirely from scraps you were about to bin.

*Typography:* DM Sans Regular, Off-White, 36pt. "$4–6" in Space Grotesk Bold, Signal Red (this is the one cost-framed slide, so red is earned here per the design system rule).
*Visual:* A mason jar filled with peels submerged in liquid, with a small calendar icon showing "2 weeks," next to a crossed-out generic spray-bottle icon labeled "$4–6" in Signal Red — the substitution is the visual argument.
*Thread state:* Jar fills to ~75% with vinegar-soak-colored liquid layer.

**Slide 5 — LIGHT BG**
> One orange. Four products. Zero trash: zest for cooking, candied peel for snacking, cleaner for the counters, and the fruit itself for eating. The peel was never the waste. Throwing it out was.

*Typography:* DM Sans Medium, Slate Black, 34pt. "Zero trash" in Space Grotesk Bold, Steel Blue.
*Visual:* A simple four-icon summary row (zest curl, candied strip, spray bottle, orange segment) beneath a single orange illustration with arrows fanning out to each — the "one input, four outputs" diagram that closes the loop opened on Slide 1.
*Thread state:* Jar fully filled — all four peel-product colors visible in layered sections, thread complete.

**Slide 6 — DARK BG (CTA)**
> fond flags produce before it's only good for the compost bin — so you catch the zest window, not just the trash can. Send this to whoever just juiced a lemon and tossed the rest.

*Typography:* Standardized fond CTA card, fond Green `#2E5E4E`.
*Visual:* Standard CTA layout per Section 3.7. The full jar from the thread appears once more, small, in the corner, now rendered in fond Green as a callback before fading into the CTA card proper.
*Thread state:* Full jar → fond CTA card.

---

## Section 4 — Production Specifications

- **Canvas:** 1080 × 1350 px (4:5 portrait), export PNG, sRGB color profile.
- **Margins:** 96px on all sides. Nothing but the continuous thread element may touch the margin zone.
- **Handle placement:** `@getfond.app`, bottom-left inside margin, DM Sans 24pt, Ink Gray `#6B7280`, every slide.
- **Slide counter:** "1/8," "2/8," etc. (or "1/6" for #62), bottom-right, same type spec as handle.
- **File naming convention:** `fond_C60_S1.png` through `fond_C60_S8.png` (carousel number + slide number), repeated per carousel.
- **Audio (at posting time, not design time):** add trending ambient audio to all three carousels per the Strategy v2 rule — pushes carousels into the Reels feed for a second distribution surface. Zero additional design cost.
- **Caption SEO:** first sentence of each caption should carry the searchable keyword ("food waste," "grocery hacks," "fridge organization") — max 3–5 hashtags per the 2026 hashtag-wall penalty rule.

---

## Section 5 — Thread Element Summary Table

| Post | Title | Thread | Start state | End state | Position |
|---|---|---|---|---|---|
| #60 | The Shrinking Cart, The Same Trash Can | Shrinking bag + static red waste tag | Full-size bag, tag present | Bag replaced by fond wordmark; tag replaced by checkmark | Bottom-right |
| #61 | The Fridge Map Nobody Reads | Fridge cutaway filling zone by zone | Empty fridge outline | Fully color-coded 5-zone map | Right-edge rail (center-frame on Slide 7) |
| #62 | Citrus Peels Aren't Trash | Jar filling with peel products | Empty jar | Full jar → fond CTA | Bottom-left |

---

## Section 6 — Design Principles (this batch)

- Dark/light backgrounds alternate every 1–3 slides across all three carousels; Slide 1 is always dark, final slide is always dark.
- Signal Red appears exactly once as a loss/cost figure in #60 (waste tag) and once in #62 ($4–6 store cleaner) — never decoratively, per brand rule.
- Every stat slide (#60 Slides 1 and 3) carries a source citation in Ink Gray, DM Sans 20–22pt.
- No slide in this batch exceeds 40 words of body copy.
- No two consecutive slides in any carousel share the same visual layout — each swipe arrives somewhere new.
- All three continuous threads are distinct types (transform+counter, illustration-building, collection-growing) — no repeats within the batch, per the thread idea bank rotation rule.
- "fond" only — no "PantryPal" anywhere in this batch.

---

## What's next (for the following Wednesday run)

Posts 63–65 are the next unbuilt slot (Mon/Wed/Fri after this batch, or continuing the Wed/Fri/Sun rotation — Post 63 = Monday Pillar 1, which falls outside this Wednesday-lane run). No scripts exist yet for 60+ beyond this batch; future runs will need fresh hooks from the pillar reference bank, same as this batch, since the original 30-post idea backlog is exhausted as of Post 59.
