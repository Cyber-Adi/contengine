// setup-cta.mjs - setup-phase final-slide CTA swap (owner-authorized, Oct 5).
// While state/launch.json phase is "setup", waitlist / "link in bio" / pre-order /
// Tier 3 sentences in slide copy are replaced by the rotated line from
// gtm.ctas.setup. Closed, mechanical, logged in spec.ctaSwap. --restore reverses it.
// Edits are made on the raw JSON text so untouched bytes stay identical.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gtm, setupCta, loadLaunch } from '../src/gtm.mjs';

const RULE = 'setup-cta';
const HOLD_TAIL = /,\n  "hold": "HOLD-UNTIL-LAUNCH"(?=\n\})/;
const HOLD_MID = /\n  "hold": "HOLD-UNTIL-LAUNCH",/;
const SWAP_TAIL = /,\n  "ctaSwap": \[[\s\S]*?\n  \](?=\n\})/;

const isCta = (sentence) => {
  const low = sentence.toLowerCase();
  return /waitlist|link in bio|pre-order/.test(low) || low.includes(gtm.ctas['Tier 3'].text.toLowerCase());
};

/** Replace only the CTA sentence(s) of a field. Returns null if nothing to swap. */
export function swapText(text, line) {
  const parts = String(text).match(/[^.!?]+[.!?]*\s*/g) || [String(text)];
  if (!parts.some(isCta)) return null;
  const out = [];
  const lastCta = parts.map(isCta).lastIndexOf(true);
  const tail = parts[lastCta].match(/\s*$/)[0];
  let placed = false;
  parts.forEach((p) => {
    if (!isCta(p)) { out.push(p); return; }
    if (!placed) { out.push(line + tail); placed = true; }
  });
  return out.join('');
}

/** Pure: plan the swaps for a spec object. Empty if already swapped. */
export function planSwaps(spec) {
  if (spec.ctaSwap) return [];
  const line = setupCta(spec.postNumber);
  const swaps = [];
  (spec.slides || []).forEach((s, i) => {
    for (const [field, v] of Object.entries(s.copy || {})) {
      if (typeof v !== 'string') continue;
      const to = swapText(v, line);
      if (to !== null) swaps.push({ slide: i + 1, field, from: v, to, rule: RULE, ...(spec.hold ? { heldBefore: true } : {}) });
    }
  });
  return swaps;
}

const lit = (s) => JSON.stringify(s);
const count = (raw, needle) => raw.split(needle).length - 1;

/** Pure on raw JSON text: apply planned swaps. Throws if a literal is not found exactly once. */
export function applySwapText(raw, swaps) {
  let out = raw;
  for (const w of swaps) {
    if (count(out, lit(w.from)) !== 1) throw new Error(`literal for slide ${w.slide} ${w.field} not unique in text`);
    out = out.replace(lit(w.from), () => lit(w.to));
  }
  const held = HOLD_TAIL.test(out) || HOLD_MID.test(out);
  out = out.replace(HOLD_TAIL, '').replace(HOLD_MID, '');
  if (held !== swaps.some((w) => w.heldBefore)) throw new Error('hold position not recognised');
  const block = JSON.stringify(swaps, null, 2).replace(/\n/g, '\n  ');
  return out.replace(/\n\}\s*$/, `,\n  "ctaSwap": ${block}\n}\n`);
}

/** Pure on raw JSON text: undo a prior swap. */
export function restoreText(raw) {
  const spec = JSON.parse(raw);
  if (!spec.ctaSwap) return raw;
  let out = raw.replace(SWAP_TAIL, '');
  for (const w of [...spec.ctaSwap].reverse()) {
    if (count(out, lit(w.to)) !== 1) throw new Error(`restore: literal for slide ${w.slide} ${w.field} not unique`);
    out = out.replace(lit(w.to), () => lit(w.from));
  }
  if (spec.ctaSwap.some((w) => w.heldBefore)) out = out.replace(/\n\}\s*$/, ',\n  "hold": "HOLD-UNTIL-LAUNCH"\n}\n');
  return out;
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const specFiles = () => [
  ...fs.readdirSync(path.join(ROOT, 'specs')).filter((f) => /^post-\d+\.json$/.test(f) && Number(f.match(/\d+/)[0]) < 9000).map((f) => path.join(ROOT, 'specs', f)),
  path.join(ROOT, 'specs', 'fixtures', 'post-9005.json'),
].filter((f) => fs.existsSync(f));

const writeAtomic = (file, text) => { const t = `${file}.tmp-${process.pid}`; fs.writeFileSync(t, text); fs.renameSync(t, file); };

if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.includes('--write');
  const restore = process.argv.includes('--restore');
  if (!restore && loadLaunch().phase !== 'setup') { console.error('launch phase is not setup; refusing to swap'); process.exit(2); }
  let total = 0;
  for (const f of specFiles()) {
    const raw = fs.readFileSync(f, 'utf8'); // re-read per file, write right after
    const name = path.basename(f);
    if (restore) {
      const next = restoreText(raw);
      if (next !== raw) { total++; console.log(`restore ${name}`); if (write) writeAtomic(f, next); }
      continue;
    }
    const swaps = planSwaps(JSON.parse(raw));
    if (!swaps.length) continue;
    total += swaps.length;
    for (const w of swaps) console.log(`${name} s${w.slide}.${w.field}: ${JSON.stringify(w.from)} -> ${JSON.stringify(w.to)}`);
    if (write) writeAtomic(f, applySwapText(raw, swaps));
  }
  console.log(`${write ? 'wrote' : 'dry-run'}: ${total} ${restore ? 'restores' : 'swaps'}`);
}
