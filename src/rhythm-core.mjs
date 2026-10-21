// rhythm-core.mjs - the pure rhythm solver (S2a). No I/O, no randomness, no mutation.
//
// Gate 5 cross-slide rule: every swipe has to land somewhere new.
//   1. no run of 3 slides on the same ground (cta-card counts as its own ground);
//   2. no two adjacent slides whose vertical ink-mass centroid is within
//      rules.rhythm.minCentroidDeltaPct of the frame height;
//   3. never the same layout twice in a row (diagram kinds count as distinct).
//
// The solver reassigns DESIGN-ONLY fields (background, layout among lossless
// alternatives, valign) and never touches copy. It minimises the number of changes
// against the spec as authored, and breaks ties by a fixed domain order, so the same
// spec always yields the same plan.
//
// Centroids are PREDICTED here from a calibrated table (rules.rhythm.centroidModel)
// because the solver runs before any pixel exists. qa.py measures the real centroid
// from the render, so a wrong prediction surfaces as a gate failure, not a silent pass.
import { tokens } from './tokens.mjs';

const R = tokens.rules.rhythm;
const VALIGNS = R.valign;
const FALLBACK = { top: 0.28, center: 0.4, bottom: 0.58 };

export const groundOf = (s) => (s.layout === 'cta-card' ? 'cta' : (s.background || 'light'));
export const layoutKey = (s) => (s.layout === 'diagram' ? `diagram:${s.diagram?.kind}` : (s.layout || 'hero-statement'));

export function predictCentroid(layout, valign) {
  const row = R.centroidModel?.[layout] || R.centroidModel?.default || FALLBACK;
  return row[valign] ?? FALLBACK[valign];
}

/** Violations of the three rhythm rules for a plan: [{kind, slides, msg}]. */
export function checkRhythm(plan) {
  const out = [];
  const max = R.maxSameBackgroundRun;
  for (let i = 0; i + max < plan.length; i++) {
    const run = plan.slice(i, i + max + 1);
    if (run.every((s) => groundOf(s) === groundOf(run[0]))) {
      out.push({ kind: 'background-run', slides: run.map((s) => s.index),
        msg: `slides ${run.map((s) => s.index).join('-')} share one ground (${groundOf(run[0])})` });
    }
  }
  for (let i = 0; i + 1 < plan.length; i++) {
    const a = plan[i], b = plan[i + 1];
    const ca = predictCentroid(a.layout, a.valign), cb = predictCentroid(b.layout, b.valign);
    if (Math.abs(ca - cb) < R.minCentroidDeltaPct - 1e-9) {
      out.push({ kind: 'centroid', slides: [a.index, b.index],
        msg: `slides ${a.index} and ${b.index} centre at ${ca.toFixed(2)} and ${cb.toFixed(2)} of frame height (need ${R.minCentroidDeltaPct} apart)` });
    }
    if (layoutKey(a) === layoutKey(b)) {
      out.push({ kind: 'layout', slides: [a.index, b.index], msg: `slides ${a.index} and ${b.index} share layout ${layoutKey(a)}` });
    }
  }
  return out;
}

/** Backgrounds this slide may legally take. A restricted accent pins the ground. */
export function legalBackgrounds(slide) {
  if (slide.layout === 'cta-card') return [slide.background || 'dark'];
  const restrict = tokens.colors[slide.accent]?.backgroundRestriction;
  if (restrict) return [restrict];
  return ['light', 'dark'].sort((a) => (a === slide.background ? -1 : 1));
}

/** Layouts that render exactly the same copy fields, so a swap loses nothing. */
export function legalLayouts(slide) {
  const own = slide.layout || 'hero-statement';
  const n = (slide.copy?.items || []).length;
  const swappable = ['stack-list', 'timeline', 'split-compare'].includes(own) && !slide.copy?.quadrants;
  if (!swappable || n < 2) return [own];
  const alts = n === 2 ? ['stack-list', 'timeline', 'split-compare'] : n <= 4 ? ['stack-list', 'timeline'] : ['stack-list'];
  return [own, ...alts.filter((l) => l !== own)];
}

const COST = { layout: 3, background: 2, valign: 1 };

/**
 * Plan the whole carousel. `free` selects which design fields the solver may move.
 * Returns { slides, changes, unresolved } where slides is the new plan and changes
 * is the design-only log {slide, field, from, to, why} (schema: spec.refinement.changes).
 */
