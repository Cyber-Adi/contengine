// test-autonomy.mjs — fixtures for the autonomy layer (gate 6, entropy guard,
// decision loop). Same discipline as tools/test_gates.py: every check gets a
// deliberately broken input and must catch it. A gate that passes a known-bad
// fixture is worse than no gate, because it manufactures confidence.
import fs from 'node:fs';
import { gtmCheck } from './gtm-check.mjs';
import { validateSpec } from './validate.mjs';
import { judge, hookShape } from './entropy.mjs';
import { decide, performanceSignal } from './decide.mjs';
import { saveFreshness, loadFreshness, isPublishable } from './state.mjs';
import os from 'node:os';
import path from 'node:path';
import { saveRefinery, loadRefinery, setPostStage, STAGES as REFINERY_STAGES } from './refinery-state.mjs';
import { validateCritique, parseNote } from './critic.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok    ${name}`); pass++; }
  catch (e) { console.log(`  FAIL  ${name}\n          ${e.message}`); fail++; }
};
const assert = (c, m) => { if (!c) throw new Error(m); };
const hasCheck = (r, c, lvl) => r.findings.some((f) => f.check === c && (!lvl || f.level === lvl));

const spec = (over = {}, slideCopy = {}) => ({
  postNumber: 999, title: 'fixture', pillar: 'The $2913 Problem', ctaTier: 'Tier 1',
  provenance: 'brief', gtmAngle: 'money-leak',
  slides: [{ index: 1, archetype: 'hook', copy: { headline: 'A clean headline about food.', ...slideCopy } }],
  ...over
});

console.log('\nGATE 6 · GTM conformance');
t('clean spec passes', () => assert(gtmCheck(spec()).verdict === 'PASS', 'clean spec should pass'));
t('catches traction claim', () =>
  assert(hasCheck(gtmCheck(spec({}, { headline: 'Join thousands of households already saving' })), 'honesty', 'FAIL'),
    'should FAIL on a pre-launch traction claim'));
t('catches "customers"', () =>
  assert(hasCheck(gtmCheck(spec({}, { body: 'Our customers save money.' })), 'honesty', 'FAIL'),
    'should FAIL: founding member, never customer'));
t('catches numeric user claim', () =>
  assert(hasCheck(gtmCheck(spec({}, { body: '12,000 households use fond every week.' })), 'honesty', 'FAIL'),
    'should FAIL on a numeric traction pattern'));
t('catches unknown ctaTier', () =>
  assert(hasCheck(gtmCheck(spec({ ctaTier: 'Tier 9' })), 'cta-tier', 'FAIL'), 'should FAIL on an undefined tier'));
t('catches unknown angle', () =>
  assert(hasCheck(gtmCheck(spec({ gtmAngle: 'invented-angle' })), 'unknown-angle', 'FAIL'),
    'should FAIL on an angle outside the matrix'));
t('warns on unsourced hero number', () =>
  assert(hasCheck(gtmCheck(spec({}, { heroNumber: '87%' })), 'unsourced-hero', 'WARN'),
    'should WARN on a figure not in gtm.json'));
t('accepts the sourced hero number', () =>
  assert(!hasCheck(gtmCheck(spec({}, { heroNumber: '$2,913' })), 'unsourced-hero'),
    'EPA 2025 figure is sourced and must not warn'));
t('reads diagram labels, not just copy', () =>
  assert(hasCheck(gtmCheck(spec({ slides: [{ index: 1, archetype: 'value', copy: { headline: 'ok' },
      diagram: { kind: 'bar-compare', data: { labels: ['trusted by 40,000 users'] } } }] })), 'honesty', 'FAIL'),
    'a dishonest claim hiding in a diagram label must still fail'));

console.log('\nSCHEMA · layout content');
// Built by mutating a real, fully valid spec: a hand-rolled minimal spec fails on
// unrelated required fields (thread zone, 5-slide minimum) and would prove nothing
// about the layout rule. Caught by the fixture itself on first run.
const base = () => JSON.parse(fs.readFileSync(new URL('../specs/post-32.json', import.meta.url), 'utf8'));
const withSlide = (patch) => { const s = base(); s.slides[1] = { ...s.slides[1], ...patch }; return s; };
const rejects = (spec) => { try { validateSpec(spec); return false; } catch { return true; } };
t('empty split-compare is REJECTED', () =>
  assert(rejects(withSlide({ layout: 'split-compare', copy: { headline: 'h' } })),
    'split-compare with no copy.items renders two empty boxes, and passed all six gates on post-31'));
