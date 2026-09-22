# WEEKLY.md — your whole job

**One sitting a week, ~20 minutes. Sunday is suggested; the point is the same slot every week.**

Everything a machine can do runs without you. What's left needs a human because
Instagram publishing isn't wired to an API, numbers come from the Insights screen,
and only a person can say whether the account is worth following.

---

## The Sunday sitting

### 1 · Start the machine (1 minute, then it runs on its own)

Open Claude Code in `~/Desktop/contengine` and paste:

```
Read CLAUDE.md and WEEKLY.md, then run `npm run tap`.
Do the MACHINE action the tap names under "3. MACHINE" and only that action.
Copy is verbatim — never write, rewrite or tighten slide copy; flag gaps instead.
When done: `npm run test:autonomy` (must pass), `npm run tap` again, and one git commit.
```

Your phone gets the same block from the **Sunday Tap** task at 10am ET, so you never
have to find this file.

### 2 · Schedule the week (10 minutes) — while it runs

Double-click **`READY-TO-POST/index.html`**. Every post there passes all six gates,
carries real brief copy, and is already slotted two a week with pillars alternated.

For each post:
1. **business.facebook.com** → Create post → Instagram → drag in its slides **in order** →
   paste the caption (Copy button) → set the date shown → Schedule.
   *(Or the Instagram app: new post → Advanced settings → Schedule. Up to 75 days ahead.)*
2. Click **Copy "mark scheduled" command** and run it in Terminal. That's what removes it
   from the page and tells the engine it's gone out.

Schedule **everything on the page**. It holds at most a few weeks, so doing it all in one
sitting is how posts keep going out on weeks you don't sit down at all.

A post marked **⚠ CHECK-FIRST** has a big number the engine couldn't trace to a source.
Open its `CHECK-FIRST.txt`. If you can't confirm the citation in a minute, skip it.

### 3 · Log numbers that are due (3 minutes)

The tap lists which posts are due — each one a week after it went live, never sooner.
Open that post's Insights on Instagram and run what the tap shows:

```bash
node tools/log-post.mjs 32 --reach 1240 --saves 41 --sends 18 --slide3 0.42
```

`--slide3` = slide-3 reach ÷ slide-1 reach, from the per-slide graph. It's the primary
metric — the closest proxy for "a stranger stopped." Likes aren't collected; they don't
predict anything you care about.

### 4 · Read the tap's last lines (1 minute)

If it asks you something, answer it now. Don't let it carry silently to next week.

---

## First Sunday of the month (+25 minutes)

The tap prints this reminder itself. Open the month's posts side by side and ask:

- Does this look like **one account**? The gates can't answer that.
- Which **angle** and **format** won? Not which topic.
- Anything underperform three posts running? The loop will say `RETIRE_FORMAT`.
- Does the latest **📡 Trend Radar** section contradict an angle in `gtm.json`?
- Would **you** follow this account? If not, what's missing?

---

## One-time setup (do once, then never again)

- **@getfond must be a Professional account** (Settings → Account type → Creator or
  Business; free). Personal accounts can't schedule and have no Insights, so steps 2
  and 3 both depend on it.
- If Business Suite asks you to link a Facebook Page, you can skip it and schedule in
  the Instagram app instead — same result.
- `npx playwright install chromium` once, so Claude Code can render on your Mac.

---

## When something looks wrong

| The tap says | It means |
|---|---|
| `FIX_SPEC` | A post renders fine but its spec is malformed (e.g. empty diagram panels). Machine job — Claude Code handles it in step 1. |
| `HOLD` | Six or more posts are ready and unscheduled. The machine stops building until you schedule. That's deliberate. |
| `HARVEST` | New-idea fuel is stale. Friday's Trend Radar posts a JSON block in Notion; paste it into `state/freshness.json`. |
| `REQUEST_BRIEFS` | Copy exists outside this folder. `specs/COVERAGE.md` names the six files. Copy them into `briefs/` once. |
| A gate started failing | Claude Code must say whether the **gate got stricter** or the **output got worse** before touching either. |

**A week where the machine correctly did nothing is fine. A week where nothing moved
and nobody noticed is the only real failure.** The Sunday slot exists to prevent that.
