# Account Profile Spec: @getfond (Instagram and TikTok)

Drafted 2026-10-07 (Wave B1). Phase: setup (state/launch.json: waitlistLive false, foundingMemberLive false). Precedence on conflict: tokens.json, gtm.json, then this file. Character counts were produced with `python3 -c "print(len(...))"`; a line break counts as 1. No hex values appear here; colours are token names from tokens.json.

Global copy rules applied to every field: no emojis, no em dashes, dry voice, product is "fond", no waitlist, no pre-order, no "link in bio", no "coming soon to the App Store", no launch date, no user counts, no statistic unless it is a verified gtm.json stat. The only CTA is in the spirit of gtm.json `ctas.setup`.

Source key: GTM = gtm.json; IGR = out/account/ig-research.md (section number); TTR = out/account/tt-research.md; LAND = out/account/landscape.md; SCHED = READY-TO-POST/SCHEDULE.txt. Anything the research marked UNVERIFIED is flagged "verify on screen": Adi or the Cowork agent must confirm it in the app before acting.

---

## 1. Instagram (@getfond)

### 1.1 Username
- Chosen: `getfond`. Already the handle; do not change it. Changes dim search for a few days and hold the old handle (IGR 1).
- Reason: identity, matches TikTok, no need to repeat the keyword. Source: IGR 1, LAND 2.

### 1.2 Name field (30 max, searchable)
- Chosen: `fond | Food Waste Tips` (22 chars)
- Alt 1: `fond | Grocery Savings` (22 chars)
- Alt 2: `fond | Fridge and Food Tips` (27 chars)
- Reason: brand first, one keyword, never repeat the handle, never stack keywords. "Food waste" is the account's real territory. "Grocery Savings" is the better alt only if the money angle gets validated (the Language Bank has no dollar-framed rows, so it is still a hypothesis, LAND 3).
- Source: IGR 1 (pattern), LAND 2 (template, "pick one, do not stack").
- Verify on screen: name-change limits are disputed between sources (IGR 1, UNVERIFIED). Change it once, correctly.

### 1.3 Bio (150 max, indexed for search)
- Chosen (119 chars):
  ```
  Food waste, fridge storage and grocery money.
  Save this for your next grocery run. Follow for more, something's coming.
  ```
- Alt 1 (125 chars):
  ```
  Fridge storage, date labels and grocery money, sorted.
  Worth saving. Follow along, we're building something for exactly this.
  ```
- Alt 2 (130 chars, carries the positioning line verbatim):
  ```
  the 17-year-old who builds systems that make invisible things visible
  Starting with wasted food. Save, follow, something's coming.
  ```
- Reason: line 1 is plain keywords in the audience's own territory (plain beats poetic for search, IGR 2; fridge, groceries, money from LAND 3). Line 2 in the chosen and Alt 1 versions is `ctas.setup` entries 1 and 2 verbatim, so it is pre-launch honest by construction. No emoji, no link wording, no counts.
- Positioning line (Decision 1, section 4): left out of the bios; the chosen bios stay. GTM positioning.rule says it goes in "every bio, every platform", but @getfond is the faceless distribution arm, not the credibility arm (GTM stance.note). Alt 2 carries it and is not used.
- Source: GTM ctas.setup, positioning, stance; IGR 2; LAND 2.

### 1.4 Link
- Recommendation: leave the link field EMPTY.
- Reason: getfond.app is not live, so any link points at nothing or implies a waitlist/product that does not exist, which the honesty rules forbid. No evidence an empty field hurts reach (IGR 3, absence evidence, UNVERIFIED). When the waitlist goes live, add the site as the first of up to 5 links (phone app only, IGR 3) and change the CTA tier then, not before.
- Not recommended: a Linktree-style page (another surface to maintain, implies something to click).
- Source: state/launch.json, GTM honesty and ctas, IGR 3.

