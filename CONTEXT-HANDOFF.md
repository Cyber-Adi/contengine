# CONTEXT-HANDOFF.md
**fond carousel engine · handoff from a long Cowork thread · 2026-09-25**

You are picking up a content pipeline mid-flight. Everything below is verified, not
remembered — every number was read off the machine on the date shown. Read it once,
then run the verification prompt at the bottom before changing anything.

Repo: `~/Desktop/contengine` on Adi's Mac · `github.com/Cyber-Adi/contengine` (private).

---

## 1 · What this is

A renderer that turns a JSON spec into publishable Instagram (4:5) and TikTok (9:16)
carousels for **@getfond**, a faceless value-first food-waste account, and **proves they
are on-brand mechanically** rather than by anyone eyeballing them. fond is a pre-launch
iOS app. Adi is a solo high-school founder.

**The failure it exists to fix:** from 22 Jul to 26 Aug 2026 a scheduled task produced
three carousel briefs a week for six weeks. Scripted posts went 62 → 75. Posts actually
*designed* never moved off 8. Every weekly log correctly identified rendering as the
bottleneck and then produced more scripts anyway.

That pattern is the thing to watch for. It has since recurred twice in new costumes:
once at the infrastructure layer (the loop was built with no machine that could run it),
and once at the scheduling stage (posts render, nobody schedules them). **When in doubt,
the right move is almost never "make more."**

---

## 2 · State as of 2026-09-25

```
gap         10    no retrievable copy (blocked on Adi, never written by the engine)
scripted    51    verbatim copy exists, no spec yet
approved     8    passes all six gates
published    0    ← has never moved
measured     0    ← has never moved
```

- **6 carousels are rendered, exported and waiting to be scheduled.** They have been
  waiting since 20 Sep. The tap re-dates them forward each run, so the list looks fresh
  while nothing happens — do not read the dates as progress.
- Gate fixtures pass; autonomy fixtures were **28/28** at last report. Verify both.
- The ladder returns **HOLD**: six ready and unscheduled against a ceiling of six.
  Building more specs here would be the six-week failure moved one stage later. The hold
  is correct. Do not raise the ceiling to make the machine look busy.

**The single fact that matters: nothing has ever been posted, so nothing has ever been
measured, so every claim about what works on this account is a guess.**

---

## 3 · Architecture, briefly

**`npm run tap`** is the only entry point. It validates every spec, renders what needs
it, runs QA, exports publishable posts into `READY-TO-POST/`, reconciles the ledger, and
prints two lists: YOUR PART (human) and MACHINE (next agent action).

**The decision ladder** (`src/decide.mjs`) returns exactly one action — the binding
constraint. Generating new copy is the *lowest* rung, deliberately.

```
FIX_QA → PUBLISH → REPLACE_FIXTURE → FIX_SPEC → MEASURE → RENDER
       → BUILD_SPECS → RETIRE_FORMAT → HARVEST → REQUEST_BRIEFS → HOLD → GENERATE
```

**Six gates.** 1 Structural · 2 Pixel conformance · 3 Thread continuity · 4 Thumbnail
legibility at 200px · 5 Optical composition · 6 GTM conformance. Gate 6 runs *before*
the renderer, so a message violation costs zero pixels.

**Two contracts.** `tokens.json` holds the design system — no hex literal exists
anywhere else, so colour drift is structurally impossible. `gtm.json` does the same for
message: positioning line, the three angles with sourced numbers, pre-launch honesty as
machine-checkable banned phrases, CTA text per tier.

**Three machines, and only one can do the whole job** — this caused a week of total
stagnation before it was diagnosed:

| | sees the repo | has a browser |
|---|---|---|
| cloud scheduled task | no | yes |
| Mac desktop sandbox (`device_bash`) | yes | **no, and cannot get one** — `cdn.playwright.dev` is blocked |
| Claude Code on the Mac | yes | yes |
| **GitHub Actions** | **yes** | **yes** |

GitHub Actions resolved it. `.github/workflows/weekly-tap.yml` runs daily at 09:00 UTC,
installs Chromium and Tesseract on a clean runner, runs the tap, and pushes back what it
produced. Verified working end to end. It never publishes.

`READY-TO-POST/` is **git-ignored** — built locally by the tap, so it does not appear on
GitHub. After the Action pushes, Adi must `git pull` then `npm run tap` to see it.

---

## 4 · Invariants. Breaking one is a build failure, not a style note.

1. **Copy is verbatim.** The engine never writes, rewrites or tightens slide copy. A
   brief missing copy gets flagged, never filled.
2. **Never invent a statistic.** A figure traceable only to blogs or survey aggregation
   renders qualitatively ("roughly three in four"), never as hero type.
3. **fond is pre-launch.** No user counts, no "customers", no traction claims.
4. **The engine never publishes.** No Instagram API until four weeks of manual cadence
   show up in `state/performance.json`.
