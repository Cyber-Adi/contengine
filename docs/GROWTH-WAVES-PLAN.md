# Growth Waves Plan (agent reference)

Waves of Sonnet 5.5 workers that review, edit and improve the fond pipeline so organic
growth is **sustainable**: posts go out on schedule every week, get measured, and the
measurements change what goes out next. Written 2026-10-06. Read CLAUDE.md first; its
invariants and precedence (Notion DS §3 -> tokens.json -> gtm.json -> CLAUDE.md -> docs)
win over this file.

**What "guaranteed" can honestly mean.** No pipeline can guarantee reach or followers.
What it can guarantee mechanically: (1) every week ships two on-brand, honest posts with no
gaps, (2) every post is measured a week later, (3) formats that underperform for three
posts get redesigned or retired (the kill criterion in gtm.json, enforced in decide.mjs),
and (4) nothing false or off-brand ever goes out. Growth is the expected outcome of that
loop, not a promise.

## Rules for every worker

- Orchestrator (Opus) is the only one who runs git. Workers never commit.
- Copy is verbatim, except Adi-authorized, logged mechanisms (ctaSwap, refinement B with Gate 7).
- Never loosen a gate; say "gate got stricter" or "output got worse".
- `npm test` only via `bash $CLAUDE_JOB_DIR/tmp/locked.sh npm test`.
- Budget: deterministic code first, at most one image per vision call, stop cleanly on rate limits.
- Each worker ends with a report under 30 lines: files changed, tests, open questions.

## Wave 1 · Review (parallel, read-only, ~4 workers)

| Worker | Reads | Produces |
|---|---|---|
| W1a Content audit | specs/, briefs/, gtm.json, COVERAGE.md | `out/audit/content.md`: near-duplicates (4/18, 10/24, 3/23) with a keep/drop recommendation, unsourced claims, pillar balance across the 52, which posts are save-magnets (checklists, how-tos) vs stat posts |
| W1b Visual audit | out/post-N/contact-sheet.png (one image per call, downscaled) + the 5-dimension rubric in src/critic.mjs | `out/audit/visual.md`: STOP / STAND / ARRIVE / SAVE / FAMILY scores per post, bottom 10 with slide+element citations. Report-only, uncalibrated, labelled so |
| W1c Pipeline audit | tools/, src/, WEEKLY.md, CLAUDE.md, docs/HANDOFF.md, .github/workflows | `out/audit/pipeline.md`: stale numbers in docs (15/15, 36/36, post-5 references), tap/decide behaviour with 52 ready (HOLD vs the 28-day scheduling window), weekly-tap Action against the new tests, every step Adi still does by hand |
| W1d Growth research | web (current 2026 sources only) | `out/audit/growth.md`: organic IG + TikTok practice for small faceless accounts: carousel length (up to 20), save/send drivers, first-hour behaviour, hashtag/keyword SEO, Trial Reels, posting cadence, measurement metrics available in Insights. Every claim sourced or marked UNVERIFIED |

Gate to Wave 2: orchestrator merges the four audits into `out/audit/SUMMARY.md` and asks Adi
the decisions that only Adi can make (duplicates to drop, claims to confirm, DS §3 type steps).

## Wave 2 · Edit (parallel, disjoint files, ~4 workers)

| Worker | Owns | Builds |
|---|---|---|
| W2a Schedule optimizer | tools/ready.mjs, new src/schedule.mjs | Order READY-TO-POST by (save-worthiness from W1a/W1b, pillar alternation, no near-duplicates within 6 weeks, first post back = best save-magnet). Emit `state/schedule.json` (post, date, time, platform) that both the page and META-SCHEDULING-AGENT read. Fixture: same input, same order |
| W2b Measurement loop | tools/log-post.mjs, src/decide.mjs, new docs section in WEEKLY.md | `docs/META-INSIGHTS-AGENT.md`: a read-only Claude-in-Chrome brief that reads each post's Insights 7 days after go-live (reach, saves, sends, per-slide reach for slide-3 ratio) and prints the exact `log-post.mjs` commands for Adi. decide.mjs kill criterion verified with fixtures on 3 consecutive misses |
| W2c Docs consolidation | CLAUDE.md, WEEKLY.md, docs/BACKLOG.md, README.md | HANDOFF §4 done properly: CLAUDE.md one screen with current numbers (24 gates, 53 autonomy, fidelity, package, 9005 fixture, ctaSwap, setup phase), WEEKLY.md matching the agent-based flow. No new top-level docs |
| W2d Content fixes | specs/ (only posts Adi ruled on) | Apply Adi's Wave-1 decisions: drop duplicates from the queue (mark, never delete), demote unconfirmed figures to qualitative wording only where Adi approves the wording |

Verify after Wave 2: all suites, full render of every spec, tap builds, agent briefs dry-read
against the live page.

## Wave 3 · Improve (sequential where noted)

1. **S3 critic calibration** (needs Adi, 10 min): Adi scores 31-36, critic agreement >=80% within +-1, then the critic runs as a WARN in the tap and feeds W2a ordering.
2. **S5 batch runner + S7 vault** (sequential, one worker): resumable refine runs for B copy variants; vault page with A/B pick commands. Only worth it once the critic is calibrated.
3. **TikTok cadence** (one worker): a TikTok-only schedule (3-4/week from the same vault, re-exported 9:16), plus a third-party scheduler evaluation note since TikTok's web scheduler skips photo posts. Recommendation only; Adi chooses.
4. **Publisher (HANDOFF §5.4)**: blocked until `state/performance.json` shows 4 logged weeks. Then APPROVE-not-POST design: `state/approved.json`, daily Action, public image bucket, token in Actions secrets.

## Wave 4 · Verify (parallel)

- code-reviewer on every changed file; security review of the two browser-agent briefs (no destructive clicks, no credentials, Instagram-only scope).
- Full verify loop + byte-identical re-render check + `npm run tap`.
- Orchestrator commits, pushes, updates PR #1 (or a follow-up PR), and reports the one thing Adi has to do.

## Dependencies

```
W1a,W1b,W1c,W1d (parallel) -> Adi decisions -> W2a,W2b,W2c,W2d (parallel) -> W3.1 (Adi) -> W3.2 -> W3.3 ; W3.4 gated on 4 logged weeks -> W4
```

## Risks

| Risk | Level | Mitigation |
|---|---|---|
| Sonnet usage limits mid-wave | HIGH (hit twice already) | Waves of <=4 workers; each worker resumable from its report; orchestrator finishes stragglers |
| Uncalibrated critic steers the schedule | MEDIUM | W1b is report-only; W2a uses it only as a tie-breaker until W3.1 calibration |
| Browser agents click something public | MEDIUM | Hard rules in both briefs; schedule-only, Instagram-only, verify in Planner; Wave 4 security review |
| Docs drift again | MEDIUM | W2c rewrites CLAUDE.md from live numbers; tap prints test counts |
| Chasing growth hacks that cost trust | LOW | gtm.json honesty rules and Gate 6 stay hard fails |