### 1.5 Profile picture brief
- Content: the fond mark only. No text, no wordmark, no face, no photo, no gradient, no shadow.
- Colour (token names): primary is Off-White mark on Slate Black. Fallback is Slate Black mark on Fond Green. Never pure black or pure white. Never Signal Red (loss/waste/cost only).
- Layout: mark centred, about 60 to 70 percent of the circular crop, generous padding so the circle never clips it (IGR 4).
- Export: square PNG, 720 px or larger (IGR 4).
- Legibility at 110 px: the mark must read as one silhouette with no thin strokes or interior detail. View it at 110 px inside a circular crop before uploading; if it needs more than one glance, simplify.
- Contrast: Off-White on Slate Black is the safe pair. Check any other pair against docs/CONTRAST-AUDIT.md first (Harvest Gold on Off-White is not legible).
- Use the same image on TikTok.
- Source: CLAUDE.md section 4, tokens.json palette, IGR 4, LAND 2.

### 1.6 Account type, category, contact buttons
- Account type: Adi decides; nothing here depends on it.
- Category label (if the account type offers one): chosen `Education`; Alt 1 `Digital creator`; Alt 2 `Blogger`. Neutral labels (IGR 5). Verify on screen which labels are offered. If no category field is available, skip it and note it.
- Contact buttons (email, phone, address): **none**. Reason: no real fond inbox exists, and a button invites messages nobody has committed to answering; no public phone or address for a 17-year-old. Revisit when a fond-owned inbox exists. Source: IGR 5 (judgement).

### 1.7 Pinned posts (max 3; the last one pinned shows first, left)
Pins need live posts, so pin after each publishes. Dates from SCHED (NOW block).

- **Pin 1, leftmost: post-5, "The Number" [The $2913 Problem], Tue 2026-10-20.** States what the account is about using the one verified stat (EPA, 2025; GTM money-leak angle). It is the nearest thing to an intro post.
- **Pin 2: post-9, "The Counter vs. Fridge Cheat Sheet" [Store It Right], Thu 2026-10-08.** Cheat-sheet format is the most save-worthy type and this is the first post live.
- **Pin 3: post-58, "5 Things You Didn't Know You Could Freeze" [Waste Hacks], Tue 2026-10-13.** Practical save-magnet in a different pillar.

- Order to pin: post-58, then post-9, then post-5 last so post-5 shows first. The 4th-pin behaviour is disputed (IGR 6): verify on screen.
- Until 2026-10-20, pin whichever of post-9 and post-58 are live. Never pin before publishing.
- Rotation: first review 2 to 4 weeks after pinning. Replace any pin whose save rate is below the account median with the top post by saves/reach from Insights (GTM organicMetrics.primary). Then review monthly. Check each cover crop in the grid.
- Runner-up pick: post-1 "The Shelf Is Rigged" (Thu 2026-10-15). No dedicated intro carousel is planned for now (Decision 3, section 4).
- Source: SCHED, GTM angles and organicMetrics, IGR 6.

### 1.8 Story Highlights (LATER: skip until Adi has posted a few Stories)
Status: deferred per Decision 5 (section 4). The plan below is kept for when real Stories exist; it is not part of the current setup.

Highlights need real Stories first. Do not create empty highlights. This repo renders files and does not publish, so Adi must post the Stories.

Names (15 max each), with 2 alternates:
1. `Start here` (10). Alts: `About` (5), `Hello` (5). Content: what the account is; the $2,913 stat (EPA, 2025).
2. `Fridge storage` (14). Alts: `Storage` (7), `Fridge` (6). Content: Store It Right cheat sheets.
3. `Date labels` (11). Alts: `Labels` (6), `Expiry` (6). Content: sourced label content only (GTM 43% stat, 2025 consumer label-confusion survey, verified).
4. Optional: `Grocery money` (13). Alts: `Money` (5), `Groceries` (9). Content: Supermarket Secrets and money-leak posts.
5. Optional: `Freezer` (7). Alts: `Freezing` (8), `Freezer tips` (12). Content: freezer how-tos.

