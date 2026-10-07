# TikTok cadence (Wave 3.3 recommendation)

Status: recommendation only. Adi chooses. Dated 2026-10-07. Web claims below are from
third-party blogs plus TikTok help pages; verify the two marked CHECK before relying on them.

## 1. Cadence

Recommend 3 posts per week: the IG Tuesday and Thursday posts the same day, plus one extra
save-magnet from the LATER queue on Saturday. TikTok photo posts reuse the existing
`tiktok/` folder (9:16) and `tiktok.txt`, so each costs about 5 minutes. Hold this for 4
weeks, then go to 4-5/week only if views per post are not falling as volume rises.

Saturday extras are chosen from save-magnets (out/audit/content.md section 4) that are
clean-sourced and NOT in the first 8 IG slots: 57, 44, 25, 13. When an extra's IG date
arrives (57 on Nov 12, 44 on Nov 24, 25 on Dec 3, 13 on Dec 10) post it to IG only; do not
repeat it on TikTok.

| Week | Thu | Sat | Tue |
|---|---|---|---|
| 1 | Oct 8 post-9 Counter vs. Fridge | Oct 10 post-57 Wrong Drawer (herbs) | Oct 13 post-58 5 Things to Freeze |
| 2 | Oct 15 post-1 Shelf Is Rigged | Oct 17 post-44 Quick Pickle | Oct 20 post-5 The Number |
| 3 | Oct 22 post-43 Fridge 5 Degrees | Oct 24 post-25 Rotisserie Chicken | Oct 27 post-2 Back-of-Store Trap |
| 4 | Oct 29 post-6 Expiration Date | Oct 31 post-13 Freezer Hacks | Nov 3 post-61 Fridge Map |

Folders: `READY-TO-POST/<date> <Dow> - post-N <title>/tiktok/`. Saturday extras are in the
LATER list, so run `npm run tap` and open that post's folder by number. Post-9 and the
IG-day posts keep their SCHEDULE.txt dates; Oct 8 may already be past when you read this,
in which case start at Oct 13 and slide the table one slot.

After week 4 (Nov 5 onward): Tue/Thu follow SCHEDULE.txt (3, 7, 57, 4, 10, ...), Saturday
takes the next unused save-magnet (14, 16, 24, 29, 37, 38). Skip any post marked
CHECK-FIRST (33, 34) until Adi clears its hero figure.

## 2. Posting method options

| Option | Cost | Trending sound | Account needed | Notes |
|---|---|---|---|---|
| Phone app, manual, same day | Free | Yes, full library | Personal or Creator | 5 min per post; no scheduling; the CLAUDE.md-safe default |
| TikTok Studio (desktop) schedule | Free | Weak: sound is added at upload, desktop picker is limited (CHECK) | Creator or Business; not Personal | 15 min to 10 days ahead; photo carousels supported; cannot edit after scheduling |
| Metricool | Free tier (sources say 20 to 50 posts/month; CHECK) | Trending Top 100 sounds only with a Business account; Personal gets random music | TikTok Business to get trending audio | Official partner; best analytics |
| Buffer | Free: 3 channels, 10 posts each; paid about $5-6 per channel | None found | Business-linked API | Sources disagree on TikTok carousel support; test first |
| Later | No free plan, 14-day trial | Notification only | Business-linked API | Paid |
| Sked | Paid (not verified) | Not verified | Business-linked API | Skip |

Constraint that decides it: the owner is 17, and TikTok states only accounts of owners over
18 can link to TikTok For Business. Business accounts also swap the general sound catalogue
for the Commercial Music Library. That removes Metricool's trending-sound feature, and
CLAUDE.md section 4 already notes unaudited API apps are private-only and a personal account
keeps the full music library.

Recommendation: phone app, manual, same day, on a Personal or Creator account (a free
switch to Creator is optional and does not change the sound library; this is the source's
claim, confirm in Settings). Reasons: it keeps trending sounds, costs nothing, needs no
18+ account, and matches docs/META-SCHEDULING-AGENT.md section 7. Revisit a scheduler after
Adi turns 18 or if the three-a-week routine proves to be a burden.

## 3. Per-post checklist

1. Open the post folder, AirDrop or sync `tiktok/01.png ...` (9:16, 1440x2560) to the phone in order.
2. TikTok app, plus, Photo mode, select all slides in order. 5 to 8 slides is the working range.
3. Paste TITLE (90 chars max) from `tiktok.txt`; paste CAPTION and the 3 HASHTAGS. Copy verbatim, never edit copy.
4. Sound: pick a trending sound in-app, set its volume low (about 5-10%) so it does not drown the text. Prefer a sound that fits a calm how-to tone.
5. Post at the same clock time as the IG slot (Tue 3:00 PM ET, Thu 12:30 PM ET); Saturday around 11:00 AM ET (guess, test it).
6. Stay on for 60 minutes: reply to every comment, pin the best one.
7. Log it: `node tools/log-post.mjs N --published --platform tiktok --date YYYY-MM-DD`.

## 4. What to measure and how it feeds log-post

Per post, read from TikTok analytics at 48 hours, and again at 7 days for the weekly
review: views, saves, shares, profile views, new followers (likes and comments optional).
Always judge ratios with views as the denominator: saves/views, shares/views, followers per
1,000 views. TikTok shows no per-slide data, so do not try.

Current state: `tools/log-post.mjs` has a `--platform instagram|tiktok` flag (line 89) and
the IG metric flags `--reach --saves --sends --profile --follows`, but it keeps one row per
post and one platform label, so TikTok numbers would overwrite IG numbers. Proposed (not
implemented):

- `--tt-views N`, `--tt-saves N`, `--tt-shares N`, `--tt-profile N`, `--tt-follows N`
- `--tt-published --date YYYY-MM-DD`, kept separate from the IG `publishedAt`
- Store under `row.tiktok = { publishedAt, views, saves, shares, profile, follows }`
- tap/decide read `row.tiktok` and report save-magnet vs stakes saves/views per platform

Until built, log TikTok as a manual line in the weekly note and leave IG columns alone.
Decision rule after 4 weeks: if TikTok median views per post is under 200 and nothing
drives profile views, drop to 2/week (Tue/Thu only) and spend the saved time on IG Reels.

## Sources
- https://help.metricool.com/how-to-add-music-to-your-tiktok-posts-from-metricool-kap4e
- https://metricool.com/how-to-post-on-tiktok/
- https://hashtagtools.io/blog/buffer-vs-later-vs-metricool-best-scheduler-2026
- https://www.hopperhq.com/blog/how-to-schedule-tiktok-posts-desktop-mobile/
- https://ads.tiktok.com/help/article/troubleshooting-linking-tiktok-and-tiktok-for-business-accounts?lang=en
- https://www.soundstripe.com/blogs/why-can-i-only-use-commercial-sounds-on-tiktok
