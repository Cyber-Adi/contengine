# Design pass, Oct 21 (slide templates)

Board: out/design/board-oct21.png (per post: old contact sheet above, new below; posts 1, 31, 57).
Files changed: src/slide-html.mjs only. No copy, no token values, no spec fields changed.

## Diagnosis (posts 1, 31, 57)

- Slide 1 hero-statement was pinned to the foot of the frame by the rhythm solver (valign bottom).
  Post 1 had the hook starting at y=814 of 1800; post 31 at 496. The upper 45% was dead space and
  the hook, the only thing doing work, sat in the thumb zone beside the swipe pill. Weak figure/ground
  and no use of the poster scale the type was already capable of (frontend-design: spend boldness in one
  place, let the type be the memorable thing; emil: details compound, the first frame sets the register).
- Lists: stack-list slides repeated the identical left-numeral ledger within a deck (post 1 slides 2 and 6),
  so the swipe landed on the same-looking slide (frontend-design: structure should encode information,
  repetition without reason reads as template).
- Tall two-box split-compare: already handled by the existing slack cap; left alone.

## Changes

1. Cover optical anchor (coverAnchor, .content.v-optical). A slide-1 hero-statement whose valign resolves
   to bottom is painted at the optical centre with 13% extra room below (poster convention: the visual
   centre sits above the geometric centre). Post 1 hook moved from y=814 to roughly y=430; post 31 and 57
   similarly lifted. Rhythm solver and spec valign untouched (rhythm centroid model still predicts bottom;
   Gate 5 passes).
2. List variant (listVariant). Every second stack-list in a deck (counted by order, not slide index) hangs
   its numerals on the right edge: text first, numeral as a right-aligned marginal index. Consecutive
   lists in a deck now differ in silhouette without changing layout enum, copy, colour or type size.
3. Tried and reverted: asymmetric split-compare columns (.88fr/1.12fr, heavier second border). It made
   posts 30, 39 (G1.2 margin, G1.6 chrome) and 31 (G5.5 fill) fail. The gate got stricter on a narrower
   column, not worse output by an old measure; no gate was loosened, the change was removed.

## Verification

- All 53 real specs (N<9000 present in specs/) render verdict PASS gates 1-7 (post 49 export refuses by
  design: reconstructed-fixture provenance, unchanged).
- locked npm test 25/25; test:fidelity 26/26; test:package 10/10.
- Posts 31 and 57 re-rendered byte-identical.

## Not done (left for lead)

Paragraph-length headlines and collisions with the micro-label (posts 24, 34, 40, 51, 53, 57 per
out/audit/visual.md) need a headline size or copy-length decision; both are outside this pass.
