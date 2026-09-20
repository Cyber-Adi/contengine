# fond — Carousel Design Brief · Posts 31–33

**Batch:** 3 carousels · 20 slides total
**Source scripts:** Notion → Faceless Content OS → "Carousel Scripts — Posts 31–40 (Visual-First)"
**Status:** Ready for design execution. Zero ambiguity — every slide has copy, type, color, visual, and thread state.
**Note on selection:** Posts 17–27 already have design briefs. Posts 31–40 are scripted but unbriefed. These three are the lowest-numbered unbriefed posts and span three distinct pillars (P1 / P2 / P3), led by today's Pillar 2.

> **Brand note:** The app is **fond** (formerly PantryPal). All scripts below still say "PantryPal" — **replace every instance with "fond"** in final design. The wordmark on CTA slides reads **fond**, lowercase, in the brand sans (DM Sans Medium), never with a logo or app screenshot yet.

---

## SECTION 1 — BRAND SYSTEM (Recap)

This is the established visual system for the faceless account. Non-negotiable on every slide.

### Color palette

| Token | Hex | Use |
|---|---|---|
| Slate Black | `#14161A` | Dark backgrounds. Slide 1 and final slide always. |
| Off-White | `#F4F1E9` | Light backgrounds; primary text on dark. |
| Steel Blue | `#3D6E8F` | Brand/positive accent. Savings, the fond line, "what you should look at." |
| Signal Red | `#D72638` | **LOSS AND WASTE ONLY.** Never decorative. Hidden costs, expired food, the bad number. |
| Warm Amber | `#E0A33E` | Secondary highlight — comfort/manufactured-warmth cues, mid-stage warnings. |
| Confirm Green | `#2F9E44` | Checkmarks, "do this," verified-correct items. |

### Typography

| Font | Weight | Use |
|---|---|---|
| Space Grotesk | Bold | All numbers, stats, dollar amounts, math. Hero figures. |
| Playfair Display | Bold | Reframe lines and closing-argument copy on final slides. |
| DM Sans | Regular / Medium | Body copy, labels, captions, CTA line, the **fond** wordmark. |

### Layout rules

- 1080 × 1350 px (4:5 portrait).
- Safe margin 80 px all sides; nothing critical in outer 64 px.
- Body copy never exceeds **40 words** per slide.
- Numbers are always Space Grotesk Bold — never the body font.
- Signal Red is reserved for loss/waste figures only.
- Dark/light backgrounds alternate every 2–3 slides. **Slide 1 dark. Final slide dark.**
- Flat illustration and diagrams only. No stock photography of people, no lifestyle imagery, no gradients, no drop shadows.
- Handle `@fond` bottom-center in DM Sans 24px, Off-White at 40% opacity, on every slide.

---

## SECTION 2 — CONTINUOUS VISUAL THREAD SYSTEM

Every carousel carries one design element that **progresses in a single direction across all slides and completes on the final slide**, timed to land with the CTA/reframe. It occupies a fixed position, stays under ~18% of slide area, and never competes with the text. This is what drives swipe-through.

### Thread summary — this batch

| # | Carousel | Thread element | Start state | End state | Position |
|---|---|---|---|---|---|
| 31 | The Shrinkflation Receipt | A receipt tape that prints one line per slide | Blank receipt header | Full receipt, total stamped "+8–12% hidden" | Right-edge vertical strip |
| 32 | What $2,913 Could Buy Instead | A "forgone-purchase" collection bar that fills with icons | Single intact `$2,913` token | Bar full of everything that money could've bought | Bottom horizontal bar |
| 33 | The FIFO Fridge | A small fridge icon reorganizing from chaos to order | Cluttered, disordered fridge | Clean FIFO-rotated fridge with green check | Top-right corner icon |

Threads are deliberately different in kind (printing tape / filling collection / transforming object) so the batch doesn't feel repetitive.

---

## SECTION 3 — THE CAROUSELS

---

### CAROUSEL #31 — "The Shrinkflation Receipt"

