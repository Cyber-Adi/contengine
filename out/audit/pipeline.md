# Pipeline audit (Wave 1c, read-only)

Verified 2026-10-07 in the refinery-plan worktree. Run results: test:fidelity 26/26, test:package 10/10, test:autonomy 53/53. `npm run decide` prints PUBLISH (52 ready, 0 measured).

## 1. Stale facts in docs

| File:line | Says | Now |
|---|---|---|
| CLAUDE.md:115 | `npm test` "15/15 gates" | 24 |
| CLAUDE.md:226 | `npm test` 15/15, `test:autonomy` 36/36 | 24 / 53; add test:fidelity 26 and test:package 10 (or `npm run test:all`) |
| CLAUDE.md:150 | test_gates.py "10 deliberately broken slides" | now 24 checks |
| CLAUDE.md:116 | `./run.sh specs/post-5.json` as the diagram fixture | specs/fixtures/post-9005.json (CAROUSEL-REFINERY-PLAN.md:27 already uses it) |
| CLAUDE.md:114-118 | verify loop omits fidelity and package suites | add both |
| CLAUDE.md:180; WEEKLY.md:29; tools/ready.mjs:7 and :209 | "six gates" | Gate 7 (fidelity) now exists for refined variants; say so |
| CLAUDE.md:88 | "Waitlist only" | setup phase: no waitlist, pre-order or "link in bio" (src/gtm.mjs:70, :84-102, state/launch.json); ctaSwap is the logged mechanism |
| CLAUDE.md:161, :228 | briefs/ "EMPTY, blocks Slice 1"; checklist item 3 | 52 posts are ready; contradicts the board |
| CLAUDE.md:105; AUTONOMOUS-ARCHITECTURE.md:309 | "HOLD at >=6 ready-unscheduled kept" | unworkable with 52 ready (section 2) |
| CLAUDE.md:206; HANDOFF.md:62 | "never reads Notion" | CLAUDE.md:206 is amended history (fine); HANDOFF.md:62 lists it as a phrase to purge |
| docs/HANDOFF.md:20, :26 | test:autonomy 28/28 | 53 |
| docs/HANDOFF.md:28 | `./run.sh specs/post-5.json` | specs/fixtures/post-9005.json |
| docs/HANDOFF.md:62-71 | "five gates", "10/10", FIX_SPEC posts 31/33, "drain 5 per tap" | dated; all drained |
| docs/AUTONOMOUS-ARCHITECTURE.md:5 | autonomy tests 18/18 | 53 |
| docs/AUTONOMOUS-ARCHITECTURE.md:30 | "five gates" | six + Gate 7 |
| docs/AUTONOMOUS-ARCHITECTURE.md:95 | `npm run gtm specs/post-5.json` | not the fixture now |
| docs/AUTONOMOUS-ARCHITECTURE.md:133, :158 | "run it today, FIX_QA, post-49 fails" | decide now says PUBLISH |
| docs/CAROUSEL-REFINERY-PLAN.md:27 | 15/15+ and 36/36+ | 24 and 53 |
| docs/CAROUSEL-REFINERY-PLAN.md:99 | spec field `hold: "HOLD-UNTIL-LAUNCH"` | superseded: src/test-autonomy.mjs:298 asserts `hold` removed and ctaSwap logged (src/gtm-check.mjs:56-65) |
| WEEKLY.md:111 | HOLD = "six or more ready, machine stops until you schedule" | see section 2 |
| WEEKLY.md:24 | "Sunday Tap task at 10am ET" | HANDOFF says no new scheduled tasks; verify it still exists |
| WEEKLY.md:3, :56 | "~20 minutes", "holds at most a few weeks" | true for one 28-day Meta batch only |
| .github/workflows/weekly-tap.yml name | "weekly tap" | cron is daily (0 9 * * *) |

## 2. Behaviour gaps