t('split-compare with panels is accepted', () =>
  assert(!rejects(withSlide({ layout: 'split-compare', copy: { headline: 'h', items: ['a', 'b'] } })),
    'a properly filled split-compare must still validate'));
t('one-item stack-list is REJECTED', () =>
  assert(rejects(withSlide({ layout: 'stack-list', copy: { headline: 'h', items: ['only one'] } })),
    'a list of one is not a list'));
t('empty quadrant-card is REJECTED', () =>
  assert(rejects(withSlide({ layout: 'quadrant-card', copy: { headline: 'h' } })),
    'quadrant-card with no quadrants renders empty cells'));

console.log('\nENTROPY GUARD');
const saved = loadFreshness();
saveFreshness({ items: [{ id: 'tt-001', source: 'tiktok-creative-center',
  observed: 'Food ads opening on a static object with no face are outperforming talking-head openers.',
  observedAt: new Date().toISOString() }] });
const recent = [
  { post: 44, hook: 'Your fridge is costing you $2,913 a year', angle: 'money-leak' },
  { post: 45, hook: 'Your crisper drawer has one job', angle: 'money-leak' },
  { post: 46, hook: 'Your eggs are fine. Your label lied.', angle: 'date-label-lie' }
];
t('near-duplicate hook is refused', () => {
  const r = judge({ hook: 'Your fridge is costing you $2,913 each year', angle: 'money-leak', citations: ['tt-001'] }, recent);
  assert(!r.ok && r.findings.some((f) => f.check === 'repetition'), 'should refuse an 80%-overlap hook');
});
t('novel hook with a citation is allowed', () => {
  const r = judge({ hook: 'Freezer burn is not spoilage and the difference is worth $200', angle: 'takeout-guilt', citations: ['tt-001'] }, recent);
  assert(r.ok, `should allow a novel, cited concept: ${JSON.stringify(r.findings)}`);
});
t('uncited concept is refused even when novel', () => {
  const r = judge({ hook: 'Freezer burn is not spoilage and the difference is worth $200', angle: 'takeout-guilt' }, recent);
  assert(!r.ok && r.findings.some((f) => f.check === 'no-citation'),
    'novelty sourced only from the account\'s own history is how entropy starts');
});
t('stale freshness pool blocks generation', () => {
  saveFreshness({ items: [{ id: 'old-1', source: 'reddit', observed: 'x',
    observedAt: new Date(Date.now() - 40 * 864e5).toISOString() }] });
  const r = judge({ hook: 'A completely unrelated angle about freezer physics', citations: ['old-1'] }, recent);
  assert(!r.ok && r.findings.some((f) => f.check === 'freshness-empty'), 'a 40-day-old pool must not count');
});
t('shape run is caught', () => {
  saveFreshness({ items: [{ id: 'f1', source: 'reddit', observed: 'x', observedAt: new Date().toISOString() }] });
  // All four share shape "possessive-open": open on "Your", no number, no negation.
  // (The earlier version of this fixture was wrong, not the gate - its history hooks
  // carried digits, making them "numeric+possessive-open" and a different move.)
  const runRecent = ['Your crisper drawer is working against you', 'Your freezer is doing half a job',
    'Your pantry is hiding something'].map((hook, i) => ({ post: i + 1, hook, angle: 'money-leak' }));
  const r = judge({ hook: 'Your last thing is also broken somehow', citations: ['f1'] }, runRecent);
  assert(r.findings.some((f) => f.check === 'shape-run'), `4th identical shape should fire; shape=${hookShape('Your last thing is also broken somehow')}`);
});
saveFreshness(saved);

