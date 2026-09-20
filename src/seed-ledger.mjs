// seed-ledger.mjs — one-time seed of the ledger from specs/COVERAGE.md.
// COVERAGE.md is the Slice 1 output and the only audited statement of which
// posts have retrievable copy. Reconcile() can only see the filesystem, so
// without this the census would report 2 posts and the loop would conclude the
// queue was empty. Re-run safely: never downgrades a post that has progressed.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './tokens.mjs';
import { loadLedger, saveLedger, reconcile, census, stageIndex } from './state.mjs';

// From specs/COVERAGE.md, 2026-09-12: 59 renderable of 69, 10 gaps.
const RENDERABLE = [[1,16],[18,53],[56,62]];   // 17 excluded; 54,55 gap; 63-69 gap
const GAPS = [17, 54, 55, 63, 64, 65, 66, 67, 68, 69];

const expand = (ranges) => ranges.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => a + i));

const cov = path.join(ROOT, 'specs', 'COVERAGE.md');
if (!fs.existsSync(cov)) { console.error('specs/COVERAGE.md missing - run Slice 1 first.'); process.exit(1); }

const ledger = reconcile(loadLedger());
const posts = { ...ledger.posts };
const set = (n, stage) => {
  const k = String(n);
  const cur = posts[k] || { post: n, stage: 'gap' };
  if (stageIndex(stage) > stageIndex(cur.stage)) cur.stage = stage;
  posts[k] = cur;
};

for (const n of expand(RENDERABLE)) if (!GAPS.includes(n)) set(n, 'scripted');
for (const n of GAPS) set(n, 'gap');

saveLedger({ ...ledger, posts, seededFrom: 'specs/COVERAGE.md' });
console.log(JSON.stringify(census({ posts }), null, 1));
