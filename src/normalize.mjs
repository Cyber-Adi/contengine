// normalize.mjs - the typographic normalizer (S2f).
//
// A CLOSED table in tokens.json (typography.normalize.rules) turns "->" into an arrow,
// straight quotes into curly ones, and " - " into an en dash. Same status as the
// PantryPal -> fond substitution: mechanical, never new copy, and every substitution
// is logged so nothing is silent. Pure functions only; nothing here mutates its input.
import { tokens } from './tokens.mjs';

const RULES = (tokens.typography?.normalize?.rules || []).map((r) => ({
  id: r.id,
  re: r.regex ? new RegExp(r.regex, 'gu') : new RegExp(r.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
  to: r.to,
}));

/** Apply the table to one string. Returns { text, hits: [{rule, count}] }. */
export function normalizeText(text) {
  if (typeof text !== 'string' || !text) return { text, hits: [] };
  let out = text;
  const hits = [];
  for (const r of RULES) {
    let count = 0;
    out = out.replace(r.re, (...m) => {
      count += 1;
      // expand $1/$2 manually: String.replace with a function does not
      return r.to.replace(/\$(\d)/g, (_, d) => (typeof m[Number(d)] === 'string' ? m[Number(d)] : ''));
    });
    if (count) hits.push({ rule: r.id, count });
  }
  return { text: out, hits };
}

function walk(value, field, slideIndex, log) {
  if (typeof value === 'string') {
    const r = normalizeText(value);
    for (const h of r.hits) log.push({ slide: slideIndex, field, rule: h.rule, count: h.count });
    return r.text;
  }
  if (Array.isArray(value)) return value.map((v, i) => walk(v, `${field}[${i}]`, slideIndex, log));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, `${field}.${k}`, slideIndex, log)]));
  }
  return value;
}

/** Normalize every display string on a slide. Returns { slide, log } (slide is a copy). */
export function normalizeSlide(slide) {
  const log = [];
  const next = { ...slide };
  for (const key of ['copy', 'diagram', 'microLabel', 'swipeLabel']) {
    if (slide[key] !== undefined) next[key] = walk(slide[key], key, slide.index, log);
  }
  if (slide.threadState) next.threadState = { ...slide.threadState, label: walk(slide.threadState.label, 'threadState.label', slide.index, log) };
  return { slide: next, log };
}
