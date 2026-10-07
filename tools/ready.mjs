// ready.mjs — builds READY-TO-POST/, the ONE place you go to schedule posts.
//
//   node tools/ready.mjs        (npm run tap calls this for you)
//
// You should never have to open out/post-N/PUBLISH/ or remember which posts are
// done. This regenerates from scratch every run, from the ledger, so it only ever
// holds posts that (a) pass all six gates, (b) carry real brief copy, (c) validate
// against the schema, and (d) have not been scheduled yet.
//
// Each post gets a suggested slot on a two-a-week cadence (Tue/Thu) with pillars
// alternated, so a week never runs two Supermarket Secrets back to back. The slot
// is a DEFAULT, not a researched optimum -- change it freely when you schedule.
//
// Open READY-TO-POST/index.html in a browser. Everything is there: slides in
// order, caption with a copy button, the exact command to mark it scheduled.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './../src/tokens.mjs';
import { reconcile, loadLedger, loadPerformance, atStage, isPublishable } from './../src/state.mjs';
import { gtmCheck } from './../src/gtm-check.mjs';

const OUT = path.join(ROOT, 'READY-TO-POST');
const PER_WEEK_DAYS = [2, 4];           // Tue, Thu
// US Eastern. Inside both Sprout Social's and Hootsuite's 2026 high-engagement windows for
// those days; docs/META-SCHEDULING-AGENT.md schedules at exactly these times.
const SLOT_TIME = { 2: '3:00 PM ET', 4: '12:30 PM ET' };

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const iso = (d) => d.toISOString().slice(0, 10);
const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---- candidates -------------------------------------------------------------
const ledger = reconcile(loadLedger());
const perf = loadPerformance();
const valid = (n) => {
  try { execFileSync('node', ['src/validate.mjs', `specs/post-${n}.json`], { cwd: ROOT, stdio: 'ignore' }); return true; }
  catch { return false; }
};
const cands = atStage('approved', ledger)
  .filter(isPublishable)
  .filter((p) => !(perf.posts?.[p.post]?.publishedAt))
  .filter((p) => fs.existsSync(path.join(ROOT, 'out', `post-${p.post}`, 'PUBLISH')))
  .filter((p) => valid(p.post))
  // reachedApprovedAt: the FIRST time this post was seen approved, held stable
  // across reruns via READY-TO-POST/.waiting.json below. Without this, the tap
  // re-dates the suggested slot forward every run and a post waiting 10 days
  // looks exactly like one that just became ready.

  .map((p) => {
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, 'specs', `post-${p.post}.json`), 'utf8'));
    const g = gtmCheck(spec);
    const heroWarn = g.findings.filter((f) => f.check === 'unsourced-hero').map((f) => f.detail);
    const heroSlides = g.findings.filter((f) => f.check === 'unsourced-hero').map((f) => f.slide);
    return { ...p, spec, heroWarn, heroSlides };
  });

// Track the first day each post was seen ready, so re-running the tap never
// hides how long a post has actually been waiting (docs/CONTEXT-HANDOFF.md §2: "the
// tap re-dates them forward each run, so the list looks fresh while nothing
// happens"). This file is the one exception to "regenerated from scratch."
const waitingFile = path.join(ROOT, 'state', 'waiting-since.json');
let waitingSince = {};
try { waitingSince = JSON.parse(fs.readFileSync(waitingFile, 'utf8')); } catch { /* first run */ }
const today = iso(new Date());
for (const c of cands) waitingSince[c.post] = waitingSince[c.post] || today;
for (const k of Object.keys(waitingSince)) if (!cands.some((c) => c.post === Number(k))) delete waitingSince[k];
fs.mkdirSync(path.dirname(waitingFile), { recursive: true });
fs.writeFileSync(waitingFile, JSON.stringify(waitingSince, null, 2));
const daysWaiting = (post) => Math.floor((Date.now() - new Date(waitingSince[post]).getTime()) / 864e5);

