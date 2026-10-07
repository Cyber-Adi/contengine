// log-post.mjs — the twenty-second version of closing the loop.
//
// The feedback edge is what separates this from a line, and it has been inert since
// the day it was built because "open a JSON file and hand-edit a nested object" is
// enough friction to never happen. This makes it one command.
//
//   node tools/log-post.mjs 49 --published
//   node tools/log-post.mjs 49 --reach 1240 --saves 41 --sends 18
//   node tools/log-post.mjs 49 --reach 1240 --saves 41 --sends 18 --profile 22 --follows 6
//
// --slide3 is OPTIONAL: Instagram's per-slide reach is unconfirmed. If you can read it,
// it is (slide 3 reach / slide 1 reach). Any metric you omit is stored as absent, never 0.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './../src/tokens.mjs';
import { STATE_DIR, loadPerformance, savePerformance, reconcile, loadLedger, saveLedger } from './../src/state.mjs';
import { loadSchedule, saveSchedule, markScheduled } from './../src/schedule.mjs';

const argv = process.argv.slice(2);

// --scheduled-all / --scheduled N,N,N: mark posts scheduled on the dates PERSISTED in
// state/schedule.json (written once by tools/ready.mjs, never recomputed). --scheduled-all
// touches ONLY planned posts inside the NOW window (next 28 days); the LATER posts have not
// been put in Meta yet and must stay in the queue. Testing hooks: --schedule-file F,
// --today YYYY-MM-DD, --dry-run (prints, writes nothing).
const optFlag = (name) => { const i = argv.indexOf(`--${name}`); return i === -1 ? undefined : argv[i + 1]; };
if (argv.includes('--scheduled-all') || argv.includes('--scheduled')) {
  const file = optFlag('schedule-file') || path.join(STATE_DIR, 'schedule.json');
  const today = optFlag('today') || new Date().toISOString().slice(0, 10);
  const dry = argv.includes('--dry-run');
  const only = argv.includes('--scheduled')
    ? String(optFlag('scheduled') ?? '').split(',').map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x > 0)
    : undefined;
  if (only && !only.length) { console.error('--scheduled needs post numbers, e.g. --scheduled 9,43,58'); process.exit(2); }
  const current = loadSchedule(file);
  if (!Object.keys(current.posts).length) { console.error('state/schedule.json is empty -- run npm run tap first'); process.exit(2); }
  const unknown = (only ?? []).filter((p) => !current.posts[p]);
  if (unknown.length) { console.error(`no assigned slot for post(s) ${unknown.join(', ')} -- run npm run tap first`); process.exit(2); }
  const { schedule, marked } = markScheduled(current, today, only);
  if (!marked.length) { console.log('nothing to mark: no planned posts in the NOW window (or the named posts are already scheduled)'); process.exit(0); }
  console.log(`marking ${marked.length} post(s) scheduled${only ? '' : ' (NOW window only)'}:`);
  if (!dry) {
    for (const { post, date } of marked) {
      execFileSync(process.execPath, [path.join(ROOT, 'tools', 'log-post.mjs'), String(post), '--published', '--date', date], { stdio: 'inherit' });
    }
    saveSchedule(file, schedule);
  } else for (const m of marked) console.log(`  post-${m.post} ${m.date}`);
  process.exit(0);
}

const n = argv[0];
if (!n || n.startsWith('--')) {
  console.error('usage: node tools/log-post.mjs <postNumber> [--published [--date YYYY-MM-DD]] [--reach N --saves N --sends N --profile N --follows N] [--slide3 0.42, optional] [--platform instagram|tiktok]\n   or: node tools/log-post.mjs --scheduled-all   (marks planned NOW-window posts, next 28 days, on their persisted dates)\n   or: node tools/log-post.mjs --scheduled 9,43,58');
  process.exit(2);
}
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
// A metric that was not given (or is blank / not a number) is ABSENT, never 0.
const num = (name) => {
  const v = flag(name);
  if (v === undefined || v === '' || v.startsWith('--')) return undefined;
  const x = Number(v);
  return Number.isFinite(x) ? x : undefined;
};

const perf = loadPerformance();
perf.posts ||= {};
const row = perf.posts[n] || { post: Number(n) };

let specMeta = {};
try {
  const s = JSON.parse(fs.readFileSync(path.join(ROOT, 'specs', `post-${n}.json`), 'utf8'));
  // format is derived from the spec by decide.mjs (formatOf), not frozen here from slide 1.
  specMeta = { title: s.title, angle: s.gtmAngle, pillar: s.pillar };
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