export function planRhythm(spec, free = { background: true, layout: true, valign: true }, enforce = { background: true, layout: true }) {
  const slides = [...spec.slides].sort((a, b) => a.index - b.index);
  const dom = slides.map((s) => {
    const bgs = free.background ? legalBackgrounds(s) : [s.background || 'light'];
    const lays = free.layout ? legalLayouts(s) : [s.layout || 'hero-statement'];
    const vas = s.valign ? (free.valign && free.valign !== 'implicit' ? [s.valign, ...VALIGNS.filter((v) => v !== s.valign)] : [s.valign])
      : (free.valign ? ['center', ...VALIGNS.filter((v) => v !== 'center')] : ['center']);
    const opts = [];
    for (const layout of lays) for (const background of bgs) for (const valign of vas) {
      const cost = (layout !== (s.layout || 'hero-statement') ? COST.layout : 0)
        + (background !== (s.background || 'light') ? COST.background : 0)
        + (valign !== (s.valign || 'center') ? COST.valign : 0);
      opts.push({ ...s, layout, background, valign, cost });
    }
    return opts;
  });

  // DP over slides; state = chosen option + the ground two slides back (for run-of-3).
  // Soft constraints: a lawful plan always beats an unlawful one, and when no lawful
  // plan exists the least-bad one is returned (smallest centroid shortfall), with the
  // remaining violations reported as unresolved instead of silently accepted.
  const memo = new Map();
  const penalty = (prev, prev2, cur) => {
    if (!prev) return 0;
    let p = 0;
    if (enforce.layout && layoutKey(prev) === layoutKey(cur)) p += 100000;
    if (enforce.background && prev2 && groundOf(prev2) === groundOf(prev) && groundOf(prev) === groundOf(cur)) p += 100000;
    const gap = Math.abs(predictCentroid(prev.layout, prev.valign) - predictCentroid(cur.layout, cur.valign));
    // plan with a safety margin: predictions are +-0.02 of the measured centroid
    const want = R.minCentroidDeltaPct + (R.solverMargin || 0);
    if (gap < want - 1e-9) p += 1000 + Math.round((want - gap) * 100);
    return p;
  };
  const best = (i, prevIdx, prev2Idx) => {
    if (i === slides.length) return { cost: 0, picks: [] };
    const key = `${i}|${prevIdx}|${prev2Idx}`;
    if (memo.has(key)) return memo.get(key);
    let bestRes = null;
    dom[i].forEach((opt, oi) => {
      const prev = i > 0 && prevIdx >= 0 ? dom[i - 1][prevIdx] : null;
      const prev2 = i > 1 && prev2Idx >= 0 ? dom[i - 2][prev2Idx] : null;
      const rest = best(i + 1, oi, prevIdx);
      const total = penalty(prev, prev2, opt) + opt.cost + rest.cost;
      if (!bestRes || total < bestRes.cost) bestRes = { cost: total, picks: [oi, ...rest.picks] };
    });
    memo.set(key, bestRes);
    return bestRes;
  };
  const sol = best(0, -1, -1);

  const result = sol.picks.map((oi, i) => { const { cost, ...rest } = dom[i][oi]; return rest; });
  const authored = slides.map((s) => ({ ...s, valign: s.valign || 'center' }));
  const before = checkRhythm(authored);
  const changes = [];
  result.forEach((r, i) => {
    const s = slides[i];
    const involved = before.filter((v) => v.slides.includes(s.index)).map((v) => v.msg);
    const why = involved.length ? involved.join('; ') : 'keeps neighbouring slides from repeating (design-only)';
    if (r.layout !== (s.layout || 'hero-statement')) changes.push({ slide: s.index, field: 'layout', from: s.layout || 'hero-statement', to: r.layout, why });
    if (r.background !== (s.background || 'light')) changes.push({ slide: s.index, field: 'background', from: s.background || 'light', to: r.background, why });
    if (r.valign !== (s.valign || 'center')) changes.push({ slide: s.index, field: 'valign', from: s.valign || 'center', to: r.valign, why });
  });
  return { slides: result, changes, unresolved: checkRhythm(result) };
}

const cache = new WeakMap();
/** {slideIndex: valign} for the renderer. Explicit slide.valign always wins. */
export function resolveValign(spec) {
  if (cache.has(spec)) return cache.get(spec);
  const plan = planRhythm(spec, { background: false, layout: false, valign: 'implicit' }, { background: false, layout: false });
  const map = Object.fromEntries(plan.slides.map((s) => [s.index, s.valign]));
  cache.set(spec, map);
  return map;
}
