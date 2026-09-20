# WEEKLY.md — your job, and only your job

Everything a machine can do is automated. This file is the residue: the things that
genuinely need you, timed and scripted so they never expand to fill a week.

**Sunday, about 20 minutes. Once a month, about 45.** That is the whole commitment.

---

## Why it is not zero

Three things in this pipeline cannot be automated honestly, and pretending otherwise
is how the last eleven weeks went:

1. **Posting.** No Instagram publishing credentials exist, and building them before a
   cadence has held for a month means debugging an API instead of posting. The tap
   makes posting a drag-and-drop, which is the right amount of friction for now.
2. **Reading the numbers.** The Insights API needs the same setup. Typing four numbers
   takes two minutes and closes the loop today.
3. **Judgment about whether it is any good.** Six gates prove a carousel is contained,
   on-palette, threaded, legible at 200px, compositionally sound and on-message. **None
   of them can tell you it is worth following.** That is the monthly read.

Everything else — deciding what to work on, converting copy, rendering, QA, exporting,
tracking state — runs without you.

---

## THE SUNDAY TAP · ~20 minutes

Pick a slot and keep it. The point is that it is the same twenty minutes every week,
not that it is Sunday.

### Step 1 · Start the machine, then walk away (1 min of your attention)

Open Claude Code in `~/Desktop/contengine` and paste exactly this:

```
Read MOMENTUM.md and CLAUDE.md, then run `npm run tap`.

Do the ONE action the tap names at the end. If that action is BUILD_SPECS,
convert 5 posts from specs/COVERAGE.md -- verbatim copy, honest provenance,
gtmAngle set -- then run `npm run tap` again so they render and export.

Copy is verbatim. Never write, rewrite or tighten a line of slide copy.
Missing copy gets flagged, never filled.

Finish with: `npm run test:autonomy` (must be 24/24), the final tap output,
and a one-line git commit of everything that changed.
```

It runs for five to fifteen minutes unattended. Do Step 2 while it works.

### Step 2 · Post (5–8 min)

Last week's export is already sitting in `out/post-N/PUBLISH/`. For each one:

1. AirDrop the folder to your phone.
2. Instagram → new post → select `01.png … 0N.png` **in order**. Order is the carousel.
3. Paste `caption.txt`.
4. Post.

**Two a week is the target.** Not five. A cadence you can hold for a month beats a
burst you abandon, and the whole reason publishing is not automated yet is that no
cadence has ever been held here.

Then, same day, one line per post:

```bash
node tools/log-post.mjs 34 --published
```

### Step 3 · Log last week's numbers (3 min)

Open Instagram → any post from **last** week → Insights. A week is the right lag; a
day-old number is noise.

```bash
node tools/log-post.mjs 34 --reach 1240 --saves 41 --sends 18 --slide3 0.42
```

**`--slide3` is the one that matters.** Scroll the insights to the per-slide reach
graph and divide slide 3's reach by slide 1's. Strategy v2 calls swipe-through the
primary metric and it is the closest thing to "a stranger stopped." It has never once
been recorded on this account.

`--saves` and `--sends` are secondary; sends are weighted 4× in the score. **Likes are
not collected on purpose.** They do not predict anything you care about.

### Step 4 · Read the tap's last line (2 min)

By now Claude Code is done. The tap ends with the one thing it could not do. Usually
that is "post these" or "log these" and you just did it. Occasionally it is a real
question — a gate started failing, a brief is missing copy, a format is being retired.
Answer it or write it down. Do not let it carry to next week silently; that is how
eight days passed with nothing changing.

---

## THE MONTHLY READ · ~45 minutes, first Sunday

This is the only session where you think instead of execute.

**1 · Look at everything you posted, together.** Open each `out/post-N/contact-sheet.png`
from the month side by side. Ask one question: *does this look like one account?* Not
"is each post good" — the gates already answered that. Family resemblance is what makes
a stranger follow rather than just read.

**2 · Read the measured signal.** `npm run decide` prints the median and the top and
bottom three once three posts are measured. Look at which **angle** and which **format**
won, not which topic. Topics are infinite; angles are three.

**3 · Apply the kill criterion.** Any format that underperformed the rest of the account
three posts running gets redesigned or retired. The loop enforces this — it will return
`RETIRE_FORMAT` — but you decide what replaces it.

**4 · Challenge the angle matrix.** Read the latest section of the rolling Notion page
**📡 Trend Radar**. If the outer world now contradicts one of the three angles in
`gtm.json` — money-leak, date-label-lie, takeout-guilt — that is the one legitimate
reason to change the matrix. An angle should never change because you got bored of it.

**5 · Ask the honest question.** Would *you* follow this account? If not, say what is
missing. That answer is worth more than any gate.

---

## What to do when something breaks

| It says | You do |
|---|---|
| `INVALID post-N` | The spec is malformed. Hand it to Claude Code; do not hand-edit JSON. |
| A gate started failing | Make Claude Code say **whether the gate got stricter or the output got worse** before changing either. Six defects were found this way. Never loosen a gate silently. |
| `REQUEST_BRIEFS` | Six named files in `specs/COVERAGE.md` live outside this repo. Copying them in closes nine of the ten gaps. Ten minutes, once. |
| `HARVEST` | The entropy guard is starved. Friday's Trend Radar task emits a paste-ready block into the rolling Notion page — paste it into `state/freshness.json`. |
| Nothing is publishable | Usually a spec still carries `reconstructed-fixture` copy. It must be replaced from the real brief before it can ship. |

---

## The rule that protects all of this

**A week where the machine correctly did nothing is a successful week.** If the board
is drained, everything is measured, and the freshness pool is current, the right output
is a short report saying so.

What is *not* acceptable is a week where nothing moved and nobody noticed. That is what
the Sunday slot exists to prevent, and it is the only thing on this page that actually
requires discipline.

---

## What runs without you

| When | Task | Output |
|---|---|---|
| Fri 05:30 ET | Trend radar | fresh outer-world observations → rolling Notion page, as a paste-ready block |
| Sun 07:00 ET | Weekly pipeline refresh | ED sprint calendar + RAG |
| Sun 18:00 ET | ICP language mining | audience vocabulary → Language Bank, hard-capped at 8 searches |
| Wed 07:00 ET | Hook + script | **refuses to write anything while Posted is 0** |
| Mon 05:30 ET | Network web weaver | outreach drafts → Gmail drafts |
| Daily 06:00 ET | Morning command brief | the day's anchor |

Every one of them reports a count even when the count is zero, so a silent failure
cannot look like a quiet success.
