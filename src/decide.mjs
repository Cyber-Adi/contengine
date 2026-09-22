// decide.mjs — THE DECISION LOOP.
//
// This is the file that makes the system an agent rather than an automation.
//
// The old pipeline was a chain: every Sunday research ran, every Wednesday a
// script was written, and neither step ever asked whether that was the useful
// thing to do that week. It could not ask, because no step could see the whole
// board. So it produced scripts for six weeks while the queue of undesigned
// scripts grew, and every weekly log correctly named rendering as the bottleneck
// before adding to the pile anyway.
//
// A loop inverts the default. It reads the whole board, finds the BINDING
// CONSTRAINT, and does only that. The single most consequential rule here:
//
//     SCRIPTING IS THE LOWEST PRIORITY ACTION, NOT THE HIGHEST.
//
// Writing new copy is what this operation does when it has nothing better to do,
// and for six weeks it had many better things to do. Everything below is in
// service of that inversion.
import { loadLedger, loadPerformance, loadFreshness, reconcile, census, atStage, logDecision } from './state.mjs';
import { gtm } from './gtm.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './tokens.mjs';
import { validateSpec } from './validate.mjs';

/** A post can pass all six image gates and still be schema-invalid (post-31 shipped
 *  empty split-compare panels exactly this way). "Publishable" must mean both. */
const specIsValid = (n) => {
  try { validateSpec(JSON.parse(fs.readFileSync(path.join(ROOT, 'specs', `post-${n}.json`), 'utf8'))); return true; }
  catch (e) { return e.code === 'ENOENT'; }   // no spec file (synthetic ledgers in tests): do not penalise
};

/** Above this many approved-but-unpublished posts, generating more copy is forbidden. */
export const DRAIN_CEILING = 12;

/**
 * Score published posts against the account median and apply the GTM kill
 * criterion. This is the feedback edge. Without it the loop is still a line
 * that happens to run twice.
 */
export function performanceSignal(perf = loadPerformance()) {
  const rows = Object.values(perf.posts || {}).filter((p) => p.reach > 0);
  if (rows.length < 3) {
    return { ready: false, n: rows.length,
      note: `${rows.length} measured post(s). Need 3 before any claim about what works is anything but a guess.` };
  }
  const w = gtm.organicMetrics.sendWeight;
  const score = (p) => ((p.saves || 0) + w * (p.sends || 0)) / p.reach;
  const scored = rows.map((p) => ({ ...p, score: score(p) })).sort((a, b) => b.score - a.score);
  const med = (xs) => {
    const s = xs.slice().sort((a, b) => a - b);
    if (!s.length) return null;
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  };
  const median = med(scored.map((p) => p.score));

  // Kill criterion: a format underperforming 3 posts running.
  //
  // The comparator is a LEAVE-ONE-FORMAT-OUT median, not the global one. A fixture
  // caught why: when a tiring format is most of the sample, it drags the global
  // median down into its own band, the format then scores at or above "median", and
  // the criterion can never fire. That is the decay-is-invisible failure the whole
  // loop exists to prevent, reintroduced through the back door of a lazy baseline.
  // Comparing a format against the rest of the account makes the baseline immune to
  // the thing it is supposed to be judging.
  const byFormat = {};
  for (const p of rows.slice().sort((a, b) => (a.publishedAt || '').localeCompare(b.publishedAt || ''))) {
    const f = p.format || p.archetype || 'unspecified';
    (byFormat[f] ||= []).push(p);
  }
  const need = gtm.organicMetrics.killCriterion.consecutiveMisses;
  const retire = Object.entries(byFormat)
    .filter(([f, posts]) => {
      const others = rows.filter((p) => (p.format || p.archetype || 'unspecified') !== f).map(score);
      const baseline = others.length ? med(others) : median;
      const misses = posts.map((p) => score(p) < baseline);
      return misses.length >= need && misses.slice(-need).every(Boolean);
    })
    .map(([f]) => f);

  return {
    ready: true, n: rows.length, median: Number(median.toFixed(4)),
    top: scored.slice(0, 3).map((p) => ({ post: p.post, score: Number(p.score.toFixed(4)), angle: p.angle, format: p.format })),
    bottom: scored.slice(-3).map((p) => ({ post: p.post, score: Number(p.score.toFixed(4)), angle: p.angle, format: p.format })),
    retire
  };
}

/**
 * The ordered constraint ladder. Each rung returns an action only when its
 * condition holds, so the first hit is by definition the binding constraint.
 * Rungs are cheap-to-expensive and drain-before-fill, in that order.
 */
