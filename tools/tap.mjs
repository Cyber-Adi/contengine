// tap.mjs — ONE COMMAND. `npm run tap`
//
// The weekly session was three or four commands and a decision about which to run,
// and a decision is exactly the kind of friction that turns a twenty-minute job into
// a week of nothing happening. This does every mechanical thing in one shot and ends
// by telling a human the only things a human can do.
//
// It never writes copy, never publishes, and never changes a gate. If something needs
// judgment it stops and says so.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './../src/tokens.mjs';
import { reconcile, loadLedger, saveLedger, census, atStage } from './../src/state.mjs';
import { decide } from './../src/decide.mjs';

const sh = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const say = (s = '') => console.log(s);
const rule = () => say('  ' + '─'.repeat(64));

const specDir = path.join(ROOT, 'specs');
const outDir = path.join(ROOT, 'out');
const specNums = fs.readdirSync(specDir)
  .map((f) => (f.match(/^post-(\d+)\.json$/) || [])[1])
  .filter(Boolean).map(Number).filter((n) => n < 9000).sort((a, b) => a - b);

say('');
say('  THE TAP — weekly mechanical pass');
rule();

// ---- 1. render anything that has a spec and no passing render --------------
const toRenderAll = specNums.filter((n) => {
  const qa = path.join(outDir, `post-${n}`, 'qa-report.json');
  if (!fs.existsSync(qa)) return true;
  try { return JSON.parse(fs.readFileSync(qa, 'utf8')).verdict !== 'PASS'; } catch { return true; }
});

// Validate EVERY spec first, not just the ones about to render. A spec can pass
// its gates, render, and export while being schema-invalid, because the gates
// measure the image and the schema measures the spec. post-31 shipped two empty
// split-compare panels exactly this way.
const invalid = [];
for (const n of specNums) {
  try { sh('node', ['src/validate.mjs', `specs/post-${n}.json`]); }
  catch (e) {
    const lines = String(e.stdout || e.stderr || '').split('\n').filter((l) => l.trim().startsWith('/'));
    invalid.push({ n, why: lines.slice(0, 3).join('; ') || 'schema invalid' });
  }
}
if (invalid.length) {
  for (const { n, why } of invalid) {
    say(`  INVALID     post-${n}  ${why}`);
  }
  say('              these will not render or export until the spec is fixed');
}

const toRender = toRenderAll.filter((n) => !invalid.some((x) => x.n === n));
const rendered = [], failed = [];
if (!toRender.length) say('  render      nothing to do — every spec already passes');
for (const n of toRender) {
  process.stdout.write(`  render      post-${n} ... `);
  try {
    sh('bash', ['run.sh', `specs/post-${n}.json`]);
    try { sh('node', ['src/render.mjs', `specs/post-${n}.json`, '--canvas=tiktok']); } catch { /* 9:16 is optional */ }
    const v = JSON.parse(fs.readFileSync(path.join(outDir, `post-${n}`, 'qa-report.json'), 'utf8')).verdict;
    say(v);
    (v === 'PASS' ? rendered : failed).push(n);
  } catch (e) {
    const msg = String(e.stderr || e.message).split('\n').filter(Boolean).slice(-1)[0] || 'failed';
    say('ERROR');
    say(`              ${msg.slice(0, 100)}`);
    failed.push(n);
  }
}

// ---- 2. export everything publishable --------------------------------------
saveLedger(reconcile(loadLedger()));
const ledger = reconcile(loadLedger());
const ready = atStage('approved', ledger)
  .filter((p) => p.provenance !== 'reconstructed-fixture')
  .filter((p) => !invalid.some((x) => x.n === p.post));
const fixtures = atStage('approved', ledger).filter((p) => p.provenance === 'reconstructed-fixture');

const exported = [];
for (const p of ready) {
  try { sh('node', ['tools/export-post.mjs', String(p.post)]); exported.push(p.post); }
  catch { /* exporter prints its own refusal */ }
}

// ---- 3. report --------------------------------------------------------------
const c = census(ledger);
const d = decide({ ledger, machineOnly: true });

// Build READY-TO-POST/ — the one place Adi goes to schedule.
let readyOut = '';
try { readyOut = sh('node', ['tools/ready.mjs']); } catch (e) { readyOut = 'READY-TO-POST/ failed to build: ' + String(e.stderr || e.message).split('\n')[0]; }

