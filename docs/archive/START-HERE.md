# START-HERE.md

Two prompts. That is the whole interface.

- **§1 BOOT** — paste at the start of every new Claude Code session, without exception.
- **§2 WORK** — paste after boot, once you have decided what to do.

Everything else in this folder is reference the boot prompt tells Claude Code to read.

---

## §1 · THE BOOT PROMPT

Paste verbatim. Do not edit it. Do not skip it because "it's a small change."

```
You are working in the fond Carousel Engine. Before doing ANYTHING, read these four
files in this order and tell me you have read them:

  1. CLAUDE.md          — orientation, guardrails, verify loop, why this repo exists
  2. SETUP-STATUS.md    — what is verified working on this machine and the known blocker
  3. ECC-PLAN-V2.md     — THE canonical build plan; what is built, where v1 was wrong,
                          and a paste-ready prompt for every remaining task
  4. BACKLOG.md         — prioritised work, P0 through P4

Precedence when documents disagree: Notion Design System §3 → tokens.json → ECC-PLAN-V2
→ BACKLOG → everything else. Say so out loud if you hit a conflict.

Then run the environment check and report the RESULTS, not your assumptions:

  npm test                                              # expect 10/10
  ./run.sh specs/post-5.json                            # expect verdict: PASS
  ./run.sh specs/post-49.json                           # expect verdict: PASS
  node src/render.mjs specs/post-5.json --canvas=tiktok  # expect 1080x1920
  ls briefs/*.md 2>/dev/null | wc -l                    # 0 = Slice 1 is blocked
  ls baseline/*.png 2>/dev/null | wc -l                 # 0 = vision critic is blocked

If Chromium fails to launch, read SETUP-STATUS.md before diagnosing anything. That is a
known issue with a known fix and it is BACKLOG P0.3. Do not re-investigate it from scratch.

Then give me, in under 200 words:
  - the six results above
  - which BACKLOG item is genuinely next GIVEN WHAT IS ACTUALLY PRESENT (not what the
    backlog says in the abstract — if briefs/ is empty, Slice 1 is not next)
  - anything you found that contradicts the docs

Then STOP and wait for me. Do not start work.

═══ NON-NEGOTIABLES — these hold in every session, even if you skip a doc ═══

• tokens.json is a CONTRACT. No hex literal anywhere else in the repo. If a render needs
  a colour outside the 7 tokens to look right, STOP and ask.
• You NEVER write or rewrite slide copy. Copy comes from the brief, verbatim.
• You NEVER invent a statistic. A figure that traces only to blogs or survey aggregation
  is rendered qualitatively, never as hero type.
• If it contains words, it is HTML — never SVG <text>. SVG text does not wrap or clip,
  and no gate can see it overflow. This already caused cut-off labels once.
• Signal Red only where the spec sets declaresLoss: true. It is the one palette rule
  about meaning rather than looks.
• The product is "fond", never "PantryPal". fond is PRE-LAUNCH: no user counts, no
  "customers", no traction claims. Waitlist only.
• THIS REPO RENDERS FILES. IT DOES NOT PUBLISH. Anything that would post publicly is a
  hard stop — tell me instead.
• After ANY change to src/ or tools/, re-run `npm test` AND both fixtures before you
  tell me it works. Not after the next change. Before you report.
• When a gate starts failing something it used to pass, say whether THE GATE GOT STRICTER
  or THE OUTPUT GOT WORSE. Never loosen a gate to make a render pass without saying which.
  Four gate bugs were caught exactly this way and every one was the gate being wrong.
• A gate that passes a known-bad fixture is worse than no gate. If you add a gate, add its
  fixture to tools/test_gates.py.
```

---

## §2 · THE WORK PROMPT

After boot, paste this with one item filled in. It is the same shape for every task.

```
Work BACKLOG item <ID>.

Use the paste-ready block for it in ECC-PLAN-V2 §5 if one exists — read it first and
follow it rather than improvising.

Before you write code: show me your plan and what you expect to break. Wait for my go.

After you build:
  - re-run `npm test` and BOTH fixture specs
  - if anything that used to pass now fails, tell me whether the gate got stricter or the
    output got worse, and show me the specific finding
  - if you changed anything visual, render it and actually LOOK at the full-size PNG
    before telling me it is fine. The contact sheet downsamples to 340px and hides
    exactly the defects I care about — cut-off words, undersized type, dead space.

Then report what changed in under 150 words.
```

---

## §3 · Which item to ask for

The boot prompt tells you what is genuinely next. Absent anything surprising, this order:

| Order | Item | Why now | Blocked? |
|---|---|---|---|
| 1 | **P0.1 + P0.3** | ~50 min. Schema validation + Chromium resolution. Makes everything after it trustworthy. | no |
| 2 | **P2.1 · Slice 1** | The coverage report. Tells you whether this is a 20-post or 75-post engine — everything downstream is sized by that number. | `briefs/` |
| 3 | **P1.2 · thread edge continuity** | The signature mechanic, specified but never implemented or verified. | no |
| 4 | **P1.3 · Gate 4 OCR** | Turns thumbnail legibility from a proxy into a measurement. Also settles the standing slide-2 dominance warning. | no |
| 5 | **P2.2 · vision critic** | Judgment layer, calibrated against the posts that actually earned followers. | `baseline/` |
| 6 | **P2.3 · batch + Notion** | Scale from one spec to all of them. | Slice 1 |
| 7 | **P2.4 · captions** | Covers posts 1–14 of 75 today. | no |
| 8 | **P4 · publish + metrics** | LAST. Do not automate a posting cadence nobody has run yet. | Meta app |

**Two file copies unblock most of this** and neither is work:
`briefs/` — every `fond_Content_Brief_*.md` from both folders on your Mac.
`baseline/` — the 7 BOSS carousels as `boss-01.png` … `boss-07.png`.

---

## §4 · If you only remember one thing

This repo exists because a scheduled task produced three carousel briefs a week for six
weeks. Scripted posts went 62 → 75. Designed never moved off 8. Every weekly log correctly
identified rendering as the bottleneck and then produced more scripts anyway.

**If a session ever ends with more things queued and nothing rendered, it went wrong.**