/** Ready-but-unscheduled posts above this is the old queue failure one stage later. */
export const READY_CEILING = 6;
/** Days after go-live before a post's numbers mean anything. */
export const MEASURE_LAG_DAYS = 7;

/**
 * machineOnly: skip rungs that only a human can act on (PUBLISH, MEASURE,
 * REQUEST_BRIEFS). The weekly Claude Code run asks for the next MACHINE action;
 * if it got "PUBLISH" it would do nothing useful and the drain would stall. The
 * tap lists human actions separately under YOUR PART.
 */
export function decide({ ledger = reconcile(loadLedger()), perf = loadPerformance(), fresh = loadFreshness(), machineOnly = false, today = new Date() } = {}) {
  const c = census(ledger);
  const signal = performanceSignal(perf);
  const undrained = c.approved + c.rendered;

  const act = (id, why, what, blocked = false) => ({ action: id, why, what, blocked, census: c, signal });

  // 1 - Something is rendered but failing its gates. Broken output beats new output.
  const failing = atStage('rendered', ledger).filter((p) => p.qaVerdict && p.qaVerdict !== 'PASS');
  if (failing.length) {
    return act('FIX_QA',
      `${failing.length} post(s) rendered but not passing all six gates. A failing render is worse than no render because it looks finished.`,
      `Run ./run.sh on post(s) ${failing.map((p) => p.post).join(', ')}, read out/post-N/qa-report.json, and fix. State for each failure whether THE GATE GOT STRICTER OR THE OUTPUT GOT WORSE before changing either.`);
  }

  // 2 - Approved and unpublished. This is the whole reason the repo exists.
  //
  // But "approved" is not "publishable". A post whose provenance is still
  // reconstructed-fixture passes every gate and is NOT the real brief copy - it was
  // assembled to exercise the pipeline. Counting those as ready to post is how a
  // fixture ends up on the account. tools/export-post.mjs refuses them; the ladder
  // has to know it too, or it will keep sending you to publish something it cannot
  // export. Found by the exporter refusing what the ladder had just recommended.
  const approved = atStage('approved', ledger);
  const fixtures = approved.filter((p) => p.provenance === 'reconstructed-fixture');
  const publishable = approved.filter((p) => p.provenance !== 'reconstructed-fixture' && specIsValid(p.post));
  const invalidApproved = approved.filter((p) => p.provenance !== 'reconstructed-fixture' && !specIsValid(p.post));
  if (invalidApproved.length > 0) {
    return act('FIX_SPEC',
      `${invalidApproved.length} post(s) render and pass every image gate but fail the schema (${invalidApproved.map((p) => p.post).join(', ')}) — usually a layout missing the content it draws, like empty split-compare panels.`,
      `Run node src/validate.mjs on each, restore the missing content VERBATIM from its brief, re-render. If the brief has no content for that panel, change the layout rather than writing copy.`);
  }
  if (machineOnly && publishable.length >= READY_CEILING) {
    return act('HOLD',
      `${publishable.length} post(s) are ready and unscheduled against a ceiling of ${READY_CEILING}. Building more is the six-week queue failure moved one stage later.`,
      'Do nothing to the drain this week. The bottleneck is scheduling, which is Adi\'s: READY-TO-POST/index.html.', true);
  }
  if (!machineOnly && publishable.length > 0) {
    return act('PUBLISH',
      `${publishable.length} post(s) pass every gate, carry real brief copy, and are not live. This is the exact boundary where the old pipeline terminated.`,
      `node tools/export-post.mjs ${publishable[0].post} -> out/post-${publishable[0].post}/PUBLISH/, then post to @getfond. Manual is fine and manual is the point: the cadence has to hold for a month before automating it is anything but debugging an API instead of posting. Record publishedAt in state/performance.json the same day.`);
  }

  if (fixtures.length > 0 && c.spec === 0 && c.scripted === 0) {
    return act('REPLACE_FIXTURE',
      `The only gate-passing post(s) (${fixtures.map((p) => p.post).join(', ')}) still carry reconstructed copy, not the real brief. They render correctly and must not be posted.`,
      `Replace the copy in specs/post-${fixtures[0].post}.json verbatim from its brief, set provenance to "brief" or "converted-from-notion-script", re-render, then export.`);
  }

  // 3 - Published and unmeasured. Close the edge that makes this a loop.
  const lagCutoff = new Date(today.getTime() - MEASURE_LAG_DAYS * 864e5).toISOString().slice(0, 10);
  const measurable = Object.values(perf.posts || {})
    .filter((p) => p.publishedAt && p.publishedAt <= lagCutoff && !(p.reach > 0));
  if (!machineOnly && measurable.length > 0) {
    return act('MEASURE',
      `${measurable.length} post(s) live for over a week with no insights recorded. Until this runs, every claim about what works on this account is a guess.`,
      `Record reach, saves, sends and swipe-through-to-slide-3 for post ${measurable.map((p) => p.post).join(', ')} into state/performance.json. Manual entry from the app is acceptable and takes two minutes; the Insights API is a convenience, not a prerequisite.`);
  }

  // 4 - Specs exist and have not rendered. Cheapest possible throughput.
  if (c.spec > 0) {
    return act('RENDER',
      `${c.spec} spec(s) validated and unrendered. 6.3s each. There is no cheaper unit of progress in this system.`,
      `./run.sh specs/post-N.json for ${atStage('spec', ledger).map((p) => p.post).join(', ')}, both canvases.`);
  }

  // 5 - Scripted copy exists that has never become a spec. Drain, do not fill.
  if (c.scripted > 0) {
    return act('BUILD_SPECS',
      `${c.scripted} post(s) have verbatim copy and no spec. Converting existing copy is strictly better than writing new copy.`,
      `Convert the next batch to specs/post-N.json. Copy verbatim, provenance set honestly, PantryPal to fond as a mechanical substitution only. Never write a line to fill a hole - flag it.`);
  }

  // 6 - A retired format is still in rotation.
  if (signal.ready && signal.retire.length) {
    return act('RETIRE_FORMAT',
      `Format(s) ${signal.retire.join(', ')} underperformed the account median ${gtm.organicMetrics.killCriterion.consecutiveMisses} posts running. GTM kill criterion fires.`,
      `Redesign or retire ${signal.retire.join(', ')} before any new post uses it.`);
  }

  // 7 - The freshness pool is stale. Blocks concept work by design.
  const cutoff = Date.now() - 14 * 864e5;
  const live = (fresh.items || []).filter((i) => new Date(i.observedAt || 0).getTime() >= cutoff);
  if (!live.length) {
    return act('HARVEST',
      'No outer-world observations inside 14 days. The entropy guard will refuse every new concept until this is refilled, which is intentional.',
      `Harvest from the free stack (${gtm.research.sources.map((s) => s.name).join(', ')}) into state/freshness.json. Deliverable per GTM: ${gtm.research.deliverable}`);
  }

  // 8 - Gaps: copy that exists but is not in this repo. Blocked on Adi, not the engine.
  if (!machineOnly && c.gap > 0) {
    return act('REQUEST_BRIEFS',
      `${c.gap} post(s) have no retrievable copy. The engine must not write it.`,
      `Locate the missing brief files and copy them into briefs/. See specs/COVERAGE.md for the exact filenames.`, true);
  }

  // 9 - Only now is writing new copy the right move, and only under the drain gate.
  if (undrained > DRAIN_CEILING) {
    return act('DRAIN_FIRST',
      `${undrained} undrained post(s) against a ceiling of ${DRAIN_CEILING}. Generating more copy here is precisely the six-week failure.`,
      'Publish or render down to the ceiling first.', true);
  }
  return act('GENERATE',
    'Every existing post is drained, measured and current. New copy is finally the highest-value action.',
    `Generate one concept. It must pass src/entropy.mjs judge() - which requires citing a live observation from state/freshness.json - and must use an angle from gtm.json. ${signal.ready ? `Measured signal says top angle is "${signal.top[0]?.angle}".` : signal.note}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const d = decide();
  const bar = (n, w = 28) => '#'.repeat(Math.min(w, n)) + (n > w ? `+${n - w}` : '');
  console.log('\n  STATE');
  for (const [k, v] of Object.entries(d.census)) if (v) console.log(`    ${k.padEnd(10)} ${String(v).padStart(3)}  ${bar(v)}`);
  console.log(`\n  SIGNAL\n    ${d.signal.ready ? `median ${d.signal.median}, top angle "${d.signal.top[0]?.angle}"` : d.signal.note}`);
  console.log(`\n  NEXT ACTION  ->  ${d.action}${d.blocked ? '   [BLOCKED ON ADI]' : ''}`);
  console.log(`    why:  ${d.why}`);
  console.log(`    do:   ${d.what}\n`);
  logDecision({ action: d.action, census: d.census, blocked: d.blocked });
}
