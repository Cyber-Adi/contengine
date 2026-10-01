# Autonomous Architecture

How this stops being a renderer you operate and starts being a loop that runs.
Written 2026-09-12, after the Isenberg/Schneider agent video and against the Fable
GTM plan. Everything here is built and tested — `npm run test:autonomy` is 18/18.

**Read `CLAUDE.md` first.** This document adds a layer; it overrides nothing in it.

---

## 0 · The GitHub skill question, answered straight

You asked why I didn't use a pre-existing carousel-generation skill. Three separate
answers, because it was three separate questions:

**Was there a Claude Skill for this?** No. I checked the skill registry this session
and it returned zero results for carousel generation, social automation, ad creative
and marketing agents. There is nothing to install.

**Did I check GitHub?** Yes, before writing any code, and the evaluation is recorded
in `ECC-PLAN-V2.md` §0. Two real candidates:

| Repo | What it is | Why rejected |
|---|---|---|
| `Hainrixz/open-carrusel` (MIT, 366★) | Next.js + Puppeteer chat-to-design studio | Wrong shape. It designs one slide at a time, interactively, with a human in the loop. You have 59 finished briefs and need an unattended batch renderer. Also 6 commits, pre-1.0. |
| `DJ-vekariya/html-to-Instagram-carousel` | HTML → carousel PNG | Renders at 420×525 with a fractional device scale factor ≈2.57. Fractional scaling is exactly what softens fine type, which is the defect you flagged. |

**The part that actually matters:** neither validates its own output. Every carousel
generator on GitHub produces images. None of them can tell you an image is wrong.
The five gates, the fixtures that prove each gate catches its own failure mode, and
the four gate bugs those fixtures found — that is the novel work here, and no repo
was going to donate it. A renderer is a weekend. A renderer that *refuses to ship
something broken* is the reason this repo exists.

**Where I was actually wrong:** I should have said all of this out loud at the time
instead of burying it in a plan appendix. Prior-art evaluation belongs in the
conversation, not a footnote.

---

## 1 · The one idea: a line, not a loop

The video's first takeaway is the only one that reframes anything, and it happens to
diagnose your exact failure.

A Zapier/Make automation is a **line**. Step 1 fires on a schedule, hands to step 2,
and terminates. No step can see the whole board, so no step can decide the line
should not have run today.

Your content system was a line:

```
Sunday: mine ICP language  ->  Notion
Wednesday: write a script   ->  Notion
                                  |
                                  +--> STOP.  Every automated run ends here.
```

For six weeks it ran perfectly. Scripted posts went 62 → 75. Designed posts stayed
at 8. **Every weekly log correctly identified rendering as the bottleneck and then
wrote another script**, because writing a script was the only thing Wednesday knew
how to do. The system was not broken. It was doing precisely what a line does.

An agent is a **loop**. It reads the whole board, finds the binding constraint, and
does only that. So the single most consequential line of code in this whole layer is
the ordering in `src/decide.mjs`:

> **Generating new copy is the LOWEST-priority action, not the highest.**

Writing new copy is what this operation does when it has nothing better to do. For
six weeks it had nine better things to do.

---

## 2 · What got built

| File | Role | Analogy |
|---|---|---|
| `state/ledger.json` | Every post's lifecycle stage, reconciled from disk | the board |
| `state/performance.json` | Per-post reach/saves/sends/swipe-through | the feedback edge |
| `state/freshness.json` | Outer-world observations, 14-day half-life | the novelty supply |
| `state/decisions.jsonl` | Append-only log of what the loop chose and why | the audit trail |
| `src/state.mjs` | Loads and reconciles all of the above | the data layer |
| `src/decide.mjs` | The constraint ladder. **This is the agent.** | the brain |
| `src/entropy.mjs` | Refuses repetitive concepts; requires outer-world citation | the anti-decay guard |
| `gtm.json` | Positioning, angles, sourced stats, honesty rules, CTAs | `tokens.json`, for message |
| `src/gtm.mjs` | Single load point for `gtm.json` | `tokens.mjs` |
| `src/gtm-check.mjs` | **Gate 6 · GTM conformance** | the sixth gate |
| `src/seed-ledger.mjs` | Seeds the board from `specs/COVERAGE.md` | — |
| `src/test-autonomy.mjs` | 18 fixtures for all of the above | `test_gates.py` |

