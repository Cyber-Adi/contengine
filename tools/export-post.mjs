// export-post.mjs — turn a passed carousel into a folder you can post from your phone
// in under a minute. The ladder's PUBLISH rung is where this operation has always
// died, and it died on friction, not on strategy. Every second of friction between
// "it passed" and "it is live" is the actual bottleneck.
//
//   node tools/export-post.mjs 49   -> out/post-49/PUBLISH/ (IG set, caption, alt, tiktok.txt,
//                                      and tiktok/ with the 9:16 set when it was rendered)
//
// Refuses to export a post that has not passed its gates or whose copy is still
// reconstructed. Shipping a fixture is worse than shipping nothing.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './../src/tokens.mjs';
import { buildCaption, buildAltText, buildTikTok, checkPackage } from './../src/package.mjs';

const n = process.argv[2];
if (!n) { console.error('usage: node tools/export-post.mjs <postNumber>'); process.exit(2); }

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

if (spec.provenance === 'refined' && spec.picked !== true) {
  console.error(`refusing: post-${n} is a Refinery variant that Adi has not picked (picked !== true).`);
  process.exit(1);
}

// Held posts still export (caption refresh); isPublishable keeps them out of READY-TO-POST.
// Everything text-shaped is deterministic and template-based (src/package.mjs), no model calls.
const copyNumbered = (srcDir, dstDir) => {
  fs.mkdirSync(dstDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.png')).sort();
  files.forEach((f, i) => fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, `${String(i + 1).padStart(2, '0')}.png`)));
  return files.length;
};

const dst = path.join(outDir, 'PUBLISH');
const count = copyNumbered(path.join(outDir, 'slides'), dst);
const tiktokSrc = path.join(outDir, 'slides-tiktok');
const tiktokCount = fs.existsSync(tiktokSrc) ? copyNumbered(tiktokSrc, path.join(dst, 'tiktok')) : 0;
const pad = String(count).padStart(2, '0');

const caption = buildCaption(spec);
const alt = buildAltText(spec);
const tiktokTxt = buildTikTok(spec);
const findings = checkPackage({ caption, tiktok: tiktokTxt }) // alt mirrors slide copy, which Gate 6 owns;

fs.writeFileSync(path.join(dst, 'caption.txt'), caption);
fs.writeFileSync(path.join(dst, 'alt.txt'), alt);
fs.writeFileSync(path.join(dst, 'tiktok.txt'), tiktokTxt);
fs.writeFileSync(path.join(dst, 'POST-ME.txt'),
`post-${n} — ${spec.title}
${count} slides, in order 01..${pad}${tiktokCount ? `   (9:16 set in tiktok/, ${tiktokCount} slides)` : ''}
pillar: ${spec.pillar}   angle: ${spec.gtmAngle || '(unset)'}   cta: ${spec.ctaTier}
qa: PASS   provenance: ${spec.provenance}

1. AirDrop this folder to your phone.
2. Instagram > new post > select 01..${pad} IN ORDER. Paste caption.txt; per-slide alt text is in alt.txt.
3. TikTok: upload the images in tiktok/, use tiktok.txt (title, caption, hashtags, sound).
4. Then, same day:  node tools/log-post.mjs ${n} --published
   and about a week later, the numbers:
   node tools/log-post.mjs ${n} --reach 1200 --saves 40 --sends 18 --slide3 0.42
`);

console.log(`exported ${count} slides${tiktokCount ? ` + ${tiktokCount} tiktok` : ''} -> ${path.relative(ROOT, dst)}`);
if (findings.length) {
  console.log('\n  package failed the honesty check, fix before posting:');
  for (const f of findings) console.log(`    ${f.where} ${f.kind}: "${f.match}" — ${f.why}`);
  process.exit(1);
}
console.log('caption, alt, tiktok, POST-ME.txt written. Honesty check clean.');
