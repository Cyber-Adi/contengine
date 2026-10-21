# Verify: docs/ACCOUNT-PROFILE.md (Wave C1)

Method: values extracted by script (/Users/adhijjoshi/.claude/jobs/27617dad/tmp/check.mjs), counted by code point, run through src/gtm.mjs honestyCheck and launchCheck. 31 text values checked (IG name x3, IG bio x3, 15 Highlight names and alternates, TikTok name x3, TikTok bio x3). Result: every stated count equals the actual count, none over its limit, zero honestyCheck or launchCheck findings, zero em dashes, emojis, hex literals, or "PantryPal" in the whole doc.

Counts (actual): IG name 22/22/27 of 30; IG bio 119/125/130 of 150 (newline = 1); Highlights 5-14 of 15; TikTok name 17/22/22 of 30; TikTok bio 73/78/72 of 80.

| Field | Result | Reason |
|---|---|---|
| 1.1 IG username | PASS | Cites IGR 1 correctly (dip in search, old handle held). |
| 1.2 IG name (3 values) | PASS | Counts match, under 30, no findings. |
| 1.3 IG bio (3 values) | PASS | Counts match, under 150. Chosen line 2 is ctas.setup[0] verbatim, Alt 1 line 2 is ctas.setup[1] verbatim. Alt 2 carries positioning.line verbatim; states Adi's age publicly, already Open Question 1. |
| 1.4 IG link | PASS | Empty; no waitlist or link-in-bio wording; IGR 3 citations verified. |
| 1.5 IG profile picture | PASS | Token names only; no gradient, shadow, photo, pure black or white; 60-70%, 720 px, 110 px match IGR 4. |
| 1.6 IG account type | PASS | Creator, not Business; teen rules match IGR 5; Insights/scheduling limits labelled UNVERIFIED with "verify on screen". |
| 1.7 IG pinned posts | PASS | post-9 (10-08), post-58 (10-13), post-5 (10-20), post-1 (10-15) all exist in READY-TO-POST/SCHEDULE.txt with matching titles and pillars; "pin after it publishes" present; 4th-pin dispute flagged. |
| 1.8 Highlights names | FAIL | Date labels content cites "GTM 43% stat" with no source attribution (gtm.json source: "2025 consumer label-confusion survey"). Also `Date labels` and `Freezer` are not in IGR 7's list (Start here, Fridge storage, Grocery money, Food waste); that is judgement and should say so. |
| 1.8 Highlight covers | PASS | Names match covers (house, fridge, calendar, coin, snowflake map to the 5 names); palette by name only; Signal Red never. |
| 1.9 IG settings checklist | FAIL | Search-engine indexing bullet cites "IGR 7"; the claim is in IGR 8. |
| 2.1 TikTok username | PASS | Limits labelled third-party UNVERIFIED (TTR 2). |
| 2.2 TikTok name (3 values) | PASS | Counts match, under 30; keyword-weighting labelled UNVERIFIED. |
| 2.3 TikTok bio (3 values) | PASS | Counts match, under 80; no URL, no waitlist; Alt 2 names @getfond only. Chosen and Alt 1 paraphrase ctas.setup (not verbatim) and are honest; doc says "in the spirit of". |
| 2.4 TikTok link | PASS | No link relied on; 1,000-follower rule explicitly rejected; social button marked "verify on screen". |
| 2.5 TikTok photo | PASS | Same brief as IG; avatar video marked UNVERIFIED. |
| 2.6 TikTok account type | FAIL | Personal/Creator, not Business: correct. But (a) "LIVE is 18+, TTR 5" is TTR 6 (TTR 5 is photo/pins); (b) the Business-limits-music claim is third-party and UNVERIFIED in TTR 1 yet is stated as fact. |
| 2.7 TikTok pinned videos | PASS | Photo-mode pinning and cover labelled UNVERIFIED (TTR 5 correct); gated on 10+ posts. |
| 2.8 TikTok settings | FAIL | Public step is present (good), but "TTR 5 suggests it may be unavailable to teens" should cite TTR 6. |
| 3. Meta Business Suite checklist | FAIL | Nothing public (ends "Schedule, edit and publish nothing"). But "use the existing fond Page" asserts a Page exists, which no source supports; and "Remove or reject anyone or any app not Adi" is a destructive action in a setup-only checklist. |
| Stats (all fields) | PASS | Only $2,913 (EPA, 2025) attributed, and 43% (see 1.8 fix). No invented figures. |
| Voice | PASS | No em dashes, emojis, PantryPal; dry voice. |

Totals: 15 PASS, 5 FAIL (1.8 names, 1.9, 2.6, 2.8, 3).

Citation spot-checks (5 opened): IGR 3 (5 links, phone only) OK; IGR 4 (720 px, 60-70%, 110 px) OK; TTR 4 (1,000-follower rule, Business 18+) OK; LAND 3 (Language Bank, no dollar-framed rows) OK; TTR 1 (Business 18+) OK. Wrong section numbers found: IGR 7 (should be 8), TTR 5 twice (should be 6).