5. **No hex outside `tokens.json`. No positioning claim outside `gtm.json`.**
6. **When a gate starts failing something it used to pass, say whether THE GATE GOT
   STRICTER OR THE OUTPUT GOT WORSE before changing either.** Eight defects were found by
   holding that line. Never loosen a gate silently.
7. **A gate that passes a known-bad fixture is worse than no gate.** New check, new
   fixture.
8. **No new scheduled tasks** (there are eight; several broke by being too big) and **no
   new top-level docs** (there are sixteen; consolidation is queued).
9. Every scheduled task reports a count even when it is zero. A silent success and a
   silent failure look identical from outside.

---

## 5 · Defects found so far — the pattern is worth knowing

Eight, and the useful generalisation is that **most were the gate being wrong, not the
output**, and the rest were invisible because nothing was looking.

- Word count ran on a truncated 80-char preview: a 55-word paragraph measured as 16.
- Contrast read CSS `color` on SVG text, which paints with `fill`.
- Boldness guessed from class-name substrings.
- Contrast compared against the slide background, not the local surface.
- **A px-rescale regex rewrote digits inside base64 font data.** Dormant while the canvas
  was 1080 (scale factor exactly 1, so every replacement was byte-identical); fatal the
  moment it became 1440. Symptom was a bare `NetworkError` naming nothing.
- `.slide` had no explicit height and happened to match the canvas at 1080. At 1800 tall,
  every slide carried 25% bare white.
- Chrome type was never scaled with the canvas, so it silently shrank.
- **`split-compare` slides with no `copy.items` rendered two empty bordered boxes and
  passed all six gates.** Every gate measures what *is* on a slide; none could see what
  was supposed to be there and wasn't. Fixed with layout-conditional schema rules.

---

## 6 · THE OPEN DESIGN QUESTION — read this before you touch anything else

Adi's words: *"the design of these needs to be legible and on point, because if this
renderer is not good enough, or if not one real image is used, it can look bleak."*

He is right to worry, and this is the most important unresolved thing in the project.

**What is true today.** The output is genuinely handsome — editorial, typographically
careful, with five working diagram primitives (bar-compare, before-after, shelf-map,
flow-loop, and a receipt metaphor object). Two carousels reviewed by eye read as
professional and postable. But it is **100% flat vector and type. There is not one
photograph anywhere, by rule.**

**The rule is deliberate.** Notion Design System §3.8 forbids photography, photorealistic
renders, gradients, shadows, bevels and glassmorphism. That constraint is why the account
looks coherent and why a machine can verify it — you cannot mechanically check whether a
photo is on-brand.

**The honest tension:** on a food account, an all-vector feed can read as cold. Food is a
sensory category and the competition is photographic. Nobody has tested whether fond's
look stops a scroll, because **zero posts have gone out.**

**So: do not resolve this by taste. Resolve it by evidence, in this order.**

1. **Ship the six that exist.** Four weeks of real reach, saves, sends and
   swipe-through-to-slide-3 will answer the question better than any opinion. Changing
   the design system before a single measurement exists would be guessing twice.
2. **Meanwhile, build the vision critic** (BACKLOG P2.2) — the one gap the six gates
   cannot cover. Score contact sheets 1–5 on STOP (does slide 1 open a loop at thumbnail
   scale) · STAND (does slide 2 work alone — Instagram re-serves carousels showing it
   first) · ARRIVE · SAVE · FAMILY. Cite the slide and the element for anything under 4.
   Run it as a pass that has **not** seen the work being produced.
3. **A known weak point to check first:** post-5's slide 1 is five lines of Playfair. A
   good sentence and a poor thumbnail. Slide 2's `$2,913/yr` hero number would stop a
   scroll far harder. If the critic does not catch that, the rubric is wrong.
4. **If the evidence says the look is too cold**, the change is a Design System amendment
   and a **hard stop that must go to Adi** — never a unilateral edit. The options worth
   putting to him, cheapest first: more scale contrast and hero numbers; a constrained
   photographic treatment (single duotone in palette tokens, or high-contrast grain) that
   a gate could still verify; or real photography on hook slides only. The middle option
   preserves mechanical verifiability; full photography does not.

**Also still open:** `CONTRAST-AUDIT.md` records that four of seven palette tokens fail
WCAG AA on at least one legal background, and the palette has **no legible way to express
"caution" on a light slide**. Harvest Gold is 2.01:1 on Off-White. The renderer currently
substitutes a legal token and the gate reports the substitution, so nothing ships
unreadable — but the underlying design decision is unmade and belongs to Adi.

---

## 7 · Adi's job

He has agreed to a weekly ritual, ~15 minutes, and wants it to stay that small.

- **Weekly:** open `READY-TO-POST/index.html`, schedule the next two posts in **Meta
  Business Suite** (@getfond is already a business account and Business Suite is already
  set up — no files have been uploaded into it yet), then run the `log-post.mjs` line
  printed under each post.
