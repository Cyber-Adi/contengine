# Content audit (W1a)

Scope: 53 spec files with N<9000. COVERAGE.md counts 52 real specs; the 53rd is `post-49` (eggs, 8 slides, fully cited), which COVERAGE.md treats as a diagram fixture. Pillar counts below use the 52. Method: token overlap (Jaccard on title plus all slide copy) and a regex sweep of every figure in slide copy. Read-only; no copy was changed.

## 1. Near-duplicates

Token overlap alone is weak here (the three confirmed pairs score 0.15-0.33; the duplication is conceptual). Overlap and judgement below.

| Pair | Overlap | Same idea | Keep | Why |
|---|---|---|---|---|
| 4 / 18 | 0.24 | "10 for $10" does not require buying 10 | 18 | Newer Notion batch, tagged money-leak, adds the "3 for $9" yogurt example, 7 slides. Post 4 is in queue slot 7: replace it. |
| 10 / 24 | 0.33 (highest of all) | Ethylene producers vs sensitive foods | 24 | Has a USDA / UC Davis citation and an outcome headline; 10 has no citation. 10's "enemies list" framing is the better save hook, but merging needs new copy, which is not allowed. |
| 3 / 23 | 0.15 | Bulk spinach you cannot finish | 3 | 3 is anchored on the EPA $2,913 hero with a citation; 23 rests on uncited 30%/40% and a Costco claim. |

Other pairs found (conceptual, by risk):

- 19 / 52 / 7 (takeout trio, one argument: "$40 in the fridge, ordered delivery anyway"). Figures contradict: 19 says $3,400/yr delivery and a $5,000 headline, 52 says $6,000+ and $5,460, 7 uses EPA $56/wk. Keep 7 (EPA-sourced, gtm angle stat); keep 52 only if its figures are reconciled; drop 19 (weakest sourcing).
- 9 / 53 (counter vs fridge cheat sheet, 0.28). Keep 9 if the "2,000+ items" product claim is ruled on; 53 miscounts (says 8, lists 9) and its lists contradict. Do not run both within 6 weeks.
- 13 / 58 / 37 (freezer posts; 13 and 58 both open with wine, ginger, eggs/egg yolks). Keep 58 (numbered, Tier 1); drop 13 or space far apart. 37 is distinct enough (timeline, rule).
- 14 / 54 (pasta water, aquafaba, bacon fat in both). Keep 54 (newer brief, tighter hook "Liquid Gold"); 14 adds parmesan rinds. Drop 14 unless 54 is held.
- 5 / 8 / 32 / 40 (all hero the $2,913; 5 and 8 both tell the "$1,500 to $2,913 nearly doubled" story). Keep 5 and 40; space 8 and 32, or treat 8 as the weaker repeat.
- 33 / 34 / 36 (fridge-discipline family, different mechanisms; fine if spaced).

## 2. Claims not traceable to gtm.json or a same-spec citation

gtm.json verified stats: $2,913/yr (EPA 2025) and 43% (2025 label survey). Everything else needs a citation field in the spec. Hero = rendered as heroNumber.

Known list from COVERAGE.md:

- 19: UNSOURCED. $3,400 delivery, $5,000 headline, $6,700-10,000 and $130-195/wk are assumed-frequency arithmetic ("2-3x per week"). Citation is vague "USDA / industry". Headline is a figure. Verdict: demote to qualitative or drop.
- 26: Not a statistic. Slide 7 "No ads. No data selling." is a product-behaviour claim about a pre-launch app. Verdict: Adi confirms it as policy, else cut.
- 30: The $1,500/yr family-savings claim (slide 6) has no source and is a product-impact claim. Not hero. Slide 5 also says the scanner is already built. Verdict: confirm or remove before publish.
- 44: "10x shelf-life" conflicts with its own "2 days to 2-4 weeks" (7x-14x). Not hero. Verdict: use qualitative "weeks, not days".
- 52: Statista/DoorDash cited loosely; 3.4 orders/wk, $34 average and $6,000+ disagree with the $5,460 on slide 6; "200+ decisions by 6 PM" is a folk stat. Verdict: reconcile or drop.
- 53: No numbers risk, but copy contradiction (8 vs 9 foods; honey and tomatoes appear in both lists). Verdict: Adi rules on the lists.
- 56: Citations present (NRDC 2013, ReFED 2022). 80% and hero 20% are "estimated"; $580 is correct arithmetic (20% of $2,913). Verdict: acceptable if 20% maps to ReFED; verify vintage.
- 60: 6% is cited (Numerator); "food waste percentage didn't move" has no source. Verdict: soften or source.
- 63: Stats fine (EPA hero, sourced). "TestFlight beta coming this summer" is stale (today is 2026-10-07). Verdict: HOLD, rewrite needs Adi.

Additional figures with no citation field and not in gtm.json (found by sweep):

