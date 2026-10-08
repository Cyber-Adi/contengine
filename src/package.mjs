// package.mjs — deterministic, template-based post package: IG caption, per-slide alt
// text, TikTok text. Zero model calls. Slide copy is only ever quoted verbatim; the
// glue text (hashtags, keyword phrases, diagram descriptions) comes from closed tables.
import { gtm, ctaLine, honestyCheck, launchCheck, unsourcedFigures } from './gtm.mjs';

const MAX_CAPTION = 2200;
const BODY_LINES = 2;
const DEFAULT_PILLAR = 'The $2913 Problem';
const plain = (t) => String(t || '')
  .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\(\((.+?)\)\)/g, '$1').replace(/\/\/(.+?)\/\//g, '$1');
const noDash = (t) => String(t).replace(/\s*[—–]\s*/g, ', ');
const terminate = (t) => (/[.!?]$/.test(t) ? t : `${t}.`);
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const sentencesOf = (t) => String(t).match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) || [];

const DIAGRAM_WORDS = {
  receipt: 'Receipt listing itemized costs with a total.',
  'before-after': 'Before and after comparison of two values.',
  'shelf-map': 'Shelf map marking zones with short notes.',
  'bar-compare': 'Bar chart comparing two values.',
  meter: 'Meter showing progress toward a total.',
  line: 'Line showing progress across the slides.',
};

/** Every string in a slide's copy, in authored key order, citations excluded. */
function copyStrings(node, key = '') {
  if (key === 'citation') return [];
  if (typeof node === 'string') return [plain(node)];
  if (typeof node === 'number') return [String(node)];
  if (Array.isArray(node)) return node.flatMap((n) => copyStrings(n));
  if (node && typeof node === 'object') return Object.entries(node).flatMap(([k, v]) => copyStrings(v, k));
  return [];
}

function openerOf(spec) {
  const s1 = (spec.slides || []).find((s) => s.index === 1) || {};
  const c = s1.copy || {};
  const lead = c.heroNumber ? `${plain(c.heroNumber)}${c.heroNumberUnit ? plain(c.heroNumberUnit) : ''}` : '';
  const hcap = plain(c.heroNumberCaption || '');
  const raw = plain(c.headline)
    || (lead && hcap ? `${lead}. ${cap(hcap)}` : '') || lead || hcap || plain(spec.title);
  return terminate(noDash(raw.trim()));
}

/** Up to BODY_LINES verbatim sentences from interior slides, none carrying a figure or CTA. */
function bodyLines(spec, opener) {
  const out = [];
  const total = (spec.slides || []).length;
  for (const s of (spec.slides || []).filter((x) => x.index > 1 && x.index < total)) {
    const c = s.copy || {};
    const pool = [c.body, ...(Array.isArray(c.items) ? c.items.filter((i) => typeof i === 'string') : [])];
    for (const raw of pool) {
      for (const sent of sentencesOf(plain(raw))) {
        if (out.length >= BODY_LINES) return out;
        if (sent.length < 25 || sent.length > 140 || sent === opener) continue;
        if (/[—–→←]|->|[0-9$%]/.test(sent)) continue;
        if (honestyCheck(sent).length || launchCheck(sent).length || unsourcedFigures(sent).length) continue;
        out.push(sent);
      }
    }
  }
  return out;
}

const hashtagsFor = (spec) => (gtm.hashtags[spec.pillar] || gtm.hashtags[DEFAULT_PILLAR]).slice(0, 5);

const CTA_SENTENCE = /waitlist|link in (the )?bio|pre-?order/i;
/** Drop any waitlist / link-in-bio / pre-order sentence from a supplied caption. */
function stripCta(text) {
  return String(text).split('\n').map((line) => {
    if (/#\w/.test(line)) return line;
    const parts = line.match(/[^.!?]+[.!?]*\s*/g);
    if (!parts) return line;
    const kept = parts.filter((p) => !CTA_SENTENCE.test(p)).join('').trim();
    return kept;
  }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function buildCaption(spec) {
  const cta = ctaLine(spec);
  const tags = hashtagsFor(spec).join(' ');
  if (spec.caption) {
    const base = stripCta(spec.caption);
    const own = base.match(/#\w+/g) || [];
    const text = base.split('\n').filter((l) => !/^\s*(#\w+\s*)+$/.test(l)).join('\n').trim();
    return `${[text, cta].filter(Boolean).join('\n\n')}\n\n${own.length ? own.join(' ') : tags}\n`;
  }
  const opener = openerOf(spec);
  const trigger = plain(spec.sendTrigger || '');
  const lines = bodyLines(spec, opener);
  const full = [opener, lines.join(' '), trigger ? terminate(noDash(trigger)) : '', cta]
    .filter(Boolean).join('\n\n');
  const out = `${full}\n\n${tags}\n`;
  return out.length <= MAX_CAPTION ? out : `${[opener, cta].filter(Boolean).join('\n\n')}\n\n${tags}\n`;
}

/** One line per slide: its copy as plain sentences, plus a short diagram description. */
export function buildAltText(spec) {
  return (spec.slides || []).map((s) => {
    const parts = copyStrings(s.copy || {}).map((t) => noDash(t.trim())).filter(Boolean).map(terminate);
    if (s.layout === 'diagram' && s.diagram) {
      parts.push(DIAGRAM_WORDS[s.diagram.kind] || 'Diagram illustrating the point.');
    }
    return `Slide ${s.index}: ${parts.join(' ').replace(/\s+/g, ' ')}`.trim();
  }).join('\n') + '\n';
}

function titleOf(spec) {
  const opener = openerOf(spec);
  if (opener.length <= 90) return opener;
  const first = sentencesOf(opener)[0] || opener;
  if (first.length <= 90) return first;
  let t = '';
  for (const w of first.split(' ')) {
    if ((`${t} ${w}`).trim().length > 90) break;
    t = `${t} ${w}`.trim();
  }
  return t;
}

export function buildTikTok(spec) {
  const kw = (gtm.tiktokKeywords[spec.pillar] || gtm.tiktokKeywords[DEFAULT_PILLAR]).slice(0, 5);
  const captionText = [`${kw.map(cap).join('. ')}.`, ctaLine(spec)].filter(Boolean).join(' ');
  return [
    `TITLE: ${titleOf(spec)}`,
    `CAPTION: ${captionText}`,
    `HASHTAGS: ${hashtagsFor(spec).slice(0, 3).join(' ')}`,
    'SOUND: pick a trending sound in-app at low volume.',
    '',
  ].join('\n');
}

/** Gate 6 honesty and launch findings across every generated text. */
export function checkPackage(texts) {
  return Object.entries(texts).flatMap(([where, t]) => [...honestyCheck(t, where), ...launchCheck(t, where)]);
}
