// gtm.mjs — single load point for the MARKETING contract, mirroring tokens.mjs.
// tokens.json makes colour drift structurally impossible. gtm.json does the same
// for positioning, angles, sourced numbers and pre-launch honesty. No positioning
// line, angle, stat or CTA may be hardcoded anywhere else in this repo.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './tokens.mjs';

export const gtm = JSON.parse(fs.readFileSync(path.join(ROOT, 'gtm.json'), 'utf8'));

export const angleById = Object.fromEntries(gtm.angles.map((a) => [a.id, a]));

/** Every stat the GTM plan has already sourced. The only numbers allowed hero treatment. */
export const sourcedStats = gtm.angles
  .filter((a) => a.stat && a.stat.value)
  .map((a) => ({ angle: a.id, ...a.stat }));

/**
 * Check text against the pre-launch honesty rules (GTM section 3).
 * Returns [] when clean, otherwise one finding per violation.
 */
export function honestyCheck(text, where = '') {
  const found = [];
  const hay = String(text || '');
  const low = hay.toLowerCase();
  for (const s of gtm.honesty.bannedSubstrings) {
    if (low.includes(s.toLowerCase())) {
      found.push({ where, kind: 'banned-phrase', match: s,
        why: 'fond is pre-launch. No user counts, no customers, no traction claims.' });
    }
  }
  for (const p of gtm.honesty.bannedPatterns) {
    const m = hay.match(new RegExp(p, 'i'));
    if (m) {
      found.push({ where, kind: 'banned-pattern', match: m[0],
        why: 'Reads as a traction claim. Projections, never traction.' });
    }
  }
  // Framing applies to statements about fond / us only. A sentence about a third party
  // ("meal kit companies ... customer retention") is not a traction claim.
  const aboutUs = (hay.match(/[^.!?]+[.!?]*/g) || []).some((x) => /\bcustomers?\b/i.test(x) && /\b(fond|our|we|we're|we've|us|my)\b/i.test(x));
  if (aboutUs && !/founding member/i.test(hay)) {
    found.push({ where, kind: 'framing', match: 'customer',
      why: gtm.honesty.requiredFraming.foundingMember });
  }
  return found;
}

/**
 * Any numeral that looks like a claim must trace to a sourced GTM stat.
 * Deliberately conservative: it flags for a human rather than blocking, because
 * a brief may legitimately carry a figure this file has not catalogued yet.
 */
export function unsourcedFigures(text) {
  const hay = String(text || '');
  const known = sourcedStats.map((s) => String(s.value).replace(/[$,\/a-z]/gi, ''));
  const out = [];
  for (const m of hay.matchAll(/\$?\d[\d,]*(?:\.\d+)?%?/g)) {
    const bare = m[0].replace(/[$,%]/g, '');
    if (Number(bare) <= 12) continue;                 // small counts, slide numbers, years-in-a-list
    if (/^(19|20)\d\d$/.test(bare)) continue;         // a year is not a claim
    if (known.some((k) => k.startsWith(bare) || bare.startsWith(k))) continue;
    out.push(m[0]);
  }
  return [...new Set(out)];
}

// ---- launch state and CTA honesty (refinery S1c) ---------------------------
const LAUNCH_FILE = path.join(ROOT, 'state', 'launch.json');
const SETUP_LAUNCH = { phase: 'setup', waitlistLive: false, foundingMemberLive: false };

/** Read state/launch.json. A missing or broken file means setup, the safe default. */
export function loadLaunch(file = LAUNCH_FILE) {
  try { return { ...SETUP_LAUNCH, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { return { ...SETUP_LAUNCH }; }
}

/** Closed-list setup CTA, rotated deterministically by post number. */
export function setupCta(postNumber) {
  const list = gtm.ctas.setup;
  return list[Math.abs(Number(postNumber) || 0) % list.length];
}

const waitlistIsLive = (l) => l.phase !== 'setup' && l.waitlistLive === true;
const memberIsLive = (l) => l.phase !== 'setup' && l.foundingMemberLive === true;

/** The one CTA line for a caption. Tier 0 has none; setup phase uses the closed list. */
export function ctaLine(spec, launch = loadLaunch()) {
  if (spec.ctaTier === 'Tier 0') return '';
  if (!waitlistIsLive(launch)) return setupCta(spec.postNumber);
  const tier = spec.ctaTier === 'Tier 3' && !memberIsLive(launch) ? 'Tier 2' : spec.ctaTier;
  return (gtm.ctas[tier] || {}).text || '';
}

/** Findings for text that promises something not yet live. Tier 1 ("More in the bio.") is allowed. */
export function launchCheck(text, where = '', launch = loadLaunch()) {
  const low = String(text || '').toLowerCase();
  const found = [];
  const hit = (match, why) => found.push({ where, kind: 'cta-not-live', match, why });
  if (!waitlistIsLive(launch)) {
    for (const p of ['waitlist', 'link in bio', 'pre-order']) {
      if (low.includes(p)) hit(p, 'Setup phase: no waitlist, pre-order or link claim until state/launch.json says live.');
    }
  }
  const t3 = (gtm.ctas['Tier 3'] || {}).text;
  if (!memberIsLive(launch) && t3 && low.includes(t3.toLowerCase())) hit(t3, 'Tier 3 CTA text while founding member is not live.');
  return found;
}
