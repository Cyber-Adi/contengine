// report.mjs: monthly "what's working" report. Deterministic text, no model calls.
// Writes out/reports/YYYY-MM.md from state/performance.json + specs/.
// Usage: node tools/report.mjs [YYYY-MM]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../src/tokens.mjs';
import { gtm as realGtm } from '../src/gtm.mjs';
import { loadPerformance } from '../src/state.mjs';
import { learnedWeights, scoredRows, MIN_SCORED } from '../src/learn.mjs';

const med = (xs) => {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const f4 = (x) => x.toFixed(4);
const row = (p) => `- post-${p.post}: score ${f4(p.score)} (saves/reach ${f4(p.savesPerReach)}, sends/reach ${f4(p.sendsPerReach)}), pillar ${p.pillar}, format ${p.format}, angle ${p.angle}`;

function segmentTable(title, seg) {
  const names = Object.keys(seg).sort((a, b) => seg[b].lift - seg[a].lift || a.localeCompare(b));
  if (!names.length) return [];
  return [`### ${title}`, ...names.map((k) => `- ${k}: lift ${seg[k].lift.toFixed(2)} (n=${seg[k].n}, mean score ${f4(seg[k].meanScore)})`), ''];
}

/** Formats whose latest run of misses is one short of the kill line (or past it). */
function nearKill(rows, need) {
  const out = [];
  const formats = [...new Set(rows.map((r) => r.format))].sort();
  for (const f of formats) {
    const others = rows.filter((r) => r.format !== f).map((r) => r.score);
    const baseline = others.length ? med(others) : med(rows.map((r) => r.score));
    const mine = rows.filter((r) => r.format === f)
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.post - b.post);
    let streak = 0;
    for (let i = mine.length - 1; i >= 0 && mine[i].score < baseline; i--) streak++;
    if (streak >= need - 1) out.push({ format: f, streak, retired: streak >= need });
  }
  return out;
}

export function buildReport(performance, specFor, gtm, month) {
  const rows = scoredRows(performance, specFor, gtm);
  const all = Object.keys((performance && performance.posts) || {}).length;
  const lines = [`# What is working: ${month}`, ''];
  if (!rows.length) {
    lines.push('No data yet. Zero posts have reach and saves logged, so nothing can be claimed about what works.',
      '', `Log numbers about a week after each post goes live: node tools/log-post.mjs <N> --reach --saves --sends. ${MIN_SCORED} measured posts is the minimum before any recommendation.`, '');
    return lines.join('\n');
  }
  const w = learnedWeights(performance, specFor, gtm);
  const need = gtm.organicMetrics.killCriterion.consecutiveMisses;
  const ranked = rows.slice().sort((a, b) => b.score - a.score || a.post - b.post);
  const enough = rows.length >= MIN_SCORED;
  lines.push(`Posts measured: ${rows.length} (${all - rows.length} logged without enough data to score). Account median score: ${enough ? f4(w.median) : 'n/a'}.`, '');
  if (!enough) lines.push(`Not enough data: ${MIN_SCORED} measured posts are needed before lifts or rankings mean anything. Lifts below are neutral by design.`, '');
  lines.push('## Top 3', ...ranked.slice(0, 3).map(row), '', '## Bottom 3', ...ranked.slice(-3).reverse().map(row), '');
  lines.push('## Segment lifts', 'Lift is segment mean over account median, shrunk toward 1 so small samples cannot swing it.', '');
  lines.push(...segmentTable('Pillar', w.byPillar), ...segmentTable('Format', w.byFormat), ...segmentTable('Angle', w.byAngle));
  const nk = enough ? nearKill(rows, need) : [];
  lines.push('## Formats near the kill line', `Kill rule: ${need} consecutive scored posts under the rest-of-account median.`);
  lines.push(...(nk.length ? nk.map((k) => `- ${k.format}: ${k.streak} miss(es) in a row${k.retired ? ', AT the kill line: redesign or retire' : ', one more miss retires it'}`) : ['- none']), '');

  const best = (seg) => Object.entries(seg).filter(([, s]) => s.n >= 2).sort((a, b) => b[1].lift - a[1].lift || a[0].localeCompare(b[0]))[0];
  const worst = (seg) => Object.entries(seg).filter(([, s]) => s.n >= 2).sort((a, b) => a[1].lift - b[1].lift || a[0].localeCompare(b[0]))[0];
  const recs = [];
  const bp = best(w.byPillar);
  recs.push(enough && bp && bp[1].lift > 1 ? `Schedule more of pillar "${bp[0]}" when ordering the unscheduled queue (lift ${bp[1].lift.toFixed(2)}, n=${bp[1].n}).` : 'Not enough data to favour any pillar yet; keep the current queue order.');
  const ba = best(w.byAngle);
  recs.push(enough && ba && ba[1].lift > 1 ? `Lean on angle "${ba[0]}" for the next concept (lift ${ba[1].lift.toFixed(2)}, n=${ba[1].n}).` : 'Not enough data to favour any angle yet; keep rotating angles.');
  const wf = worst(w.byFormat);
  recs.push(nk.length ? `Review format "${nk[0].format}" before posting another: it is ${nk[0].retired ? 'at' : 'one miss from'} the kill line.`
    : enough && wf && wf[1].lift < 1 ? `Watch format "${wf[0]}" (lift ${wf[1].lift.toFixed(2)}, n=${wf[1].n}); no action until it nears the kill line.`
      : 'Not enough data to judge any format; no format is near the kill line.');
  lines.push('## Recommendations', ...recs.map((r, i) => `${i + 1}. ${r}`), '');
  return lines.join('\n');
}

const readSpec = (n) => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'specs', `post-${n}.json`), 'utf8')); } catch { return null; }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const month = process.argv[2] || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) { console.error('month must be YYYY-MM'); process.exit(2); }
  const text = buildReport(loadPerformance(), readSpec, realGtm, month);
  const dir = path.join(ROOT, 'out', 'reports');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${month}.md`);
  fs.writeFileSync(file, text);
  console.log(`wrote ${path.relative(ROOT, file)}`);
}