| Post.slide | Figure | Hero? |
|---|---|---|
| 31.4 / 31.6 | 8-12% effective price rise; $0.43/oz | YES, both (generic "documented cases" cite only) |
| 33.4 | $580-870/yr, 20-30% restaurant FIFO savings | YES (cite: "foodservice benchmarks", no named source) |
| 34.5 | 40% less waste, $1,165/yr | YES (cite: "weekly audit estimate") |
| 36.4 | $936-2,080/yr leftovers | YES (vague "household estimate") |
| 46.3 | $800-1,100/yr; kids waste 30-40% | YES (WRAP UK cited, dollars derived) |
| 27.1-5 | 19.1% since 2022; $250/wk "national average"; eggs +64%, beef +22%, veg +18%; $13,000, $3,900, $1,950 | no hero; NO citation field at all |
| 7.4, 8.1 | 19.1% over "4 years" / since 2020 | no; inconsistent with 27 (since 2022) |
| 1.2-5 | slotting $250-1,000; eye-level +30-35%; $9,000 slot | no (3 vague cites) |
| 22.5 | checkout cold-case markup 40-100% | no, uncited |
| 23.2-3 | 30% used; 40% unit price; Costco $14 | no, uncited |
| 39.1-2 | $12/plate vs $4 groceries; 2022 packaging study | no, uncited |
| 51.2,4 | 24-48 h window; $800-1,200/yr | no (generic cite) |
| 59.3,5 | 20-40% shelf price gap; 30% | no, uncited |
| 25, 29, 38, 14, 62 | $6 chicken, $8/$9 banana value, $6-10 broth, $3, $4-6 cleaner | no; price illustrations, low risk |
| 41, 43, 45 | tempo study 38%/32% (journals cited); fridge 37 vs 40F (FDA); apples up to 12 months (USDA) | no, cited |

Internal contradictions to rule on: post 5 says the old $1,500 was "2010 prices" while 8 says "In 2020"; 27 says waste is 30% of purchases while the EPA figure in 5/8 is 11% of spend; 9.8 "2,000+ items" is a product claim.

## 3. Pillar balance

All 52: $2913 Problem 15, Supermarket Secrets 15, Waste Hacks 11, Store It Right 9, Origin Story 2. CTA tiers: Tier 2 = 34, Tier 0 = 9, Tier 1 = 7, Tier 3 = 2. gtm.json says the majority of the feed should be Tier 0; here it is 17%.

First 8 queued (1, 5, 2, 6, 3, 7, 4, 8; Oct 8 to Nov 3): Supermarket Secrets 4, $2913 Problem 4, Waste Hacks 0, Store It Right 0. Pillars alternate strictly, but all 8 are stakes/stat posts; no save-magnet appears until slot 9 (post 9, Nov 5). Slot 7 (post 4) duplicates 18 and slot 5 (post 3) overlaps 23. Through slot 20 the mix is SS 7, $2913 6, WH 4, SIR 3.

## 4. Save-worthiness

Classes (title and structure based):

- Save-magnet (how-to, checklist, cheat sheet, storage fix): 9, 10, 13, 14, 16, 24, 25, 29, 33, 34, 37, 38, 43, 44, 49, 53, 54, 57, 58, 61, 62
- Stakes/stat: 1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 22, 23, 26, 27, 31, 32, 35, 36, 39, 40, 41, 42, 45, 46, 51, 52, 55, 56, 59, 60
- Story: 30, 63

Top 8 save-magnets to bring forward (ranked on use-after-save, sourcing cleanliness, blockers):

1. post-49 Eggs 5 weeks: USDA FSIS cited, no uncited figures. Blocker: fixture status; Adi confirms it is real.
2. post-9 Counter vs Fridge cheat sheet: cited. Blocker: "2,000+ items" claim.
3. post-43 Fridge 5 degrees too warm: FDA cited, fix is a $5-10 thermometer. "Hundreds" saved is a soft claim.
4. post-58 5 Things You Can Freeze: clean, Tier 1, no figures.
5. post-61 Fridge Map: the map is the save object; one 7-10F figure, uncited.
6. post-57 Wrong Drawer / herbs: rescue steps, no stat risk.
7. post-34 Sunday Fridge Audit: strong checklist, but hero 40% / $1,165 is unsourced.
8. post-44 Quick Pickle: formula slide is saveable. Blocker: 10x claim.

Runner-ups: 25 (rotisserie), 33 (FIFO, hero unsourced), 53 (only if the list contradictions are fixed and 9 is not used).

## 5. Decisions for Adi

- Confirm drops: 4 (keep 18), 10 (keep 24), 23 (keep 3), 19 (keep 7/52). Mark, never delete.
- Replace queue slot 7 (post 4) and open the first 8 with at least 2 save-magnets (candidates 58, 43, 9).
- Is post-49 (eggs) a real post? If yes it leads the save-magnet list.
- Hero figures with no named source: 31 ($0.43/oz, 8-12%), 33, 34, 36, 46. CLAUDE.md default: render qualitatively.
- Reconcile or drop 27, 19, 52: most uncited dollar math, and they disagree with each other and with the EPA 11%.
- Confirm or cut product claims: "No ads. No data selling" (26), "2,000+ items" (9), $1,500 savings and "scanner built" (30).
- Post 63: rewrite "TestFlight this summer" before it ships. Post 53: fix the 8 vs 9 list.
- CTA mix: 34 of 52 are Tier 2 against gtm.json's "majority Tier 0". Decide whether to convert some to Tier 0.
