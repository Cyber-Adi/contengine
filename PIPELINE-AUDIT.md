# End-to-end pipeline audit — 2026-09-12

Ran the whole thing, not just the parts that were easy to run. Three renderer bugs
found and fixed, one architectural hole found and half-fixed, one scheduled task
found silently failing.

---

## 1 · "How can there be defects if we already have a pipeline?"

Worth answering properly, because the intuition behind the question is wrong in a
way that matters.

A pipeline is not a guarantee. It is a set of steps. "The pipeline exists" and "the
pipeline produces correct output" are different claims, and only the second one is
worth anything. Software that runs is not software that is right — it is software
that did not crash, which is a much weaker statement.

What actually happened here is the cleanest possible illustration:

**C1 changed one number.** The canvas went from 1080×1350 to 1440×1800 — a one-line
edit in `tokens.json`, exactly the kind of change a well-built system is supposed to
absorb. It broke three things at once, and every one of them was invisible:

| # | What broke | Why it was invisible |
|---|---|---|
| 1 | **Font binaries were being corrupted.** The CSS scaler rewrites every `<digits>px` literal. Base64's alphabet contains `p`, `x` and all ten digits, so the regex was matching *inside the inlined font data* and rewriting it. | While the canvas was 1080, the scale factor was 1, so every replacement was byte-identical. The bug was dormant, not absent. It went live the instant the factor stopped being 1 — and only for the two fonts whose base64 happens to contain that pattern. |
| 2 | **Every slide had 25% bare white at the bottom.** `.slide` never had an explicit height; as a flex column it took its content's height, which happened to equal 1350. | At 1080×1350 the coincidence held perfectly. At 1800 tall the content still stopped at 1350. |
| 3 | **Chrome type shrank.** Handle, counter, micro-label and thread label were never multiplied by the scale factor. | Nothing errors. The slide just quietly looks slightly cheaper. |

None of these three produce an error message that names the cause. Bug 1 surfaces as
`NetworkError: A network error occurred` thrown from `document.fonts.load()` — a
message with no connection whatsoever to a regex in a CSS post-processing step.

**That is the entire argument for the gates.** Bug 2 was caught by G2.2 (pure white
covering a quarter of the frame). Bug 3 was caught by G5.3 (type below the floor).
Bug 1 was caught by the render refusing to run at all, which is the gate of last
resort. Without the gate battery, the honest outcome is eight slides that look almost
right, posted, and nobody able to say why the account feels amateur.

**The corollary worth internalising:** a machine that reports defects is working. A
machine that reports none is usually just not looking.

---

## 2 · How to run it (the part nobody wrote down)

`./run.sh` is a shell script in the repo. Open Terminal and:

```bash
cd ~/Desktop/contengine
./run.sh specs/post-5.json          # validate -> gate 6 -> render -> contact sheet -> gates 1-5
```

The other commands, all from that same folder:

```bash
npm run decide                      # what should I work on right now, and why
npm test                            # 15 gate fixtures - each must catch its own failure
npm run test:autonomy               # 18 fixtures for the loop, GTM gate and entropy guard
npm run gtm specs/post-5.json       # gate 6 alone
node src/render.mjs specs/post-5.json --canvas=tiktok   # 9:16 from the same spec
```

**First-time setup, once:** `npx playwright install chromium`. The renderer needs a
real browser and resolves it in this order — `FOND_CHROMIUM` env var, then
Playwright's own copy, then a clear error naming both.

Output lands in `out/post-N/`: `slides/`, `slides-tiktok/`, `contact-sheet.png`,
`qa-report.json`. Open the contact sheet first; it is the fastest way to see a whole
carousel at once.

---

## 3 · Verified working, end to end

Run in a clean Linux container against a fresh Chromium, which is a harder test than
re-running on the machine that built it.

| | |
|---|---|
| `post-5` (all five diagram kinds, every chrome feature) | **PASS**, 0 fails, 4 warns |
| `post-49` (meter thread, Signal Red forbidden by its own argument) | **PASS**, 0 fails, 7 warns |
| TikTok 9:16 from the same specs | renders, 1440×2560 |
| Gate fixtures | **15/15** each catching its own failure mode |
| Autonomy fixtures | **18/18** |
| Determinism | byte-identical across runs |

The remaining warnings are all G5.2 balance and G5.5 fill — top- or bottom-heavy
compositions. Those are WARN by design and stay WARN: a sparse editorial slide is a
legitimate choice and the gate's job is to tell you, not to decide for you.

---

## 4 · The architectural hole: the loop had nowhere to run

This is the important finding and it is not a code bug.

Both fond scheduled tasks run **in the cloud with no folder attached**. They can read
Notion and search the web. They cannot see this repo. Which means:

- They cannot render. Ever.
- They cannot run `npm run decide`.
- They cannot read or write `state/`.

So the loop was built and had no machine to run on. The Wednesday task's only
available action was, once again, writing a script — which is precisely the failure
the loop exists to break, reproduced at the infrastructure layer.

**The fix, and the one thing that needs you:** a third task now exists —
**"fond — run the loop (on the Mac, drains the queue)"**, Wednesdays 16:00 UTC. It
declares that it needs this computer, so its runs get `contengine` mounted and can
actually render. **It is created but NOT YET BOUND** — device binding requires your
approval on this Mac, and until you approve it the task will run in the cloud and be
useless in exactly the way described above. Approve it, or the loop stays theoretical.

The division of labour once it is bound:

| Task | Where | Can it render? | Job |
|---|---|---|---|
| Sun 22:00 UTC · ICP language mining | cloud | no | audience vocabulary → Notion |
| Wed 11:00 UTC · hook + script | cloud | no | one script → Notion, behind the drain gate |
| **Wed 16:00 UTC · run the loop** | **this Mac** | **yes** | decide → execute → verify |

---

## 5 · The Sunday task has been failing

`fond — ICP language mining (weekly)` last fired 2026-09-06 22:05 UTC and **failed
seven seconds later**. Not a timeout, not a bad result — a failure at startup. Nobody
noticed, because a scheduled task that fails silently looks identical to one that
found nothing worth writing.

It is still enabled and fires again Sunday. Watch that run. If it fails again the
same way, the cause is environmental (model availability or a connector), not the
prompt — the prompt is fine and has produced good output before.

**General lesson worth wiring in:** every one of these tasks should report a count,
even when the count is zero. "0 rows added, bank saturated" is a successful run you
can distinguish from a crash. A silent success and a silent failure look the same.

---

## 6 · What is still genuinely manual, ranked by what it costs you

1. **Approve the device binding** on the new loop task. Two minutes. Without it,
   nothing else on this list matters.
2. **Copy the six missing brief files** into `briefs/` — named in `specs/COVERAGE.md`.
   Closes 9 of the 10 gaps and un-stales posts 44–52.
3. **Post something.** Zero posts have ever gone out of this engine. Publishing
   automation (P4.1) is deliberately not built until a manual cadence holds for a
   month, because automating a cadence nobody has run means debugging an API instead
   of posting.
4. **Record three posts' numbers** in `state/performance.json`. Manual entry, two
   minutes each. Until three exist, every claim about what works on this account is
   a guess, and the loop's feedback edge is inert.
