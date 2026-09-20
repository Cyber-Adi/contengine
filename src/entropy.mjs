// entropy.mjs — THE ENTROPY GUARD.
//
// The failure mode this prevents: an agent left to generate concepts from its
// own history converges. It finds a shape that scored well, produces variations
// on it, and the variations narrow until the account is publishing the same post
// with different nouns. Performance decays slowly enough that no single week
// looks wrong. The fix is not "be more creative" - it is a mechanical refusal to
// ship a concept too close to recent ones, plus a hard requirement that new
// concepts cite something from OUTSIDE the account's own output.
//
// Both halves matter. Refusal alone just produces random drift. The outer-world
// citation is what gives the novelty somewhere real to come from, and every
// source it draws on is already named in the GTM plan's free research stack.
import { gtm } from './gtm.mjs';
import { loadFreshness } from './state.mjs';

const STOP = new Set(('a an the and or but if then than that this these those of to in on for with '
  + 'is are was were be been being it its your you my our we they them he she i at by from as not '
  + 'no so do does did doing have has had will would can could should about into over under out up '
  + 'down just more most some any all one two three what when where why how').split(/\s+/));

export const tokenize = (s) => String(s || '').toLowerCase()
  .replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/)
  .filter((w) => w.length > 2 && !STOP.has(w));

const jaccard = (a, b) => {
  const A = new Set(a), B = new Set(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
};

/** Shape fingerprint: the grammatical move a hook makes, independent of its nouns. */
export function hookShape(hook) {
  const h = String(hook || '').toLowerCase();
  const shapes = [];
  if (/^\s*(your|the)\s/.test(h)) shapes.push('possessive-open');
  if (/\?\s*$/.test(h)) shapes.push('question');
  if (/\d/.test(h)) shapes.push('numeric');
  if (/\bnot\b|\bisn't\b|\bdoesn't\b|\bstop\b|\bnever\b/.test(h)) shapes.push('negation');
  if (/\blie[sd]?\b|\bmyth\b|\bwrong\b|\bactually\b/.test(h)) shapes.push('debunk');
  if (/\bhow to\b|\bthe way to\b/.test(h)) shapes.push('instructional');
  if (/:/.test(h)) shapes.push('colon-split');
  return shapes.length ? shapes.sort().join('+') : 'plain';
}

export const DEFAULTS = {
  window: 12,            // posts of history the guard considers "recent"
  maxSimilarity: 0.34,   // Jaccard above this against any recent hook = too close
  maxShapeRunLength: 3,  // same grammatical move 3x in a row = formulaic
  freshnessMaxAgeDays: 14,
  requireOuterWorldCitation: true
};

/**
 * Judge a proposed concept against recent history and the freshness pool.
 *
 * @param proposed {{hook:string, angle?:string, concept?:string, citations?:string[]}}
 * @param recent   [{post:number, hook:string, angle?:string}]  newest last
 * @returns {{ok:boolean, findings:[], nearest:object|null, suggestion:string|null}}
 */
export function judge(proposed, recent = [], opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const findings = [];
  const history = recent.slice(-o.window);
  const pt = tokenize(`${proposed.hook} ${proposed.concept || ''}`);

  // 1 - lexical closeness to any recent hook
  let nearest = null;
  for (const h of history) {
    const sim = jaccard(pt, tokenize(`${h.hook} ${h.concept || ''}`));
    if (!nearest || sim > nearest.similarity) nearest = { ...h, similarity: Number(sim.toFixed(3)) };
  }
  if (nearest && nearest.similarity > o.maxSimilarity) {
    findings.push({
      level: 'FAIL', check: 'repetition',
      detail: `${Math.round(nearest.similarity * 100)}% token overlap with post ${nearest.post} ("${nearest.hook}"). Ceiling is ${Math.round(o.maxSimilarity * 100)}%.`
    });
  }

  // 2 - grammatical move repeated too many times running
  const shape = hookShape(proposed.hook);
  let run = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (hookShape(history[i].hook) === shape) run++; else break;
  }
  if (run >= o.maxShapeRunLength) {
    findings.push({
      level: 'FAIL', check: 'shape-run',
      detail: `Hook shape "${shape}" has run ${run} posts straight. Vary the grammatical move, not just the nouns.`
    });
  }

  // 3 - angle over-concentration inside the window
  if (proposed.angle) {
    const same = history.filter((h) => h.angle === proposed.angle).length;
    if (same >= Math.ceil(o.window / 2)) {
      findings.push({
        level: 'WARN', check: 'angle-concentration',
        detail: `Angle "${proposed.angle}" is ${same} of the last ${history.length}. The matrix has ${gtm.angles.length} angles.`
      });
    }
  }

  // 4 - outer-world citation. This is the half that actually creates novelty.
  if (o.requireOuterWorldCitation) {
    const pool = loadFreshness();
    const cutoff = Date.now() - o.freshnessMaxAgeDays * 864e5;
    const live = (pool.items || []).filter((i) => new Date(i.observedAt || 0).getTime() >= cutoff);
    const cited = (proposed.citations || []).filter((c) => live.some((i) => i.id === c));
    if (!live.length) {
      findings.push({
        level: 'FAIL', check: 'freshness-empty',
        detail: `No outer-world observations newer than ${o.freshnessMaxAgeDays} days. Run the harvest before generating concepts. Sources: ${gtm.research.sources.map((s) => s.name).join(', ')}.`
      });
    } else if (!cited.length) {
      findings.push({
        level: 'FAIL', check: 'no-citation',
        detail: `Concept cites nothing from the freshness pool (${live.length} live observations available). A concept sourced only from the account's own history is how entropy starts.`
      });
    }
  }

  const ok = !findings.some((f) => f.level === 'FAIL');
  const unused = gtm.angles.map((a) => a.id)
    .filter((id) => !history.slice(-6).some((h) => h.angle === id));

  return {
    ok, findings, nearest, shape,
    suggestion: ok ? null
      : unused.length ? `Least-recently-used angle: "${unused[0]}". Its organic sources: ${(gtm.angles.find((a) => a.id === unused[0]) || {}).organicSources?.join(', ')}.`
      : 'Every angle is recent. Change format rather than angle, per the Ad Bank rotation rule.'
  };
}
