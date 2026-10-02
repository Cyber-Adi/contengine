# Carousel Refinery Plan (agent reference)

Parsed from `fond_Carousel_Refinery_ECC_Execution_Plan.md` (Oct 1 2026). This file is the
working copy every agent reads. The long original is the rationale; this is the contract.
If they disagree, this file wins (it carries Adi's Oct 1 decisions), and CLAUDE.md
precedence still applies above both: Notion DS §3 -> tokens.json -> gtm.json -> CLAUDE.md -> this.

Goal: every scripted carousel ends up in `VAULT/post-N/` as a postable IG 4:5 + TikTok 9:16
package (slides, caption, alt text, tiktok.txt), passing Gates 1-7, with an optional
copy variant B that Adi picks or rejects. Nothing publishes.

---

## 0. Rules every agent obeys (read before touching anything)

1. Renderer never writes copy. Only the Refinery lane (S4) proposes copy, as variant B,
   next to verbatim A. B never ships without Adi's pick (`tools/pick.mjs`).
2. No invented numbers, entities or claims. Gate 7 enforces it in code.
3. Never publish. Never create Notion rows. Never touch Notion copy fields.
4. A gate that passes a known-bad fixture is worse than no gate. New gate = new fixture first (tdd-guide).
5. When a gate starts failing: say "gate got stricter" or "output got worse" before editing either.
   No threshold edits in tokens.json during S5/S8 batches.
6. Budget mode: deterministic code first; one downscaled image (<=1600px) per critic call;
   max 6 model calls per post; on rate limit, checkpoint and exit 0, never retry in a loop.
7. No hex outside tokens.json. No em dashes in generated text. No new top-level docs.
8. Verify loop after any change to `src/` or `tools/` (CLAUDE.md §5):
   `npm test` (15/15+) · `npm run test:autonomy` (36/36+) · `./run.sh specs/fixtures/post-9005.json` ·
   `./run.sh specs/post-49.json` · `node src/render.mjs specs/fixtures/post-9005.json --canvas=tiktok`.

## 1. Adi's decisions (Oct 1)

| Item | Decision |
|---|---|
| CTA reality (Part C §C0.1) | **Setup phase. No waitlist, no pre-order, no "link in bio" claim anywhere.** Generated text (captions, tiktok.txt, bios) ends with one line from the closed `ctas.setup` list in gtm.json (§1a): save it, follow for more, something's coming. Nothing more: no app pitch, no link promise, no date. Content stays save-worthy first; the CTA is a whisper. |
| Parallelism | Allowed. Independent slices run as parallel Sonnet 5.5 subagents in one shared worktree (see §4). |
| Invariant amendments (Part A3) | Authorized: Refinery lane may propose B; new `VAULT/` ignores the HOLD-at-6 cap; refine runs on demand only (`npm run refine`), never scheduled; renders files, never publishes. |

### 1a. Setup-phase CTA lines (closed list; additions need Adi)

Rotate deterministically by post number (`setup[postNumber % length]`). Product-voiced ("we"), dry, no em dashes,
matching every other line on the account so the CTA never reads out of character.

1. `Save this for your next grocery run. Follow for more, something's coming.`
2. `Worth saving. Follow along, we're building something for exactly this.`
3. `Save it before your fridge does the forgetting. Follow for more, something's on the way.`
4. `Keep this one. Follow for more, we're working on something for this.`

**Conflict to state out loud:** gtm.json says CTAs are product-voiced, not founder-voiced, and
its Tier 1 text is "More in the bio." Adi's decision overrides that for the setup phase. S1 encodes
it as `state/launch.json.phase = "setup"` plus a closed `ctas.setup` list in gtm.json, so the tiers
stay intact for later and flipping `phase` restores them.

## 2. Verified state (Oct 1, checked against the repo)

- 69 carousel posts in `state/ledger.json`. Specs exist for only **8**: 5, 31-36, 49.
  5 and 49 are `reconstructed-fixture` (placeholder copy, must never post).
- 51 more are "renderable" in the sense that verbatim copy exists (Notion script pages or
  `briefs/`), but **no spec file exists yet**. Converting them is part of S1.
- Gaps: 17 (no script anywhere), 47-48, 50, 52 (stale/unknown), 54-55, 63-69.
- Brief files on disk in `~/Desktop/fond stuff/`: **only 2 of the 6** the plan expects:
  - `fond_Content_Brief_Posts_44-45-46_and_Kinetic_Reel_OpportunityCost.md`
  - `fond_Content_Brief_Posts_54-55-63_and_Kinetic_Reel_56Friday.md`
  - **Missing:** 47-48-49, 50-51-52, 64-65-66, 67-68-69. Adi must find them (Claude.ai
    chat downloads, Drive, Notion attachments). Until then 47-50, 52, 64-69 stay gaps.
- Known defect: `out/post-31/PUBLISH/caption.txt` ends "Waitlist open. Link in bio." (false today).
- Tooling present: tesseract (`/opt/homebrew/bin`), Playwright chromium, `claude` CLI.
- Schema provenance enum today: `brief | converted-from-notion-script | reconstructed-fixture`.

## 3. Slice cards

Format: **goal** · files · must-pass · depends on. Subagents in brackets.

### S0 · Refinery contract (keystone, pass^3) [tdd-guide]
- Schema (`carousel.schema.json`): provenance += `refined`; optional `variant` (A|B),
  `refinedFrom` (int), `picked` (bool), `originalCopy` (per-slide verbatim A, **required when variant=B**),
  `refinement` {round, changes:[{slide, field, from, to, why}], model, at}.
- `refinery.config.json` (root): `models` {copy, critic, caption, designFix}, `batchSize:5`,
  `maxDesignRounds:2`, `maxCopyRounds:1`, critic {images:1, maxPx:1600}, `stopAtUsagePct:85`,
  `maxCallsPerPost:6`. Every model name and limit lives here, nowhere else.
- `state/refinery.json` per post: {stage: queued|designing|copy|critic|vault|picked|rejected,
  rounds, bestScores, lastError, updatedAt}. Atomic write (temp file + rename) in `src/refinery-state.mjs`.
- Paste the A3 amendment table verbatim into CLAUDE.md §4 and docs/AUTONOMOUS-ARCHITECTURE.md.
- Fixtures: B without `originalCopy` rejected; `refined` without `picked:true` never enters READY-TO-POST.
- Verify: validate good A, good B, two bad fixtures x3 (same result every time); kill -9 mid-write leaves valid JSON.

### S1 · Inventory + CTA honesty (pass^3) [tdd-guide] · after S0
- (a) Copy the 2 available briefs into `briefs/` unchanged. List the 4 missing; continue.
- (b) Generate specs, verbatim, for every post with retrievable copy: 1-16, 18-30, 37-40
  (Notion pages, `converted-from-notion-script`), 41-46, 51, 53-63 from `briefs/` (`brief`).
  Replace post-49 and post-5 fixture copy only if a real source exists (49 needs the missing
  47-49 file; 5 comes from Notion "Carousel Scripts — Posts 1–8"). Post 17 stays a gap.
  Update `specs/COVERAGE.md`. PantryPal -> fond swap is mechanical, logged.
- (c) CTA honesty:
  - `state/launch.json` {phase:"setup", waitlistLive:false, foundingMemberLive:false, checkedAt}.
  - gtm.json: add `ctas.setup` = the four lines in §1a, verbatim.
  - Gate 6 (`src/gtm-check.mjs`): in phase setup, any Tier 2/3 text in a slide or caption FAILs,
    and banned substrings += "link in bio", "waitlist", "pre-order" for generated text.
  - Caption builder emits the rotated `ctas.setup` line (or nothing for Tier 0). Never more than that one line.
  - Slide copy that verbatim contains Tier 2/3 text: mark spec `hold: "HOLD-UNTIL-LAUNCH"`, do not rewrite.
  - Re-export READY-TO-POST captions 31-36.
- Fixture: Tier 2 caption fails at waitlistLive:false, passes at true.
- Verify: `grep -ri "waitlist\|pre-order\|link in bio" READY-TO-POST VAULT` returns nothing outside HOLD posts.

### S2 · Engine quality, zero tokens (pass^3) [tdd-guide, code-reviewer] · after S0
Fixes critic's two failing dimensions: "stand" (slide 2 alone) and "arrive" (each swipe new).
- a) Rhythm gate (Gate 5 cross-slide): no 3 consecutive same background; no 2 adjacent slides with
  vertical ink centroid within 12% of frame height. `tools/rhythm.mjs` reassigns background/layout
  deterministically within the archetype's legal options; logs design-only changes to `spec.refinement`.