rule();
say('');
say('  BOARD');
for (const [k, v] of Object.entries(c)) if (v) say(`    ${k.padEnd(10)} ${String(v).padStart(3)}`);
say('');

say('  YOUR PART — nothing below can be done without you');
say('');
const readyLines = readyOut.split('\n').filter((l) => /^\s+\d{4}-\d{2}-\d{2}/.test(l));
if (readyLines.length) {
  say(`  1. SCHEDULE  ${readyLines.length} carousel(s) — open READY-TO-POST/index.html`);
  for (const l of readyLines) say('     ' + l.trim());
  say('       Meta Business Suite or the Instagram app → schedule each for its date,');
  say('       then run the "mark scheduled" command shown under it on the page.');
} else {
  say('  1. SCHEDULE  nothing ready.');
  if (fixtures.length) {
    const list = fixtures.map((p) => p.post).join(', ');
    say(`       post ${list} ${fixtures.length > 1 ? 'pass their gates' : 'passes its gates'} but still ${fixtures.length > 1 ? 'carry' : 'carries'}`);
    say('       reconstructed copy. Replace it from the brief first.');
  }
}
say('');

const perf = JSON.parse(fs.readFileSync(path.join(ROOT, 'state', 'performance.json'), 'utf8'));
const live = Object.values(perf.posts || {});
// Only ask for numbers once a post has been live a week. A scheduled post dated
// in the future, or one posted yesterday, has nothing worth recording yet.
const lagCutoff = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
const unmeasured = live.filter((p) => p.publishedAt && p.publishedAt <= lagCutoff && !(p.reach > 0));
const upcoming = live.filter((p) => p.publishedAt && p.publishedAt > lagCutoff && !(p.reach > 0));
const measured = live.filter((p) => p.reach > 0).length;
if (unmeasured.length) {
  say(`  2. LOG   ${unmeasured.length} post(s) live with no numbers. Open Instagram insights:`);
  for (const p of unmeasured) {
    say(`       node tools/log-post.mjs ${p.post} --reach R --saves S --sends X --slide3 0.42`);
  }
  say('       slide3 = slide-3 reach divided by slide-1 reach, off the per-slide graph');
} else if (upcoming.length) {
  say(`  2. LOG   nothing due. ${upcoming.length} scheduled or recent post(s) — numbers are due a week after each goes live:`);
  for (const p of upcoming) {
    const due = new Date(new Date(p.publishedAt).getTime() + 7 * 864e5).toISOString().slice(0, 10);
    say(`       post-${p.post}  live ${p.publishedAt}  → log on or after ${due}`);
  }
} else if (measured) {
  say(`  2. LOG   nothing outstanding. ${measured} post(s) measured.`);
} else {
  say('  2. LOG   nothing live yet, so nothing to measure.');
}
say('');
say(`  3. MACHINE  next for Claude Code: ${d.action}${d.blocked ? '  (blocked on you)' : ''}`);
say(`       ${d.why}`);
if (failed.length) {
  say('');
  say(`  ALSO   post ${failed.join(', ')} did not pass. Read out/post-N/qa-report.json and say`);
  say('         whether the gate got stricter or the output got worse before changing either.');
}
say('');
say(measured < 3
  ? `  ${measured}/3 measured. Under three there is no signal, only anecdote.`
  : `  ${measured} measured — the feedback edge is live.`);

// The monthly read lives here rather than in a ninth scheduled task. A reminder
// that fires inside the tool you already have open is harder to ignore than a
// notification, and this system does not need more surface area.
const today = new Date();
if (today.getDay() === 0 && today.getDate() <= 7) {
  say('');
  rule();
  say('  FIRST SUNDAY — the monthly read is due (~45 min). See WEEKLY.md.');
  say('    · open every contact-sheet.png from the month together: does this look');
  say('      like ONE account? The gates cannot answer that one.');
  say('    · which ANGLE and which FORMAT won, not which topic');
  say('    · retire anything that underperformed three posts running');
  say('    · does the Trend Radar contradict the angle matrix in gtm.json?');
  say('    · would you follow this account? If not, say what is missing.');
  rule();
}
say('');