`Date labels` and `Freezer` are judgement picks, not from IGR 7.

Cover brief (one system for all, 1080x1920, icon inside the centre 60 percent so the circular crop never clips; displayed at about 110 px):
- Background Slate Black; one simple glyph per cover in Off-White linework (house, fridge outline, calendar, coin outline, snowflake). No text on covers.
- Accent: Fond Green as the single fill on the `Start here` cover; Steel Blue on the `Date labels` cover; Harvest Gold at most once, on one cover. Signal Red never.
- No gradients, shadows, photos, pure black or pure white.
- Source: IGR 7 (3 to 5, safe zone; value of Highlights is from marketing blogs, UNVERIFIED), tokens.json, CLAUDE.md section 4.

### 1.9 Settings checklist (Instagram)
- [ ] Account visibility is Public (teen default is private).
- [ ] Category set if the account offers the field (1.6); otherwise skipped and noted.
- [ ] Name, bio and photo applied exactly as chosen; link field empty.
- [ ] Account suggestions ("suggest account to others"): leave ON; verify the exact label on screen (IGR 8).
- [ ] Search-engine indexing of the profile: verify on screen whether the toggle exists (IGR 8, UNVERIFIED); leave ON if present.
- [ ] Comments: default filters on, add a custom spam word list, hide offensive comments (IGR 8).
- [ ] Tags and mentions: leave defaults; verify on screen (UNVERIFIED).
- [ ] Hide the Threads badge unless Threads is used (IGR 8).
- [ ] Message requests: leave at teen defaults; do not loosen.
- [ ] Two-factor authentication ON; recovery email is the owner's own.
- [ ] Linked accounts: connect only what Meta Business Suite needs (section 3).
- [ ] No posting, commenting, DMing or following during setup; profile edits only.

---

## 2. TikTok (@getfond)

### 2.1 Username
- Chosen: `getfond`. Allowed characters and length (letters, numbers, underscore, period; 2 to 24) and change cadence are third-party and UNVERIFIED (TTR 2): verify on screen and do not change it casually.
- Source: TTR 2, IGR 1 (consistency).

### 2.2 Name field (display name)
- Chosen: `fond | food waste` (17 chars)
- Alt 1: `fond | food waste tips` (22 chars)
- Alt 2: `fond | grocery savings` (22 chars)
- Reason: same brand-plus-one-keyword pattern as Instagram so the two read as one brand. "Food waste" appears in four of the five pillar keyword sets in GTM tiktokKeywords. Whether the name field is weighted in TikTok search is UNVERIFIED (TTR 2), so keep it short and honest. Verify the length limit and change cadence on screen.
- Source: TTR 2 and recommendation 3, LAND 2, GTM tiktokKeywords.

### 2.3 Bio (80 max, no URL)
- Chosen (73 chars): `Food waste and grocery money tips. Save them. Follow, something's coming.`
- Alt 1 (78 chars): `Fridge, date labels, grocery money. Save this. Follow, something's on the way.`
- Alt 2 (72 chars): `Wasted food, explained. Save this, follow for more. Also on IG: @getfond`
- Reason: keywords first (TikTok search reads name plus bio, TTR 3, UNVERIFIED), setup-phase CTA in the spirit of `ctas.setup`, no URL (a plain-text URL is non-clickable and burns characters, TTR 4), no waitlist wording. Alt 2 points to Instagram by handle only, which is not a product claim. No emoji, so no 2-character penalty; line breaks count.
- Source: TTR 3, GTM ctas.setup and honesty.

### 2.4 Link
- Do not add a website or link-in-bio tool: nothing is live. The "1,000 followers" link rule cited by guides does not match TikTok's current documentation, which ties a bio link to Business verification (18+) (TTR 4, UNVERIFIED), so the field may not appear.
- Allowed workaround: the Instagram social button in Edit profile, if the app shows it (verify on screen; older sources say only one of Instagram/YouTube shows, TTR 4, UNVERIFIED). If it does not appear, use bio Alt 2 or skip.
- Source: TTR 4 and recommendation 5.

