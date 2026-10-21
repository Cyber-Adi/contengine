// fidelity.mjs - GATE 7 · FIDELITY. Pure code, no model.
//
// Gates 1-6 judge a slide on its own. This gate judges a Refinery variant B against the
// verbatim brief copy A: B may re-phrase, it may never invent. It exists because the
// copy refinery is the only place a model touches slide copy, and CLAUDE.md forbids
// invented statistics, new claims and em dashes. Rules are enforced here in code, not
// trusted to the prompt.
//
// Shape matches gtm-check.mjs: { verdict, fails, warns, findings:[{level,check,detail,slide}] }.
//
// Copy paths: a "field" is a dotted path inside slide.copy, e.g. "headline", "items.1",
// "quadrants.0.label". A change entry with field "deadSlide" records a removed or merged
// slide and is the only thing that licenses a +-1 slide-count difference.
import fs from 'node:fs';
import { tokens } from './tokens.mjs';
import { gtm, honestyCheck } from './gtm.mjs';

const MAX_BODY = tokens.rules.maxBodyWords;
const MAX_HOOK_LINE = tokens.rules.maxHookWordsPerLine;
const BANNED_WORDS = tokens.rules.bannedWords || [];
const HOOK_ARCHETYPES = new Set(['hook', 'backupHook']);
const DEAD_SLIDE = 'deadSlide';
const EM_DASH = '—';

const clone = (o) => JSON.parse(JSON.stringify(o));
const isObj = (v) => v !== null && typeof v === 'object';
const stable = (v) => JSON.stringify(v, (_, x) =>
  isObj(x) && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x);

/** Flatten a copy object to [{path, value}] for every string leaf. */
export function copyLeaves(copy, prefix = '') {
  if (typeof copy === 'string') return [{ path: prefix, value: copy }];
  if (Array.isArray(copy)) return copy.flatMap((v, i) => copyLeaves(v, prefix ? `${prefix}.${i}` : String(i)));
  if (isObj(copy)) return Object.entries(copy).flatMap(([k, v]) => copyLeaves(v, prefix ? `${prefix}.${k}` : k));
  return [];
}

const getPath = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setPath(obj, p, value) {
  const keys = p.split('.');
  const last = keys.pop();
  const parent = keys.reduce((o, k) => o?.[k], obj);
  if (!isObj(parent)) throw new Error(`copy path "${p}" does not exist`);
  parent[last] = value;
}

const diagramStrings = (d) => (!d ? [] : copyLeaves(d.data || {}).map((l) => l.value));
const slideText = (s) => [...copyLeaves(s.copy || {}).map((l) => l.value), ...diagramStrings(s.diagram)];

// ---- number extraction ------------------------------------------------------------
// Digits only (spelled-out numbers like "three in four" are qualitative by house rule,
// and matching bare words like "one" would drown the gate in false positives).
// "$2,913/yr" and "2913" normalise to the same token; "43%" keeps its percent sign so a
// percentage cannot be satisfied by an unrelated bare number.
export function numberSet(texts) {
  const out = new Set();
  for (const t of texts) {
    for (const m of String(t).matchAll(/\d[\d,]*(?:\.\d+)?%?/g)) {
      out.add(m[0].replace(/,+$/, '').replace(/,/g, ''));
    }
  }
  return out;
}
const gtmNumbers = () => numberSet(gtm.angles.filter((a) => a.stat?.value).map((a) => a.stat.value));

// ---- proper-noun extraction -------------------------------------------------------
// Heuristic, deliberately conservative, and documented because it is a heuristic:
//  - A capitalised word NOT at the start of a sentence is a proper noun candidate.
//    Sentence start = first word of a string, or the word after a token ending . ! ? :
//  - Brand-like tokens (ACRONYMS such as EPA/USDA, and camelCase such as TikTok) count
//    wherever they appear, including sentence-initially, so "USDA says..." is caught.
//  - The A-side set is built from EVERY capitalised word in A (sentence-initial too), so
//    B may legitimately move "Paris" from a sentence start to mid-sentence.
//  - Known limit: a brand used as the very first word of a plain sentence ("Walmart
//    saves...") is not flagged. Numbers and em dashes still are.
const strip = (w) => w.replace(/^[^A-Za-z0-9]+/, '').replace(/[^A-Za-z0-9]+$/, '');
const isBrandLike = (w) => /^[A-Z]{2,}s?$/.test(w) || /[a-z][A-Z]/.test(w) || (/[A-Za-z]/.test(w) && /\d/.test(w) && /^[A-Z]/.test(w));

