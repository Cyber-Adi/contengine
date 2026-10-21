# Render report (render-quality worker)

Real specs (post-N, N<9000) re-rendered through render + contact_sheet + qa (Gate 6 bypassed). Gates 1-5 only.

| Gate | Before (old report) | After engine fixes + design edits |
|---|---|---|
| G5.1-deadband | 26 (21 posts) | 0 |
| G1.2-margins | 23 (6 posts) | 0 |
| G1.1-overflow | 10 (51, 53) | 0 |
| G5.6-rhythm-bg | 8 (37, 38, 44, 54, 60, 61, 63) | 0 |
| X-distinct | 5 (41, 44, 45, 61, 34) | 4 (41, 44, 45, 61) |
| G5.5-fill | 5 (41, 43, 45, 46) | 4 (41, 43, 45, 46) |

## Engine changes (src/slide-html.mjs)
- Stack-list stretch: hole model now uses ink (0.62 of box) and the true half-row hole, limit 0.88 of the deadband.
- Fill cap: a stretched block can no longer grow past the room the content box has (fixed split-compare overruns).
- Type-step guard: a headline that still overruns the frame steps down toward its token floor (hook min / reframe min).
- Hole guard: closes only the offending inter-block gap (floor 14 px) when an estimated hole exceeds 0.85 of the deadband share (also inside cta-wrap).
- Quadrant value size steps down to body min when wrapped lines would overflow the quadrant.

## Design edits (logged in spec.refinement.changes)
- Rhythm tool --write: 37, 38, 44, 54, 60, 61, 63 (valign / background / layout).
- 38: slide 3 accent steelBlue + background dark (fondGreen pinned five light slides).
- 16, 55, 60, 62: slide 2 layout stack-list to split-compare (sparse copy, lossless swap).

## Still failing, copy-bound
- X-distinct 41, 44, 45, 61: slides 1 and 2 are headline-only; hero-statement is the only layout that renders headline-only copy.
- G5.5-fill 41 (45%), 43 (28%), 45 (53%), 46 (35%): slide 2 is a short headline at the hook size ceiling; nothing else to fill with.

Stricter vs worse: no gate was touched. Every change is the output getting better (engine) or a design-field edit.
