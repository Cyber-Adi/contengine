# INITIALIZATION DIRECTIVE

What has to be in the folder before Claude Code can actually work, and the exact
first prompt to paste. Read this before anything else.

---

## 1 · Where the folder goes

Put the unpacked repo somewhere stable and **share that same folder with Claude** in the
desktop app (Add folder). One folder, one path, for the whole project:

```
~/dev/fond-carousel-engine/
```

Do not nest it inside a synced Downloads folder — the renderer writes hundreds of PNGs and
cloud-sync will fight it.

---

## 2 · What is already in the box

You do not need to create any of this. It ships working.

```
CLAUDE.md                  the boot file — Claude Code reads this every run
tokens.json                the design contract, mirrored from Design System §3
carousel.schema.json       the spec shape
assets/fonts/              11 vendored OFL font files (determinism)
src/tokens.mjs             single load point for the contract
src/slide-html.mjs         the ONE place slide HTML is produced
src/diagrams.mjs           5 flat-vector diagram primitives
src/render.mjs             Playwright capture + in-DOM measurement
tools/qa.py                the four gates
tools/test_gates.py        10 fixtures — every gate must catch its own failure
tools/contact_sheet.py     contact sheet + feed-scale thumbs
tools/downsample.py        the Lanczos pass
tools/contrast_audit.py    reproduces CONTRAST-AUDIT.md
specs/post-49.json         fixture — eggs, meter thread, no Signal Red
specs/post-5.json          fixture — exercises all 5 diagrams + every chrome feature
run.sh                     render -> contact sheet -> QA
BACKLOG.md                 prioritised work order
```

---

## 3 · What YOU must put in the folder — this is the gating list

Nothing downstream works until these land. Neither is work; both are a file copy.

### 3.1 `briefs/` — **blocks Slice 1, which sizes the whole project**

```
briefs/
  fond_Content_Brief_Posts_47-48-49_and_Kinetic_Reel_GraveyardFade.md
  fond_Content_Brief_Posts_50-51-52_and_Kinetic_Reel_KidsPlateLoop.md
  fond_Content_Brief_Posts_64-65-66_and_Kinetic_Reel_BestBy.md
  ... every fond_Content_Brief_*.md you have
```

They live in two places today — a "fond stuff" folder and an outputs folder. **Copy both
sets in.** Do not curate; duplicates and older versions are fine, the parser reports on
them. Copying only the ones you think are good defeats the coverage report, whose entire
job is telling you what you actually have.

### 3.2 `baseline/` — **blocks the vision critic**

```
baseline/
  boss-01.png  ...  boss-07.png     the 7 posts that ran during BOSS
```

Export them from Instagram at the largest size available. These are not decoration: they
are the only visual evidence that ever earned a follower, and the critic calibrates against
them. **A gate that fails the baseline is a mis-calibrated gate, and gets loosened.**

### 3.3 Optional but useful

```
reference/            the juju.branding + orange-editorial screenshots
                      Not to copy — those palettes violate §3. They are here as evidence
                      for the STRUCTURAL moves already implemented: swipe affordance,
                      one-word accent pop, bracketed micro-label, geometric ornament.
```

---

## 4 · One-time machine setup

```bash
cd ~/dev/fond-carousel-engine
npm install                    # playwright, ajv, fontsource
npx playwright install chromium
npm test                       # must print 10/10 gates caught their own failure mode
./run.sh specs/post-5.json     # must print verdict: PASS
```

If `npm test` is not 10/10, **stop and fix that before anything else.** A gate that cannot
catch its own failure mode is worse than no gate, because it manufactures confidence.

---

## 5 · The boot prompt — paste this first, every new Claude Code session

```
Read CLAUDE.md, BACKLOG.md and CONTRAST-AUDIT.md before doing anything.

Then confirm the environment out loud:
  - npm test prints 10/10
  - ./run.sh specs/post-5.json prints verdict: PASS
  - how many .md files are in briefs/  (0 means Slice 1 is still blocked)
  - how many .png files are in baseline/  (0 means the critic is still blocked)

Then tell me which BACKLOG item is next given what is actually present, and wait.
Do not start work before I confirm.

Standing rules for every session in this repo:
  - tokens.json is a contract. No hex literal anywhere else. If a render needs a colour
    outside the 7 tokens, STOP and ask.
  - You never write or rewrite slide copy. Copy comes from the brief, verbatim.
  - You never invent a statistic. If a claim cannot survive a source check it does not
    get hero-number treatment.
  - This repo renders files. It does not publish.
  - After any change to src/ or tools/, re-run `npm test` AND `./run.sh` on both fixture
    specs before you tell me it works.
```

---

## 6 · Session recipes

**Working a backlog item**
```
Work BACKLOG item P0.1. Show me the plan first. When you build, re-run npm test and both
fixtures before reporting. If a gate starts failing something it used to pass, tell me
whether the gate got stricter or the output got worse — do not silently loosen the gate.
```

**Adding a diagram primitive**
```
Add a <kind> diagram to src/diagrams.mjs. Constraints: flat vector only, 2px stroke,
no gradients or shadows, every colour through tokens, readable in under 2 seconds at
phone size. Add it to a fixture spec, render, and show me the contact sheet. Then confirm
X-distinct still passes — adjacent slides must not look alike.
```

**After the briefs land**
```
Run Slice 1. Parse every brief in briefs/, emit specs/*.json validated against
carousel.schema.json, and write specs/COVERAGE.md classifying each post as READY / THIN /
STUB / ORPHAN / CONFLICT. Do not write copy to fill gaps — flag them. Report the counts
before doing anything else.
```

---

## 7 · What "done" looks like for the render half

1. `npm test` → 10/10.
2. Every READY post renders 8 PNGs, 0 gate fails, byte-identical across two runs.
3. `specs/COVERAGE.md` states with evidence how many posts are actually renderable.
4. The critic scores the BOSS baseline ≥ 4 average; new output gated at ≥ 3.5.
5. Notion Content Calendar reflects true Designed status, zero rows created.

---

## 8 · The two scheduled tasks live OUTSIDE this repo

`fond-icp-language-mining` (weekly) and `fond-hook-and-script` (weekly) run as cloud
scheduled tasks against Notion. They do not touch this repo and this repo does not depend
on them. Their contract with the engine is one-directional: the script task writes specs
into Notion in `carousel.schema.json` shape, and you paste them into `specs/`.

**The one rule that keeps the whole system honest:** `fond-hook-and-script` is gated on
the render queue. It refuses to produce a new script while more than 12 scripted posts are
undesigned. That gate exists because the previous content lane ran for six straight weeks
growing a queue from 62 to 75 while the designed count never moved off 8.
