# Visual audit (W1b): uncalibrated model critic, report-only

Scope: contact-sheet.png for every post with N<9000 (53 sheets found, not 52), each downscaled to <=1000px long edge and viewed once. Rubric from src/critic.mjs: STOP, STAND, ARRIVE, SAVE, FAMILY, 1-5, pass mark 4. Everything below is uncalibrated model critic, report-only. It must not steer scheduling or block a post. Individual slides were not opened, so element sizes are judged at sheet scale (about 245px per slide) and small-text findings are approximate.

Comparison with state/critic.json (3 posts): post 5 there is STOP 3 / STAND 5 / ARRIVE 5 / SAVE 5 / FAMILY 4 about a five-line headline with no number. The current out/post-5 sheet opens with a $2,913 hero, so that render has changed since 2026-10-01 and the old score is stale; I scored STOP 5. Posts 31 and 32 agree directionally on the weakness in slide 2 (small items, bare lower half) but I scored them a notch higher on STAND and ARRIVE.

Mean scores: STOP 4.04, STAND 3.74, ARRIVE 3.89, SAVE 3.98, FAMILY 4.49. Posts scoring under 4 per dimension: STOP 8, STAND 15, ARRIVE 15, SAVE 17, FAMILY 0.

## Scores per post

| Post | STOP | STAND | ARRIVE | SAVE | FAMILY | Total | Note |
|---|---|---|---|---|---|---|---|
| 1 | 4 | 4 | 4 | 4 | 5 | 21 | s1 headline low, no number; s2 list splits one sentence across 3 items; s3 lower half bare |
| 2 | 4 | 4 | 4 | 3 | 5 | 20 | no screenshot slide; s2 list small, lower 40% bare; s5 timeline sparse |
| 3 | 4 | 4 | 4 | 4 | 5 | 21 | s4 $2,913 hero strong; s2 bottom half bare |
| 4 | 4 | 3 | 4 | 3 | 5 | 19 | s2 four-line headline crowds 3 tiny list rows; s6 cards tiny text, empty lower cards |
| 5 | 5 | 4 | 5 | 5 | 5 | 24 | s1 $2,913 hero stops scroll; s2 list ok; critic.json score differs (3/5/5/5/4) render changed |
| 6 | 4 | 4 | 4 | 5 | 5 | 22 | s4 43% hero is save slide; s1 headline low-weighted |
| 7 | 4 | 4 | 4 | 4 | 5 | 21 | s1 headline bottom; s2 headline 4 lines vs small list; s5 timeline sparse |
| 8 | 4 | 4 | 4 | 4 | 5 | 21 | s1 headline low; s4 $2,913 hero reused from post 5/9; s5 list sparse |
| 9 | 4 | 4 | 4 | 4 | 5 | 21 | s4 $2,913 hero repeated across 5,8,9 (family dup); s2 cards small text |
| 10 | 4 | 4 | 4 | 5 | 5 | 22 | s1 headline low; s3 7 foods card lists ok; s4 cards empty tops; most useful save carousel |
| 13 | 4 | 4 | 4 | 5 | 5 | 22 | s1 headline low; s2 ethylene explainer; s4 cards small text with large empty box |
| 14 | 4 | 3 | 4 | 4 | 4 | 19 | s1 upper half blank; s2 headline plus 4-row list good; s5 cards tiny text; s5 text-heavy |
| 16 | 4 | 4 | 4 | 4 | 4 | 20 | s1 headline low upper 50% empty; s5 dense paragraph |
| 18 | 4 | 3 | 4 | 4 | 4 | 19 | s1 headline low; s2 2 cards bare tops; s3 five-step list small; s5 bare |
| 19 | 5 | 4 | 4 | 4 | 4 | 21 | s1 "$5,000/year lie" has figure; s2 4-line headline crowds label and cards; s4 timeline good |
| 22 | 4 | 4 | 3 | 3 | 4 | 18 | s2-s6 same cream/dark rhythm of small headline + list/cards; no screenshot slide |
| 23 | 3 | 4 | 3 | 3 | 4 | 17 | s1 plain headline, no number; s2 4-line headline touches micro-label; s5 text-only |
| 24 | 3 | 3 | 3 | 3 | 4 | 16 | s2 headline collides with micro-label "[THE $2913 PROBLEM]" (visible overlap); s2 cards huge bare tops; s1 no number |
| 25 | 4 | 4 | 4 | 4 | 4 | 20 | s1 headline lowish; s2 cards bare tops; s6 CTA 7-line headline |
| 26 | 4 | 4 | 4 | 4 | 4 | 20 | s1 $6 figure in headline; s2 cards bare; s5 CTA headline |
| 27 | 4 | 3 | 3 | 3 | 4 | 17 | s2 cards bare tops with tiny text; s3 and s5 near-identical headline+paragraph layout; no standout save slide |
| 29 | 4 | 4 | 4 | 3 | 4 | 19 | s1 $8 in headline; s2 cards bare tops; s3 and s5 text-only; s5 CTA low-contrast tiny |
| 30 | 5 | 4 | 4 | 4 | 5 | 22 | s1 "I'm 17" personal hook strong; s7 CTA slide 60% empty |
| 31 | 4 | 4 | 4 | 5 | 5 | 22 | s1 headline; s4 8-12% hero + s6 $0.43/oz hero are save slides; s3 evidence log strong |
| 32 | 5 | 4 | 5 | 5 | 5 | 24 | s1 $2,913/yr hero; s4 receipt slide is the screenshot; s5 three red callouts |
| 33 | 5 | 4 | 4 | 5 | 5 | 23 | s1 headline 4 lines plus 4-line body dense; s4 $580-870/yr hero |
| 34 | 4 | 4 | 5 | 5 | 5 | 23 | s2 headline collides with micro-label "[WASTE HACKS]"; s3 headline touches label; s5 40% hero; s2 piles diagram strong |
| 35 | 4 | 4 | 5 | 5 | 5 | 23 | s1 headline 5 lines no number but good; s3 +16%/+12% stat pair; s4 callout pair; s2 inset box small |
| 36 | 4 | 4 | 5 | 5 | 5 | 23 | s4 $936-2,080/yr hero; s6 FIFO compare diagram; s5 stat pair |
| 37 | 3 | 3 | 3 | 3 | 4 | 16 | s1 plain headline; s2 headline vs timeline with sparse lower half; s3-s5 same headline+list/timeline rhythm; no hero visual |
| 38 | 3 | 4 | 3 | 3 | 4 | 17 | s1 no number; s3 and s4 timeline repeated; s5 dense paragraph; no screenshot slide |
| 39 | 3 | 3 | 3 | 3 | 4 | 16 | s1 cream opener lacks contrast with feed; s2 timeline sparse; s4 timeline repeated; no hero |
| 40 | 4 | 3 | 4 | 3 | 4 | 18 | s2 headline collides with micro-label "[SUPERMARKET SECRETS]"; s5 headline overlaps label; s2 4-line headline above cards |
| 41 | 4 | 4 | 3 | 4 | 4 | 19 | s1 "$56" in Playfair renders odd; s4 timeline sparse lower half; s5 four-item red list |
| 42 | 5 | 4 | 5 | 5 | 5 | 24 | s1 $2,913 inside headline; s5 bar diagram 30% vs 10% is the save slide; s2 sparse but ok |
| 43 | 5 | 4 | 4 | 5 | 5 | 23 | s1 40F plus red card; s2 oversize headline; s6 stepped timeline; s8 CTA short |
| 44 | 5 | 4 | 5 | 5 | 5 | 24 | s6 2 days vs 2-4 weeks compare strong; s2 five-line oversize headline; s5 list sparse |
| 45 | 4 | 4 | 4 | 4 | 5 | 21 | s1 headline low; s5 two cards small text; s7 six-line headline text-only slide |
| 46 | 5 | 4 | 5 | 5 | 5 | 24 | s1 cards w/ red; s3 $800-1,100 hero; s2 oversize headline; s5 guilt loop |
| 49 | 5 | 5 | 5 | 5 | 5 | 25 | s2 3-5 WEEKS hero with strike; s7 week-by-week keep-this grid; best sequence |
| 51 | 4 | 3 | 3 | 4 | 4 | 18 | s4 eight-line headline paragraph overlaps micro-label "[SUPERMARKET SECRETS]"; s6 headline overlaps label; s2 small list below 4-line headline |
| 52 | 4 | 3 | 4 | 4 | 4 | 19 | s4 headline overlaps micro-label "[THE $2913 PROBLEM]"; s5 five-line headline then dense paragraph; s6 timeline fine |
| 53 | 3 | 3 | 3 | 4 | 4 | 17 | s2 headline overlaps micro-label "[STORE IT RIGHT]" and is a 6-line paragraph; s5 seven-line headline dense; s6 cheat sheet is the save slide but 11px text |
| 54 | 4 | 4 | 3 | 3 | 4 | 18 | s1 four-line headline lowish; s2 and s3 headline plus timeline/list repeat; no screenshot slide; s5 plain list |
| 55 | 3 | 3 | 4 | 3 | 4 | 17 | s1 no number; s2 headline overlaps nothing but dense; s5 dense; s6 dense list |
| 56 | 3 | 3 | 3 | 3 | 4 | 16 | s1 no number, headline low; s4 headline text only; s6 headline text-heavy "Misting helps" six-line; s7 timeline repeat |
| 57 | 4 | 3 | 4 | 4 | 4 | 19 | s2 headline overlaps micro-label "[THE $2913 PROBLEM]", 5-line paragraph headline; s4 20% hero is the save slide; s6 six-row timeline cramped |
| 58 | 4 | 4 | 3 | 3 | 4 | 18 | s5 row 04 reads "5. FRESH HERBS" inside item number 04 (double numbering); s3 all-caps headline sits mid-frame; s1 no number; no screenshot slide |
| 59 | 4 | 4 | 4 | 4 | 5 | 21 | s1 six-line headline; s5 $100 vs $115-120 bar chart is save slide; s3 and s4 repeat headline plus body |
| 60 | 4 | 3 | 3 | 3 | 4 | 17 | s4 five-line oversize headline, text-only; s5 and s6 repeated timeline; no hero; s1 stat inside headline (6%) |
| 61 | 4 | 4 | 3 | 3 | 4 | 18 | s2 five-line headline over drawers; s4 headline plus short text only; s6 timeline text-heavy; no screenshot slide |
| 62 | 4 | 4 | 4 | 4 | 4 | 20 | s1 headline low; s4 dark text-only; s5 four-product cards ok |
| 63 | 4 | 4 | 4 | 5 | 5 | 22 | s4 $2,913 hero; s7 honest pre-launch; s1 five-line headline; strong narrative |

