// test-package.mjs — fixtures for the post package (caption, alt text, tiktok text).
// Deterministic, zero model calls. Runs over every real spec plus broken-input fixtures.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './tokens.mjs';
import { gtm, launchCheck } from './gtm.mjs';
import { buildCaption, buildAltText, buildTikTok, checkPackage } from './package.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok    ${name}`); pass++; }
  catch (e) { console.log(`  FAIL  ${name}\n          ${e.message}`); fail++; }
};
const assert = (c, m) => { if (!c) throw new Error(m); };

const specDir = path.join(ROOT, 'specs');
const specs = fs.readdirSync(specDir).filter((f) => /^post-\d+\.json$/.test(f))
  .map((f) => ({ f, spec: JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8')) }));
const setupPhase = launchCheck('waitlist').length > 0;
const cleanBody = (cap) => cap.trim().split('\n').filter((l) => !/^\s*(#\w+\s*)+$/.test(l));
const lastLine = (cap) => cleanBody(cap).filter(Boolean).pop();

const mk = (over = {}) => ({
  postNumber: 7, title: 'Fixture', pillar: 'Store It Right', ctaTier: 'Tier 1', sendTrigger: 'Send this to your roommate.',
  slides: [
    { index: 1, layout: 'hero-statement', copy: { headline: 'Your fridge door is the warmest shelf.' } },
    { index: 2, layout: 'diagram', diagram: { kind: 'shelf-map' }, copy: { headline: 'Milk belongs on the back shelf near the wall.' } },
    { index: 3, layout: 'cta-card', copy: { headline: 'Keep it cold.', ctaLine: 'x' } },
  ],
  ...over,
});

console.log('post package');

t('closed tables exist for every pillar in specs', () => {
  for (const { spec } of specs) {
    assert(gtm.hashtags[spec.pillar], `no hashtags for pillar ${spec.pillar}`);
    assert(gtm.tiktokKeywords[spec.pillar], `no tiktokKeywords for pillar ${spec.pillar}`);
  }
});

t('caption ends with exactly one setup CTA (non-Tier-0), setup phase', () => {
  assert(setupPhase, 'launch state is not setup; this test targets the setup phase');
  for (const { f, spec } of specs.filter((s) => s.spec.ctaTier !== 'Tier 0')) {
    const cap = buildCaption(spec);
    const hits = gtm.ctas.setup.filter((c) => cap.includes(c));
    assert(hits.length === 1, `${f}: expected 1 setup CTA, found ${hits.length}`);
    assert(lastLine(cap) === hits[0], `${f}: caption body does not end with the CTA`);
  }
});

t('Tier 0 caption carries no CTA', () => {
  for (const { f, spec } of specs.filter((s) => s.spec.ctaTier === 'Tier 0')) {
    const cap = buildCaption(spec);
    assert(!gtm.ctas.setup.some((c) => cap.includes(c)), `${f}: Tier 0 has a CTA`);
  }
  const cap = buildCaption(mk({ ctaTier: 'Tier 0' }));
  assert(!gtm.ctas.setup.some((c) => cap.includes(c)), 'fixture Tier 0 has a CTA');
  assert(!buildTikTok(mk({ ctaTier: 'Tier 0' })).includes('Follow'), 'Tier 0 tiktok has a CTA');
});

t('no em dash, no waitlist / link in bio / pre-order in any output', () => {
  for (const { f, spec } of specs) {
    const gen = [buildCaption(spec), buildTikTok(spec)].join('\n');
    const all = `${gen}\n${buildAltText(spec)}`;
    assert(!/[—–]/.test(all), `${f}: em or en dash in output`);
    // alt text mirrors slide copy, which Gate 6 owns; caption and tiktok are checked here.
    assert(checkPackage({ gen }).length === 0, `${f}: honesty/launch finding`);
  }
});

t('hashtags are 3-5 per caption', () => {
  for (const { f, spec } of specs) {
    const n = (buildCaption(spec).match(/#\w+/g) || []).length;
    assert(n >= 3 && n <= 5, `${f}: ${n} hashtags`);
  }
});

t('caption stays under 2200 chars and leads with the hook', () => {
  for (const { f, spec } of specs) {
    const cap = buildCaption(spec);
    assert(cap.length <= 2200, `${f}: ${cap.length} chars`);
  }
  assert(buildCaption(mk()).startsWith('Your fridge door is the warmest shelf.'), 'hook does not lead');
});

t('alt text has one line per slide, diagram slides described', () => {
  for (const { f, spec } of specs) {
    const lines = buildAltText(spec).trim().split('\n');
    assert(lines.length === spec.slides.length, `${f}: ${lines.length} alt lines vs ${spec.slides.length} slides`);
  }
  assert(/Shelf map/.test(buildAltText(mk())), 'diagram description missing');
});

t('tiktok title <= 90 chars, has caption, 3 hashtags and sound line', () => {
  for (const { f, spec } of specs) {
    const tt = buildTikTok(spec);
    const title = tt.match(/^TITLE: (.+)$/m)?.[1] || '';
    assert(title.length > 0 && title.length <= 90, `${f}: title length ${title.length}`);
    assert(/^CAPTION: .+/m.test(tt), `${f}: no caption`);
    assert((tt.match(/^HASHTAGS: (.+)$/m)?.[1].match(/#\w+/g) || []).length === 3, `${f}: hashtags != 3`);
    assert(tt.includes('SOUND: pick a trending sound in-app at low volume.'), `${f}: no sound line`);
  }
});

t('supplied caption is kept verbatim, CTA sentences stripped, rotated setup CTA appended', () => {
  const cap = buildCaption(mk({ caption: 'Cold milk lasts longer. Join the waitlist, link in bio.\n\n#milk #fridge #foodwaste' }));
  assert(cap.startsWith('Cold milk lasts longer.'), 'supplied text lost');
  assert(!/waitlist|link in bio/i.test(cap), 'CTA sentence not stripped');
  assert(gtm.ctas.setup.some((c) => lastLine(cap) === c), 'setup CTA not appended');
  assert(cap.includes('#milk #fridge #foodwaste'), 'supplied hashtags lost');
});

t('output is deterministic', () => {
  for (const { spec } of specs) {
    assert(buildCaption(spec) === buildCaption(spec), 'caption differs');
    assert(buildAltText(spec) === buildAltText(spec), 'alt differs');
    assert(buildTikTok(spec) === buildTikTok(spec), 'tiktok differs');
  }
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