console.log('\nDECISION LOOP');
t('kill criterion fires after 3 consecutive misses', () => {
  const perf = { posts: Object.fromEntries([
    ['1', { post: 1, reach: 1000, saves: 90, sends: 40, format: 'good', publishedAt: '2026-08-01' }],
    ['2', { post: 2, reach: 1000, saves: 80, sends: 35, format: 'good', publishedAt: '2026-08-03' }],
    ['3', { post: 3, reach: 1000, saves: 5, sends: 1, format: 'tired', publishedAt: '2026-08-05' }],
    ['4', { post: 4, reach: 1000, saves: 4, sends: 1, format: 'tired', publishedAt: '2026-08-07' }],
    ['5', { post: 5, reach: 1000, saves: 3, sends: 0, format: 'tired', publishedAt: '2026-08-09' }]
  ]) };
  const s = performanceSignal(perf);
  assert(s.ready && s.retire.includes('tired'), `should retire "tired": ${JSON.stringify(s)}`);
});
t('refuses to claim a signal from under 3 posts', () => {
  const s = performanceSignal({ posts: { 1: { post: 1, reach: 100, saves: 9, sends: 2 } } });
  assert(!s.ready, 'two posts is not a signal');
});
t('drain beats generate', () => {
  const ledger = { posts: Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [String(i), { post: i, stage: 'approved' }])) };
  const d = decide({ ledger, perf: { posts: {} }, fresh: { items: [] } });
  assert(d.action === 'PUBLISH', `20 approved posts must not produce GENERATE, got ${d.action}`);
});
t('a fixture-provenance post is not publishable', () => {
  const ledger = { posts: { 5: { post: 5, stage: 'approved', provenance: 'reconstructed-fixture' } } };
  const d = decide({ ledger, perf: { posts: {} }, fresh: { items: [{ id: 'f', observedAt: new Date().toISOString() }] } });
  assert(d.action !== 'PUBLISH', `must not send you to publish reconstructed copy, got ${d.action}`);
  assert(d.action === 'REPLACE_FIXTURE', `should ask for the real brief copy, got ${d.action}`);
});
t('a real-brief post IS publishable', () => {
  const ledger = { posts: { 5: { post: 5, stage: 'approved', provenance: 'brief' } } };
  const d = decide({ ledger, perf: { posts: {} }, fresh: { items: [] } });
  assert(d.action === 'PUBLISH', `real copy that passed its gates must be published, got ${d.action}`);
});
t('machine-only never returns a human action', () => {
  const ledger = { posts: { 5: { post: 5, stage: 'approved', provenance: 'brief' }, 7: { post: 7, stage: 'scripted' } } };
  const d = decide({ ledger, perf: { posts: {} }, fresh: { items: [] }, machineOnly: true });
  assert(!['PUBLISH', 'MEASURE', 'REQUEST_BRIEFS'].includes(d.action), `machine-only returned human action ${d.action}`);
  assert(d.action === 'BUILD_SPECS', `with copy waiting, the machine should drain it, got ${d.action}`);
});
t('a full ready buffer holds the drain', () => {
  const posts = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [String(900 + i), { post: 900 + i, stage: 'approved', provenance: 'brief' }]));
  posts['7'] = { post: 7, stage: 'scripted' };
  const d = decide({ ledger: { posts }, perf: { posts: {} }, fresh: { items: [] }, machineOnly: true });
  assert(d.action === 'HOLD', `6 unscheduled ready posts must hold the drain, got ${d.action}`);
});
t('a scheduled future post is not due for measurement', () => {
  const ledger = { posts: { 5: { post: 5, stage: 'published', provenance: 'brief' }, 7: { post: 7, stage: 'scripted' } } };
  const future = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
  const d = decide({ ledger, perf: { posts: { 5: { post: 5, publishedAt: future } } }, fresh: { items: [] } });
  assert(d.action !== 'MEASURE', `a post going live in 5 days has no numbers yet, got ${d.action}`);
});
t('a post live 8 days with no numbers IS due', () => {
  const ledger = { posts: { 5: { post: 5, stage: 'published', provenance: 'brief' } } };
  const past = new Date(Date.now() - 8 * 864e5).toISOString().slice(0, 10);
  const d = decide({ ledger, perf: { posts: { 5: { post: 5, publishedAt: past } } }, fresh: { items: [] } });
  assert(d.action === 'MEASURE', `8 days live, unmeasured, should be MEASURE, got ${d.action}`);
});
t('generate only when the board is genuinely clear', () => {
  const d = decide({ ledger: { posts: { 1: { post: 1, stage: 'measured' } } }, perf: { posts: {} },
    fresh: { items: [{ id: 'f', observedAt: new Date().toISOString() }] } });
  assert(d.action === 'GENERATE', `clear board should generate, got ${d.action}`);
});

