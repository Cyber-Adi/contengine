// test-learn.mjs: fixtures only, never the real state files.
import { learnedWeights, rankAdjust, MIN_SCORED, SHRINK_K } from './learn.mjs';
import { buildReport } from '../tools/report.mjs';

let pass = 0, fail = 0;
const test = (name, fn) => { try { fn(); console.log(`  ok   ${name}`); pass++; } catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const gtm = { organicMetrics: { sendWeight: 4, killCriterion: { consecutiveMisses: 3 } } };
const specs = {};
const perf = { posts: {} };
const add = (n, { pillar, format, angle, reach = 1000, saves, sends = 0, at }) => {
  specs[n] = { postNumber: n, pillar, format, gtmAngle: angle };
  perf.posts[n] = { post: n, reach, saves, sends, publishedAt: at || `2026-10-${String(n).padStart(2, '0')}` };
};
const specFor = (n) => specs[n] || null;
const fresh = () => { for (const k of Object.keys(specs)) delete specs[k]; for (const k of Object.keys(perf.posts)) delete perf.posts[k]; };

test('neutral below MIN_SCORED', () => {
  fresh();
  add(1, { pillar: 'P', format: 'f', angle: 'a', saves: 90 });
  add(2, { pillar: 'Q', format: 'g', angle: 'b', saves: 10 });
  const w = learnedWeights(perf, specFor, gtm);
  assert(w.scored === 2 && MIN_SCORED === 3, 'scored count');
  assert(w.byPillar.P.lift === 1 && w.byPillar.Q.lift === 1, 'lifts neutral');
  assert(rankAdjust({ pillar: 'P', format: 'f', gtmAngle: 'a' }, w) === 1, 'rankAdjust neutral');
});

test('empty and null performance are neutral', () => {
  const w = learnedWeights({ posts: {} }, specFor, gtm);
  assert(w.scored === 0 && Object.keys(w.byPillar).length === 0, 'empty');
  assert(rankAdjust({ pillar: 'P' }, w) === 1, 'neutral');
  assert(learnedWeights(null, specFor, gtm).scored === 0, 'null safe');
});

test('unscored posts are ignored', () => {
  fresh();
  add(1, { pillar: 'P', format: 'f', angle: 'a', saves: 50 });
  add(2, { pillar: 'P', format: 'f', angle: 'a', saves: 50 });
  add(3, { pillar: 'P', format: 'f', angle: 'a', saves: 50 });
  add(4, { pillar: 'Z', format: 'z', angle: 'z', reach: 0, saves: 99 });
  perf.posts[5] = { post: 5, reach: 1000 };
  const w = learnedWeights(perf, specFor, gtm);
  assert(w.scored === 3 && !w.byPillar.Z, 'unscored dropped');
});

test('shrinkage keeps a 1-post segment near 1', () => {
  fresh();
  [1, 2, 3, 4].forEach((n) => add(n, { pillar: 'P', format: 'f', angle: 'a', saves: 20 }));
  add(5, { pillar: 'Solo', format: 'f', angle: 'a', saves: 200 });
  const w = learnedWeights(perf, specFor, gtm);
  const raw = 10;
  assert(w.byPillar.Solo.n === 1, 'n');
  assert(w.byPillar.Solo.lift > 1 && w.byPillar.Solo.lift < 1 + (raw - 1) * (1 / (1 + SHRINK_K)) + 1e-9, `lift ${w.byPillar.Solo.lift}`);
});

test('clearly better pillar gets lift > 1 and rankAdjust > 1; worse < 1', () => {
  fresh();
  let n = 0;
  for (let i = 0; i < 6; i++) add(++n, { pillar: 'Good', format: 'f', angle: 'a', saves: 60 + i });
  for (let i = 0; i < 6; i++) add(++n, { pillar: 'Bad', format: 'f', angle: 'a', saves: 10 + i });
  const w = learnedWeights(perf, specFor, gtm);
  assert(w.byPillar.Good.lift > 1 && w.byPillar.Bad.lift < 1, 'lifts');
  const up = rankAdjust({ pillar: 'Good', format: 'f', gtmAngle: 'a' }, w);
  const down = rankAdjust({ pillar: 'Bad', format: 'f', gtmAngle: 'a' }, w);
  assert(up > 1 && down < 1, `adjust ${up} ${down}`);
  assert(up <= 1.25 && down >= 0.8, 'bounded');
  assert(rankAdjust({ pillar: 'Never seen' }, w) === 1, 'unknown segment neutral');
});

test('rankAdjust stays within [0.8, 1.25] under extreme data', () => {
  fresh();
  for (let i = 1; i <= 20; i++) add(i, { pillar: 'Hi', format: 'f', angle: 'a', saves: 900 });
  for (let i = 21; i <= 22; i++) add(i, { pillar: 'Lo', format: 'g', angle: 'b', saves: 0 });
  const w = learnedWeights(perf, specFor, gtm);
  const u = rankAdjust({ pillar: 'Hi', format: 'f', gtmAngle: 'a' }, w);
  const d = rankAdjust({ pillar: 'Lo', format: 'g', gtmAngle: 'b' }, w);
  assert(u <= 1.25 && d >= 0.8, `${u} ${d}`);
});

test('deterministic', () => {
  fresh();
  for (let i = 1; i <= 8; i++) add(i, { pillar: i % 2 ? 'A' : 'B', format: 'f', angle: 'a', saves: 10 * i });
  const a = JSON.stringify(learnedWeights(perf, specFor, gtm));
  const b = JSON.stringify(learnedWeights(JSON.parse(JSON.stringify(perf)), specFor, gtm));
  assert(a === b, 'same output');
  const r1 = buildReport(perf, specFor, gtm, '2026-10');
  assert(r1 === buildReport(perf, specFor, gtm, '2026-10'), 'report deterministic');
});

test('report with no data says so', () => {
  const r = buildReport({ posts: {} }, specFor, gtm, '2026-10');
  assert(/no data yet/i.test(r), 'says no data yet');
  assert(r.split('\n').length < 20, 'short');
  assert(!/—/.test(r), 'no em dash');
});

test('report lists top/bottom, lifts, near-kill formats, 3 recommendations', () => {
  fresh();
  let n = 0;
  for (let i = 0; i < 4; i++) add(++n, { pillar: 'Good', format: 'win', angle: 'a', saves: 80 + i });
  for (let i = 0; i < 2; i++) add(++n, { pillar: 'Bad', format: 'lose', angle: 'b', saves: 5 + i });
  const r = buildReport(perf, specFor, gtm, '2026-10');
  assert(/Posts measured: 6/.test(r), 'count');
  assert(/Top 3/.test(r) && /Bottom 3/.test(r), 'top/bottom');
  assert(/Good/.test(r) && /n=4/.test(r), 'segment lifts with n');
  assert(/near the kill line/i.test(r) && /lose/.test(r), 'near kill');
  assert((r.match(/^\d\. /gm) || []).length === 3, 'three recommendations');
});

test('report below minimum says not enough data', () => {
  fresh();
  add(1, { pillar: 'P', format: 'f', angle: 'a', saves: 50 });
  const r = buildReport(perf, specFor, gtm, '2026-10');
  assert(/not enough data/i.test(r), 'honest');
});

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