## Bottom 10 with citations (every score under 4)

### Post 24 (total 16: STOP 3, STAND 3, ARRIVE 3, SAVE 3, FAMILY 4)
- STOP=3: s2 headline collides with micro-label "[THE $2913 PROBLEM]" (visible overlap); s2 cards huge bare tops; s1 no number
- STAND=3: s2 headline collides with micro-label "[THE $2913 PROBLEM]" (visible overlap); s2 cards huge bare tops; s1 no number
- ARRIVE=3: s2 headline collides with micro-label "[THE $2913 PROBLEM]" (visible overlap); s2 cards huge bare tops; s1 no number
- SAVE=3: s2 headline collides with micro-label "[THE $2913 PROBLEM]" (visible overlap); s2 cards huge bare tops; s1 no number

### Post 37 (total 16: STOP 3, STAND 3, ARRIVE 3, SAVE 3, FAMILY 4)
- STOP=3: s1 plain headline; s2 headline vs timeline with sparse lower half; s3-s5 same headline+list/timeline rhythm; no hero visual
- STAND=3: s1 plain headline; s2 headline vs timeline with sparse lower half; s3-s5 same headline+list/timeline rhythm; no hero visual
- ARRIVE=3: s1 plain headline; s2 headline vs timeline with sparse lower half; s3-s5 same headline+list/timeline rhythm; no hero visual
- SAVE=3: s1 plain headline; s2 headline vs timeline with sparse lower half; s3-s5 same headline+list/timeline rhythm; no hero visual