```bash
npm run decide         # what should I do right now, and why
npm run test:autonomy  # 18/18 - every new gate catches its own failure
npm run gtm specs/post-5.json
```

### The board, right now

```
gap         10   ##########
scripted    57   ############################+29
rendered     1   #
approved     1   #
published    0
measured     0
```

Which is the whole story in six rows. 59 posts have verbatim copy sitting in Notion
or `briefs/`. One has been rendered and approved. **Zero have ever been published
from this engine, and zero have ever been measured.** The queue is not a content
problem. It never was.

---

## 3 · The constraint ladder

`src/decide.mjs` walks nine rungs and returns the first one that fires. Cheap before
expensive, drain before fill.

| # | Fires when | Action | Reasoning |
|---|---|---|---|
| 1 | A render fails its gates | `FIX_QA` | A broken render is worse than none: it looks finished. |
| 2 | Approved, unpublished | `PUBLISH` | **The exact boundary where the old pipeline terminated.** |
| 3 | Published, unmeasured | `MEASURE` | Until this runs, every claim about what works is a guess. |
| 4 | Spec exists, unrendered | `RENDER` | 6.3 seconds. Cheapest unit of progress in the system. |
| 5 | Copy exists, no spec | `BUILD_SPECS` | Converting existing copy beats writing new copy, always. |
| 6 | A format missed 3 running | `RETIRE_FORMAT` | GTM kill criterion, enforced in code rather than noted in a doc. |
| 7 | Freshness pool stale | `HARVEST` | Blocks concept work by design. See §5. |
| 8 | Copy missing entirely | `REQUEST_BRIEFS` | Blocked on you. The engine must never write it. |
| 9 | Everything above is clear | `GENERATE` | Only now. And still gated by the drain ceiling of 12. |

Run it today and it says `FIX_QA`: **post-49 currently renders and fails its gates on
your machine.** That is a real finding, not a demo — the loop's first act was to notice
something neither of us had looked at. Following it produced three defects in one
sitting (full write-up in `BACKLOG.md` P5.6):

- **G4.5 was stricter than reality.** Tesseract read the hero "3–5 WEEKS" as "5-5
  WEEKS" and failed for a missing `3`. I looked at the actual 200px thumbnail; the 3
  is unmistakable. The gate now separates a *misread* digit (same skeleton: 3/5/8,
  6/9/0, 1/7 — WARN, the instrument cannot tell) from an *unread* figure (wrong digit
  count — still FAIL).
- **G5.3 made a category error.** It applied the content type floor to chrome, so
  every slide failed on its own page number. Chrome is a signature, identified rather
  than read, and now has its own floor — the same distinction G5.1 already made and
  G5.3 did not.
- **And the output really had got worse.** Chrome font sizes were never scaled when C1
  moved the canvas to 1440, so the handle, counter, micro-label and thread label
  rendered proportionally smaller than designed. Fixed.

Three defects, two of them gates being wrong and one the output being wrong, and the
rule that keeps it honest is saying which each time. None of them would have surfaced
from "what should I write this week."

**One is left for you** because Chromium cannot launch through the desktop bridge:
re-run `./run.sh` on both fixture specs natively, then re-read G5.3. Any remaining
typefloor FAIL on a non-chrome element is a genuine undersized-type defect, and there
is one already visible on post-49 slide 5.

### One measurement decision worth knowing about

The kill criterion originally compared each format against the account median. A
fixture caught why that is wrong: when a tiring format is most of your sample, it
drags the median down into its own band, the format then scores "at median", and the
criterion can never fire. Decay becomes invisible *through the instrument meant to
detect it*. It now compares a format against a **leave-one-format-out median** — the
rest of the account — so the baseline is immune to the thing it is judging.

That bug was found by a fixture, not by reading the code. Which is the argument for
fixtures.

---

