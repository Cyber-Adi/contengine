# Wave 1 summary (2026-10-07)

Sources: content.md, visual.md (uncalibrated critic), pipeline.md, growth.md in this folder.

## Do not run the scheduling agent until W2a lands
The first 8 queued posts are all stat/stakes posts, post 4 (a duplicate of 18) is in slot 7,
and the first save-magnet is in slot 9.

## Wave 2 work that needs no decision (starting now)
- **W2a schedule:** persist slot dates (state/schedule.json); order by save-worthiness, pillar
  alternation, no near-duplicate within 6 weeks; open with save-magnets; `--scheduled-all`
  window-aware (NOW = next 28 days vs LATER); exclude posts Adi drops.
- **W2b measurement:** HOLD replaced by a scheduling-window rule (SCHEDULE when the next 28 days
  have unscheduled ready posts; HOLD only copy-generating rungs); kill criterion on real save rate
  and a true format field, missing data = no score not a miss; slide-3 metric made optional
  (per-slide reach is unconfirmed in IG Insights); `docs/META-INSIGHTS-AGENT.md` read-only brief.
- **W2c docs + CI:** CLAUDE.md / HANDOFF / plans with current numbers; `npm run test:all` in the
  weekly Action.
- **W2e engine:** headline vs top-right micro-label overlap on 9 posts (24, 34, 40, 41, 51, 52, 53,
  57) passed every gate: add a collision check + fixture, fix layout. Slide-1 upper-half blank
  (~30 posts) and tall near-empty two-box diagrams (~24) as systemic layout improvements.

## Decisions for Adi (W2d waits on these)
1. Drop near-duplicates: 4 (keep 18), 10 (keep 24), 23 (keep 3), 19 (keep 7), 53 (keep 9),
   13 (keep 58), 14 (keep 54). Drop means removed from the queue, never deleted.
2. Uncited hero numbers on approved posts 31, 33, 34, 36, 46: render qualitatively (CLAUDE.md
   default), or supply sources.
3. Claims: 26 "No ads. No data selling.", 30 "$1,500 savings", 44 "10x", 52 figures, 60 "didn't
   move", 63 stale "TestFlight this summer": confirm, demote, or drop each.
4. Post 49 (eggs, top visual score) has placeholder copy: is there a real brief for it?
5. 34 of 52 posts are CTA Tier 2 (now the soft setup line); gtm.json wants most posts Tier 0.
   Move some to Tier 0 (no CTA line at all)?

## Growth facts that change the plan
- Hold 2/week for 4 weeks, then consider 3. 6-8 slides, end on a send prompt.
- Keyword in caption line 1, 3-5 hashtags, alt text anyway.
- First hour: reply, pin, reshare to Stories.
- Per-slide reach on IG is unconfirmed: measure sends, saves, follows, profile visits per reach.
- TikTok photo posts need the app or a third-party scheduler.