### Post 39 (total 16: STOP 3, STAND 3, ARRIVE 3, SAVE 3, FAMILY 4)
- STOP=3: s1 cream opener lacks contrast with feed; s2 timeline sparse; s4 timeline repeated; no hero
- STAND=3: s1 cream opener lacks contrast with feed; s2 timeline sparse; s4 timeline repeated; no hero
- ARRIVE=3: s1 cream opener lacks contrast with feed; s2 timeline sparse; s4 timeline repeated; no hero
- SAVE=3: s1 cream opener lacks contrast with feed; s2 timeline sparse; s4 timeline repeated; no hero

### Post 56 (total 16: STOP 3, STAND 3, ARRIVE 3, SAVE 3, FAMILY 4)
- STOP=3: s1 no number, headline low; s4 headline text only; s6 headline text-heavy "Misting helps" six-line; s7 timeline repeat
- STAND=3: s1 no number, headline low; s4 headline text only; s6 headline text-heavy "Misting helps" six-line; s7 timeline repeat
- ARRIVE=3: s1 no number, headline low; s4 headline text only; s6 headline text-heavy "Misting helps" six-line; s7 timeline repeat
- SAVE=3: s1 no number, headline low; s4 headline text only; s6 headline text-heavy "Misting helps" six-line; s7 timeline repeat

