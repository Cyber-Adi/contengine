# MOMENTUM.md — the directive for Claude Code

Everything Claude Code needs to turn this from a renderer into a machine that keeps
moving without you steering it. **Read `CLAUDE.md` and `AUTONOMOUS-ARCHITECTURE.md`
first.** This file is the operating instruction on top of them.

Verified end to end 2026-09-20 in a clean container on a fresh Chromium.

---

## 0 · Where things actually stand

| | |
|---|---|
| post-5, post-49 | **PASS**, 0 fails, both canvases |
| Gate fixtures | **15/15** |
| Autonomy fixtures | **20/20** |
| Renderable posts with copy | **59** of 69 |
| Specs built | **2** |
| **Published, ever** | **0** |
| **Measured, ever** | **0** |

Eight days passed between the last two sessions and **not one number changed.** The
engine is not the problem. It has been ready the whole time.

---

## 1 · The three-machine problem — the thing that was actually blocking everything

There are three places code can run and only one of them can do the whole job.

| | Sees the repo? | Has a browser? | Verdict |
|---|---|---|---|
| **Cloud scheduled task** | no | yes | can research and write to Notion. Cannot render. |
| **Mac desktop sandbox** (`device_bash`) | yes | **no, and cannot get one** — `cdn.playwright.dev` returns 403 through the egress proxy, so `npx playwright install` will never succeed there | can think, cannot render |
| **Claude Code on your Mac, natively** | **yes** | **yes** — normal network, normal install | **the only place the whole loop runs in one piece** |

This is why nothing moved. The two cloud tasks physically could not render, so the only
action available to either was writing another script — the six-week failure, reproduced
at the infrastructure layer rather than in the prompt.

A weekly scheduled task now exists (**"fond — run the loop (drains the queue, renders via
cloud)"**, Sundays 16:00 UTC) which bridges the gap: it thinks on the Mac via `device_bash`
and renders in the cloud container, copying results back. That bridge is proven — this
session used it to re-render post-49 and land it on your disk. **But the task is not bound
to your computer**, and binding needs your approval in the app; it cannot be granted from a
session. Two attempts, both refused with `no_signed_approval`.

**So: the scheduled task is the nice-to-have. Claude Code on your Mac is the load-bearing
path, and it needs nothing from anyone.** Everything below is written for it.

---

## 2 · The weekly prompt — paste this into Claude Code, nothing else

```
Read MOMENTUM.md, CLAUDE.md and AUTONOMOUS-ARCHITECTURE.md.

Run `npm run decide`. Do the ONE action it names and only that action. If you
think the ladder is wrong, say so — do not quietly act on the disagreement.

Copy is verbatim, always. Never write, rewrite or tighten a line of slide copy.
Missing copy gets flagged, never filled.

When you are done: re-run `npm run decide`, run `npm test` (15/15) and
`npm run test:autonomy` (20/20), and tell me the one thing I have to do myself.
```

That is the whole interface. The ladder decides; you do not have to.

**First-time setup, once:** `npx playwright install chromium`

---

## 3 · The build queue — in order, with acceptance criteria

Work these top-down. Each one is written so "done" is checkable, not a matter of opinion.

### M1 · Drain 15 posts into specs  ·  the single highest-value thing in this file
> **IN PROGRESS — Adi handed M1 to Claude Code on 2026-09-20.** Do not start it in a second
> session and do not let a scheduled run pick it up: two agents writing into `specs/` at once
> will produce duplicate or half-converted posts and neither will know. If `npm run decide`
> says `BUILD_SPECS` and M1 is still marked in progress here, the correct action is to report
> that and stop. Clear this note when the 15 specs exist.
`npm run decide` says `BUILD_SPECS` and it is right: **57 posts have verbatim copy and no
spec.** That is the entire backlog, sitting one mechanical conversion away from renderable.

`specs/COVERAGE.md` says which posts and where the copy lives. Do them in batches of five,
render each batch, then move on. Verbatim copy, honest provenance, `gtmAngle` set, both
canvases.

**Done when:** 15 new specs exist, all validate, all pass gates 1–6, all render at both
canvases, and `npm run decide` has moved off `BUILD_SPECS`.

**Why first:** everything downstream is gated on inventory. You cannot test a posting
cadence with two posts, one of which is a fixture.

### M2 · Replace the two fixtures
`post-5` and `post-49` both pass every gate and both carry `provenance:
"reconstructed-fixture"` — copy assembled to exercise the pipeline, not the real brief.
`tools/export-post.mjs` refuses them, and the ladder now refuses them too.

**Done when:** both carry real brief copy, provenance is honest, both still PASS.

### M3 · Post three carousels, by hand, a week apart
```bash
node tools/export-post.mjs 49          # -> out/post-49/PUBLISH/
node tools/log-post.mjs 49 --published # same day
```
`PUBLISH/` holds numbered slides, a caption, and POST-ME.txt. AirDrop, post, paste.

