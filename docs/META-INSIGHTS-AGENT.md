# Meta Insights reading agent

Paste this whole file to a Claude agent that has **Claude in Chrome** and can see Adi's Chrome.
It READS per-post numbers from Instagram Insights and reports them. It changes nothing,
renders nothing, writes no copy. Written 2026-10-07. Meta moves its UI often: every menu path
below is marked "verify on screen". When the screen disagrees with this file, trust the
screen, follow the intent, and say what differed in the final report.

---

## 1 · Your job in one paragraph

Work out which fond posts are due for measurement (§3), open Instagram Insights for the
@getfond account in a **new tab**, read **reach, saves, shares (sends), profile visits and
follows** for each due post, and print the exact `node tools/log-post.mjs` lines in §6 for Adi
to paste. Why it matters: the loop's kill criterion (`src/decide.mjs`) scores each post as
saves/reach plus a weighted sends/reach. Without these numbers every claim about what works
on the account is a guess.

## 2 · Hard rules (stop and ask Adi rather than break one)

1. **Read only.** Look, scroll, open the Insights view. Nothing else.
2. **Never click** Edit, Delete, Archive, Boost, Promote, Reply, Comment, Share, Create,
   Schedule, or anything in Settings. No ads, no DMs, no follows.
3. **Never guess a number.** If a metric is not shown for a post, report it as `n/a`. Do not
   estimate, round up, or copy from another post. A missing number is fine: the loop treats a
   post without reach or saves as unscored, not as a miss.
4. **Never click anything that opens a browser confirm dialog** (it freezes the extension).
5. **Do not touch Adi's other tabs.** Open your own.
6. If a step fails twice, stop and report where. Do not improvise around a login wall or a
   security check; ask Adi.

## 3 · Which posts

Adi gives you (or you read from the repo) two files:

- `state/schedule.json`: post number to `{date, time, status}`.
- `state/performance.json`: post number to the numbers already logged.

A post is **due** when all three hold:

- its `status` in `state/schedule.json` is `scheduled` or `published`;
- its `date` is **at least 7 days before today** (Instagram's numbers need a week to settle);
- `state/performance.json` has no `reach` for it yet.

If you cannot read the repo files, ask Adi to paste the due post numbers and their dates.
Do not guess which posts are due. Skip a post whose date is under 7 days old and list it
under SKIPPED.

## 4 · Where the numbers are (verify on screen)

Two routes reach the same data. Try A first.

**A. Instagram professional dashboard (web).** Open `https://www.instagram.com/getfond/`,
confirm the handle, open the post whose date matches (carousels show a stacked-squares icon),
then **View insights** under the post (verify on screen: it may be a bar-chart icon, or
**Professional dashboard** in the left menu then **Content you shared** or **Account
insights**). Set the content filter to **Posts** and a date range that covers the post date.

**B. Meta Business Suite.** Open `https://business.facebook.com/`, confirm the account
switcher shows fond / @getfond, then **Insights** (left menu) then **Content** (verify on
screen: may read "Content" or "Posts and stories"), filter to Instagram, find the post by
date and thumbnail, and open its insights panel.

Read these per post:

| Metric to report | Label on screen (verify on screen) | log-post flag |
|---|---|---|
| Reach | Accounts reached (not "Views" or "Impressions") | `--reach` |
| Saves | Saves | `--saves` |
| Sends | Shares (Instagram counts sends and reposts under shares) | `--sends` |
| Profile visits | Profile activity: profile visits | `--profile` |
| Follows | Follows (follows attributed to the post) | `--follows` |

Notes:

- **Reach, not views.** Instagram now leads with Views. The loop divides by reach. If only
  Views is visible, report reach as `n/a` and add the Views figure in PROBLEMS.
- **Slide-3 swipe-through is optional and probably unavailable.** Per-slide reach is not
  confirmed in Insights. Do not hunt for it. If a per-slide reach graph happens to be on
  screen, add it under NOTES as slide-1 reach and slide-3 reach, and Adi decides.
- Read the number for the post's own **lifetime**, not a 7-day account total.
- Time-zone or rounding differences ("1.2K") are fine: report exactly what is shown and
  mark rounded figures with `~` in NOTES.

## 5 · The loop, one post at a time

1. Note the post number, its date, and the thumbnail you expect (slide 1 title from
   `READY-TO-POST/` folder name if you have it).
2. Open the post's insights (§4). Confirm the date and slide count match before reading.
3. Read the five metrics. Do not interpret them.
4. Close the panel and move to the next post. Never leave a panel open that has an edit
   control focused.

## 6 · Report back in exactly this shape

```
MEASURED (read from Insights, verified against post date)
  post-N  YYYY-MM-DD  reach R  saves S  sends D  profile P  follows F
  ...
SKIPPED   post-N  reason (under 7 days old / not found / metrics not shown)
NOTES     rounded figures (~), slide-3 reach if shown, anything unusual
PROBLEMS  anything that differed from this file (UI labels, Views instead of Reach)
ADI RUNS  one line per measured post, exact flags, leave out any metric that is n/a:
  node tools/log-post.mjs N --reach R --saves S --sends D
  node tools/log-post.mjs N --reach R --saves S --sends D --profile P --follows F
NEXT RUN  the date the next scheduled or published post turns 7 days old
```

Print the `ADI RUNS` lines with real numbers substituted, one per post, and nothing else
Adi must edit. A post missing reach or saves still gets a line with whatever IS known: the
loop will mark it unscored rather than count it as a miss.

---

## Why it's set up this way (for Adi)

- **Read-only on purpose.** Insights is the one place an agent can wander into Boost or Edit
  by mistake. A reading agent that cannot change anything costs you nothing when it errs.
- **Seven days, not seven hours.** A carousel keeps collecting reach for days; scoring it
  early understates every post and biases the kill criterion against recent formats.
- **Saves and sends, not likes.** They are the signal for "a stranger found it worth keeping
  or forwarding", which is what `gtm.json` `organicMetrics` optimises.
- **`n/a` over a guess.** The scorer skips posts with missing data. A wrong number would be
  scored, and could retire a good format or keep a dead one.
- **Run it weekly,** after the scheduling agent's posts age past the 7-day lag. `npm run
  decide` says MEASURE when anything is due.
