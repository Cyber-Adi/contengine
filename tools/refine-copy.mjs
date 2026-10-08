// refine-copy.mjs - Refinery copy step (S4). TEXT ONLY.
//
// Proposes variant B copy next to verbatim variant A. The model only ever returns a list
// of per-field changes; this tool applies them to A's copy, so anything the model does not
// mention is carried over byte for byte. Gate 7 (src/fidelity.mjs) then judges B in code.
// FAIL discards B and A continues. B is never exported: it is provenance "refined" with no
// picked flag, so the S0 publishable guard keeps it out of READY-TO-POST.
//
//   node tools/refine-copy.mjs --post 32 [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { ROOT } from '../src/tokens.mjs';
import { gtm } from '../src/gtm.mjs';
import { validateSpec } from '../src/validate.mjs';
import { fidelityCheck, buildVariantB, copyLeaves } from '../src/fidelity.mjs';
import { loadRefinery, saveRefinery, setPostStage } from '../src/refinery-state.mjs';

const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'refinery.config.json'), 'utf8'));
const REFINED_DIR = path.join(ROOT, 'specs', 'refined');
const RATE_LIMIT = /rate.?limit|usage limit|limit reached|too many requests|\b429\b|overloaded|quota|credit balance/i;
const LOCKED_FIELDS = new Set(['ctaLine', 'citation', 'sendTrigger', 'eyebrow', 'heroNumber', 'heroNumberUnit']);

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };

export function criticFindingsFor(n) {
  try {
    const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'state', 'critic.json'), 'utf8'));
    return all.posts?.[String(n)]?.findings || [];
  } catch { return []; }
}

export function buildPrompt(A, findings) {
  const slides = A.slides.map((s, i) => ({
    slide: i + 1,
    archetype: s.archetype,
    layout: s.layout,
    fields: Object.fromEntries(copyLeaves(s.copy || {}).map((l) => [l.path, l.value]))
  }));
  const stat = gtm.angles.find((a) => a.id === A.gtmAngle)?.stat;
  return [
    'You are the copy editor for fond, a pre-launch household food-waste app. Faceless, value-first Instagram account.',
    'Task: propose small improvements to this carousel copy. Output variant B as a list of field-level changes.',
    '',
    `Post ${A.postNumber}: "${A.title}". Pillar: ${A.pillar}. Angle: ${A.gtmAngle}. CTA tier: ${A.ctaTier}.`,
    `Voice rules: ${gtm.voice.rules.join('; ')}.`,
    `Honesty: pre-launch. Never write any of: ${gtm.honesty.bannedSubstrings.join(', ')}. No user counts, customers or traction. Say "founding member", never "customer".`,
    stat?.value ? `The only sourced figure for this angle: ${stat.value} (${stat.source}).` : 'This angle has no sourced figure.',
    findings.length
      ? `Critic findings to address where copy can help:\n${findings.map((f) => `- ${f.dimension}, slide ${f.slide}: ${f.element}`).join('\n')}`
      : 'No critic findings recorded for this post.',
    '',
    'HARD RULES (a code gate checks each; a violation discards your whole answer):',
    '1. Same argument, same thread, same slide count. Do not add, remove, reorder or merge slides.',
    '2. Zero new numbers, proper nouns, brands, places, sources or claims. Use only figures and names already in the copy below.',
    '3. Hook (slide 1, slide 2 headline): at most 8 words per line. Body: at most 40 words per slide.',
    '4. Slide 2 must stand alone for someone who never saw slide 1. One idea per slide.',
    '5. No em dashes and no ASCII arrows like "->". Dry wit, long self-correcting clauses are fine.',
    '6. Never edit fields named ctaLine, citation, sendTrigger, eyebrow, heroNumber or heroNumberUnit. Keep the CTA tier.',
    '7. Only change a field if the change is clearly better. "unchanged" is a valid answer for the whole post.',
    '8. Never use the name PantryPal.',
    '',
    'CURRENT COPY (variant A, verbatim). Field names are dotted paths inside each slide:',
    JSON.stringify(slides, null, 1),
    '',
    'Reply with ONE JSON object and nothing else:',
    '{"changes":[{"slide":2,"field":"headline","to":"<new text>","why":"<one short reason>"}],"verdict":"changed|unchanged"}',
    'Every change needs a non-empty why. Use only fields that exist above. If nothing should change, reply {"changes":[],"verdict":"unchanged"}.'
  ].join('\n');
}

/** Pulls the first balanced JSON object out of model text, tolerating fences and prose. */
export function extractJson(text) {
  const s = String(text || '');
  for (let start = s.indexOf('{'); start >= 0; start = s.indexOf('{', start + 1)) {
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < s.length; i++) {
      const c = s[i];
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) {
        try { return JSON.parse(s.slice(start, i + 1)); } catch { break; }
      }
    }
  }
  return null;
}

class RateLimited extends Error {}

