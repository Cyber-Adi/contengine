// learn.mjs: turns measured post performance into gentle queue weights.
//
// Pure and deterministic. Reads nothing itself except via the arguments; the
// CLI/report layer loads state. Uses the SAME score as src/decide.mjs:
//   score = saves/reach + sendWeight * sends/reach
// A post missing reach or saves is unscored and ignored (never a miss).
//
// lift = segment mean score / account median score, then SHRUNK toward 1:
//   lift' = (n * lift + SHRINK_K * 1) / (n + SHRINK_K)     with SHRINK_K = 3
// so a 1-post segment keeps only 1/4 of its raw deviation and needs about 9
// posts to carry 75%. Below MIN_SCORED scored posts every lift is exactly 1.
//
// rankAdjust only nudges ordering of the NOT-yet-scheduled queue. It is a
// multiplier in [0.8, 1.25]; callers must still honour exclusions, scheduled
// posts and near-duplicate spacing. It is never a gate.
import { formatOf } from './decide.mjs';

export const MIN_SCORED = 3;
export const SHRINK_K = 3;
export const ADJUST_MIN = 0.8;
export const ADJUST_MAX = 1.25;
const DAMPING = 0.5;

const median = (xs) => {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const r4 = (x) => Number(x.toFixed(4));

const angleOf = (row, spec) => (spec && spec.gtmAngle) || row.angle || 'unspecified';
const pillarOf = (row, spec) => (spec && spec.pillar) || row.pillar || 'unspecified';

/** Scored rows, sorted by post number for determinism. */
export function scoredRows(performance, specFor, gtm) {
  const w = gtm.organicMetrics.sendWeight;
  return Object.values((performance && performance.posts) || {})
    .filter((p) => p && p.reach > 0 && Number.isFinite(p.saves))
    .map((p) => {
      const spec = specFor(p.post) || null;
      const savesPerReach = p.saves / p.reach;
      const sendsPerReach = (Number.isFinite(p.sends) ? p.sends : 0) / p.reach;
      return {
        post: p.post, publishedAt: p.publishedAt || '',
        savesPerReach, sendsPerReach, score: savesPerReach + w * sendsPerReach,
        pillar: pillarOf(p, spec), format: formatOf(p, spec), angle: angleOf(p, spec),
      };
    })
    .sort((a, b) => a.post - b.post);
}

function segment(rows, key, med, neutral) {
  const groups = new Map();
  for (const r of rows) {
    if (!groups.has(r[key])) groups.set(r[key], []);
    groups.get(r[key]).push(r.score);
  }
  const out = {};
  for (const name of [...groups.keys()].sort()) {
    const scores = groups.get(name);
    const n = scores.length;
    const m = mean(scores);
    if (neutral || !med) { out[name] = { n, meanScore: r4(m), lift: 1 }; continue; }
    const lift = (n * (m / med) + SHRINK_K) / (n + SHRINK_K);
    out[name] = { n, meanScore: r4(m), lift: r4(lift) };
  }
  return out;
}

export function learnedWeights(performance, specFor, gtm) {
  const rows = scoredRows(performance, specFor, gtm);
  const neutral = rows.length < MIN_SCORED;
  const med = neutral ? null : median(rows.map((r) => r.score));
  return {
    scored: rows.length,
    neutral,
    median: med === null ? null : r4(med),
    byPillar: segment(rows, 'pillar', med, neutral),
    byFormat: segment(rows, 'format', med, neutral),
    byAngle: segment(rows, 'angle', med, neutral),
  };
}

/** Multiplier in [0.8, 1.25]; 1 when data is thin or the segments are unseen. */
export function rankAdjust(spec, weights) {
  if (!weights || weights.neutral || !spec) return 1;
  const lifts = [
    weights.byPillar[spec.pillar],
    weights.byFormat[formatOf({}, spec)],
    weights.byAngle[spec.gtmAngle],
  ].filter(Boolean).map((s) => s.lift);
  if (!lifts.length) return 1;
  const adj = 1 + DAMPING * (mean(lifts) - 1);
  return r4(Math.min(ADJUST_MAX, Math.max(ADJUST_MIN, adj)));
}