### Post 23 (total 17: STOP 3, STAND 4, ARRIVE 3, SAVE 3, FAMILY 4)
- STOP=3: s1 plain headline, no number; s2 4-line headline touches micro-label; s5 text-only
- ARRIVE=3: s1 plain headline, no number; s2 4-line headline touches micro-label; s5 text-only
- SAVE=3: s1 plain headline, no number; s2 4-line headline touches micro-label; s5 text-only

### Post 27 (total 17: STOP 4, STAND 3, ARRIVE 3, SAVE 3, FAMILY 4)
- STAND=3: s2 cards bare tops with tiny text; s3 and s5 near-identical headline+paragraph layout; no standout save slide
- ARRIVE=3: s2 cards bare tops with tiny text; s3 and s5 near-identical headline+paragraph layout; no standout save slide
- SAVE=3: s2 cards bare tops with tiny text; s3 and s5 near-identical headline+paragraph layout; no standout save slide

### Post 38 (total 17: STOP 3, STAND 4, ARRIVE 3, SAVE 3, FAMILY 4)
- STOP=3: s1 no number; s3 and s4 timeline repeated; s5 dense paragraph; no screenshot slide
- ARRIVE=3: s1 no number; s3 and s4 timeline repeated; s5 dense paragraph; no screenshot slide
- SAVE=3: s1 no number; s3 and s4 timeline repeated; s5 dense paragraph; no screenshot slide

### Post 53 (total 17: STOP 3, STAND 3, ARRIVE 3, SAVE 4, FAMILY 4)
- STOP=3: s2 headline overlaps micro-label "[STORE IT RIGHT]" and is a 6-line paragraph; s5 seven-line headline dense; s6 cheat sheet is the save slide but 11px text
- STAND=3: s2 headline overlaps micro-label "[STORE IT RIGHT]" and is a 6-line paragraph; s5 seven-line headline dense; s6 cheat sheet is the save slide but 11px text
- ARRIVE=3: s2 headline overlaps micro-label "[STORE IT RIGHT]" and is a 6-line paragraph; s5 seven-line headline dense; s6 cheat sheet is the save slide but 11px text

### Post 55 (total 17: STOP 3, STAND 3, ARRIVE 4, SAVE 3, FAMILY 4)
- STOP=3: s1 no number; s2 headline overlaps nothing but dense; s5 dense; s6 dense list
- STAND=3: s1 no number; s2 headline overlaps nothing but dense; s5 dense; s6 dense list
- SAVE=3: s1 no number; s2 headline overlaps nothing but dense; s5 dense; s6 dense list

### Post 60 (total 17: STOP 4, STAND 3, ARRIVE 3, SAVE 3, FAMILY 4)
- STAND=3: s4 five-line oversize headline, text-only; s5 and s6 repeated timeline; no hero; s1 stat inside headline (6%)
- ARRIVE=3: s4 five-line oversize headline, text-only; s5 and s6 repeated timeline; no hero; s1 stat inside headline (6%)
- SAVE=3: s4 five-line oversize headline, text-only; s5 and s6 repeated timeline; no hero; s1 stat inside headline (6%)

## Top 8 visually

