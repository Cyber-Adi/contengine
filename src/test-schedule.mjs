// test-schedule.mjs -- fixtures for src/schedule.mjs and log-post --scheduled-all.
// Pure data in, nothing touches the real state/ (the CLI case runs on a temp copy).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './tokens.mjs';
import { orderPosts, assignSlots, markScheduled, isNow, loadSchedule, saveSchedule, addDays, DUP_GAP_SLOTS } from './schedule.mjs';

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok    ${name}`); pass++; }
  catch (e) { console.log(`  FAIL  ${name}\n          ${e.message}`); fail++; }
};
const assert = (c, m) => { if (!c) throw new Error(m); };

const PILLARS = ['A', 'B', 'C', 'D'];
const cands = Array.from({ length: 40 }, (_, i) => ({ post: i + 1, pillar: PILLARS[(i * 7 + (i >> 2)) % 4], risky: false }));
const queue = {
  exclude: [],
  priority: [9, 33, 20, 31, 15, 5, 12],
  nearDuplicates: [[4, 18], [10, 24], [3, 23], [9, 34], [5, 8], [8, 32], [20, 21]],
};
const posts = (list) => list.map((c) => c.post);
const idx = (order, n) => order.indexOf(n);

console.log('schedule');
t('deterministic: same input, same order', () => {
  const a = posts(orderPosts(cands, queue));
  const b = posts(orderPosts([...cands], JSON.parse(JSON.stringify(queue))));
  assert(JSON.stringify(a) === JSON.stringify(b), 'orders differ');
  assert(a.length === cands.length, 'lost posts');
});
t('first two slots are the top save-magnets', () => {
  const o = posts(orderPosts(cands, queue));
  assert(o[0] === 9 && o[1] === 33, `got ${o.slice(0, 2)}`);
});
t('risky magnets yield to clean ones for the lead slots', () => {
  const c = cands.map((x) => (x.post === 9 ? { ...x, risky: true } : x));
  const o = posts(orderPosts(c, queue));
  assert(o[0] === queue.priority[1] && o[1] === queue.priority[2], `got ${o.slice(0, 2)}`);
});
t('no near-duplicate pair within 12 slots', () => {
  const o = posts(orderPosts(cands, queue));
  for (const [a, b] of queue.nearDuplicates) {
    assert(Math.abs(idx(o, a) - idx(o, b)) >= DUP_GAP_SLOTS, `pair ${a}/${b} at ${idx(o, a)}/${idx(o, b)}`);
  }
});
t('excluded posts never appear', () => {
  const q = { ...queue, exclude: [4, 9, 20] };
  const o = posts(orderPosts(cands, q));
  assert(![4, 9, 20].some((n) => o.includes(n)), 'excluded post present');
  const sched = assignSlots({ posts: {} }, cands, q, '2026-10-07');
  assert(!sched.posts[4] && !sched.posts[9], 'excluded post got a slot');
});
t('pillars alternate where possible', () => {
  const o = orderPosts(cands, queue);
  const repeats = o.filter((c, i) => i && o[i - 1].pillar === c.pillar).length;
  assert(repeats <= 3, `${repeats} back-to-back pillar repeats`);
});
t('magnets appear roughly every third slot early on', () => {
  const o = posts(orderPosts(cands, queue));
  const mag = (n) => queue.priority.includes(n);
  assert(mag(o[0]) && mag(o[1]) && mag(o[4]) && mag(o[7]), `got ${o.slice(0, 8)}`);
});
t('dates persist across runs with a changed today', () => {
  const s1 = assignSlots({ posts: {} }, cands, queue, '2026-10-07');
  const s2 = assignSlots(s1, cands, queue, '2026-10-14');
  for (const [k, e] of Object.entries(s1.posts)) {
    if (e.date >= '2026-10-14') assert(s2.posts[k].date === e.date, `post ${k} moved ${e.date} -> ${s2.posts[k].date}`);
  }
  const s3 = assignSlots(s1, cands, queue, '2026-10-07');
  assert(JSON.stringify(s3) === JSON.stringify(s1), 'same-day rerun changed the schedule');
});
t('new posts append after the last date; past planned dates re-slot with a note', () => {
  const s1 = assignSlots({ posts: {} }, cands.slice(0, 10), queue, '2026-10-07');
  const last = Object.values(s1.posts).map((e) => e.date).sort().pop();
  const s2 = assignSlots(s1, cands.slice(0, 12), queue, '2026-10-07');
  assert(s2.posts[11].date > last && s2.posts[12].date > last, 'new posts not after last date');
  const first = Object.entries(s1.posts).sort((a, b) => a[1].date.localeCompare(b[1].date))[0];
  const s3 = assignSlots(s1, cands.slice(0, 10), queue, addDays(first[1].date, 1));
  assert(s3.posts[first[0]].date > first[1].date && /re-slotted/.test(s3.posts[first[0]].note), 'past planned date not re-slotted');
});
t('scheduled entries are never touched', () => {
  const s1 = assignSlots({ posts: {} }, cands.slice(0, 6), queue, '2026-10-07');
  const marked = markScheduled(s1, '2026-10-07').schedule;
  const s2 = assignSlots(marked, cands.slice(0, 6), queue, '2027-03-01');
  assert(JSON.stringify(s2.posts) === JSON.stringify(marked.posts), 'scheduled entries changed');
});
t('--scheduled-all marks only the NOW window (library)', () => {
  const s1 = assignSlots({ posts: {} }, cands, queue, '2026-10-07');
  const { schedule, marked } = markScheduled(s1, '2026-10-07');
  assert(marked.length > 0 && marked.length < cands.length, `marked ${marked.length}`);
  for (const m of marked) assert(isNow(m.date, '2026-10-07'), `${m.post} ${m.date} outside window`);
  for (const [k, e] of Object.entries(schedule.posts)) {
    assert((e.status === 'scheduled') === isNow(e.date, '2026-10-07'), `post ${k} status ${e.status}`);
  }
});
t('--scheduled-all CLI on a temp copy touches only NOW, real state untouched', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sched-'));
  const file = path.join(dir, 'schedule.json');
  saveSchedule(file, assignSlots({ posts: {} }, cands, queue, '2026-10-07'));
  const realFile = path.join(ROOT, 'state', 'schedule.json');
  const before = fs.existsSync(realFile) ? fs.readFileSync(realFile, 'utf8') : null;
  const out = execFileSync(process.execPath, [path.join(ROOT, 'tools', 'log-post.mjs'), '--scheduled-all', '--dry-run', '--schedule-file', file, '--today', '2026-10-07'], { encoding: 'utf8' });
  const n = Number(out.match(/marking (\d+) post/)[1]);
  const expect = Object.values(loadSchedule(file).posts).filter((e) => isNow(e.date, '2026-10-07')).length;
  assert(n === expect && n < cands.length, `CLI marked ${n}, expected ${expect}`);
  const after = fs.existsSync(realFile) ? fs.readFileSync(realFile, 'utf8') : null;
  assert(before === after, 'real state/schedule.json changed');
  const named = execFileSync(process.execPath, [path.join(ROOT, 'tools', 'log-post.mjs'), '--scheduled', '9,15', '--dry-run', '--schedule-file', file, '--today', '2026-10-07'], { encoding: 'utf8' });
  assert(/marking 2 post/.test(named), `named run: ${named}`);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