// Posts with no hero-number question go first, then alternate pillars.
cands.sort((a, b) => (a.heroWarn.length - b.heroWarn.length) || (a.post - b.post));
const ordered = [];
const pool = [...cands];
while (pool.length) {
  const last = ordered[ordered.length - 1];
  const i = pool.findIndex((c) => !last || c.spec.pillar !== last.spec.pillar);
  ordered.push(pool.splice(i === -1 ? 0 : i, 1)[0]);
}

// ---- slots: the next Tue/Thu after today, then onward -----------------------
const slots = [];
const d = new Date(); d.setHours(12, 0, 0, 0);
while (slots.length < ordered.length) {
  d.setDate(d.getDate() + 1);
  if (PER_WEEK_DAYS.includes(d.getDay())) slots.push(new Date(d));
}

// ---- build ------------------------------------------------------------------
// Clear the previous build. Some sandboxes forbid unlink; there, stale folders are
// MOVED aside (rename is permitted where delete is not) and current ones are
// overwritten in place, so the page never shows a post that has been scheduled.
const tryRm = (p) => { try { fs.rmSync(p, { recursive: true, force: true }); return true; } catch { return false; } };
if (!tryRm(OUT)) {
  const keep = new Set(ordered.map((c) => c.post));
  const wanted = new Set(ordered.map((c, i) => `${iso(slots[i])} ${DAY[slots[i].getDay()]} - post-${c.post} ${c.spec.title}`.replace(/[\/:*?"<>|]/g, '')));
  const aside = path.join(ROOT, '_to_delete', `READY-TO-POST-stale-${Date.now()}`);
  for (const name of fs.existsSync(OUT) ? fs.readdirSync(OUT) : []) {
    const m = name.match(/post-(\d+)/);
    if (m && keep.has(Number(m[1])) && wanted.has(name)) continue;
    if (!m) continue;                                  // index.html / SCHEDULE.txt get overwritten
    fs.mkdirSync(aside, { recursive: true });
    fs.renameSync(path.join(OUT, name), path.join(aside, name));
  }
}
fs.mkdirSync(OUT, { recursive: true });

const entries = ordered.map((c, i) => {
  const slot = slots[i];
  const folder = `${iso(slot)} ${DAY[slot.getDay()]} - post-${c.post} ${c.spec.title}`.replace(/[\/:*?"<>|]/g, '');
  const dst = path.join(OUT, folder);
  const src = path.join(ROOT, 'out', `post-${c.post}`, 'PUBLISH');
  fs.mkdirSync(dst, { recursive: true });
  const files = fs.readdirSync(src).sort();
  for (const f of files) fs.cpSync(path.join(src, f), path.join(dst, f), { recursive: true }); // PUBLISH/tiktok/ is a folder
  const slides = files.filter((f) => f.endsWith('.png'));
  const caption = fs.readFileSync(path.join(src, 'caption.txt'), 'utf8');
  const markCmd = `node tools/log-post.mjs ${c.post} --published --date ${iso(slot)}`;
  const flagFile = path.join(dst, 'CHECK-FIRST.txt');
  if (!c.heroWarn.length && fs.existsSync(flagFile)) tryRm(flagFile);
  if (c.heroWarn.length) {
    const where = c.heroSlides.length ? `slide ${c.heroSlides.join(', ')}` : 'a slide';
    fs.writeFileSync(flagFile,
      `CHECK-FIRST: post-${c.post} "${c.spec.title}"\n\n` +
      `${where} sets a big number that does not trace to a sourced figure in gtm.json.\n` +
      c.heroWarn.map((w) => `  - ${w}`).join('\n') + '\n\n' +
      'Two ways out (30 seconds, no copy is ever rewritten by the engine):\n' +
      `  CONFIRM  you can name the real source -> add it to gtm.json (angles[].stat), run npm run tap, the flag clears.\n` +
      `  SKIP     you cannot -> do not schedule this post. Leave it; it sorts after every clean post.\n` +
      '           A made-up or unsourced statistic is the one thing this account cannot ship.\n');
  }
  return { ...c, slot, folder, slides, caption, markCmd, waitingDays: daysWaiting(c.post) };
});

const oldestWait = entries.length ? Math.max(...entries.map((e) => e.waitingDays)) : 0;

// ---- SCHEDULE.txt: the plain-text version -----------------------------------
const lines = [
  'READY TO SCHEDULE',
  `generated ${new Date().toLocaleString()} — regenerated every time you run npm run tap`,
  '',
  entries.length ? `${entries.length} post(s), two a week, Tue 3:00 PM / Thu 12:30 PM ET. Oldest has waited ${oldestWait}d.` : 'Nothing ready. Run npm run tap, or see what it says is blocking.',
  entries.length ? 'Mark the whole page scheduled in one command:  node tools/log-post.mjs --scheduled-all' : '',
  '',
];
for (const e of entries) {
  lines.push(`${iso(e.slot)} ${DAY[e.slot.getDay()]}   post-${e.post}  ${e.spec.title}   [${e.spec.pillar}]${e.heroWarn.length ? '   ⚠ CHECK-FIRST' : ''}   (waiting ${e.waitingDays}d)`);
  lines.push(`    folder:  ${e.folder}/`);
  lines.push(`    after scheduling:  ${e.markCmd}`);
  lines.push('');
}
fs.writeFileSync(path.join(OUT, 'SCHEDULE.txt'), lines.join('\n'));

// ---- index.html: the visual version -----------------------------------------
const card = (e) => `
<article class="post${e.heroWarn.length ? ' warn' : ''}">
  <header>
    <div class="slot"><span class="day">${DAY[e.slot.getDay()]}</span><span class="date">${e.slot.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span class="time">${SLOT_TIME[e.slot.getDay()]}</span></div>
    <div class="meta">
      <h2>${esc(e.spec.title)}</h2>
      <p>post-${e.post} · ${esc(e.spec.pillar)}${e.spec.gtmAngle ? ' · ' + esc(e.spec.gtmAngle) : ''} · ${e.slides.length} slides</p>
    </div>
  </header>
  ${e.heroWarn.length ? `<div class="flag"><b>Check first.</b> ${esc(e.heroWarn[0])}</div>` : ''}
  <div class="strip">${e.slides.map((s, i) => `<figure><img src="${encodeURI(e.folder)}/${s}" alt="slide ${i + 1}" loading="lazy"><figcaption>${i + 1}</figcaption></figure>`).join('')}</div>
  <div class="cap">
    <textarea id="cap-${e.post}" readonly rows="6">${esc(e.caption)}</textarea>
    <div class="actions">
      <button type="button" data-copy="cap-${e.post}">Copy caption</button>
      <button type="button" data-copy="cmd-${e.post}" class="ghost">Copy "mark scheduled" command</button>
      <code id="cmd-${e.post}">${esc(e.markCmd)}</code>
    </div>
  </div>
</article>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>fond — Ready to Post</title>
<style>
:root{--bg:#F5F2EC;--fg:#14161A;--dim:#5A5F66;--rule:#DCD6C9;--card:#fff;--accent:#2E5E4E;--warn:#D64541;--blue:#4A7BA6}
@media (prefers-color-scheme:dark){:root{--bg:#14161A;--fg:#F5F2EC;--dim:#A8AEB6;--rule:#2E333B;--card:#1C1F25;--accent:#57A186;--warn:#E4645F;--blue:#6FA3CE}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.wrap{max-width:1100px;margin:0 auto;padding:36px 20px 80px}
h1{font:700 34px/1.1 Georgia,serif;margin:0 0 8px}
.lede{color:var(--dim);max-width:70ch;margin:0 0 22px}
.how{background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:16px 20px;margin:0 0 30px}
.how h3{margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
.how ol{margin:0;padding-left:20px}.how li{margin:4px 0}
.post{background:var(--card);border:1px solid var(--rule);border-radius:4px;padding:18px 20px;margin:0 0 22px}
.post.warn{border-left:3px solid var(--warn)}
header{display:flex;gap:18px;align-items:center;margin-bottom:12px}
.slot{display:flex;flex-direction:column;align-items:center;min-width:64px;padding:8px;border:1px solid var(--rule);border-radius:4px}
.day{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
.date{font:700 20px/1.1 Georgia,serif}.time{font-size:11px;color:var(--dim)}
.meta h2{margin:0;font:700 21px/1.2 Georgia,serif}.meta p{margin:2px 0 0;color:var(--dim);font-size:13px}
.flag{background:color-mix(in srgb,var(--warn) 12%,transparent);color:var(--fg);padding:8px 12px;border-radius:3px;font-size:13px;margin:0 0 12px}
.strip{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}
figure{margin:0;flex:0 0 150px}figure img{width:150px;aspect-ratio:4/5;object-fit:cover;border-radius:2px;display:block;border:1px solid var(--rule)}
figcaption{font-size:11px;color:var(--dim);text-align:center;margin-top:2px}
.cap{margin-top:12px;display:grid;gap:8px}
textarea{width:100%;font:13px/1.5 ui-monospace,Menlo,monospace;background:var(--bg);color:var(--fg);border:1px solid var(--rule);border-radius:3px;padding:10px;resize:vertical}
.actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
button{font:600 13px/1 -apple-system,sans-serif;padding:9px 14px;border-radius:3px;border:1px solid var(--accent);background:var(--accent);color:#fff;cursor:pointer}
button.ghost{background:transparent;color:var(--accent)}button:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
code{font:12px ui-monospace,Menlo,monospace;color:var(--dim);overflow-wrap:anywhere}
.empty{padding:40px;text-align:center;color:var(--dim)}
</style></head><body><div class="wrap">
<h1>Ready to post</h1>
<p class="lede">${entries.length} carousel${entries.length === 1 ? '' : 's'} that pass all six gates and carry real brief copy, slotted two a week. Regenerated every time <code>npm run tap</code> runs — anything you mark scheduled disappears from here.</p>
${entries.length ? `<p class="lede"${oldestWait >= 10 ? ' style="color:var(--warn);font-weight:600"' : ''}>Oldest post has been waiting <b>${oldestWait} day${oldestWait === 1 ? '' : 's'}</b>. This number does not reset when the page regenerates.</p>` : ''}
<section class="how"><h3>Schedule the lot in one sitting</h3><ol>
<li>Open <b>business.facebook.com</b> on this Mac → Create post → Instagram → Schedule. (Or the Instagram app: new post → Advanced settings → Schedule — up to 75 days ahead.)</li>
<li>Drag in the slides from that post's folder in <code>READY-TO-POST/</code>, <b>in order</b>. Order is the carousel.</li>
<li>Copy caption below, paste. Set the date shown on the left.</li>
<li>After scheduling everything on the page, run <b>one</b> command from <code>~/Desktop/contengine</code> instead of one per post: <code>node tools/log-post.mjs --scheduled-all</code> — it marks every post above scheduled on the date shown here. (Skipped one? Use its own "mark scheduled" command instead.)</li>
</ol></section>
${entries.length ? entries.map(card).join('\n') : '<p class="empty">Nothing ready right now. Run <code>npm run tap</code>; its last lines say what is blocking.</p>'}
</div>
<script>
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button[data-copy]'); if (!b) return;
  const el = document.getElementById(b.dataset.copy); const text = el.value ?? el.textContent;
  try { await navigator.clipboard.writeText(text); }
  catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  const old = b.textContent; b.textContent = 'Copied'; setTimeout(() => (b.textContent = old), 1400);
});
</script></body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);

console.log(`READY-TO-POST/  ${entries.length} post(s)`);
for (const e of entries) console.log(`  ${iso(e.slot)} ${DAY[e.slot.getDay()]}  post-${e.post}  ${e.spec.title}${e.heroWarn.length ? '   ⚠ CHECK-FIRST' : ''}`);