**HOLD rule.** src/decide.mjs:96 `READY_CEILING = 6`; :138 returns HOLD when `machineOnly && publishable.length >= 6`. tools/tap.mjs calls `decide({ledger, machineOnly:true})`, so with 52 ready the MACHINE line is permanently HOLD and every later rung is unreachable (RENDER, BUILD_SPECS, RETIRE_FORMAT, HARVEST, GENERATE). Consequences:
- Scheduling 8 posts leaves 44 >= 6, so HOLD does not clear for roughly 22 weeks.
- HOLD text says "bottleneck is scheduling, Adi's" even after Adi has filled the 28-day window.
- The kill criterion (RETIRE_FORMAT rung) is shadowed by HOLD in machine mode.
- Human-mode CLI (`npm run decide`, skips HOLD) says PUBLISH with "node tools/export-post.mjs 1 ... then post": outdated, tap already exports and the real step is the Meta agent (decide.mjs:143-146).

Proposed rule: measure scheduling debt, not queue size.
- `windowDebt` = ready posts with a slot date inside the next 28 days not yet logged scheduled.
- `windowDebt > 0`: human action SCHEDULE (blocked on Adi, names the count and oldest slot date).
- `windowDebt == 0` and backlog >= 6: HOLD only the copy-generating rungs (GENERATE, BUILD_SPECS, REQUEST_BRIEFS) with text "window full, N posts of runway = N/2 weeks". FIX_*, RETIRE_FORMAT, HARVEST, MEASURE stay above HOLD.
- Update test-autonomy.mjs:160-164 (asserts 6 ready -> HOLD) and WEEKLY.md:111.

**`--scheduled-all` with a partial window: NOT handled.** tools/log-post.mjs:26-43 regex-parses every `node tools/log-post.mjs N --published --date D` line in READY-TO-POST/SCHEDULE.txt. tools/ready.mjs writes a card and a SCHEDULE.txt line for all 52 candidates (slots loop sized to `ordered.length`). If the Meta agent schedules only the first ~8, `--scheduled-all` marks all 52 published with dates out to about 26 weeks. The other 44 vanish from READY-TO-POST, waiting-since clears, and the tap later asks for metrics on posts that never went out. META-SCHEDULING-AGENT.md:115-119 says to use per-post commands for partial runs, but WEEKLY.md:44-54 and tools/tap.mjs:111 say `--scheduled-all` unconditionally. Fix: add `--through DATE` (default today+28d) or `--posts`, and split SCHEDULE.txt into a "SCHEDULE NOW" block and a "LATER" block with mark-commands only in the first.