console.log('\nVISION CRITIC');
const good = { stop: 4, stand: 4, arrive: 5, save: 4, family: 5 };
t('a clean critique is accepted', () => assert(validateCritique({ scores: good }).ok, 'all >= 4 needs no citations'));
t('a missing dimension is REJECTED', () => assert(!validateCritique({ scores: { ...good, save: undefined } }).ok, 'missing save should fail'));
t('a score of 6 or 0 or 3.5 is REJECTED', () => {
  for (const bad of [6, 0, 3.5]) assert(!validateCritique({ scores: { ...good, stop: bad } }).ok, `stop=${bad} should fail`);
});
t('a score under 4 with no citation is REJECTED', () => assert(!validateCritique({ scores: { ...good, stop: 2 } }).ok, 'bare low score should fail'));
t('a low score citing slide and element is accepted', () => {
  const f = [{ dimension: 'stop', slide: 1, element: 'five-line serif headline' }];
  assert(validateCritique({ scores: { ...good, stop: 2 }, findings: f }).ok, 'cited low score should pass');
});
t('a citation for the WRONG dimension does not excuse a low score', () => {
  const f = [{ dimension: 'save', slide: 1, element: 'five-line serif headline' }];
  assert(!validateCritique({ scores: { ...good, stop: 2 }, findings: f }).ok, 'citation must match the dimension');
});
t('a citation with no real element is REJECTED', () => {
  const f = [{ dimension: 'stop', slide: 1, element: ' ' }];
  assert(!validateCritique({ scores: { ...good, stop: 2 }, findings: f }).ok, 'blank element should fail');
});
t('note parsing keeps colons inside the element', () => {
  const n = parseNote('stop:1:hook: five lines');
  assert(n && n.slide === 1 && n.element === 'hook: five lines', 'element should keep its own colon');
  assert(parseNote('garbage') === null, 'unparseable note should be null');
});

console.log('\nREFINERY CONTRACT (S0)');
const refined = (over = {}) => {
  const b = base();
  const first = b.slides[0].copy;
  return { ...b, provenance: 'refined', variant: 'B', refinedFrom: b.postNumber, picked: false,
    originalCopy: b.slides.map((sl) => sl.copy),
    refinement: { round: 1, model: 'claude-sonnet-5-5', at: '2026-10-02T00:00:00.000Z',
      changes: [{ slide: 1, field: 'headline', from: String(first.headline ?? ''), to: 'x', why: 'tighter' }] },
    ...over };
};
t('variant B without originalCopy is REJECTED', () => {
  const { originalCopy, ...noOrig } = refined();
  assert(rejects(noOrig), 'variant B must require originalCopy');
  try { validateSpec(noOrig); } catch (e) { assert(/originalCopy/.test(e.message), `rejected for the wrong reason: ${e.message}`); }
});
t('good variant B with originalCopy validates', () => { validateSpec(refined()); });
t('refinement change with empty why is REJECTED', () => {
  const b = refined();
  assert(rejects({ ...b, refinement: { ...b.refinement, changes: [{ ...b.refinement.changes[0], why: '' }] } }), 'why must be non-empty');
});
t('variant A needs no originalCopy', () => { validateSpec({ ...base(), variant: 'A' }); });
t('refined spec without picked:true is excluded by the ready filter', () => {
  assert(!isPublishable({ provenance: 'refined' }), 'unpicked refined must not ship');
  assert(!isPublishable({ provenance: 'refined', picked: false }), 'picked:false must not ship');
  assert(isPublishable({ provenance: 'refined', picked: true }), 'picked refined may ship');
  assert(isPublishable({ provenance: 'brief' }), 'brief ships');
  assert(!isPublishable({ provenance: 'reconstructed-fixture' }), 'fixture never ships');
});
t('saveRefinery leaves valid JSON and no temp file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'refinery-'));
  const file = path.join(dir, 'refinery.json');
  saveRefinery({ posts: { 5: { stage: 'queued' } } }, file);
  saveRefinery(setPostStage(loadRefinery(file), 5, 'designing'), file);
  const back = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert(back.posts['5'].stage === 'designing' && back.updatedAt, 'state persisted');
  assert(fs.readdirSync(dir).join() === 'refinery.json', `temp lingered: ${fs.readdirSync(dir)}`);
  assert(REFINERY_STAGES.includes('vault'), 'stage enum');
  let threw = false; try { setPostStage({ posts: {} }, 5, 'bogus'); } catch { threw = true; }
  assert(threw, 'unknown stage rejected');
});

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
