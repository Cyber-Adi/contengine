// log-post.mjs — the twenty-second version of closing the loop.
//
// The feedback edge is what separates this from a line, and it has been inert since
// the day it was built because "open a JSON file and hand-edit a nested object" is
// enough friction to never happen. This makes it one command.
//
//   node tools/log-post.mjs 49 --published
//   node tools/log-post.mjs 49 --reach 1240 --saves 41 --sends 18 --slide3 0.42
//   node tools/log-post.mjs 49 --reach 1240 --saves 41 --sends 18 --profile 22 --follows 6
//
// --slide3 is swipe-through to slide 3: read it off Instagram's per-slide reach
// graph as (slide 3 reach / slide 1 reach). Strategy v2 calls it the primary metric
// and it has never once been logged. It is the closest proxy for "a stranger stopped."
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './../src/tokens.mjs';
import { loadPerformance, savePerformance, reconcile, loadLedger, saveLedger } from './../src/state.mjs';

const argv = process.argv.slice(2);
const n = argv[0];
if (!n || n.startsWith('--')) {
  console.error('usage: node tools/log-post.mjs <postNumber> [--published [--date YYYY-MM-DD]] [--reach N --saves N --sends N --slide3 0.42 --profile N --follows N] [--platform instagram|tiktok]');
  process.exit(2);
}
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const num = (name) => (flag(name) === undefined ? undefined : Number(flag(name)));

const perf = loadPerformance();
perf.posts ||= {};
const row = perf.posts[n] || { post: Number(n) };

let specMeta = {};
try {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, 'specs', `post-${n}.json`), 'utf8'));
  specMeta = { title: s.title, angle: s.gtmAngle, pillar: s.pillar, format: s.slides?.[0]?.layout };
} catch { /* spec may not exist yet */ }

// --date lets you record a post you SCHEDULED rather than posted. Scheduling is the
// normal case now (see READY-TO-POST/index.html), and the go-live date is what the
// one-week measurement lag has to count from, not the day you clicked schedule.
if (flag('date') && !/^\d{4}-\d{2}-\d{2}$/.test(flag('date'))) {
  console.error(`--date must be YYYY-MM-DD, got "${flag('date')}"`); process.exit(2);
}
if (argv.includes('--published') || flag('date') || !row.publishedAt) {
  row.publishedAt = flag('date') || row.publishedAt || new Date().toISOString().slice(0, 10);
}
row.platform = flag('platform') || row.platform || 'instagram';
for (const [k, v] of Object.entries({
  reach: num('reach'), saves: num('saves'), sends: num('sends'),
  profileVisits: num('profile'), follows: num('follows'), swipeToSlide3: num('slide3'),
})) if (v !== undefined && !Number.isNaN(v)) row[k] = v;

perf.posts[n] = { ...specMeta, ...row };
savePerformance(perf);

// A measured post moves to 'measured'; a published one to 'published'. The ledger
// cannot observe either from the filesystem, so this is the only thing that sets them.
const ledger = reconcile(loadLedger());
const lp = ledger.posts[String(n)] || { post: Number(n), stage: 'gap' };
lp.stage = row.reach > 0 ? 'measured' : 'published';
ledger.posts[String(n)] = lp;
saveLedger(ledger);

const have = ['reach', 'saves', 'sends', 'swipeToSlide3'].filter((k) => perf.posts[n][k] !== undefined);
console.log(`post-${n} -> ${lp.stage}${row.publishedAt ? `  (published ${row.publishedAt})` : ''}`);
console.log(`  logged: ${have.length ? have.map((k) => `${k}=${perf.posts[n][k]}`).join('  ') : 'nothing yet — publish date only'}`);
const measured = Object.values(perf.posts).filter((p) => p.reach > 0).length;
console.log(measured < 3
  ? `  ${measured}/3 measured. Below 3 there is no signal, only anecdote.`
  : `  ${measured} measured — the loop's feedback edge is live. Run npm run decide.`);