### 2.5 Profile photo
- Same image as Instagram (1.5): fond mark, Off-White on Slate Black, centred 60 to 70 percent, no text. Same 110 px legibility test.
- Profile video avatar: skip (nothing current found, TTR 5, UNVERIFIED).

### 2.6 Account type
- Account type: Adi decides; nothing here depends on it.
- Facts only: a bio link is tied to Business verification (18+) per TTR 4, and a personal-account link has been reported to need 1,000 followers (UNVERIFIED); if a field is not offered, skip it.
- Do not use TikTok Shop, ads or LIVE (LIVE is 18+, TTR 6).
- Source: TTR 1 and recommendation 1.

### 2.7 Pinned videos (max 3)
- Pin only once 10 or more posts exist (TTR recommendation 7). Mirror the Instagram picks by topic (post-5, post-9, post-58), same 2 to 4 week review rule.
- Whether photo-mode posts can be pinned and how the cover is chosen are UNVERIFIED (TTR 5): verify on screen. By default the first image is the cover, so slide 1 (the hook) leads.
- Source: TTR 5, SCHED.

### 2.8 Settings checklist (TikTok)
- [ ] Adi, on the phone (Decision 6): switch the account from Private to **Public** (teen default is private).
- [ ] Adi, on the phone (Decision 6): review "Suggest your account to others"; enable if present and allowed for a 17-year-old (TTR 6 says it is off for 13-17, UNVERIFIED for 17-year-olds in the app).
- [ ] Downloads and direct messages: leave at teen defaults; do not loosen.
- [ ] Comments: teen defaults, spam filter on.
- [ ] Instagram linked via Edit profile if the button appears (2.4).
- [ ] Two-factor authentication ON.
- [ ] No posting, commenting or following during setup; profile edits only.

---

## 3. Meta Business Suite setup checklist (content planning)

Scheduling itself is in docs/META-SCHEDULING-AGENT.md; this is setup only.
- [ ] Log in as Adi only. Meta ad accounts require 18+ (GTM paid.blockedReasons); no ads are set up.
- [ ] Confirm @getfond (Instagram) is **connected** to Business Suite. If a linked Facebook Page is required and none is visible, stop and ask Adi; do not create one.
- [ ] Open **Planner**; confirm @getfond is selectable and the calendar loads; default to week or month view.
- [ ] Timezone **America/New_York**. Slots are Tue 3:00 PM ET and Thu 12:30 PM ET (SCHED).
- [ ] **Notifications**: keep only new-comment and scheduled-post-failure alerts; turn off marketing and tips emails.
- [ ] **Insights**: confirm they load for @getfond (reach, saves, sends feed GTM organicMetrics); report any teen-account limitation (IGR 5, UNVERIFIED).
- [ ] **Inbox auto-replies**: OFF. If ever on, the text must be honest and plain, for example "Thanks for the message. This is a small account run by one person, so replies can be slow." No waitlist, no link, no promises.
- [ ] **Roles**: Adi only, full control. If anyone or any app other than Adi appears, do not remove it; report it to Adi. Add no third-party apps.
- [ ] Schedule, edit and publish nothing during this checklist.

---

## 4. Decisions (Oct 7)

1. Positioning line: left out of the bios; the chosen bios stay.
2. Name keyword: "Food Waste Tips"; the chosen name field stays.
3. Intro carousel: none for now; pin post-5 first as specced (1.7).
4. Account type: Adi decides it himself. This spec makes no account-type recommendation; contact buttons stay none until a real fond inbox exists.
5. Highlights: skipped until Adi has posted a few Stories; the plan in 1.8 is marked later and is out of scope for the Cowork setup.
6. TikTok: switch to Public with "suggest to others" reviewed, done by Adi on his phone (2.8); Cowork does not touch TikTok.