- b) Fill: stack-list / split-compare / quadrant-card scale to >=70% of content box (within type ceiling).
  Gate 5 fill-ratio FAIL below 55% on slide 2 only.
- c) Thread edge continuity: line thread exits right / re-enters left at same y, Gate 3 checks within 4px.
- d) OCR at 200px (tesseract) on slides 1-2: must recover the hook's longest word and every number. End of batch only.
- e) Grid-safe zone: 3:4 crop of slide 1; Gate 4 fails if hook or hero number is cut.
- f) Typographic normalizer: closed table in tokens.json (`->` to arrow, straight to curly quotes,
  ` - ` to en dash). Mechanical, logged, additions need Adi.
- g) Diagram demand audit: report only (which specs ask for visuals the engine lacks).
- Verify: re-render 31-36 three times, byte-identical; each passes rhythm + fill or the report names the slide and why.

### S3 · Blind critic + calibration (pass^2) · after S2
- `tools/critic.mjs run`: separate `claude -p --model <config.models.critic> --max-turns 2`, given ONLY the
  downscaled contact sheet + 5-dimension rubric. No spec, copy or rationale.
- Validate JSON with `validateCritique()`; one retry, then `critic-error`.
- Pairwise mode: one stacked image, randomized order, labels X/Y; de-randomize after.
- Calibration (needs Adi, 10 min): Adi scores 31-36 via `node tools/critic.mjs record`; model must agree within
  +-1 on >=80% of 30 scores, else add 3 text-only anchors and retest once. Store rate in `state/critic.json`.