- **A week later:** `node tools/log-post.mjs <N> --reach R --saves S --sends X --slide3 0.42`.
  `--slide3` is slide-3 reach ÷ slide-1 reach off the per-slide graph. Strategy v2 calls
  it the primary metric and **it has never once been recorded.** Likes are deliberately
  not collected.
- **Monthly:** the tap prints the read on the first Sunday. Open the month's contact
  sheets together and ask whether it looks like one account.

**The endgame he asked for** (specified in `HANDOFF.md` §5.4): after four weeks of logged
posts, his weekly act becomes **approve, not post**. `state/approved.json` holds post
numbers and go-live dates; the daily Action publishes what is approved and writes
`publishedAt` itself. Images need public HTTPS URLs and the repo is private, so a public
Supabase bucket is the host; the token lives in GitHub Actions secrets.

---

## 8 · The eight scheduled tasks

| When (ET) | Task | Health |
|---|---|---|
| Sun 10:00 | **fond — Sunday Tap** | reads Notion, sends the week's paste block and three steps |
| Sun 18:00 | fond — ICP language mining | hard-capped at 8 searches after a 49-hour run |
| Wed 07:00 | fond — hook + script | **refuses to write while Posted is 0** |
| Fri 05:30 | Fond trend radar | emits a paste-ready `freshness.json` block; feeds the entropy guard |
| Mon 05:30 | Network web weaver | outreach drafts → Gmail drafts |
| Mon 07:00 | Weekly DJ Crate | 20 tracks, 12-search cap, after an abandoned 50-track run |
| Sun 07:00 | Fond weekly pipeline refresh | sprint calendar + RAG |
| Daily 06:00 | Fond morning command brief | the day's anchor |

Device binding was attempted twice and refused (`no_signed_approval`) — it must be signed
on the Mac at task-creation time. GitHub Actions replaced the need for it.

---

## 9 · Queued and not done

1. `FIX_SPEC` on any remaining schema-invalid specs.
2. Drain 5 posts per tap from `specs/COVERAGE.md` — but **respect HOLD**.
3. **The vision critic** (§6.2). The highest-value remaining build.
4. Docs consolidation: 16 root markdown files down to three. Keep `CLAUDE.md` (rewrite —
   it still says "five gates", "10/10", "never reads Notion", "BOSS baseline"),
   `WEEKLY.md`, `README.md`; move the rest to `docs/` and `docs/archive/`.
5. Instagram publisher + Insights ingest — **only after four weeks of logged posts.**
6. Six named brief files listed in `specs/COVERAGE.md` live outside the repo. Copying
   them in closes nine of the ten gaps. Ten minutes of Adi's time, once.

---

## 10 · VERIFICATION PROMPT — run this first, before any new work

Paste this into the new session:

```
You are taking over the fond carousel engine at ~/Desktop/contengine.
Read CONTEXT-HANDOFF.md, CLAUDE.md and HANDOFF.md first.

Do not build anything yet. Verify what is actually true, and report each
item as VERIFIED / DIFFERENT / BROKEN with the evidence you saw.

MACHINE
1. npm test            — do the image-gate fixtures all catch their own failure?
2. npm run test:autonomy — count them. The handoff says 28. If lower, something
   was removed; find out what and whether it was deliberate.
3. ./run.sh specs/post-5.json and specs/post-49.json — both PASS?
4. npm run tap — does it complete, rebuild READY-TO-POST/, and print a MACHINE
   action that is actually a machine action?
5. node src/validate.mjs on EVERY spec in specs/. Any invalid one is quarantined
   from export — say which and why.
6. Check the last 3 GitHub Actions runs. Did the daily tap succeed, and did it
   push anything? A green run that pushed nothing for a week is not success.

OUTPUT — this is the part the gates cannot check
7. Open every contact-sheet.png for the 6 ready posts and LOOK at them. For each,
   score 1-5: STOP (does slide 1 open a loop at thumbnail scale), STAND (does
   slide 2 work alone), ARRIVE (does each swipe feel like a new place), SAVE (is
   there a screenshot-worthy slide), FAMILY (same account as the others).
   Cite the slide number and the concrete element for every score below 4.
8. Downsample slide 1 and slide 2 of each to 200px and look again. Is the hook
   readable, or does it read as a grey block? Name the ones that fail.
9. Answer the open design question in §6 with evidence, not taste: does this
   all-vector, no-photography feed look cold for a food account? If you think it
   does, say exactly which slides and propose the CHEAPEST fix that a gate could
   still verify. Do NOT amend the Design System — that is a hard stop for Adi.

TRUTH
10. Confirm published and measured are both still 0, and say plainly how many
    days the 6 ready posts have been waiting. Do not soften it.

Then give me ONE next action and why — and if the ladder says HOLD, the right
answer is to say so and stop, not to find something to build.
```
