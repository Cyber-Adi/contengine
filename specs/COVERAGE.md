# Coverage — Slice 1 (Posts 1–69)

Source priority per CORRECTIONS.md C4: **Notion carousel-script pages are primary
coverage; `briefs/*.md` wins where a local file overlaps a post number.** No copy
was written or rewritten to produce this count — every renderable post traces to
verbatim text in Notion or `briefs/`. Where nothing retrievable exists, the post is
listed as a gap per CLAUDE.md §4 ("A brief is missing slide copy → flag it, do NOT
write replacement copy").

## Headline number

**59 of 69 scripted posts (Posts 1–69) are renderable today. 10 are gaps.**

(The Content Engine × GTM Aggregation page puts the scripted total at "78" — that
figure includes 9 Mono-Text Reels, which this repo does not render. 69 is the
carousel-post count.)

## Renderable — 59 posts

| Posts | Source | Provenance | Notes |
|---|---|---|---|
| 1–8 | Notion "Carousel Scripts — Posts 1–8" | `converted-from-notion-script` | Already designed as PNGs outside this repo (Canva); full script text retrievable regardless. |
| 9–16 | Notion "Carousel Scripts — Posts 9–16 + Origin Story" | `converted-from-notion-script` | Post 10 has multiple candidate drafts in the Content Calendar (Origin Story variant + others) — only the Scripted row's content was used. |
| 18–30 | Notion "Carousel & Reel Scripts — Posts 18–30" | `converted-from-notion-script` | This page's own posting map is authoritative for 18–30; titles cross-checked against current Content Calendar canonical titles and match. **Post 17 excluded — see Gaps.** |
| 31–36 | `briefs/*.md` (local) | local | Local wins per C4. |
| 37–40 | Notion "Carousel Scripts — Posts 31–40 (Visual-First)" | `converted-from-notion-script` | No local brief exists for these four; Notion is sole source. |
| 41–43 | `briefs/*_41-43_v2.md` (local) | local | Explicit v2, 8-slide, supersedes the older 6–8-slide version also present in the Notion "41–50" page. |
| 44–50 | Notion "Carousel Scripts — Posts 41–50 (Visual-First)" | `converted-from-notion-script` | **Version-stale — see below.** This is the pre-v2, 6–7-slide script. A newer 8-slide re-brief was produced (per the GTM Aggregation page's Wednesday logs) but the file was never added to `briefs/`, so it isn't retrievable from this repo or Notion. Renderable now on the older text; re-render once the real v2 brief lands. |
| 51–52 | `briefs/*.md` (local, v1) | local | **Version-stale — see below.** Local file is the pre-Aug-19 7-slide version. An Aug 19 re-brief (8-slide, dedicated threads) exists per the Aggregation page but its file was never added to `briefs/`. Local still wins per C4 as written, but this is not the current version. |
| 53 | `briefs/*.md` (local) | local | |
| 56–62 | `briefs/*.md` (local) | local | Posts 60–62 are fresh hooks (the original pillar backlog ran out at Post 59), not backfilled scripts — same status as any other scripted post. |

## Gaps — 10 posts (do not render; flag to Adi, do not invent copy)

| Post(s) | Why |
|---|---|
| **17** | Canonical Content-Calendar title is "Stale Doesn't Mean Dead." No Notion page or local brief contains matching script text. The "Carousel Scripts — Posts 17–27" page's own Post 17 ("Your Grocery App Is Spying on You") is a renumbered draft that became today's Post 26 ("Your Grocery Store App Is Spying on You") — confirmed by near-duplicate copy between the two. That page's Post 17 content is therefore not usable for today's Post 17. |
| **54, 55, 63** | Briefed Jul 29 in `fond_Content_Brief_Posts_54-55-63_and_Kinetic_Reel_56Friday.md`. That file lives outside this repo (Adi's "fond stuff" / outputs folder) and was never added to `briefs/`. No Notion Carousel Script page covers past Post 50, so there is no fallback source either. |
| **64, 65, 66** | Briefed Aug 26 in `fond_Content_Brief_Posts_64-65-66_and_Kinetic_Reel_BestBy.md`. Same off-repo situation as above. |
| **67, 68, 69** | Briefed Sep 2 in `fond_Content_Brief_Posts_67-68-69_and_Kinetic_Reel_ShrinkingCart.md`. Same off-repo situation as above. |

**Pattern across all 10 gaps except Post 17: the script exists, it's just not in this
repo.** Six named `.md` files documented in the Content Engine × GTM Aggregation
Notion page (`fond_Content_Brief_Posts_44-45-46...`, `..._47-48-49...`,
`..._50-51-52...`, `..._54-55-63...`, `..._64-65-66...`, `..._67-68-69...`) sit in
Adi's local "fond stuff" / outputs folder and were never copied into `briefs/`. The
44–50 and 51–52 "version-stale" rows above are the same root cause — the file just
happens to have an older fallback (an earlier Notion or local script) to render from
in the meantime; 17/54/55/63/64–69 have no fallback at all.

**Action for Adi, not taken by me:** locate and copy those 6 files into `briefs/`.
That would immediately resolve the 44–50 and 51–52 staleness and very likely close
5 of the 6 remaining hard gaps (54, 55, 63, 64–66, 67–69). Post 17 needs separate
attention — none of the located Notion pages contain it under any name.

## Mechanical requirements for every `converted-from-notion-script` post (40 posts: 1–16, 18–30, 37–40, 44–50)

- `provenance: "converted-from-notion-script"` set in the spec.
- Every occurrence of "PantryPal" substituted to "fond" — mechanical text swap only,
  never treated as new copy.
- Copy carried verbatim from the Notion script text; no paraphrasing.

## Not covered by this pass

Posts 70+ were not investigated — the Content Calendar and the Aggregation page's
Wednesday lane log both stop at Post 69 as of the Sep 2, 2026 entry.

## Not built

Per explicit instruction, `npm run sync` (C3) was **not** built in this pass. This
document is coverage-only.

---

## Oct 2 2026 status (Refinery S1b)

**52 real specs exist** (plus fixture post-49 and the diagram fixture `specs/fixtures/post-9005.json`):
1-10, 13-14, 16, 18-19, 22-27, 29-46, 51-63. Post 5 now carries real brief copy.

| Post(s) | Status | Why |
|---|---|---|
| 11, 12, 20, 21, 28 | not carousels | Notion has them as Reels (shot lists / voiceover). Nothing to render here. |
| 15 | blocked | Script has 4 slides; schema minimum is 5. Needs Adi: a 5th slide or a schema change. |
| 16 | source conflict | Local 9-16-19 brief has 4 slides (invalid); Notion 5-slide script used instead. |
| 9 | source conflict | Two local briefs (_1-5-9 legacy PantryPal, _9-16-19 current) plus Notion differ; _9-16-19 used. |
| 17 | gap | No script anywhere. |
| 47, 48, 50, 64-69; real 49 | gap | Brief files 47-48-49, 50-51-52, 64-65-66, 67-68-69 are not on this Mac. |
| 51-53 | version-stale | Rendered from the v1 7-slide brief; the Aug 19 re-brief is missing. |

**CTA slides:** most specs end on a verbatim "waitlist" / "link in bio" slide, which Gate 6 fails while
`state/launch.json.phase == "setup"`. See docs/CAROUSEL-REFINERY-PLAN.md for the open decision.

**Copy issues for Adi (kept verbatim, not fixed):** 19 and 30 unsourced dollar figures; 26 "No ads. No data
selling."; 29 pillar mapped to Waste Hacks (not in enum); 44 "10x" vs its own 2 days to 2-4 weeks; 52 delivery
stats look implausible; 53 cheat sheet contradicts itself (honey, tomatoes; "8 foods" lists 9); 56 20% / $580
as cited hero; 60 "didn't move" unsourced; 63 "TestFlight beta coming this summer" is stale.