- Post 49 (total 25): s2 3-5 WEEKS hero with strike; s7 week-by-week keep-this grid; best sequence
- Post 5 (total 24): s1 $2,913 hero stops scroll; s2 list ok; critic.json score differs (3/5/5/5/4) render changed
- Post 32 (total 24): s1 $2,913/yr hero; s4 receipt slide is the screenshot; s5 three red callouts
- Post 42 (total 24): s1 $2,913 inside headline; s5 bar diagram 30% vs 10% is the save slide; s2 sparse but ok
- Post 44 (total 24): s6 2 days vs 2-4 weeks compare strong; s2 five-line oversize headline; s5 list sparse
- Post 46 (total 24): s1 cards w/ red; s3 $800-1,100 hero; s2 oversize headline; s5 guilt loop
- Post 33 (total 23): s1 headline 4 lines plus 4-line body dense; s4 $580-870/yr hero
- Post 34 (total 23): s2 headline collides with micro-label "[WASTE HACKS]"; s3 headline touches label; s5 40% hero; s2 piles diagram strong

## Recurring visual problems the engine could fix systemically
Counts are posts affected out of 53 (uncalibrated model critic, report-only; estimated from contact sheets).

1. Two-box "01 / 02" diagram with a tall empty upper half and 12-14px-scale text pinned to the box bottoms: about 24 posts (2, 4, 9, 10, 13, 14, 18, 19, 24, 25, 26, 27, 29, 30, 40, 45, 51, 52, 60, 61, 62 and others). Fix: size the box to content, or scale text up to fill it; a Gate 5 "ink in box" check.
2. Slide 1 composition: headline sits in the lower half, upper 40-50% blank, a tiny italic "Swipe" pill jammed under the last line: about 30 posts, nearly all of 1-34. Posts 42-49 vary this well (oversize or centred headlines, hero numbers). Fix: a slide-1 variant ladder (hero number, oversize headline, diagram) rather than one template.
3. Sparse list or timeline slides with a bare lower 40% of the frame (headline plus 2-3 short rows): about 18 posts (1, 2, 3, 7, 18, 22, 23, 37, 38, 39, 41, 54, 56, 60, 61 and others). Fix: vertical distribution or larger row type when content is short.
4. Headline collides with the top-right micro-label: 9 posts, visible overlap on 24 s2, 34 s2, 40 s2 and s5, 41 s2 and s5, 51 s4 and s6, 52 s4, 53 s2, 57 s2, near-touch on 23 s2 and 19 s2. Cause: headlines of 4-8 lines are pushed up into chrome. Fix: reserve the micro-label band as a hard top inset and shrink or cap lines (a Gate 5 hole or overlap test between headline box and micro-label box; the overlap is visible at sheet scale yet apparently passed the gates).
5. Paragraph-length headlines (5-8 lines of serif) that read as text walls, mostly posts 45-63 (45, 51, 52, 53, 55, 56, 57, 60, 61): 9 posts. This is a copy issue at root (brief text promoted to headline), so the engine can only warn: a headline word cap warning above about 18 words.
6. No standout "screenshot" slide (no hero number, receipt, comparison or cheat sheet): 17 posts score SAVE 3 (2, 4, 22, 23, 24, 27, 29, 37, 38, 39, 40, 54, 55, 56, 58, 60, 61). Posts with a hero (5, 6, 31, 32, 33, 36, 42, 44, 46, 49) score 5.
7. Same rhythm of cream slide, small serif headline, list or timeline, repeated on consecutive slides: 15 posts score ARRIVE 3 (22, 23, 24, 27, 37, 38, 39, 41, 51, 53, 54, 56, 58, 60, 61). The rule "no same layout twice" is met in name only because list and timeline look alike. Fix: treat list and timeline as one family for adjacency, or vary background and scale.
8. The $2,913 hero slide is reused almost identically across posts 5, 8, 9, 32, 63 (FAMILY risk if posted close together, scored 5 on FAMILY but a duplicate-content risk).
9. Possible glyph issue (UNVERIFIED at this scale): the "$" in Playfair headlines looks overstruck or thin in 29 s1, 40 s1, 41 s1, 42 s1, 43 s1. Check on a full-size slide before acting.
10. Numbering glitch: post 58 s5 row 04 reads "5. FRESH HERBS" inside the 04 marker. Copy-structure issue, flag for Adi, do not rewrite.
11. Closing fond slides: green CTA is consistent (FAMILY strength) but the tiny grey "Send this to..." line is low-contrast and small on 20+ posts; post 30 s7 is about 60% empty.