### S4 · Copy refinery + Gate 7 Fidelity (gate pass^3, copy pass@2) [tdd-guide] · after S0
- `tools/refine-copy.mjs`, text-only, model from config. Input: A copy, pillar, angle, gtm.json voice/honesty, critic findings.
- Rules (in prompt AND code): same argument/thread/slide count (+-1 only on flagged dead slide); hook <=8 words/line,
  body <=40 words/slide; slide 2 stands alone; one idea per slide; zero new numbers, proper nouns or claims;
  no em dashes; keep CTA tier; "kept" and "unchanged" are valid answers.
- Gate 7 (`src/fidelity.mjs`, no model): numbers(B) subset of numbers(A) + gtm stats; proper nouns(B) subset of A;
  no banned honesty strings; word limits; slide-count rule; every change has a `why`. FAIL discards B, A continues.
- Fixtures (each must fail): invented %, new brand name, em dash, 45-word body, missing `why`.

### S5 · Batch runner + Notion writeback (pass^3) [code-reviewer] · after S1-S4
`npm run refine -- [--posts 37-43] [--batch 5] [--resume] [--dry-run]`, steps per post, state in `state/refinery.json`:
1. A spec -> validate -> Gate 6. 2. Rhythm + normalizer -> render IG -> Gates 1-6.
3. Critic A; if every dimension >=4, skip 4. 4. Design-fix rounds (layout/diagram/background/emphasis/thread only;
schema diff rejects copy changes). Keep best passing version. 5. Copy B -> Gate 7 -> A's design -> render -> gates ->
pairwise critic. 6. Package (S6) both; TikTok render for winner + A. 7. Write `VAULT/post-N/{A,B}/{ig,tiktok}/`,
caption.txt, alt.txt, tiktok.txt, critic.json, diff.md. Stage `vault`.
- Budget: check usage before each model call; at >= stopAtUsagePct or rate-limit error finish step, checkpoint,
  print `PAUSED post N step S. Resume: npm run refine -- --resume`, exit 0.
- `out/BATCH_REPORT.md`: counts per stage, gate failures grouped by gate, critic deltas, calls used.
- Notion (Content Calendar `collection://26759dfd-da4d-417e-9bbd-29ab33dd0ce0`): dry-run diff first, then
  Designed=true + Status "Designed" for vaulted posts. Never create rows.
- Verify: kill mid-step-4 then `--resume` gives byte-identical output; simulated rate limit pauses with exit 0.

### S6 · Post package (pass@2) · after S4
- IG caption: keyword in first sentence, 1-2 value lines, send-trigger, CTA = rotated `ctas.setup` line or none, 3-5 hashtags
  (1 broad, 2 niche, 1 community). No em dashes. Aim <600 chars.
- Alt text per slide from spec (no model). tiktok.txt: search-phrase title, 3-5 keyword phrases, 3 hashtags,
  "SOUND: pick a trending sound in-app".
