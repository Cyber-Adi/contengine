# Design System finding — palette contrast

Measured with WCAG 2.1 relative luminance, every token against both legal backgrounds
(Slate Black `#14161A`, Off-White `#F5F2EC`). Reproduce with `python3 tools/contrast_audit.py`.

| Token | on Slate Black | on Off-White |
|---|---|---|
| Off-White `#F5F2EC` | **16.21** | 1.00 |
| fond Green `#2E5E4E` | 2.44 | **6.65** |
| Steel Blue `#4A7BA6` | 4.03 | 4.02 |
| Signal Red `#D64541` | 4.13 | 3.93 |
| Harvest Gold `#D9A441` | **8.05** | 2.01 |
| Ink Gray `#6B7280` | 3.75 | 4.33 |
| Slate Black `#14161A` | 1.00 | **16.21** |

WCAG AA needs **4.5:1** for normal text and **3:1** for large text (≥32px bold / ≥40px regular
on this canvas) and for graphical objects.

## What this means in practice

Three rules fall out of the numbers. They are now encoded in `tokens.json` and enforced by
gates G2.3 and G2.6, so they cannot be violated silently.

1. **Harvest Gold is dark-ground only.** At 2.01:1 on Off-White it fails even the 3:1
   graphical bar. It cannot legally carry text *or* a thread segment on a light slide.
2. **fond Green is light-ground only.** 2.44:1 on Slate Black. It works as the CTA card's
   *background* (Off-White on fond Green is 6.65:1), never as an accent on a dark slide.
3. **Steel Blue, Signal Red and Ink Gray are large-text only.** All three clear 3:1 on both
   grounds and miss 4.5:1 on both. Fine for hero numbers, eyebrows, quadrant values and
   32px+ bold labels. Not fine for 22px citations.

## The real gap, for Adi to decide

**The palette cannot express "caution" on a light background.** Harvest Gold is the caution
token and it is illegible on Off-White. Today the renderer substitutes Steel Blue and the
gate reports the substitution, which keeps output readable but collapses the caution/good
distinction on light slides.

Two clean fixes, both cheap:

- **Add a dark gold variant** (roughly `#8A6410`, ~4.6:1 on Off-White) as `harvestGoldDark`,
  used only on light grounds. Preserves the semantic distinction. Recommended.
- **Or make caution content dark-slide-only** by convention. Costs nothing, constrains layout.

Also worth a decision: citations render at 20–22px in Ink Gray, which is below AA. Bumping
citations to 24px and Ink Gray to about `#5A616E` would clear it without changing the look.

**Nothing here has been changed in Notion.** Section 3 remains the source of truth; this file
records what was measured and what the engine currently does about it.
