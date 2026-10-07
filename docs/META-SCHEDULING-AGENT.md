# Meta Business Suite scheduling agent

Paste this whole file to a Claude agent that has **Claude in Chrome** and can see Adi's
Chrome. It schedules the next few fond carousels on Instagram through Meta Business
Suite. It renders nothing, writes no copy, and publishes nothing immediately.

Written 2026-10-06 from current Meta and scheduling-tool documentation (sources at the end).
Meta changes this UI often: when the screen disagrees with this file, trust the screen,
follow the intent, and say what differed in the final report.

---

## 1 · Your job in one paragraph

Open Meta Business Suite in a **new tab**, and for each carousel in the scheduling
window (§3) create **one Instagram-only** post: upload that post's slides `01.png`,
`02.png`, … in that exact order, paste its `caption.txt` exactly as written, and **schedule** it for
its date and time. Then check every post in the Planner and report back in the §8 format.
That's it. Speed comes from doing the same short loop per post, not from shortcuts.

## 2 · Hard rules (stop and ask Adi rather than break one)

1. **Schedule, never publish now.** If the only button is "Publish" or "Share now",
   stop. Never click it.
2. **Instagram only.** Facebook must be unticked on every post. fond has no Facebook
   audience, and a cross-post is a public mistake that can't be scheduled away.
3. **Copy is verbatim.** Paste `caption.txt` exactly. Never edit, shorten, "improve",
   add emojis, or add hashtags. If the caption box rejects it, stop and report.
4. **Only folders from the window.** Never schedule a post twice. Before scheduling,
   check the Planner for an existing post on that date (§6).
5. **No deletions, no edits to existing posts, no settings changes, no ads, no boosts,
   no DMs, no comments.** Nothing outside creating these scheduled posts.
6. **Never click anything that opens a browser confirm dialog** (it freezes the
   extension). Meta's own in-page modals are fine.
7. If a step fails twice, stop and report what you saw. Do not loop.

## 3 · What to schedule (the window)

The posts live in Adi's repo as folders, one per post, already dated and in order:

```
~/Desktop/contengine/READY-TO-POST/
  2026-10-13 Tue - post-2 The Back-of-Store Trap/
     01.png 02.png ... 0N.png   <- Instagram slides, 4:5, upload in this order
     caption.txt                <- paste verbatim
     alt.txt                    <- per-slide alt text (see §5.6)
     tiktok/ + tiktok.txt       <- NOT for this agent (see §7)
     POST-ME.txt                <- summary: slide count, pillar
```

(If the repo has not been merged yet, the same folders are under
`~/Desktop/contengine/.claude/worktrees/refinery-plan/READY-TO-POST/`.)
`READY-TO-POST/index.html` shows the same list in a browser if you want an overview.

**Schedule the folders whose date falls between tomorrow and 28 days from today**,
oldest first. That is the window Meta Business Suite reliably accepts (its planner caps
near 29-30 days for many accounts; the Instagram app allows 75 days). Skip any folder
dated today or earlier: it needs a new date from Adi, so list it in the report.

**Times (US Eastern):** Tuesday **3:00 PM**, Thursday **12:30 PM**. These sit inside the
2026 high-engagement windows in both Sprout Social and Hootsuite data for those days.
If Business Suite shows a different timezone than America/New_York, convert, and say
so in the report.

## 4 · Start

1. Call `tabs_context_mcp`, then open a **new tab** at `https://business.facebook.com/`.
   Don't touch Adi's other tabs.
2. Confirm the account switcher (top left) shows the fond / @getfond business. If it
   shows anything else, stop and ask.
3. Read the folder list (§3) and write down the window: post number, date, time,
   slide count. You'll report against this list.

## 5 · The loop, one post at a time

1. **Create post.** Content (or Planner) → **Create post**. (On some accounts it's
   "Create" → "Post".)
2. **Placement:** tick **Instagram (@getfond)**, untick **Facebook**. Check it again
   before scheduling: the toggle sometimes re-enables itself.
3. **Media:** Add photo/video → Upload from computer → choose that folder's `01.png` …
   `0N.png`. Business Suite takes up to **10** images per carousel (our posts are 5-8).
   - If you can set files in the file picker, select all slides at once.
   - If your tools cannot reach the operating-system file picker, **stop and ask Adi**
     to drag the folder's numbered PNGs into the upload area. Then you continue.
   - **Check the order matches 01 → 0N** in the thumbnail strip. Uploads sometimes land
     out of order: drag thumbnails to fix. Wrong order breaks the story, so this check
     is mandatory.
   - **Crop:** the slides are 1080×1350 (4:5). If a crop control shows 1:1, set it to
     **original / 4:5** so nothing is cut off. Never crop into the slide.