- Everything passes Gate 6.

### S7 · VAULT page + pick tool (pass^2) · after S5, S6
- `tools/vault.mjs` -> `VAULT/index.html` (git-ignored): A/B strips, critic scores, inline diff, IG/TikTok tabs,
  copy buttons, pick commands.
- `tools/pick.mjs N A|B` / `N reject "reason"` / `--accept-critic 37-43`. Picked spec gets `picked:true` and joins
  the READY queue (HOLD cap still applies there). Rejects feed S4.

### S8 · Calibration batch, then full run · after S7
- Batch 1 = 37-43. Stop, print report + VAULT path, wait for Adi's picks.
- If Adi picks B on <2 of 7: tighten S4. If critic and Adi disagree on >=3: rerun S3 calibration.
- Then `npm run refine -- --batch 5 --resume` per usage window, pillar-balanced, until every renderable post is vaulted.

## 4. Parallel lanes (merge in this order)

Execution model (Oct 2): Sonnet 5.5 subagents build; the orchestrator verifies and is the ONLY one that runs git.
All lanes share the worktree `.claude/worktrees/refinery-plan` (branch `worktree-refinery-plan`); lanes touch
disjoint files. `npm test` writes fixture posts 9000+, so lanes run it through the shared lock:
`bash $CLAUDE_JOB_DIR/tmp/locked.sh npm test`.

```
Lane 0 (alone, first):  S0 contract
Lane A  (after S0):     S1 inventory + CTA        -> touches specs/, gtm*.mjs, gtm.json, state/launch.json
Lane B  (after S0):     S2 engine quality         -> touches tools/qa.py, src/slide-html.mjs, tools/rhythm.mjs, tokens.json
Lane C  (after S0):     S4 copy refinery + Gate 7 -> touches tools/refine-copy.mjs, src/fidelity.mjs
Then sequential:        S3 (needs B) -> S6 (needs C) -> S5 -> S7 -> S8
```
Merge A, C, then B (B is the largest diff), rerun the full verify loop after each merge.
Shared-file risk: S1 and S2 both edit the test fixture list in `tools/test_gates.py`. Resolve by appending only.

## 5. Stop and ask Adi

- Gate 7 fails or B changes the argument: discard B, ship A, never hand-patch B.
- Any threshold change in tokens.json mid-batch.
- A post needs >6 model calls: stop at best-so-far.
- Brief copy and Notion copy disagree: local brief wins (C4); log both in COVERAGE.md.
- Any colour outside the 7 tokens; any Notion DS §3 change; anything that posts publicly.

## 6. Done

1. Every post with retrievable copy is in `VAULT/` (A, plus B if it passed Gate 7), IG + TikTok + caption + alt + tiktok.txt.
2. Every vaulted variant passes Gates 1-7 incl. rhythm, fill, edge, OCR, grid-safe.
3. Critic calibration recorded at >=80% within +-1.
4. No caption, bio or slide claims a waitlist or pre-order while `launch.json.phase == "setup"`.
5. Posts 5 and 49 carry real copy or stay excluded; 17 listed as a gap.
6. Notion shows Designed for vaulted posts. 7. All fixtures pass; byte-identical re-renders. 8. Paused runs resume cleanly.

## 7. Human playbook, setup phase (Part C, adjusted for the CTA decision)

- **Bios use the setup line, not "waitlist" or "App coming soon".**
  - IG name: `fond | stop wasting groceries`
  - IG bio: `The average family of 4 bins $2,913 of food a year (EPA). Save-worthy fixes for where it goes. Follow along, something's coming.` (128 chars, limit 150)
  - IG link: none until getfond.app is live.
  - TikTok name: `fond | food waste, fixed` · bio: `Fridge fixes + store secrets. Follow along, something's coming.` (63 chars, limit 80)
- IG reactivation: 5 warm-up days (profile, 20-30 niche follows, 5-10 real comments/day, 2-3 Stories), then 2
  carousels/week Tue/Thu; reply to every comment in the first hour; log Insights after a week (`log-post.mjs`).
- TikTok: personal account (Business requires 18+), Photo mode with 9:16 renders, trending sound in-app, 4 warm-up
  days of niche scrolling before the first post, 3-4 photo posts/week.
- Adi only: picking A vs B, trending sounds, comment replies, Post 17's brief, the 4 missing brief files.
