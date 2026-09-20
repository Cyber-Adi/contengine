// export-post.mjs — turn a passed carousel into a folder you can post from your phone
// in under a minute. The ladder's PUBLISH rung is where this operation has always
// died, and it died on friction, not on strategy. Every second of friction between
// "it passed" and "it is live" is the actual bottleneck.
//
//   node tools/export-post.mjs 49            -> out/post-49/PUBLISH/
//   node tools/export-post.mjs 49 --tiktok   -> the 9:16 set instead
//
// Refuses to export a post that has not passed its gates or whose copy is still
// reconstructed. Shipping a fixture is worse than shipping nothing.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './../src/tokens.mjs';
import { gtm } from './../src/gtm.mjs';
import { honestyCheck } from './../src/gtm.mjs';

const n = process.argv[2];
const tiktok = process.argv.includes('--tiktok');
if (!n) { console.error('usage: node tools/export-post.mjs <postNumber> [--tiktok]'); process.exit(2); }

const outDir = path.join(ROOT, 'out', `post-${n}`);
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'specs', `post-${n}.json`), 'utf8'));
const qa = JSON.parse(fs.readFileSync(path.join(outDir, 'qa-report.json'), 'utf8'));

if (String(qa.verdict).toUpperCase() !== 'PASS') {
  console.error(`refusing: post-${n} qa verdict is ${qa.verdict}, not PASS.`); process.exit(1);
}
if (spec.provenance === 'reconstructed-fixture') {
  console.error(`refusing: post-${n} provenance is "reconstructed-fixture" — the copy is not the real brief.\n` +
                `Replace it from the brief before publishing. Shipping a fixture is worse than shipping nothing.`);
  process.exit(1);
}

const src = path.join(outDir, tiktok ? 'slides-tiktok' : 'slides');
const dst = path.join(outDir, tiktok ? 'PUBLISH-tiktok' : 'PUBLISH');
fs.mkdirSync(dst, { recursive: true });
const slides = fs.readdirSync(src).filter((f) => f.endsWith('.png')).sort();
slides.forEach((f, i) => fs.copyFileSync(path.join(src, f), path.join(dst, `${String(i + 1).padStart(2, '0')}.png`)));

// ---- caption (BACKLOG P2.4) -------------------------------------------------
// Assembled from the spec's OWN words, never invented. Strategy v2's rule: the
// first sentence carries the searchable keyword, because caption SEO replaced
// hashtag walls. 3-5 hashtags, never a wall.
const s1 = spec.slides.find((s) => s.index === 1) || {};
const last = spec.slides[spec.slides.length - 1] || {};
const plain = (t) => String(t || '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\(\((.+?)\)\)/g, '$1').replace(/\/\/(.+?)\/\//g, '$1');

const opener = plain(s1.copy?.headline || s1.copy?.heroNumberCaption || spec.title);
const trigger = plain(last.copy?.sendTrigger || spec.sendTrigger || '');
const cta = (gtm.ctas[spec.ctaTier] || {}).text || '';
const tags = {
  'The $2913 Problem': ['#foodwaste', '#grocerybudget', '#mealplanning'],
  'Store It Right': ['#foodstorage', '#kitchentips', '#foodwaste'],
  'Supermarket Secrets': ['#grocerystore', '#grocerybudget', '#foodwaste'],
  'Waste Hacks': ['#zerowaste', '#kitchentips', '#foodwaste'],
}[spec.pillar] || ['#foodwaste', '#kitchentips'];

const caption = [opener, '', trigger, cta].filter(Boolean).join('\n') + '\n\n' + tags.slice(0, 4).join(' ') + '\n';
const findings = honestyCheck(caption, 'caption');

fs.writeFileSync(path.join(dst, 'caption.txt'), caption);
fs.writeFileSync(path.join(dst, 'POST-ME.txt'),
`post-${n} — ${spec.title}
${slides.length} slides, in order 01..${String(slides.length).padStart(2, '0')}
pillar: ${spec.pillar}   angle: ${spec.gtmAngle || '(unset)'}   cta: ${spec.ctaTier}
qa: PASS   provenance: ${spec.provenance}

1. AirDrop this folder to your phone.
2. Instagram > new post > select 01..${String(slides.length).padStart(2, '0')} IN ORDER.
3. Paste caption.txt.
4. Then, same day:  node tools/log-post.mjs ${n} --published
   and about a week later, the numbers:
   node tools/log-post.mjs ${n} --reach 1200 --saves 40 --sends 18 --slide3 0.42
`);

console.log(`exported ${slides.length} slides -> ${path.relative(ROOT, dst)}`);
if (findings.length) {
  console.log('\n  caption failed the honesty check — fix before posting:');
  for (const f of findings) console.log(`    ${f.kind}: "${f.match}" — ${f.why}`);
  process.exit(1);
}
console.log('caption + POST-ME.txt written. Honesty check clean.');