- **Pillar:** 1 — Supermarket Secrets
- **CTA Tier:** Tier 2
- **Slides:** 7 · **Post day:** Monday, Week 12
- **THE ARC:** Discovery → outrage → proof → the pattern → what it means → what to do → the verdict
- **CONTINUOUS THREAD:** A receipt tape pinned to the right edge of every slide. It starts as a blank receipt header (slide 1) and prints one new evidence line each slide, ending on slide 7 as a complete receipt whose total reads **"+8–12% — charged, not shown."** Position: vertical strip, right 14% of canvas. Receipt is Off-White paper texture on dark slides, faint grey outline on light slides; printed lines in DM Sans monospace-feel.

**Slide 1 — DARK BG (`#14161A`)**
> The price didn't go up.
> The box got smaller.

- *Type:* Playfair Display Bold, Off-White, two stacked lines, centered-left.
- *Visual:* Two product silhouettes side by side, same packaging outline, but the right one visibly shorter and thinner. No brand names, no labels — pure stark white outlines on Slate Black. Eye bounces between the shapes hunting for the difference.
- *Thread:* Receipt tape appears on right edge — just the header printed: "STORE RECEIPT" + a faint dotted line. Empty body.

**Slide 2 — LIGHT BG (`#F4F1E9`)**
> It's called shrinkflation. Same price. Same shelf. Less product inside. The packaging barely changes so you don't notice.

- *Type:* DM Sans body, Slate Black. Word "shrinkflation" in Steel Blue Medium.
- *Visual:* A clean before/after weight comparison. Left: "2019 — 16 oz" in Space Grotesk Bold, Steel Blue `#3D6E8F`. Right: "2025 — 13.5 oz" in Space Grotesk Bold, Signal Red `#D72638`. A thin connecting line between them labeled "same price" in small DM Sans. Diagrammatic, the size drop is the visual.
- *Thread:* Receipt prints line 1 → "16oz → 13.5oz ........ −2.5oz".

**Slide 3 — LIGHT BG (`#F4F1E9`)**
> Frito-Lay bags dropped from 10 oz to 9.25 oz. Gatorade went from 32 oz to 28 oz. A "family size" Oreo is now the size the regular used to be.

- *Type:* DM Sans body, Slate Black. Old weights struck through in Signal Red; new weights in Slate Black.
- *Visual:* Three evidence rows, each a generic silhouette (chip bag / bottle / cookie package) with old weight crossed out in Signal Red and new weight beside it. No logos. Formatted like an evidence log / police report — each row a line of proof.
- *Thread:* Receipt prints three more lines (chips / drink / cookies), each "was → now".
- *Source:* Documented shrinkflation cases, 2023–2025 consumer reporting.

**Slide 4 — DARK BG (`#14161A`) — impact shift**
> The effective price increase on a bag of chips isn't 0%. It's 8–12%. They just hid it in the packaging instead of the price tag.

- *Type:* "8–12%" Space Grotesk Bold, Signal Red `#D72638`, ~100pt, centered. Beneath, small DM Sans Off-White: "the price increase you weren't supposed to notice."
- *Visual:* Single hero number on Slate Black so the red reads like a warning light. Nothing else competes.
- *Thread:* Receipt now shows a running subtotal forming near its base — a faint "SUBTOTAL …" line appears, value blurred/pending.

**Slide 5 — LIGHT BG (`#F4F1E9`)**
> Companies do this because research shows people notice price increases but not size decreases. You check the price. You don't weigh the box.

- *Type:* DM Sans body, Slate Black.
- *Visual:* Two editorial-cartoon icons side by side. Left: an eye looking at a price tag, labeled "what you check" (Steel Blue). Right: a scale with a question mark, labeled "what you don't" (muted grey). The asymmetry is the message.
- *Thread:* Receipt prints "psychology fee ........ included".

**Slide 6 — LIGHT BG (`#F4F1E9`)**
> The unit price tag — small print, bottom-left of the shelf label — is the only number that adjusts for shrinkflation. It shows cost per ounce. Most people never look at it.

- *Type:* DM Sans body, Slate Black. "cost per ounce" in Steel Blue Medium.
- *Visual:* Zoomed illustration of a shelf price label. Big number "$3.99" in plain Slate Black; the tiny unit price "$0.43/oz" circled in Steel Blue with an arrow pointing to it. The viewer is being trained to look where the store doesn't want them to.
- *Thread:* Receipt prints "→ check $/oz" in Steel Blue — the first *helpful* line, distinct color.

**Slide 7 — DARK BG (`#14161A`) — FINAL · CTA Tier 2**
> The price didn't change. Your serving count did.
> fond tracks what you actually get per dollar — not what the box says. Link in bio.