## 4 · `gtm.json` — the marketing contract

`tokens.json` made colour drift structurally impossible: there is no hex literal
anywhere else in the repo, so an off-palette slide cannot be built by accident.
`gtm.json` does the same for message. It carries, sourced from your GTM page verbatim:

- **The positioning line**, once: *the 17-year-old who builds systems that make
  invisible things visible.*
- **The angle matrix** — money-leak / date-label-lie / takeout-guilt — each with its
  sourced number (EPA 2025 `$2,913`; the 2025 label survey's `43%`), its pillar, and
  the organic carousels it can be adapted from.
- **Pre-launch honesty as machine-checkable rules.** Banned phrases and patterns for
  traction claims, the founding-member-never-customer framing, CTA text per tier.
- **The audience map and watering holes.**
- **The testing protocol** (3 angles × 2 formats, $10/day × 3 days, kill <1% CTR,
  iterate >2%, scale on landing-page conversion and never on clicks) and the two hard
  constraints: Meta requires 18+, so ads run through your partner's Business Manager,
  and no spend before founding-member revenue exists.
- **The metrics that count**: swipe-through-to-slide-3 primary, saves/reach and
  sends/reach secondary, sends weighted 4×. Likes are deliberately absent.

**Gate 6** reads it the way the pixel gate reads `tokens.json`. It runs in `run.sh`
*before* the renderer, so a message violation costs zero pixels. Fixtures prove it
catches: a traction claim, the word "customers", a numeric user count, an undefined
CTA tier, an angle outside the matrix, an unsourced hero number — and the same claim
hidden inside a diagram label rather than a headline.

One thing this surfaced immediately: your specs use `ctaTier: "Tier 2"`, from the
Design System. My first draft of `gtm.json` invented nicer names. The precedence rule
in `CLAUDE.md` says the Design System wins, so `gtm.json` now supplies the *text* for
each existing tier rather than renaming them. Worth recording because it is the
precedence rule doing its job on its first real conflict.

---

## 5 · The entropy guard

The video's third takeaway is the sharpest: an agent generating from its own history
**converges**. It finds a shape that worked, produces variations, and the variations
narrow until the account is publishing the same post with different nouns.
Performance decays slowly enough that no single week looks wrong.

`src/entropy.mjs` refuses on four checks. Three look inward:

- **Repetition** — Jaccard token overlap above 34% against any of the last 12 hooks.
- **Shape run** — the same grammatical move three posts running. A hook opening on
  "Your" with no number is `possessive-open`; add a figure and it becomes
  `numeric+possessive-open`. Varying nouns while holding the move constant is the
  most common way a feed goes flat, and it is invisible to a human reading one post.
- **Angle concentration** — one angle taking more than half the window.

The fourth looks outward, and it is the one that actually creates novelty:

- **Outer-world citation, required.** Every new concept must cite a live observation
  from `state/freshness.json`, harvested inside 14 days. **A concept sourced only
  from the account's own history is refused even when it is novel.** Novelty with no
  external input is drift; novelty anchored to something real is a direction.

The 14-day half-life is what forces the harvest to actually re-run. Let the pool go
stale and the loop cannot generate at all — it returns `HARVEST` and stops. That is
the intended behaviour, not a bug to route around.

Every source is free and already named in your own GTM plan's research stack: Meta
Ad Library, TikTok Creative Center, Google Trends, Reddit search, Product Hunt
archives, YouTube autocomplete. **You had already written the entropy guard's supply
side into the GTM plan in July** — the monthly Viral Research prompt, ending "update
the Ad Bank angle matrix if anything contradicts it." That instruction is the video's
takeaway, eight weeks earlier. It was just never wired to anything that could act on it.

---

## 6 · The scheduled tasks, redesigned

Two fixed-purpose tasks become one loop plus one supply run.

| Was | Becomes |
|---|---|
| **Sun 22:00 UTC** — ICP language mining → Notion Language Bank | **Sun — HARVEST.** Same job, widened to the full free research stack, writing `state/freshness.json` as well as the Language Bank. Deliverable per GTM: 5 hooks working, 2 formats gaining, 1 dying format to avoid. |
| **Wed 11:00 UTC** — write a hook + carousel script | **Wed — RUN THE LOOP.** `npm run decide`, then do what it says. Some weeks that is publishing. Some weeks it is rendering. Some weeks it is writing a script. **The task no longer knows in advance.** |
| — | **Monthly — CHALLENGE THE MATRIX.** Re-run the GTM Viral Research prompt against the angle matrix and amend `gtm.json` if the outer world contradicts it. |

The Wednesday drain gate stays and gets stronger: the ceiling is now enforced in
`decide.mjs` (`DRAIN_CEILING = 12`), not remembered in a prompt.

Note what happens to your instinct that the job still feels manual. It should feel
less manual and it will never feel like nothing — but the specific manual thing you
were doing (deciding each week what the system should work on) is the thing that
just got automated. That was the expensive part.

---

## 7 · What I took from the video, and what I didn't

| Takeaway | Verdict |
|---|---|
| **1. Agents need unified data + an autonomous decision loop, not linear automation** | **Taken in full.** §1–3. The core of this document. |
| **2. Meta's Andromeda reads creative, not targeting — so creative generation is the growth lever** | **Taken, adapted.** Directionally right and it argues for this engine's existence. But you cannot run Meta ads (18+, and no spend before revenue), so it applies to *organic* creative now: the algorithm reading the creative is Instagram's ranker, and the same conclusion holds — volume of good creative beats clever distribution. |
| **3. Feed agents fresh outer-world data or creative decays** | **Taken in full.** §5, and it was already half-built in your own GTM plan. |
| **4. AI-first WordPress plugins are an opportunity** | **Not taken.** Unrelated to fond. A genuinely interesting market, and a different venture. |
| **5. Cloud-host on Railway/Heroku with Airbyte + ClickHouse** | **Taken in principle, rejected in implementation.** The principle — the loop must run without you — is right and is what the scheduled tasks do. The stack is wrong at your scale. Airbyte + ClickHouse is correct at millions of rows. You have 69 posts. That is a JSON file, and it loads in one read so the loop runs offline in milliseconds. Revisit around 5,000 rows. Adopting that stack now would mean paying in setup, cost and debugging for a scale problem you do not have. |

**The honest framing on all of it:** a two-hour cloud-hosted ad-manager agent is a
demo of an idea, and the idea is good. Applying it to an account with zero measured
posts would mean automating decisions on data that does not exist yet. The loop is
built; the feedback edge is real but currently empty; §8 is what fills it.

---

## 8 · What is still manual, and why each one is

Three things. Two are honest constraints, one is a deliberate choice.

**1 · Publishing.** `BACKLOG` P4.1. The Instagram Content Publishing API needs
@getfond converted to a Business or Creator account, a Meta app, a long-lived token,
and a public HTTPS bucket for the PNGs — about 45 minutes, mostly in Meta's console.
**The deliberate choice: do not automate this until you have posted manually for a
month.** Automating a cadence nobody has run means debugging an API instead of
posting, and your board says zero posts have ever gone out of this engine. The
bottleneck is not the upload.

**2 · Measurement.** The Insights API needs the same setup. **Do not wait for it.**
`state/performance.json` takes manual entry and two minutes per post, and the loop
closes the moment there are three measured posts. An unmeasured loop is a line.

**3 · The 10 gaps.** Six brief files named in `specs/COVERAGE.md` sit in your "fond
stuff" folder and were never copied into `briefs/`. That would close 9 of the 10
gaps and un-stale posts 44–52. Post 17 needs separate attention — no Notion page
contains it under any name. **The engine must never write this copy**, which is why
`REQUEST_BRIEFS` is marked blocked-on-you rather than actioned.

---

## 9 · Done =

The loop runs weekly without you deciding what it should do; every post that ships
passes all six gates; every published post is measured within a week; the measurement
picks the next angle; and the entropy guard refuses any concept that is merely a
recombination of the last twelve.

At that point the only human inputs are the brief copy, the posting tap, and judgment
about whether it is any good — and the third one is the only one worth your time.
