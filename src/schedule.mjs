// schedule.mjs -- pure, deterministic ordering and slot assignment for publishable posts.
//
// Inputs are plain data (candidates, queue.json, the persisted schedule), so the same
// input always yields the same order. Dates are YYYY-MM-DD strings handled in UTC, never
// the machine clock, so tests can pass any "today".
import fs from 'node:fs';
import path from 'node:path';

export const SLOT_TIME = { 2: '3:00 PM ET', 4: '12:30 PM ET' }; // Tue, Thu
export const NOW_WINDOW_DAYS = 28;
export const DUP_GAP_SLOTS = 12;                                // about 6 weeks at two a week
const DAY_MS = 864e5;

const toMs = (iso) => Date.parse(`${iso}T00:00:00Z`);
const fromMs = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (iso, n) => fromMs(toMs(iso) + n * DAY_MS);
export const weekday = (iso) => new Date(toMs(iso)).getUTCDay();

/** The next `count` Tue/Thu dates strictly after `afterIso`. */
export function nextSlots(afterIso, count) {
  const out = [];
  let d = afterIso;
  while (out.length < count) {
    d = addDays(d, 1);
    if (SLOT_TIME[weekday(d)]) out.push(d);
  }
  return out;
}

export const isNow = (date, today) => date >= today && date <= addDays(today, NOW_WINDOW_DAYS);

const isMagnetSlot = (absIndex) => absIndex < 2 || (absIndex - 1) % 3 === 0;

const pairKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/**
 * Order candidates for consecutive slots.
 * @param cands   [{ post, pillar, risky? }] in tie-break order (callers sort clean first, then by number)
 * @param queue   { exclude, priority, nearDuplicates }
 * @param placed  [{ post, pillar }] already-assigned posts that precede these slots, in slot order
 */
export function orderPosts(cands, queue = {}, placed = []) {
  const exclude = new Set(queue.exclude ?? []);
  const dups = new Set((queue.nearDuplicates ?? []).map(([a, b]) => pairKey(a, b)));
  const rank = new Map((queue.priority ?? []).map((p, i) => [p, i]));
  const placedSet = new Set(placed.map((p) => p.post));
  const pool = cands.filter((c) => !exclude.has(c.post) && !placedSet.has(c.post));
  const seq = [...placed];
  const added = [];

  const ok = (c) => !seq.slice(-(DUP_GAP_SLOTS - 1)).some((s) => dups.has(pairKey(s.post, c.post)));
  const pillarOk = (c) => !seq.length || seq[seq.length - 1].pillar !== c.pillar;

  while (pool.length) {
    const magnets = pool.filter((c) => rank.has(c.post))
      .sort((a, b) => (Number(!!a.risky) - Number(!!b.risky)) || (rank.get(a.post) - rank.get(b.post)));
    const rest = pool.filter((c) => !rank.has(c.post));
    const tiers = isMagnetSlot(seq.length)
      ? [magnets, rest]
      : [rest, magnets.filter((c) => !c.risky), magnets];
    let pick;
    for (const tier of tiers) pick = pick || tier.find((c) => ok(c) && pillarOk(c));
    for (const tier of tiers) pick = pick || tier.find(ok);
    pick = pick || pool[0]; // only duplicates remain: unavoidable, placed last
    pool.splice(pool.indexOf(pick), 1);
    seq.push(pick);
    added.push(pick);
  }
  return added;
}

// ---- persistence -------------------------------------------------------------
export function loadSchedule(file) {
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { posts: j.posts ?? {} };
  } catch { return { posts: {} }; }
}

export function saveSchedule(file, schedule) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = {
    $comment: 'Slot dates are assigned once and never recomputed. planned = ready to schedule, scheduled = in Meta Planner, published = went out. A planned date in the past is re-slotted forward with a note. Written by tools/ready.mjs and tools/log-post.mjs.',
    posts: schedule.posts,
  };
  fs.writeFileSync(file, JSON.stringify(body, null, 2) + '\n');
}

/**
 * Merge candidates into the persisted schedule. Pure: returns a new schedule.
 * Assigned dates are kept; planned dates before `today` are re-slotted; planned entries
 * for posts that left the queue are dropped; only unassigned posts receive new slots.
 */
export function assignSlots(schedule, cands, queue, today) {
  const exclude = new Set(queue.exclude ?? []);
  const byPost = new Map(cands.map((c) => [c.post, c]));
  const kept = {};
  const reslotted = new Map();
  for (const [k, e] of Object.entries(schedule.posts)) {
    const n = Number(k);
    if (e.status === 'planned') {
      if (exclude.has(n) || !byPost.has(n)) continue;
      if (e.date < today) { reslotted.set(n, e.date); continue; }
    }
    kept[k] = e;
  }
  const keptPosts = Object.entries(kept).sort((a, b) => a[1].date.localeCompare(b[1].date) || Number(a[0]) - Number(b[0]));
  const placed = keptPosts.map(([k]) => ({ post: Number(k), pillar: byPost.get(Number(k))?.pillar }));
  const ordered = orderPosts(cands.filter((c) => !kept[c.post]), queue, placed);
  const last = keptPosts.length ? keptPosts[keptPosts.length - 1][1].date : today;
  const slots = nextSlots(last < today ? today : last, ordered.length);
  const posts = { ...kept };
  ordered.forEach((c, i) => {
    const date = slots[i];
    posts[c.post] = {
      date, time: SLOT_TIME[weekday(date)], status: 'planned',
      ...(reslotted.has(c.post) ? { note: `re-slotted from ${reslotted.get(c.post)} (date passed unscheduled)` } : {}),
    };
  });
  return { posts };
}

/** Mark planned posts as scheduled. `only` limits to given post numbers; otherwise NOW window only. */
export function markScheduled(schedule, today, only) {
  const posts = { ...schedule.posts };
  const marked = [];
  for (const [k, e] of Object.entries(posts)) {
    if (e.status !== 'planned') continue;
    const want = only ? only.includes(Number(k)) : isNow(e.date, today);
    if (!want) continue;
    posts[k] = { ...e, status: 'scheduled' };
    marked.push({ post: Number(k), date: e.date });
  }
  marked.sort((a, b) => a.date.localeCompare(b.date) || a.post - b.post);
  return { schedule: { posts }, marked };
}