## Required fixes

1. Section 1.8, item 3 Content: replace "sourced label content only (GTM 43% stat is verified)" with "sourced label content only (GTM 43% stat, 2025 consumer label-confusion survey, verified)". Add after the names list: "`Date labels` and `Freezer` are judgement picks, not from IGR 7."
2. Section 1.9, indexing bullet: change "(IGR 7, UNVERIFIED)" to "(IGR 8, UNVERIFIED)".
3. Section 2.6: change "(LIVE is 18+, TTR 5)" to "(LIVE is 18+, TTR 6)"; change "it limits music to the commercial library (TTR 1)" to "it reportedly limits music to the commercial library (TTR 1, third-party, UNVERIFIED)".
4. Section 2.8: change "(TTR 5 suggests it may be unavailable to teens, UNVERIFIED)" to "(TTR 6 says it is off for 13-17, UNVERIFIED for 17-year-olds in the app)".
5. Section 3, Page bullet: replace "use the existing fond Page; do not create a new one without asking Adi" with "if a linked Facebook Page is required and none is visible, stop and ask Adi; do not create one".
6. Section 3, Roles bullet: replace "Remove or reject anyone or any app not Adi; add no third-party apps." with "If anyone or any app other than Adi appears, do not remove it; report it to Adi. Add no third-party apps."

No other fixes required. Doc was not edited.

---

# Pass 2

## 2a. ACCOUNT-PROFILE.md: the 5 earlier FAILs

| Earlier FAIL | Result | Evidence |
|---|---|---|
| 1.8 43% attribution + judgement label | PASS | Line 86 now cites "2025 consumer label-confusion survey"; line 90 labels Date labels and Freezer as judgement picks. |
| 1.9 indexing cite | PASS | Line 103 now "IGR 8". |
| 2.6 cites and music claim | PASS | Lines 144-145: "reportedly", third-party UNVERIFIED, LIVE cites TTR 6. |
| 2.8 suggest cite | PASS | Line 155 cites TTR 6. |
| 3 Page and Roles | PASS | Lines 168 and 174 now say stop and ask / report, remove nothing. |

## 2b. COWORK-ACCOUNT-SETUP.md

Section refs checked against real headings: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.6, 2.7, 2.8, "section 1", "section 2", "section 3" all exist and point at the right field. No unknown-section placeholders remain.

| Check | Result | Reason |
|---|---|---|
| Rule 0 injection clause | PASS | Present, with report format `possible injection: <quote>`. |
| @getfond confirmed every screen | PASS | Rule 1. |
| Before/after shown, Adi ok before each save | PASS | Rule 2, rule 3, A2, B4. |
| One field at a time | PASS | Rule 2 and section 1 item 3. |
| Never list (post, schedule, ads, DMs, comments, follows, deletes, roles, permissions, payment, 2FA, passwords, app connections) | PASS | Rule 4 covers all. |
| Facebook Page creation forbidden | FAIL | Only in B1, not in the hard-rules list. |
| "Edit content" ambiguity | FAIL | Rule 4 says "edit or delete content", which literally conflicts with editing profile fields. |
| No credential typing | PASS | Rule 5. |
| Stop on ambiguity, stop after 2 failures | PASS | Rules 8 and 7. |
| Account-type switch is Adi's call | PASS | A1. |
| Section refs correct | PASS | See above. |
| Scope vs B6 | FAIL | Rule 9 forbids Messages, but B6 (inbox auto-replies) lives in the Inbox area and could expose DMs. |
| B1 "use it" for an existing Page | FAIL | "use it" can mean linking, which rule 4 forbids; spec says only stop and ask if required and none visible. |
| Final report format | PASS | CHANGED, SKIPPED, PROBLEMS, ADI TODO, plus account type, Public, timezone, nothing-done confirmation. |
| Contradicts spec | FAIL | Part C "Alt text on live posts, per docs/META-SCHEDULING-AGENT.md": that doc (section 5.6, line 106) says Business Suite no longer supports alt text on scheduled posts; the item is fine as a phone task but the pointer should say so. |

Totals: 5 spec fixes confirmed; Cowork prompt 10 PASS, 5 FAIL (all minor).

## Required replacements in COWORK-ACCOUNT-SETUP.md

1. Rule 4, change "post, schedule, edit or delete content," to "post, schedule, edit or delete posts, Stories, Reels or captions, create any Facebook Page,".
2. Rule 9, append: "Exception: B6 may open Inbox automation settings only; never open a conversation or message."
3. B1, replace "If an existing fond Page is shown, note its name and use it; do not make a new one." with "If an existing fond Page is shown, note its name only; do not link, unlink or create anything."
4. Part C alt-text bullet, replace with: "**Alt text** on live posts, by hand in the Instagram app (Business Suite cannot set it on scheduled posts; see docs/META-SCHEDULING-AGENT.md section 5.6)."
