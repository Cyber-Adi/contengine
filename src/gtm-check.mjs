// gtm-check.mjs — GATE 6 · GTM CONFORMANCE.
//
// Gates 1-5 prove a slide is well made. None of them can tell you it is off-message.
// A carousel can be typographically perfect, palette-clean, legible at 200px and
// still claim traction fond does not have, or set an unsourced number as hero type.
// This gate reads gtm.json the way the pixel gate reads tokens.json.
//
// It is deliberately the only gate allowed to WARN rather than FAIL on figures:
// a brief may legitimately carry a number gtm.json has not catalogued. FAIL is
// reserved for claims that are pre-launch-dishonest, which are never legitimate.
import fs from 'node:fs';
import { gtm, honestyCheck, unsourcedFigures } from './gtm.mjs';

export function gtmCheck(spec) {
  const findings = [];
  const add = (level, check, detail, slide = null) => findings.push({ level, check, detail, slide });

  // Slide text lives under `copy` (schema-defined), plus any diagram label. Read the
  // real shape rather than a guessed one - guessing the shape is what made the word-count
  // gate measure a 55-word paragraph as 16 words.
  const diagramText = (d) => !d ? [] : JSON.stringify(d.data || {}).match(/"[^"]{2,}"/g)?.map((x) => x.slice(1, -1)) || [];
  const allText = (spec.slides || []).map((s, i) => ({
    i: i + 1,
    text: [...Object.values(s.copy || {}).filter((v) => typeof v === 'string'),
           ...diagramText(s.diagram)].join(' ')
  }));

  // 6.1 - pre-launch honesty. Hard fail.
  for (const { i, text } of allText) {
    for (const f of honestyCheck(text, `slide ${i}`)) {
      add('FAIL', 'honesty', `${f.why} Found: "${f.match}"`, i);
    }
  }

  // 6.2 - hero numbers must trace to a sourced GTM stat.
  for (const s of spec.slides || []) {
    const hero = s.copy?.heroNumber;
    if (!hero) continue;
    const un = unsourcedFigures(String(hero));
    if (un.length) {
      add('WARN', 'unsourced-hero',
        `Hero number ${un.join(', ')} is not in gtm.json's sourced set (${gtm.angles.filter(a=>a.stat?.value).map(a=>a.stat.value).join(', ')}). Either add its citation to gtm.json or render it qualitatively.`,
        spec.slides.indexOf(s) + 1);
    }
  }

  // 6.3 - CTA tier must exist in the contract and stay pre-launch.
  if (spec.ctaTier && !(spec.ctaTier in gtm.ctas)) {
    add('FAIL', 'cta-tier', `ctaTier "${spec.ctaTier}" is not defined in gtm.json. Known: ${Object.keys(gtm.ctas).filter(k => k[0] !== '$').join(', ')}.`);
  }

  // 6.4 - angle attribution. A carousel with no angle cannot be adapted into an ad card
  // later, which is where the Ad Bank's 90%-adaptation rule gets its supply.
  if (!spec.gtmAngle) {
    add('WARN', 'no-angle',
      `No gtmAngle set. Angles: ${gtm.angles.map(a => a.id).join(', ')}. Without one this post cannot feed the Ad Bank, whose rule is 90% adaptation and 10% origination.`);
  } else if (!gtm.angles.some(a => a.id === spec.gtmAngle)) {
    add('FAIL', 'unknown-angle', `gtmAngle "${spec.gtmAngle}" is not in the matrix.`);
  }

  // 6.5 - provenance must be honest before anything ships.
  if (spec.provenance === 'reconstructed-fixture') {
    add('WARN', 'provenance', 'Copy is reconstructed, not verbatim from a brief. Must be replaced before publishing.');
  }

  const fails = findings.filter(f => f.level === 'FAIL').length;
  return { verdict: fails ? 'FAIL' : 'PASS', fails, warns: findings.length - fails, findings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const p = process.argv[2];
  if (!p) { console.error('usage: node src/gtm-check.mjs specs/post-N.json'); process.exit(2); }
  const r = gtmCheck(JSON.parse(fs.readFileSync(p, 'utf8')));
  for (const f of r.findings) console.log(`  ${f.level.padEnd(4)} ${f.check.padEnd(16)} ${f.slide ? `s${f.slide} ` : ''}${f.detail}`);
  console.log(`  gate 6 -> ${r.verdict}  (${r.fails} fail, ${r.warns} warn)`);
  process.exit(r.verdict === 'FAIL' ? 1 : 0);
}
