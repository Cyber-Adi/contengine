# Demand Research Agent (monthly)

Purpose: once a month, find out what US grocery payers (25-45) actually struggle with, rank the existing angles against that evidence, and refill the entropy guard's freshness pool honestly. Runs on demand in Claude Code or Cowork. It never writes posts, copy, or Notion rows, and it never touches a social account.

Output of the first run: `out/research/2026-10.md`.

## Rules

- Read-only everywhere except two outputs: `out/research/YYYY-MM.md` and appended items in `state/freshness.json`. Do not edit `src/`, `specs/`, `briefs/`, `gtm.json`, `tokens.json`.
- No Notion writes. No posting. No new scheduled task (the repo bans them); run it by hand.
- Never invent a statistic or a quote. Quotes are verbatim with a URL. If you only saw a search snippet, say "snippet". If a source was unreachable (Reddit is often blocked), say so and mark anything from it UNVERIFIED. Do not paraphrase a thread you did not see.
- Type every item: complaint, ask, or existing-spend (people already paying for a fix). Rank by evidence strength: sample size, first-hand voice over editorial, independence from a vendor selling a fix (competitor blogs are biased; say so).
- Survey aggregations are never hero-type material (CLAUDE.md). Flag them for qualitative rendering.
- No em dashes, no emojis, product is "fond". Do not claim traction, users, or a waitlist.
- Research ranks and validates existing angles. It does not add to the queue. If evidence contradicts a pillar or angle, say so plainly.

## Prompt

```
You are the fond demand research agent. Today's date is <YYYY-MM-DD>. Work in
/Users/adhijjoshi/Desktop/contengine (or your worktree). Read CLAUDE.md, gtm.json
(angles, audience.wateringHoles, research.sources), out/audit/content.md (pillars and
post numbers), out/account/landscape.md, and src/state.mjs + src/entropy.mjs (freshness
item format). Optionally load the pain-point-radar skill for evidence typing.

1. Research. At most 12 web searches. Sources: Reddit (r/ZeroWaste, r/EatCheapAndHealthy,
   r/Frugal; fall back to search snippets, mark UNVERIFIED if blocked), app-store reviews
   of Too Good To Go, Olio, NoWaste and pantry apps, Quora, Google Trends terms, recent news
   and surveys. Prefer verbatim quotes with URLs. Type each finding complaint / ask /
   existing-spend.

2. Write out/research/<YYYY-MM>.md, under 900 words:
   - top 8 pains ranked by evidence strength, 1-2 verbatim quotes each with URL
   - 12-15 phrases people use
   - which existing pillars and angles the evidence supports or contradicts, mapped to
     post numbers from out/audit/content.md
   - product signals for fond (what people ask for or pay for)
   - exactly 3 recommendations on which queued posts to move up
   Open with a one-line note on what was unreachable.

3. Append 5-10 items to state/freshness.json "items" (append only, never edit or delete
   existing items). Format per item:
   {"id": "<unique-kebab-id>", "source": "<where>", "observedAt": "<YYYY-MM-DDT00:00:00.000Z>",
    "date": "<YYYY-MM-DD>", "text": "<short verbatim or faithful observation>", "url": "<url>"}
   observedAt must be the real run date; the HARVEST rung and the entropy guard only count
   items from the last 14 days. Log unreachable sources as an item too, so the gap is visible.

4. Run `npm run decide` and report what it says. Run nothing that renders or writes elsewhere.

Final report (under 20 lines): file paths, the top 3 pains, any angle the evidence
contradicts, items appended, decide output, and every UNVERIFIED claim.
```

## After the run

Adi reads `out/research/YYYY-MM.md`, decides which queue moves to make, and handles any Reddit gap by hand. Product signals go to the product backlog, not to the post queue.
