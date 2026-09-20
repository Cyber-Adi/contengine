// state.mjs — THE UNIFIED DATA LAYER.
//
// Why this file exists: the old pipeline was linear. Research wrote to Notion,
// scripting wrote to Notion, and nothing ever read back. A step cannot make a
// decision from a document it does not read, which is why every weekly run
// correctly identified rendering as the bottleneck and then produced more
// scripts anyway. 374 rows created, ~3 shipped.
//
// A loop needs one place where every stage's status is legible to every other
// stage. That is this ledger. It is deliberately a flat JSON file, not a
// warehouse: Notion remains the system of record for CONTENT, and this holds
// only the STATE MACHINE. The whole thing loads in one read so the decision
// loop can run in a single shot, offline, in milliseconds.
//
// Free-architecture note: Airbyte + ClickHouse is the right answer at a scale
// this account is nowhere near. 69 posts is a JSON file. Revisit at ~5k rows.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './tokens.mjs';

/** Post numbers at or above this are test fixtures, not real posts. tools/test_gates.py
 *  writes post-9000/9002; without this they land in the ledger and inflate the census the
 *  decision loop reads, which would make the loop act on imaginary work. */
export const FIXTURE_POST_FLOOR = 9000;
const isFixture = (n) => Number(n) >= FIXTURE_POST_FLOOR;

export const STATE_DIR = path.join(ROOT, 'state');
const LEDGER = path.join(STATE_DIR, 'ledger.json');
const PERF = path.join(STATE_DIR, 'performance.json');
const FRESH = path.join(STATE_DIR, 'freshness.json');
const DECISIONS = path.join(STATE_DIR, 'decisions.jsonl');

/** The post lifecycle, in order. A post's stage is the furthest one it has reached. */
export const STAGES = [
  'gap',         // no retrievable copy. Blocked on Adi, never on the engine.
  'scripted',    // verbatim copy exists in Notion or briefs/
  'spec',        // parsed into specs/post-N.json, schema-valid
  'rendered',    // PNGs exist
  'approved',    // all five gates PASS
  'published',   // live on a platform
  'measured'     // insights ingested; feeds the next decision
];
export const stageIndex = (s) => STAGES.indexOf(s);

const readJson = (p, fallback) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
};
const writeJson = (p, v) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
};

export const loadLedger = () => readJson(LEDGER, { updatedAt: null, posts: {} });
export const saveLedger = (l) => writeJson(LEDGER, { ...l, updatedAt: new Date().toISOString() });
export const loadPerformance = () => readJson(PERF, { updatedAt: null, source: null, posts: {} });
export const savePerformance = (p) => writeJson(PERF, { ...p, updatedAt: new Date().toISOString() });
export const loadFreshness = () => readJson(FRESH, { updatedAt: null, items: [] });
export const saveFreshness = (f) => writeJson(FRESH, { ...f, updatedAt: new Date().toISOString() });

/** Append-only decision log. The audit trail for anything the loop did unattended. */
export function logDecision(entry) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.appendFileSync(DECISIONS, JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n');
}

/**
 * Reconcile the ledger against what is actually on disk. Filesystem truth beats
 * remembered truth: a post is 'rendered' because slides exist, not because
 * something once claimed it rendered. Never downgrades 'published'/'measured',
 * which live outside this repo and cannot be observed here.
 */
export function reconcile(ledger = loadLedger()) {
  // Prune on load as well as on scan: a ledger written before the fixture floor
  // existed still carries those rows, and rm is not always available to clear it.
  const posts = Object.fromEntries(
    Object.entries(ledger.posts || {}).filter(([k]) => !isFixture(k)));
  const specDir = path.join(ROOT, 'specs');
  const outDir = path.join(ROOT, 'out');

  const bump = (n, stage, patch = {}) => {
    const key = String(n);
    const cur = posts[key] || { post: Number(n), stage: 'gap' };
    if (stageIndex(stage) > stageIndex(cur.stage)) cur.stage = stage;
    posts[key] = { ...cur, ...patch, stage: cur.stage };
  };

  for (const f of fs.existsSync(specDir) ? fs.readdirSync(specDir) : []) {
    const m = f.match(/^post-(\d+)\.json$/);
    if (!m || isFixture(m[1])) continue;
    let spec = {};
    try { spec = JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8')); } catch { /* malformed */ }
    bump(m[1], 'spec', { title: spec.title, pillar: spec.pillar, provenance: spec.provenance });
  }

  for (const d of fs.existsSync(outDir) ? fs.readdirSync(outDir) : []) {
    const m = d.match(/^post-(\d+)$/);
    if (!m || isFixture(m[1])) continue;
    const slides = path.join(outDir, d, 'slides');
    if (fs.existsSync(slides) && fs.readdirSync(slides).some((x) => x.endsWith('.png'))) {
      bump(m[1], 'rendered');
    }
    const qa = readJson(path.join(outDir, d, 'qa-report.json'), null);
    if (qa && String(qa.verdict).toUpperCase() === 'PASS') {
      bump(m[1], 'approved', { qaVerdict: 'PASS' });
    } else if (qa) {
      posts[String(m[1])] = { ...posts[String(m[1])], qaVerdict: qa.verdict };
    }
  }

  // published/measured cannot be observed on disk, so they are set by
  // tools/log-post.mjs. But they must still be BACKED by performance.json --
  // otherwise a stale ledger entry claims a post is measured while the data that
  // would prove it is gone, and the census reports momentum that does not exist.
  // Filesystem truth beats remembered truth here exactly as it does above.
  const perf = readJson(path.join(STATE_DIR, 'performance.json'), { posts: {} });
  for (const [k, p] of Object.entries(posts)) {
    const row = (perf.posts || {})[k];
    if (p.stage === 'measured' && !(row && row.reach > 0)) p.stage = row?.publishedAt ? 'published' : 'approved';
    if (p.stage === 'published' && !row?.publishedAt) p.stage = 'approved';
  }

  return { ...ledger, posts };
}

/** Counts by stage. The decision loop reads nothing else to choose an action. */
export function census(ledger = reconcile()) {
  const out = Object.fromEntries(STAGES.map((s) => [s, 0]));
  for (const p of Object.values(ledger.posts)) out[p.stage] = (out[p.stage] || 0) + 1;
  return out;
}

/** Posts sitting at exactly `stage`, lowest post number first. */
export function atStage(stage, ledger = reconcile()) {
  return Object.values(ledger.posts)
    .filter((p) => p.stage === stage)
    .sort((a, b) => a.post - b.post);
}
