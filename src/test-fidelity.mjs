// test-fidelity.mjs - fixtures for Gate 7 (fidelity). Every check gets a deliberately
// broken variant B built from the real specs/post-32.json and must be caught.
// A gate that passes a known-bad fixture is worse than no gate.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './tokens.mjs';
import { fidelityCheck, buildVariantB } from './fidelity.mjs';
import { validateSpec } from './validate.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok    ${name}`); pass++; }
  catch (e) { console.log(`  FAIL  ${name}\n          ${e.message}`); fail++; }
};
const assert = (c, m) => { if (!c) throw new Error(m); };
const has = (r, check) => r.findings.some((f) => f.check === check && f.level === 'FAIL');

const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'specs/post-32.json'), 'utf8'));
const failsWith = (B, check) => {
  const r = fidelityCheck(base, B);
  assert(r.verdict === 'FAIL' && has(r, check),
    `expected FAIL on "${check}", got ${r.verdict}: ${JSON.stringify(r.findings.map((f) => f.check))}`);
};
const meta = { model: 'test', at: '2026-10-02T00:00:00.000Z' };
const edit = (slide, field, to, why = 'sharper phrasing') => ({ slide, field, to, why });
const makeB = (edits) => buildVariantB(base, edits, meta);

console.log('\nGATE 7 · Fidelity');

t('clean B passes', () => {
  const B = makeB([edit(2, 'headline', 'Your fridge, bound for Paris')]);
  const r = fidelityCheck(base, B);
  assert(r.verdict === 'PASS', `should pass: ${JSON.stringify(r.findings)}`);
  assert(B.refinement.changes[0].from === 'Your fridge -> Paris', 'from filled from A');
});
t('clean B validates against the schema', () =>
  validateSpec(makeB([edit(2, 'headline', 'Your fridge, bound for Paris')])));
t('unchanged B (identical copy) passes', () =>
  assert(fidelityCheck(base, makeB([])).verdict === 'PASS', 'unchanged must pass'));
t('number already in A may be reused', () =>
  assert(fidelityCheck(base, makeB([edit(3, 'body',
    'Used-car payments average $525/month, so $2,913 of waste is about half a year of one.')])).verdict === 'PASS', 'reuse ok'));
t('sourced gtm stat (43%) may be used', () =>
  assert(fidelityCheck(base, makeB([edit(2, 'body', 'Roughly 43% of people misread labels.')])).verdict === 'PASS', 'gtm stat ok'));

t('catches invented percentage', () =>
  failsWith(makeB([edit(2, 'body', 'Households cut waste by 37% in a month.')]), 'numbers'));
t('catches invented dollar figure', () =>
  failsWith(makeB([edit(3, 'body', 'The average used-car payment is $612/month.')]), 'numbers'));
t('catches new brand name', () =>
  failsWith(makeB([edit(2, 'body', 'Skip the Instacart run and use what you own.')]), 'proper-nouns'));
t('catches new acronym even sentence-initial', () =>
  failsWith(makeB([edit(2, 'body', 'USDA says this covers a fare to Rome.')]), 'proper-nouns'));
t('catches em dash', () =>
  failsWith(makeB([edit(2, 'body', 'This covers a flight — taxes included.')]), 'em-dash'));
t('catches 45-word body', () => {
  const body = Array.from({ length: 45 }, (_, i) => `word${i}`).join(' ');
  failsWith(makeB([edit(3, 'body', body)]), 'word-limit');
});
t('catches hook line over 8 words', () =>
  failsWith(makeB([edit(2, 'headline', 'Your fridge is quietly sending you on a trip to Paris')]), 'word-limit'));
t('word limit already broken by untouched A text is a warning, not a fail', () => {
  const A2 = JSON.parse(JSON.stringify(base));
  A2.slides[2].copy.body = Array.from({ length: 45 }, (_, i) => `word${i}`).join(' ');
  const r = fidelityCheck(A2, buildVariantB(A2, [], meta));
  assert(r.verdict === 'PASS' && r.findings.some((f) => f.check === 'word-limit' && f.level === 'WARN'), 'should warn only');
});
t('catches banned honesty phrase', () =>
  failsWith(makeB([edit(2, 'body', 'Join thousands of households.')]), 'honesty'));
t('catches PantryPal', () =>
  failsWith(makeB([edit(2, 'body', 'PantryPal covers a fare.')]), 'banned-word'));
t('catches change missing why', () => {
  const B = makeB([edit(2, 'headline', 'Your fridge, bound for Paris')]);
  B.refinement.changes[0].why = '';
  failsWith(B, 'change-why');
});
t('catches undisclosed change (copy differs, no change entry)', () => {
  const B = makeB([edit(2, 'headline', 'Your fridge, bound for Paris')]);
  B.refinement.changes = [];
  failsWith(B, 'undisclosed-change');
});
t('catches change entry that does not match B copy', () => {
  const B = makeB([edit(2, 'headline', 'Your fridge, bound for Paris')]);
  B.refinement.changes[0].to = 'something else';
  failsWith(B, 'change-mismatch');
});
t('catches missing originalCopy', () => {
  const B = makeB([]);
  delete B.originalCopy;
  failsWith(B, 'original-copy');
});
t('catches originalCopy that is not A verbatim', () => {
  const B = makeB([]);
  B.originalCopy[1].headline = 'Doctored original';
  failsWith(B, 'original-copy');
});
t('catches slide count change without dead-slide reason', () => {
  const B = makeB([]);
  B.slides.splice(5, 1);
  failsWith(B, 'slide-count');
});
t('slide count -1 with dead-slide reason is allowed', () => {
  const B = makeB([]);
  B.slides.splice(5, 1);
  B.refinement.changes.push({ slide: 6, field: 'deadSlide', from: 'slide 6', to: 'removed', why: 'repeats slide 3 argument' });
  const r = fidelityCheck(base, B);
  assert(!has(r, 'slide-count'), `dead-slide reason should satisfy count rule: ${JSON.stringify(r.findings)}`);
});
t('catches slide count change of 2', () => {
  const B = makeB([]);
  B.slides.splice(4, 2);
  B.refinement.changes.push({ slide: 5, field: 'deadSlide', from: 'x', to: 'removed', why: 'dead' });
  failsWith(B, 'slide-count');
});
t('catches thread change', () => {
  const B = makeB([]);
  B.thread = { ...B.thread, kind: 'meter' };
  failsWith(B, 'argument-shape');
});
t('catches ctaTier change', () => {
  const B = makeB([]);
  B.ctaTier = 'Tier 1';
  failsWith(B, 'argument-shape');
});
t('catches B not marked variant B / refined', () => {
  const B = makeB([]);
  B.variant = 'A';
  failsWith(B, 'variant');
});

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