**Do not automate this yet.** Instagram publishing (BACKLOG P4.1) stays unbuilt until a
manual cadence has held for a month, because automating a cadence nobody has run means
debugging an API instead of posting. Zero posts have ever gone out of this engine.

**Done when:** three posts are live and `state/performance.json` has three publish dates.

### M4 · Log the numbers — this is what makes it a loop
```bash
node tools/log-post.mjs 49 --reach 1240 --saves 41 --sends 18 --slide3 0.42
```
`--slide3` is swipe-through to slide 3: slide-3 reach ÷ slide-1 reach, off Instagram's
per-slide graph. Strategy v2 calls it the primary metric and **it has never once been
logged.** It is the closest proxy for "a stranger stopped."

Under three measured posts the loop refuses to claim a signal, and it is right to. Two
posts is anecdote.

**Done when:** three posts have reach, saves, sends and slide3, and `npm run decide` reports
a median instead of "0 measured".

### M5 · First harvest
`state/freshness.json` is empty, so the entropy guard refuses every new concept — by design.
Fill it from the free stack in `gtm.json`. Deliverable: 5 hooks working, 2 formats gaining,
1 dying format to avoid.

**Done when:** the pool has live items and `npm run decide` stops returning `HARVEST`.

### M6 · The vision critic (BACKLOG P2.2) — the last real gap
Six gates prove a slide is contained, on-palette, threaded, legible at 200px,
compositionally sound and on-message. **None of them can tell you it is worth following.**

Build it as a separate pass that has NOT seen the work being produced: read
`contact-sheet.png` and `thumbs.png` with vision, score 1–5 on STOP (does slide 1 open a
loop at thumbnail scale) · STAND (does slide 2 work alone — Instagram re-serves carousels
showing it first) · ARRIVE (does each swipe feel like a new place) · SAVE (is there a
screenshot slide) · FAMILY (does it look like the same account).

Calibrate against `baseline/` — which per CORRECTIONS C2 means **approved renders from this
engine**, never the old Instagram exports. Cite slide number and concrete element for every
score below 4.

**One thing to look at first, from reviewing post-5 by eye:** slide 1 is five lines of
Playfair. A good sentence and a weak thumbnail. Slide 2's `$2,913/yr` hero number would stop
a scroll far harder. If the critic does not notice that, the rubric is wrong.

### M7 · Then, and only then, publishing automation
Once three posts are live and measured, P4.1 becomes worth building. Not before.

---

## 4 · What makes it perpetual

Three flywheels, each feeding the next. The system is only self-sustaining when all three
turn; right now the first is stalled at inventory and the other two have never turned once.

1. **Drain** — copy → spec → render → PASS. Fully automated, 6.3s per carousel. Needs M1.
2. **Attention** — export → post → the account grows. One human tap. Needs M3.
3. **Analytics** — log → median → the measured signal picks the next angle → back into
   drain. Needs M4.

The entropy guard sits across the whole thing, refusing any concept that is a recombination
of the last twelve or that cites nothing from outside the account's own history. That is
what stops the machine from converging on itself once it does start turning.

---

## 5 · Scheduled-task hygiene — worth ten minutes

There are now eight tasks and several are not healthy:

| Task | State | What to do |
|---|---|---|
| `fond — run the loop` | **not bound to your Mac** | approve the device binding, or rely on Claude Code |
| `fond — ICP language mining` | fired Sep 13, finished Sep **15** — over two days | it is hanging, not working. Cap its scope or retire it |
| `Weekly DJ Crate` | **ABANDONED** Sep 14, never finished | unrelated to fond, but it is burning runs |
| `Network web weaver` | **never fired** | check or delete |
| `Fond weekly pipeline refresh` | **never fired** | check or delete — and it overlaps the loop task |
| `Fond morning command brief` | daily, healthy | fine |
| `Fond trend radar` | weekly, healthy | this is your harvest feed — point it at `state/freshness.json` |
| `fond — hook + carousel script` | healthy, drain-gated | fine, but it is filling a queue that is not draining |

**Two tasks that have never fired and one that runs for two days are not automation, they
are decoration.** More scheduled tasks is not more momentum; it is more surface area where
silent failure hides. Every one of them should report a count even when the count is zero,
because a silent success and a silent failure look identical from outside.

---

## 6 · The rules none of this changes

- Copy is verbatim. The engine never writes a line of slide copy.
- Never invent a statistic. Unsourceable figures render qualitatively, never as hero type.
- fond is pre-launch: no user counts, no customers, no traction claims.
- No hex literal outside `tokens.json`. No positioning claim outside `gtm.json`.
- When a gate starts failing something it used to pass, say **whether the gate got stricter
  or the output got worse** before changing either. Five gate bugs have been found this way.
- A gate that passes a known-bad fixture is worse than no gate. New gate, new fixture.
- This repo renders files. It does not publish.
