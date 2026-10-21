# Verify Oct 7 (independent)

| # | Check | Result |
|---|-------|--------|
| A1 | Every new copy diff has a refinement.changes entry, exact from/to, why "Adi-authorized Oct 7:" (scripted, all 21 specs) | PASS. 0 unlogged copy diffs; 0 new entries with a wrong why prefix. ctaTier and ctaSwap are metadata, not copy. |
| A2 | No new numbers or capitalised proper nouns vs HEAD | PASS. Only FIFO and 30 (33), 10 and Sunday (34), all moved from the removed captions of the same slide. |
| A3 | Matches decision, minimal | Excluded 4,10,13,14,19,23,52,53 PASS. Hero numbers qualitative on 31,33,34,36 PASS. Claims fixed on 26,30,44,60 PASS. Tier 0 = 24 of 44 non-excluded specs (majority) PASS. Post 46 FAIL, post 63 FAIL (below). |
| A4 | ctaSwap consistency; gtm-check; setup-cta dry run | PASS. Every spec swapped to Tier 0 had its ctaSwap removed (8,9,31,32,33,34,41,42,43,54,55); the rest are retained and match; gtm-check gate 6 PASS on all 21; setup-cta dry-run "0 swaps". |
| A5 | Meaning/grammar | 60 "may not have moved": grammatical, hedged, OK. 63 "a waitlist": FAIL (below). Others read correctly. |
| B | ACCOUNT-PROFILE / COWORK | PASS. Account type recommendation removed (1.6, 2.6, Decision 4); Cowork rule 12 and A1 never touch it; Highlights marked later (1.8, rule 13); TikTok Public is an Adi phone step (2.8, Part C, Decision 6); no "Open Question" refs remain; no unsafe action added. Nit: 2.6 repeats the "1,000 followers" link rule that line 136 says does not match TikTok docs (marked UNVERIFIED); rule 12 wording "view-to-change" is awkward. |

## Fix 1: post 46 (FAIL)
specs/post-46.json slide 3 keeps hero "$800-1,100/year" derived from a WRAP UK citation (spec note line 10 says it is the brief's own translation). Gate 6 warns unsourced-hero. CLAUDE.md section 4: render qualitatively. Replace slide 3 (index 2):
- layout: hero-statement; remove heroNumber, heroNumberUnit, heroNumberCaption, citation (as done on 31/33/34/36).
- headline: "Children under 12 waste food served to them."
- body: "For a family with two kids, that's plate waste alone - separate from the fridge waste figure."
- Add refinement.changes entries (why "Adi-authorized Oct 7: unsourced derived hero figure rendered qualitatively") and delete the line-10 note asking Adi to confirm.
Note the 30-40% in the caption is also not in gtm.json's sourced set, so it is dropped too.

## Fix 2: post 63 (FAIL on substance; Gate 6 does not catch it)
slide 7 items.0 "There is a waitlist and no user numbers I can honestly quote you." state/launch.json has waitlistLive false (setup phase), which forbids waitlist claims. src/gtm.mjs launchCheck only scans CTA fields, so Gate 6 passes while the body claim is untrue. Replace with: "There are no user numbers I can honestly quote you." and update the existing change entry's "to". Gate follow-up (separate change): extend launchCheck to body copy.