- *Type:* Playfair Display Bold, Off-White for the reframe. The **fond** line in DM Sans Medium, Steel Blue `#3D6E8F`.
- *Visual:* Closing-card simplicity — pure type, generous whitespace, documentary-end-card feel.
- *Thread:* **Completes.** Receipt is full and prints its total at the base: **"TOTAL HIDDEN: +8–12%"** stamped in Signal Red, with a torn-paper bottom edge. The receipt the viewer watched build is the evidence summary.

---

### CAROUSEL #32 — "What $2,913 Could Buy Instead"

- **Pillar:** 2 — The $2,913 Problem
- **CTA Tier:** Tier 2
- **Slides:** 7 · **Post day:** Wednesday, Week 12
- **THE ARC:** The number → reframe as opportunity cost → what it could be → the emotional version → the compound version → the invisible part → the challenge
- **CONTINUOUS THREAD:** A "forgone-purchase" collection bar across the bottom 15% of every slide. It starts (slide 1) holding a single intact `$2,913` token. Each interior slide drops one icon of what that money could've bought into the bar (plane → car → cash-to-trash → future-fund → drip of coins). By slide 7 the bar is a full row of everything the waste could have become. Position: bottom horizontal strip. Bar background a thin Off-White rule on dark slides / faint Slate line on light slides.

**Slide 1 — DARK BG (`#14161A`)**
> $2,913 a year.
> Here's what you could do with that instead.

- *Type:* "$2,913" Space Grotesk Bold, Signal Red `#D72638`, massive, centered. Below a thin rule and "or…" in small DM Sans, Off-White.
- *Visual:* The number dominates; "or…" opens the curiosity gap that powers the swipe.
- *Thread:* Bottom bar holds one item — the intact `$2,913` token glowing faintly, nothing spent yet.
- *Source:* EPA, April 2025 — avg. household of 4 wastes $2,913/yr in food.

**Slide 2 — LIGHT BG (`#F4F1E9`)**
> A round-trip flight to Europe for two. $2,913 covers economy tickets from the East Coast to London, Paris, or Rome — including taxes.