function callModel(prompt, model) {
  let out;
  try {
    out = execFileSync('claude', ['-p', '--model', model, '--output-format', 'json', '--max-turns', '1'],
      { input: prompt, encoding: 'utf8', cwd: os.tmpdir(), maxBuffer: 16 * 1024 * 1024, timeout: 240000, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    const blob = `${e.stdout || ''}\n${e.stderr || ''}\n${e.message}`;
    if (RATE_LIMIT.test(blob)) throw new RateLimited(blob.slice(0, 200));
    throw new Error(`claude CLI failed: ${blob.slice(0, 300)}`);
  }
  let env;
  try { env = JSON.parse(out); } catch { return { text: out, usage: null }; }
  const text = typeof env.result === 'string' ? env.result : JSON.stringify(env.result ?? '');
  if (env.is_error || /^error/i.test(env.subtype || '')) {
    if (RATE_LIMIT.test(text)) throw new RateLimited(text.slice(0, 200));
    throw new Error(`model returned error: ${text.slice(0, 300)}`);
  }
  if (RATE_LIMIT.test(text) && text.length < 300) throw new RateLimited(text);
  return { text, usage: env.usage || null, cost: env.total_cost_usd ?? null };
}

function record(n, stage, extra) {
  try { saveRefinery(setPostStage(loadRefinery(), n, stage, extra)); } catch (e) { console.error(`state write failed: ${e.message}`); }
}

function diffReport(B) {
  return B.refinement.changes.length
    ? B.refinement.changes.map((c) => `  slide ${c.slide} ${c.field}\n    A: ${c.from}\n    B: ${c.to}\n    why: ${c.why}`).join('\n')
    : '  (unchanged: B copy identical to A)';
}

export async function refine(n, { dryRun = false } = {}) {
  const specPath = path.join(ROOT, 'specs', `post-${n}.json`);
  const A = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  validateSpec(A);
  const prompt = buildPrompt(A, criticFindingsFor(n));
  if (dryRun) { console.log(prompt); return { status: 'dry-run' }; }

  const model = config.models.copy;
  const meta = { model, at: new Date().toISOString() };
  let calls = 0, usage = null, lastWhy = 'no attempt';
  for (let attempt = 0; attempt < 2; attempt++) {   // one retry, only on unusable JSON
    let res;
    try { res = callModel(prompt, model); calls++; }
    catch (e) {
      if (e instanceof RateLimited) {
        record(n, 'copy', { lastError: 'rate-limited' });
        console.log(`PAUSED post ${n} step copy. Resume later.`);
        return { status: 'paused', calls };
      }
      record(n, 'copy', { lastError: e.message.slice(0, 200) });
      console.error(`post ${n}: ${e.message}`);
      return { status: 'error', calls, error: e.message };
    }
    usage = res.usage;
    const obj = extractJson(res.text);
    if (!obj || !Array.isArray(obj.changes)) { lastWhy = 'model reply was not the expected JSON'; continue; }
    const edits = obj.changes.filter((c) => !LOCKED_FIELDS.has(String(c.field).split('.').pop()));
    let B;
    try { B = buildVariantB(A, edits, meta); }
    catch (e) { lastWhy = `could not apply changes: ${e.message}`; break; }
    try { validateSpec(B); } catch (e) { lastWhy = `B failed schema validation: ${e.message}`; break; }
    const gate = fidelityCheck(A, B);
    if (gate.verdict === 'FAIL') {
      const why = gate.findings.filter((f) => f.level === 'FAIL').map((f) => `${f.check}${f.slide ? ` s${f.slide}` : ''}: ${f.detail}`);
      record(n, 'copy', { lastError: `gate7 FAIL: ${why[0]}`, copyB: 'discarded' });
      console.log(`post ${n}: Gate 7 FAIL, B discarded, A continues.\n  ${why.join('\n  ')}`);
      return { status: 'gate-fail', calls, usage, findings: gate.findings };
    }
    fs.mkdirSync(REFINED_DIR, { recursive: true });
    const out = path.join(REFINED_DIR, `post-${n}-B.json`);
    fs.writeFileSync(out, JSON.stringify(B, null, 2) + '\n');
    record(n, 'copy', { lastError: null, copyB: B.refinement.changes.length ? 'pass' : 'unchanged' });
    console.log(`post ${n}: Gate 7 PASS (${B.refinement.changes.length} change(s)) -> ${path.relative(ROOT, out)}\n${diffReport(B)}`);
    return { status: 'pass', calls, usage, changes: B.refinement.changes };
  }
  record(n, 'copy', { lastError: lastWhy, copyB: 'discarded' });
  console.log(`post ${n}: B discarded (${lastWhy}). A continues.`);
  return { status: 'discarded', calls, usage, reason: lastWhy };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = Number(opt('post'));
  if (!Number.isInteger(n) || n < 1) { console.error('usage: node tools/refine-copy.mjs --post N [--dry-run]'); process.exit(2); }
  try {
    const r = await refine(n, { dryRun: flag('dry-run') });
    if (r.usage) console.error(`calls: ${r.calls}, usage: ${JSON.stringify(r.usage)}`);
    process.exit(r.status === 'error' ? 1 : 0);
  } catch (e) { console.error(e.message); process.exit(1); }
}