function properNouns(texts, { includeInitial }) {
  const out = new Set();
  for (const t of texts) {
    let start = true;
    for (const raw of String(t).split(/\s+/).filter(Boolean)) {
      const w = strip(raw);
      if (w && /^[A-Z]/.test(w) && w !== 'I' && !/^I['’]/.test(w)) {
        if (isBrandLike(w) || includeInitial || !start) out.add(w.toLowerCase());
      }
      start = /[.!?:]$/.test(raw);
    }
  }
  return out;
}
const gtmProperNouns = () => properNouns(
  gtm.angles.filter((a) => a.stat?.source).map((a) => a.stat.source), { includeInitial: true });

const wordCount = (s) => String(s).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

/** Gate 7. A = verbatim brief spec, B = Refinery variant. */
export function fidelityCheck(A, B) {
  const findings = [];
  const add = (check, detail, slide = null, level = 'FAIL') => findings.push({ level, check, detail, slide });
  const aSlides = A.slides || [];
  const bSlides = B.slides || [];
  const changes = B.refinement?.changes || [];

  // 7.0 - B must declare itself a refined variant of A.
  if (B.variant !== 'B') add('variant', `variant must be "B", got "${B.variant}".`);
  if (B.provenance !== 'refined') add('variant', `provenance must be "refined", got "${B.provenance}".`);
  if (B.refinedFrom !== A.postNumber) add('variant', `refinedFrom ${B.refinedFrom} does not match A post ${A.postNumber}.`);
  if (B.picked === true) add('variant', 'B must not arrive pre-picked; only Adi sets picked.');

  // 7.1 - originalCopy is A's copy, verbatim.
  const aCopies = aSlides.map((s) => s.copy || {});
  if (!Array.isArray(B.originalCopy)) add('original-copy', 'B carries no originalCopy.');
  else if (stable(B.originalCopy) !== stable(aCopies)) add('original-copy', 'originalCopy does not match variant A copy verbatim.');

  // 7.2 - slide count: equal, or +-1 with a recorded dead-slide reason.
  const delta = bSlides.length - aSlides.length;
  const dead = changes.find((c) => c.field === DEAD_SLIDE && String(c.why || '').trim());
  if (Math.abs(delta) > 1) add('slide-count', `slide count moved ${aSlides.length} -> ${bSlides.length}; at most +-1 is allowed.`);
  else if (delta !== 0 && !dead) add('slide-count', `slide count moved ${aSlides.length} -> ${bSlides.length} with no "${DEAD_SLIDE}" change carrying a why.`);

  // 7.3 - same argument: pillar, angle, CTA tier, thread, and every design field.
  for (const k of ['pillar', 'gtmAngle', 'ctaTier', 'thread', 'sendTrigger']) {
    if (stable(A[k]) !== stable(B[k])) add('argument-shape', `${k} differs from A. Refinement is copy only.`);
  }
  if (delta === 0) {
    aSlides.forEach((a, i) => {
      const { copy: _ac, ...aRest } = a;
      const { copy: _bc, ...bRest } = bSlides[i];
      if (stable(aRest) !== stable(bRest)) add('argument-shape', 'design fields differ from A (layout, diagram, background, thread state).', i + 1);
    });
  }

  // 7.4 - every change records a why, and matches what B actually says.
  changes.forEach((c, n) => {
    if (!String(c.why || '').trim()) add('change-why', `change #${n + 1} (slide ${c.slide}, ${c.field}) has no why.`, c.slide);
    if (c.field !== DEAD_SLIDE) {
      const actual = getPath(bSlides[c.slide - 1]?.copy, c.field);
      if (actual !== c.to) add('change-mismatch', `change #${n + 1} says slide ${c.slide} ${c.field} became "${c.to}" but B has "${actual}".`, c.slide);
    }
  });

  // 7.5 - no undisclosed edits: any copy leaf that differs from A needs a change entry.
  if (delta === 0) {
    aSlides.forEach((a, i) => {
      const b = bSlides[i];
      const paths = new Set([...copyLeaves(a.copy).map((l) => l.path), ...copyLeaves(b.copy).map((l) => l.path)]);
      for (const p of paths) {
        if (getPath(a.copy, p) !== getPath(b.copy, p) && !changes.some((c) => c.slide === i + 1 && c.field === p)) {
          add('undisclosed-change', `slide ${i + 1} ${p} differs from A with no change entry.`, i + 1);
        }
      }
    });
  }

  // 7.6 - numbers(B) subset of numbers(A) + gtm sourced stats.
  const allowedNums = new Set([...numberSet(aSlides.flatMap(slideText)), ...gtmNumbers()]);
  bSlides.forEach((s, i) => {
    for (const n of numberSet(slideText(s))) {
      if (!allowedNums.has(n)) add('numbers', `"${n}" appears in B but not in A or gtm.json sourced stats. Invented figure.`, i + 1);
    }
  });

  // 7.7 - proper nouns(B) subset of proper nouns(A) + gtm stat sources.
  const allowedNouns = new Set([...properNouns(aSlides.flatMap(slideText), { includeInitial: true }), ...gtmProperNouns()]);
  bSlides.forEach((s, i) => {
    for (const n of properNouns(slideText(s), { includeInitial: false })) {
      if (!allowedNouns.has(n)) add('proper-nouns', `"${n}" is a new name or entity in B. Not in A.`, i + 1);
    }
  });

  // 7.8 - honesty (reuse Gate 6 phrase lists), banned words, em dashes.
  const aHonesty = new Set(aSlides.flatMap((s) => honestyCheck(slideText(s).join(' ')).map((f) => f.match)));
  bSlides.forEach((s, i) => {
    const text = slideText(s).join(' ');
    for (const f of honestyCheck(text, `slide ${i + 1}`)) {
      if (!aHonesty.has(f.match)) add('honesty', `${f.why} Found: "${f.match}"`, i + 1);
    }
    for (const w of BANNED_WORDS) {
      if (text.toLowerCase().includes(w.toLowerCase())) add('banned-word', `"${w}" must never appear in rendered output.`, i + 1);
    }
    if (text.includes(EM_DASH)) add('em-dash', 'em dash in copy. House rule: none.', i + 1);
  });

  // 7.9 - word limits from tokens.json rules. A limit already broken by A's own untouched
  // text is A's problem, not a refinement defect: WARN there, FAIL only where B changed it.
  bSlides.forEach((s, i) => {
    const aCopy = aSlides[i]?.copy;
    const lvl = (field) => (delta === 0 && getPath(aCopy, field) === getPath(s.copy, field) ? 'WARN' : 'FAIL');
    const body = s.copy?.body;
    if (typeof body === 'string' && wordCount(body) > MAX_BODY) add('word-limit', `body is ${wordCount(body)} words; max ${MAX_BODY}.`, i + 1, lvl('body'));
    if (HOOK_ARCHETYPES.has(s.archetype) && typeof s.copy?.headline === 'string') {
      for (const line of s.copy.headline.split('\n')) {
        if (wordCount(line) > MAX_HOOK_LINE) add('word-limit', `hook line "${line}" is ${wordCount(line)} words; max ${MAX_HOOK_LINE}.`, i + 1, lvl('headline'));
      }
    }
  });

  // 7.10 - every change record is well formed.
  if (!B.refinement || !Array.isArray(B.refinement.changes)) add('change-why', 'B carries no refinement.changes array.');

  const fails = findings.filter((f) => f.level === 'FAIL').length;
  return { verdict: fails ? 'FAIL' : 'PASS', fails, warns: findings.length - fails, findings };
}

/**
 * Builds variant B from A by applying `edits` ({slide, field, to, why}) to A's copy.
 * `from` is read from A, never trusted from the caller. "kept"/"unchanged" and no-op
 * edits are dropped. Design fields are copied from A untouched. Returns a new object.
 */
export function buildVariantB(A, edits, { model, at, round = 1 }) {
  const B = clone(A);
  const changes = [];
  for (const e of edits) {
    if (['kept', 'unchanged'].includes(String(e.to).toLowerCase())) continue;
    const slide = B.slides[e.slide - 1];
    if (!slide) throw new Error(`edit targets slide ${e.slide}, which does not exist`);
    const from = getPath(A.slides[e.slide - 1].copy, e.field);
    if (typeof from !== 'string') throw new Error(`slide ${e.slide} field "${e.field}" is not an existing string in A copy`);
    if (typeof e.to !== 'string') throw new Error(`slide ${e.slide} field "${e.field}": "to" must be a string`);
    if (e.to === from) continue;
    setPath(slide.copy, e.field, e.to);
    changes.push({ slide: e.slide, field: e.field, from, to: e.to, why: String(e.why ?? '') });
  }
  delete B.picked;
  return {
    ...B,
    provenance: 'refined',
    variant: 'B',
    refinedFrom: A.postNumber,
    originalCopy: A.slides.map((s) => clone(s.copy || {})),
    refinement: { round, changes, model, at }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [pa, pb] = process.argv.slice(2);
  if (!pa || !pb) { console.error('usage: node src/fidelity.mjs specs/post-N.json specs/refined/post-N-B.json'); process.exit(2); }
  const r = fidelityCheck(JSON.parse(fs.readFileSync(pa, 'utf8')), JSON.parse(fs.readFileSync(pb, 'utf8')));
  for (const f of r.findings) console.log(`  ${f.level.padEnd(4)} ${f.check.padEnd(18)} ${f.slide ? `s${f.slide} ` : ''}${f.detail}`);
  console.log(`  gate 7 -> ${r.verdict}  (${r.fails} fail, ${r.warns} warn)`);
  process.exit(r.verdict === 'FAIL' ? 1 : 0);
}
