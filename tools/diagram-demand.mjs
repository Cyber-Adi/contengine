#!/usr/bin/env node
// diagram-demand.mjs - S2g. Report only; changes nothing.
//
// Reads every "*Visual:*" line in briefs/*.md and classifies the visual it asks for
// against the engine's diagram kinds (src/diagrams.mjs DIAGRAM_KINDS) and against a
// small closed list of visuals the engine does NOT have. Keyword heuristics: counts are
// directional, not exact; object-illustration is the catch-all for flat object art. A missing kind with 3 or more
// requests is a build candidate; fewer is noise. Also lists which diagram kinds the
// specs actually use, so a supported-but-unused kind is visible too.
//
//   node tools/diagram-demand.mjs            human report
//   node tools/diagram-demand.mjs --json     machine-readable
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIAGRAM_KINDS } from '../src/diagrams.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THRESHOLD = 3;

// Closed classification table. First match wins, so order is most specific first.
const KINDS = [
  { id: 'before-after', have: true, re: /before\s*\/?\s*after|two-panel|before:.*after:/i },
  { id: 'bar-compare', have: true, re: /\bbar\b|progress bar|horizontal bars|comparison bars/i },
  { id: 'shelf-map', have: true, re: /three labeled zones|labeled zones|shelf zones|triage/i },
  { id: 'receipt', have: true, re: /receipt|itemi[sz]ed|line items/i },
  { id: 'flow-loop', have: true, re: /\bloop\b|cycle|circular|round and round/i },
  { id: 'icon-row', have: false, re: /(row|line|grid|set) of (\w+[ -]){0,3}(icons?|containers?|eggs?|bowls?)|\b(five|six|three|four|\d)[ -]\w*[ -]?icons?\b|icons? (in a row|beside|below|next to)/i },
  { id: 'timeline-strip', have: false, re: /horizontal (left-to-right )?timeline|timeline (bar|strip)|day 1.*day 7/i },
  { id: 'floorplan-or-topdown', have: false, re: /floor plan|top-down|blueprint|\\baisles?\\b|store (entrance|layout|map)|\\bvents?\\b|\\bduct/i },
  { id: 'multi-panel', have: false, re: /triptych|three small panels|panel 1|side by side|two hero numbers|\bpanels?\b/i },
  { id: 'big-number-stack', have: false, re: /vertical stack|stacked beneath|zoom-out|escalat/i },
  { id: 'object-illustration', have: false, re: /illustrat|\\bicons?\\b|\\bdrawn\\b|\\bdrawing\\b|\\bjars?\\b|\\bfridge\\b|\\bfreezer\\b|\\bbags?\\b|\\bpan\\b|stovetop|\\bcounter\\b/i },
  { id: 'type-only', have: true, re: /pure type|two clean lines|typographic|closing[- ]card|end-card|type[- ]only/i },
];

export function classify(text) {
  for (const k of KINDS) if (k.re.test(text)) return k.id;
  return 'unclassified';
}

export function auditBriefs(briefDir = path.join(ROOT, 'briefs')) {
  const files = fs.existsSync(briefDir) ? fs.readdirSync(briefDir).filter((f) => f.endsWith('.md')) : [];
  const rows = [];
  for (const f of files) {
    const lines = fs.readFileSync(path.join(briefDir, f), 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(/\*Visual:\*\s*(.+)$/i);
      if (m) rows.push({ file: f, line: i + 1, kind: classify(m[1]), text: m[1].slice(0, 90) });
    });
  }
  return rows;
}

export function auditSpecs(specDir = path.join(ROOT, 'specs')) {
  const used = {};
  for (const f of fs.readdirSync(specDir).filter((x) => /^post-\d+\.json$/.test(x))) {
    const spec = JSON.parse(fs.readFileSync(path.join(specDir, f), 'utf8'));
    for (const s of spec.slides || []) {
      if (s.layout === 'diagram' && s.diagram?.kind) used[s.diagram.kind] = (used[s.diagram.kind] || 0) + 1;
    }
  }
  return used;
}

export function summarise(rows) {
  const counts = {};
  for (const r of rows) counts[r.kind] = (counts[r.kind] || 0) + 1;
  const have = new Set([...DIAGRAM_KINDS, ...KINDS.filter((k) => k.have).map((k) => k.id)]);
  const missing = Object.entries(counts).filter(([k]) => !have.has(k) && k !== 'unclassified')
    .map(([kind, n]) => ({ kind, requests: n, buildCandidate: n >= THRESHOLD })).sort((a, b) => b.requests - a.requests);
  return { counts, missing };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rows = auditBriefs();
  const { counts, missing } = summarise(rows);
  const used = auditSpecs();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ visualRequests: rows.length, counts, missing, specDiagramKindsUsed: used, engineKinds: DIAGRAM_KINDS }, null, 2));
  } else {
    console.log(`diagram demand: ${rows.length} visual request(s) across briefs/`);
    console.log(`engine kinds: ${DIAGRAM_KINDS.join(', ')}`);
    console.log(`specs use:    ${Object.entries(used).map(([k, n]) => `${k} x${n}`).join(', ') || 'none'}`);
    console.log(`requested:    ${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ')}`);
    console.log(`\nvisuals the engine lacks (build candidate at >= ${THRESHOLD} requests):`);
    for (const m of missing) console.log(`  ${m.buildCandidate ? 'BUILD' : 'skip '}  ${m.kind}: ${m.requests}`);
    if (!missing.length) console.log('  none');
  }
}
