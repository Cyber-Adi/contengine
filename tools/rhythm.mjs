#!/usr/bin/env node
// rhythm.mjs - deterministic rhythm repair for one spec (S2a).
//
//   node tools/rhythm.mjs specs/post-N.json            dry run: print the plan
//   node tools/rhythm.mjs specs/post-N.json --write    apply it to the spec
//   node tools/rhythm.mjs specs/post-N.json --json     machine-readable plan
//
// Only DESIGN fields move (background, layout among lossless alternatives, valign).
// Copy is never read for rewriting and never written. Every change is appended to
// spec.refinement.changes as {slide, field, from, to, why}. The solver lives in
// src/rhythm-core.mjs so the renderer and this tool cannot disagree.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { planRhythm, checkRhythm } from '../src/rhythm-core.mjs';

/**
 * Pure: spec in, { spec, changes, unresolved } out. Never mutates `spec`.
 * `spec` in the result is the repaired copy with refinement.changes extended.
 */
export function repairRhythm(spec) {
  const plan = planRhythm(spec);
  const byIndex = Object.fromEntries(plan.slides.map((s) => [s.index, s]));
  const slides = spec.slides.map((s) => {
    const p = byIndex[s.index];
    const next = { ...s };
    if (p.layout !== (s.layout || 'hero-statement')) next.layout = p.layout;
    if (p.background !== (s.background || 'light')) next.background = p.background;
    if (p.valign !== (s.valign || 'center')) next.valign = p.valign;
    return next;
  });
  const prior = spec.refinement || { round: 0, changes: [] };
  const refinement = plan.changes.length
    ? { ...prior, changes: [...prior.changes, ...plan.changes] }
    : spec.refinement;
  const out = { ...spec, slides };
  if (refinement) out.refinement = refinement;
  return { spec: out, changes: plan.changes, unresolved: plan.unresolved, before: checkRhythm(spec.slides.map((s) => ({ ...s, valign: s.valign || 'center' }))) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node tools/rhythm.mjs specs/post-N.json [--write] [--json]'); process.exit(2); }
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const r = repairRhythm(spec);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ post: spec.postNumber, before: r.before, changes: r.changes, unresolved: r.unresolved }, null, 2));
  } else {
    console.log(`rhythm post ${spec.postNumber}: ${r.before.length} violation(s) as authored, ${r.changes.length} design change(s), ${r.unresolved.length} unresolved`);
    for (const v of r.before) console.log(`  authored  ${v.kind}: ${v.msg}`);
    for (const c of r.changes) console.log(`  change    slide ${c.slide} ${c.field}: ${c.from} -> ${c.to}`);
    for (const v of r.unresolved) console.log(`  UNRESOLVED ${v.kind}: ${v.msg}`);
  }
  if (process.argv.includes('--write')) {
    fs.writeFileSync(file, JSON.stringify(r.spec, null, 2) + '\n');
    console.log(`  wrote ${file}`);
  } else if (!process.argv.includes('--json')) {
    console.log('  (dry run; pass --write to apply)');
  }
}