Related: ready.mjs recomputes slots from `new Date()` every run. If the daily Action (or Adi's tap) runs between the agent scheduling and Adi logging, slot dates shift to the next Tue/Thu and `--scheduled-all` logs dates that disagree with Meta. Persist slots (like state/waiting-since.json).

**Weekly GitHub Action vs new suites.** weekly-tap.yml: `npm ci`, playwright chromium, apt tesseract-ocr, pip pillow numpy pytesseract, then `npm run tap` only. It runs no test suite at all, so a gate regression ships in the daily commit unchecked.
- test:fidelity and test:package are pure node, read tracked specs (post-32.json and every tracked post spec), need no browser or tesseract: would pass in CI (pass locally).
- test:autonomy: passes locally; I did not verify it is independent of mutable state/ files that tap rewrites (ledger.json, waiting-since.json are modified in git status). Check before adding to CI.
- `npm test` (tools/test_gates.py) loads specs/post-49.json (tracked) and writes fixtures that match .gitignore `specs/post-9[0-9][0-9][0-9]*.json` and `out/post-9[0-9][0-9][0-9]*/`, so the gitignore change does not break it and `git add -A -- out/ specs/ state/` will not commit them. tap.mjs:25 filters `n < 9000`, so tracked specs/fixtures/post-9005.json is outside the tap loop. Needs tesseract (installed in the yml).
- node_modules: untracked and ignored; `npm ci` installs it. No assumption of a committed copy. Needs package-lock.json tracked (not checked).
- Repo growth: the Action commits out/ including PUBLISH folders (919 tracked PUBLISH files); unbounded per new render.
- The commit filter only suppresses a ledger.json-only timestamp diff; a waiting-since.json change alone would commit.
Recommendation: add a step running `npm run test:all` before the tap.

**Kill criterion: fires in code, with caveats.** src/decide.mjs performanceSignal (lines ~44-83): needs >= 3 measured posts (`reach > 0`); score = `(saves + sendWeight*sends)/reach`; groups by `p.format || p.archetype`; a format retires when it has >= `gtm.organicMetrics.killCriterion.consecutiveMisses` (3, gtm.json:233-235) posts and the last 3 (by publishedAt) all score below the leave-one-format-out median (decide.mjs:72-80). It is surfaced as RETIRE_FORMAT at decide.mjs ~:180. Gaps:
1. It is a saves+sends composite, not a save rate; swipeToSlide3 (WEEKLY's "primary metric") is ignored.
2. `format` = `slides[0].layout` (tools/log-post.mjs:63), the opening layout, a weak proxy; few layouts will reach 3 posts.
3. A post logged with reach but no saves/sends scores 0 and counts as a miss.
4. With one format only, `others` is empty and baseline falls back to the global median (the failure its own comment describes).
5. Shadowed by HOLD (machine mode) and PUBLISH/MEASURE (human mode) before it can surface.
6. `publishedAt` is the planned `--date`, so ordering and lag use scheduled, not actual, dates.

## 3. Steps Adi still does by hand

| Step | Automatable | By |
|---|---|---|
| Open Claude Code and paste the tap prompt (WEEKLY:15-22) | yes | scheduled cloud agent or the existing Action |
| Open READY-TO-POST, upload slides, paste caption, schedule in Meta | mostly | Claude in Chrome agent (META-SCHEDULING-AGENT.md); blocker is the OS file picker, so Adi must drag PNGs |
| Alt text on scheduled posts (Meta dropped support) | partly | browser agent in the Instagram app/web after go-live; else accept auto alt text |
| `log-post.mjs --scheduled-all` | yes | script ingesting the agent's report (after the section 2 fix) |
| TikTok from phone with trending sound | not fully | no web scheduler for photo posts |
| Read Insights, run `log-post.mjs N --reach --saves --sends --slide3` | yes | browser agent on the Insights page (per-slide reach is in-app) or Graph API once Professional account is set; tap already prints the command |
| CHECK-FIRST: confirm a source for an unsourced hero number | no | judgment, keep human |
| Paste Trend Radar JSON into state/freshness.json (HARVEST); add briefs | partly | an agent that already reads Notion |
| Monthly read ("would you follow this") | no | human by design |
| `git pull` + local tap to see READY-TO-POST (git-ignored) | yes | Action uploads READY-TO-POST as a zip artifact |
| One-time: Professional account, playwright install | no | one-off |

## 4. Top 8 fixes, by impact

1. Make `--scheduled-all` window-aware (`--through DATE` / `--posts`; split SCHEDULE.txt into NOW and LATER). Stops 44 unposted posts being marked published.
2. Replace the count-based HOLD (decide.mjs:96, :138) with a window-debt rule that emits SCHEDULE and no longer shadows FIX/RETIRE/HARVEST rungs; update test-autonomy.mjs:160-164 and WEEKLY.md:111.
3. Add `npm run test:all` to weekly-tap.yml before the tap.
4. Persist slot dates (state/slots.json) so reruns cannot shift dates between scheduling and logging.
5. Update CLAUDE.md verify loop and checklist (15/15, 36/36, post-5, briefs EMPTY, "six gates", "Waitlist only") and the HANDOFF, AUTONOMOUS-ARCHITECTURE, CAROUSEL-REFINERY-PLAN numbers in section 1.
6. Rework the kill criterion: real save rate and slide-3 reach, a true format field (not slides[0].layout), missing saves/sends = unmeasured not zero.
7. Make human-mode `npm run decide` say SCHEDULE with the window count and point at the Meta agent, not "export then post".
8. Close the metrics loop: Insights-reading browser/Graph step feeding log-post.mjs, and publish READY-TO-POST as an Action artifact.
