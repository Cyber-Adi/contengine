# HANDOFF.md — for Claude Code, when your current build finishes

Adi asked you to make this pipeline as autonomous as possible. While you worked, a
parallel session changed the engine. **Before you merge anything, reconcile against
this file.** It is short on purpose: the repo already has too many documents, and
"we've been through a lot of back and forth" is the problem being solved.

---

## 1 · What changed underneath you (2026-09-20 → 09-22)

| | |
|---|---|
| `npm run tap` | The weekly entry point. Validates every spec, renders, exports, builds `READY-TO-POST/`, then prints YOUR PART (human) and MACHINE (you). |
| `READY-TO-POST/index.html` | Where Adi schedules from. Regenerated every tap. Posts slotted Tue/Thu, pillars alternated. **Git-ignored.** |
| `decide({ machineOnly: true })` | Never returns a human action. New rungs: `FIX_SPEC` (schema-invalid but gate-passing), `HOLD` (≥6 ready and unscheduled). `MEASURE` only fires a week after go-live. |
| Schema | Layout-conditional content: `split-compare`, `stack-list`, `timeline`, `quadrant-card` must carry their items. post-31/33 shipped empty panels past all six gates before this. |
| `log-post.mjs --date` | Records a *scheduled* post with its real go-live date. |
| Captions | A hero-number slide 1 now leads the caption with its number. |
| Fixtures | `npm run test:autonomy` — **28/28**. |

## 2 · Acceptance checks — your build is not done until all pass

```bash
npm test                 # image-gate fixtures, each catches its own failure
npm run test:autonomy    # 28+ and none removed
npm run tap              # completes; READY-TO-POST/ builds; MACHINE line is a machine action
./run.sh specs/post-5.json && ./run.sh specs/post-49.json   # both PASS
git status               # clean, committed
```

**If any fixture you did not write starts failing, say whether the gate got stricter or
the output got worse before changing either.** Eight defects in this repo were found by
holding that line. Never delete or loosen a fixture to make your build pass.

## 3 · Invariants — do not break these, whatever you built

1. **Copy is verbatim.** The engine never writes, rewrites or tightens slide copy.
2. **The engine never publishes.** No Instagram API calls until Adi has held a manual
   cadence for four weeks (`state/performance.json` will show it). Scheduling is his.
3. **Generating new copy is the lowest rung.** Draining existing copy always comes first.
4. **No new scheduled tasks.** There are eight; several were broken by being too big.
   Extend an existing one or put the logic in the tap.
5. **No new top-level docs.** See §4.
6. **No hex outside `tokens.json`; no positioning claim outside `gtm.json`.**
7. **A gate that passes a known-bad fixture is worse than no gate.** New check, new fixture.
8. **Every scheduled task reports a count, even zero.** Silent success = silent failure.

## 4 · Consolidate the docs — once, after your build merges

The root has ~16 markdown files, and they disagree in places because each was written to
correct the last. Make it definitive:

**Keep at root:** `CLAUDE.md` (the router — rewrite it), `WEEKLY.md` (Adi's job), `README.md`.
**Move to `docs/`:** `MOMENTUM.md`, `AUTONOMOUS-ARCHITECTURE.md`, `PIPELINE-AUDIT.md`,
`BACKLOG.md`, `ECC-PLAN-V2.md`, `CONTRAST-AUDIT.md`, `GITHUB-SETUP.md`, this file.
**Move to `docs/archive/`:** `CORRECTIONS.md`, `INITIALIZATION.md`, `START-HERE.md`,
`SETUP-STATUS.md`, the V1 plan. Their content is either superseded or folded into CLAUDE.md.

Rewrite `CLAUDE.md` to one screen: what the repo is, the invariants in §3, the tap as the
entry point, where each thing lives, the verify loop. Fix every stale number in it (it
still says "five gates", "10/10", "never reads Notion", "BOSS baseline" in places).
Update any path references in `src/`, `tools/`, and the scheduled-task prompts
(they reference `CLAUDE.md`, `WEEKLY.md`, `MOMENTUM.md` — keep the first two at root).

## 5 · The machine queue, in order

1. **`FIX_SPEC` — posts 31 and 33.** Slides 2 and 5 are `split-compare` with no
   `copy.items`. Restore the panel content verbatim from `briefs/`. If the brief has none,
   change the layout; never write panel copy.
2. **Drain 5 posts per weekly tap** until `specs/COVERAGE.md` is exhausted. `HOLD` will stop
   you when six are waiting on Adi — respect it.
3. **The vision critic** (BACKLOG P2.2). Six gates prove a slide is well made; none say it's
   worth following. Score contact sheets 1–5 on STOP / STAND / ARRIVE / SAVE / FAMILY, cite
   the slide and element for anything under 4. Wire it as a WARN into the tap. Calibrate on
   `out/` renders Adi has scheduled, never on old Instagram exports.
4. **Only after four weeks of logged posts:** the Instagram Graph API publisher (BACKLOG P4.1)
   and Insights ingest (P4.2). Not before — until then you'd be debugging an API instead of
   learning what posts work.

## 6 · Report back to Adi in this shape

What you built (one line each) · what you merged vs. set aside after reading this ·
acceptance-check counts · the docs consolidation done or not · **the one thing he has to do.**