- *Type:* DM Sans body, Slate Black. "$2,913" in Space Grotesk Bold, Steel Blue (here it's potential, not loss).
- *Visual:* A simplified boarding-pass illustration. Departure: "YOUR FRIDGE." Destination: "PARIS." Fare: "$2,913 (previously wasted)." The boarding-pass metaphor makes opportunity cost visceral.
- *Thread:* A small plane icon drops into the bottom bar — collection item 1.

**Slide 3 — LIGHT BG (`#F4F1E9`)**
> 6 months of car payments. The average used-car payment is $525/month. Your food waste covers half a year.

- *Type:* DM Sans body, Slate Black. "$525/month" Space Grotesk Bold, Steel Blue.
- *Visual:* A 12-month calendar. First 6 months highlighted Steel Blue, labeled "covered by food-waste savings." Remaining 6 dimmed. Scale shown in time, not just dollars.
- *Thread:* A car icon drops into the bottom bar — collection item 2.

**Slide 4 — DARK BG (`#14161A`) — emotional shift**
> $56 a week for a year. Imagine handing your kid $56 in cash every Friday and watching them drop it in the garbage. That's what's happening. You just can't see it.

- *Type:* DM Sans body, Off-White. "$56" Space Grotesk Bold, Signal Red.
- *Visual:* An illustrated hand holding $56 in cash above a trash can. Deliberately uncomfortable — it should feel wrong. That discomfort is the point. Illustration, not photo.
- *Thread:* A cash-into-trash icon drops into the bar — collection item 3, the only one tinted Signal Red (this is the loss made literal).

**Slide 5 — LIGHT BG (`#F4F1E9`)**
> Over 10 years, at current inflation, that's roughly $35,000. A down payment. A year of college tuition. A small business.

- *Type:* "$35,000" Space Grotesk Bold, Signal Red `#D72638`, hero-sized. Below, three DM Sans lines: "a down payment" / "a year of tuition" / "a small business."
- *Visual:* The viewer picks the option that hurts most — each is a different life that money could've funded.
- *Thread:* A "future fund" icon (small house/diploma stack) drops into the bar — collection item 4.

**Slide 6 — LIGHT BG (`#F4F1E9`)**
> The waste isn't one big event. It's $8 of produce on Tuesday. A forgotten yogurt on Thursday. A leftover no one reheated on Saturday. It adds up because it's invisible.

- *Type:* DM Sans body, Slate Black. Small dollar figures in Space Grotesk Bold, Signal Red.
- *Visual:* A single-week timeline (Mon–Sun) with small amounts appearing at random points — $3, $8, $5 — totaling $56 by Sunday. A drip, not a flood: the waste accumulates through micro-moments no one notices.
- *Thread:* A trail of tiny coin icons drips into the bar — collection item 5, filling the last gap.

**Slide 7 — DARK BG (`#14161A`) — FINAL · CTA Tier 2**
> You didn't choose to waste $2,913.
> You just didn't have a way to see it happening.
> fond makes the invisible visible. Link in bio.

- *Type:* Playfair Display Bold for the reframe, Off-White. CTA in DM Sans Medium. **The words "invisible" and "visible" both in Steel Blue** — the only color besides white; their contrast carries the concept.
- *Visual:* Three lines, generous spacing, closing-card restraint.
- *Thread:* **Completes.** The bottom bar is now a full row — plane, car, cash, future-fund, coins — every forgone purchase the $2,913 could have been. The intact token from slide 1 is gone; it became all of these.

---

### CAROUSEL #33 — "The FIFO Fridge"

- **Pillar:** 3 — Store It Right
- **CTA Tier:** Tier 2
- **Slides:** 6 · **Post day:** Friday, Week 12
- **THE ARC:** The problem behavior → the restaurant secret → how to do it → the result → the proof → the payoff
- **CONTINUOUS THREAD:** A small fridge icon in the top-right corner of every slide that reorganizes itself across the carousel — from a chaotic, randomly-stuffed fridge (slide 1) into a clean, FIFO-rotated fridge with a green check (slide 6). Each slide nudges it one step toward order. Position: top-right corner, ~12% area. Outline style: white line-art on dark slides, Slate line-art on light slides; final-state check in Confirm Green.

**Slide 1 — DARK BG (`#14161A`)**
> Every restaurant in the world uses this system.
> Almost no home kitchen does.

- *Type:* Playfair Display Bold, Off-White, two stacked lines.
- *Visual:* A split. Left: a clean, organized restaurant walk-in cooler — everything labeled, dated, rotated. Right: a typical home fridge — chaos, items shoved in, things hidden behind other things. The contrast is the hook.
- *Thread:* Corner fridge icon is at its messiest — items at random angles, one door ajar.

**Slide 2 — LIGHT BG (`#F4F1E9`)**
> It's called FIFO. First In, First Out. When you buy new groceries, the new items go to the back. The older items move to the front. You always use the oldest food first.

- *Type:* DM Sans body, Slate Black. "FIFO" and "First In, First Out" in Steel Blue Medium.
- *Visual:* A top-down fridge-shelf diagram. Arrows show rotation: new items enter from the right, old items slide left toward the front. Each item carries a small date label. Reads like a conveyor belt — the system is instantly legible.
- *Thread:* Corner fridge straightens slightly — a couple of items now aligned, door closed.

**Slide 3 — LIGHT BG (`#F4F1E9`)**
> It takes 30 seconds when you unload groceries. Pull the old items forward. Put the new stuff behind them. That's the entire system.

- *Type:* DM Sans body, Slate Black. "30 seconds" Space Grotesk Bold, Steel Blue.
- *Visual:* Three-step illustration, each a small panel with a hand performing the action: (1) open fridge, (2) slide old items forward, (3) new items go behind. Simplicity is the sell — half a minute, not a lifestyle overhaul.
- *Thread:* Corner fridge half-organized — front row now neatly faced forward.

**Slide 4 — DARK BG (`#14161A`) — the payoff number**
> Restaurants that use FIFO cut food waste by 20–30%. Applied to a home kitchen, that's $580–870 saved per year.

- *Type:* "$580–870/year" Space Grotesk Bold, **Steel Blue** `#3D6E8F` (money *saved*, positive framing — not red). Below, DM Sans Off-White: "from 30 seconds of effort per grocery trip."
- *Visual:* Hero number on Slate Black; the effort-to-benefit ratio is the argument and the layout should make that absurdity obvious.
- *Thread:* Corner fridge nearly done — shelves aligned, only the dating labels left to add.
- *Source:* Foodservice FIFO waste-reduction benchmarks (20–30%), applied to avg. household spend.

**Slide 5 — LIGHT BG (`#F4F1E9`)**
> The reason you don't do this already: new groceries feel urgent. The old food is "still fine." By the time "still fine" becomes "not fine," you can't see it anymore.

- *Type:* DM Sans body, Slate Black. The phrase "I'll eat that later" (in the visual) in Warm Amber.
- *Visual:* A thought-bubble illustration reading "I'll eat that later" — the universal lie — with a trash can beneath it. Simple, but the emotional recognition is instant.
- *Thread:* Corner fridge gets its date labels — fully FIFO-ordered now, awaiting the check.

**Slide 6 — DARK BG (`#14161A`) — FINAL · CTA Tier 2**
> The cheapest upgrade to your kitchen isn't an appliance.
> It's putting the old food in front of the new food.
> fond tracks dates for you — but FIFO costs $0. Start today. Link in bio.

- *Type:* Playfair Display Bold for the reframe, Off-White. "$0" in Space Grotesk Bold, Confirm Green. CTA in DM Sans Medium, Steel Blue. (Recommending the free fix before the product builds trust — keep that honesty visible.)
- *Visual:* Closing-card restraint after the diagram-heavy middle.
- *Thread:* **Completes.** Corner fridge is fully organized, FIFO-rotated, with a **Confirm Green check** stamped on it — the transformation the viewer watched, finished.

---

## SECTION 4 — PRODUCTION SPECIFICATIONS

- **Canvas:** 1080 × 1350 px (4:5 portrait).
- **Export:** PNG, sRGB, one file per slide.
- **Margins:** 80 px safe area all sides; handle/thread inside outer 64 px only.
- **Handle:** `@fond` bottom-center, DM Sans 24px, Off-White @ 40% opacity, every slide.
- **Wordmark:** "fond" lowercase, DM Sans Medium, Steel Blue, CTA slides only. No logo, no app screenshot.
- **Naming convention:** `fond_P[postnumber]_[pillar#]_slide[n]_of[total].png`
  - e.g. `fond_P32_P2_slide1_of7.png`
- **Slide-count map:** #31 = 7 slides · #32 = 7 slides · #33 = 6 slides. **Total 20 slides.**
- **Find/replace before export:** every "PantryPal" → "fond".

---

## SECTION 5 — THREAD ELEMENT SUMMARY TABLE

| # | Thread element | Start state | End state | Position |
|---|---|---|---|---|
| 31 | Receipt tape, prints 1 line/slide | Blank receipt header | Full receipt, total "+8–12% hidden" stamped Signal Red | Right-edge vertical strip |
| 32 | Forgone-purchase collection bar | Single intact `$2,913` token | Bar full: plane, car, cash, future-fund, coins | Bottom horizontal bar |
| 33 | Fridge icon transforming | Cluttered, disordered fridge | Clean FIFO fridge + Confirm Green check | Top-right corner |

---

## SECTION 6 — DESIGN PRINCIPLES (governing this batch)

1. **Slide 1 opens with a visual contradiction, mystery, or discomfort** — the swipe trigger. (Shrinking box; the "or…"; restaurant-vs-home split.)
2. **Interior slides teach through diagrams, comparisons, timelines, and spatial layouts** — never text on a color. The visual should land even on mute with captions off.
3. **One "evidence" slide per carousel** — receipt, evidence log, boarding pass, conveyor diagram — so the account reads like journalism, not opinion.
4. **The dark-background slide is the emotional escalation** — the worst number, the hardest truth. (8–12%; cash-to-trash; the $580–870 flip to positive.)
5. **The final slide returns to simplicity** — pure type, whitespace, one closing sentence. Restraint after complexity reads as a closing argument.
6. **Signal Red is loss/waste only.** Savings and the brand voice are Steel Blue; "do this" confirmations are Confirm Green. Never use red decoratively.
7. **Every visual is flat-illustratable** — no 3D, no photography of people, no gradients or shadows. Diagrams, type, and simple line-art only.
8. **The thread completes on the final slide, with the CTA** — the payoff the viewer has been watching assemble.