4. **Text:** paste `caption.txt` exactly. It already contains the call to action and the
   hashtags. Leave location, collaborators and product tags empty.
5. **Schedule:** open the dropdown next to Publish → **Schedule** (or "Schedule post")
   → set the date and time from §3 → **Schedule**. Never use the plain Publish button.
6. **Alt text:** since April 2026 Business Suite **no longer supports alt text on
   scheduled posts**. Don't hunt for it. Note the post in the report under "alt text to
   add after it goes live". Adi pastes `alt.txt` per slide in the Instagram app once it
   is live (Edit → Advanced → Accessibility). Instagram's automatic alt text covers the
   gap until then.
7. Wait for the confirmation (toast or the post appearing in Planner), then next folder.

## 6 · Verify before you finish

Open **Planner** (calendar view) and check, for every post in your window:
- exactly one Instagram post on that date at the right time (no duplicates, no Facebook copy);
- the preview shows slide 01 first;
- the slide count matches the folder.

Fix anything wrong (open the scheduled post → edit date or order). If you can't fix it, report it.

## 7 · Not this agent's job (say so if asked)

- **TikTok:** Meta Business Suite cannot post to TikTok, and TikTok's own web scheduler
  does not take photo carousels. Adi posts TikTok from the phone on the same day, using
  the folder's `tiktok/` images and `tiktok.txt`, with a trending sound picked in-app.
- **Marking posts scheduled in the repo:** you can't run commands. In your report, print
  one line per scheduled post for Adi to paste:
  `node tools/log-post.mjs N --published --date YYYY-MM-DD`
  If you scheduled every post in the NOW section, one line covers them all:
  `node tools/log-post.mjs --scheduled-all` (it only touches the 28-day NOW window).
- Insights, comments and replies stay Adi's.

## 8 · Report back in exactly this shape

```
SCHEDULED (Instagram only, verified in Planner)
  post-N  YYYY-MM-DD  HH:MM ET  N slides
  ...
SKIPPED   post-N  reason
PROBLEMS  anything that differed from this file (UI changes, timezone, crops, order fixes)
ALT TEXT TO ADD AFTER GO-LIVE   post-N, post-N ...
ADI RUNS  one line per scheduled post: node tools/log-post.mjs N --published --date YYYY-MM-DD
NEXT RUN  on or after YYYY-MM-DD (the first date beyond this window, minus 28 days)
```

---

## Why it's set up this way (for Adi)

- **A 28-day rolling window, not all 52.** 52 posts at two a week is six months, beyond
  any Meta scheduling horizon. Run this agent every ~3-4 weeks; it takes the next batch.
- **Consistency beats volume** for a small account: the same two slots every week, no gaps.
- **Scheduled posts are not penalized.** Native Meta scheduling publishes the same as a
  manual post; the reach risk is missed weeks, not the tool.
- **If you want 75 days or alt text at schedule time,** schedule from the Instagram app
  instead (New post → Advanced settings → Schedule, and per-slide alt text before
  scheduling). It's slower per post but has neither limit.

## Sources

- [Scribely: Meta Business Suite no longer supports alt text on scheduled posts (Apr 2026)](https://www.scribely.com/post/social-media-accessibility-part-2-how-to-make-your-social-media-content-accessible-2)
- [Accessible Social: alt text through Meta Business Suite](https://www.accessible-social.com/images-and-visuals/alt-text/meta-business-suite)
- [PostEverywhere: scheduling Instagram carousels in 2026 (10-image Business Suite cap, 75 days, 25/day)](https://posteverywhere.ai/blog/how-to-schedule-instagram-carousels)
- [SocialBee: Meta Planner 30-day scheduling restriction](https://socialbee.com/blog/meta-planner-30-day-post-scheduling-restriction/)
- [Storrito: Instagram's 20-slide carousel limit](https://storrito.com/resources/how-instagrams-20-slide-carousels-work-and-what-the-new-limits-are/)
- [Sprout Social: best times to post on Instagram](https://sproutsocial.com/insights/best-times-to-post-on-instagram/)
- [Hootsuite: best time to post on Instagram](https://blog.hootsuite.com/best-time-to-post-on-instagram/)
- [Metricool: scheduling TikTok in 2026 (web scheduler is video-only, 10 days)](https://metricool.com/schedule-tiktok-videos/)
