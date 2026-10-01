// critic.mjs -- the vision critic's rubric and score validation (BACKLOG P2.2).
//
// Gates 1-6 prove a slide is well made, on-palette, legible and on-message. None can say
// whether it LOOKS right. This is the one place a judgement is recorded, so the judgement
// itself is held to a rule the gates can check: a score under 4 must name the slide and
// the element at fault. A bare "3" is an opinion; "3, slide 1, the five-line headline"
// is something a fix can be aimed at.
//
// This module makes no model call and holds no secret. The scoring is done in a Claude
// Code session that has not produced the work (tools/critic.mjs prepares the packet).

export const DIMENSIONS = {
  stop: 'Does slide 1 open a loop at thumbnail scale, in under a second?',
  stand: 'Does slide 2 work ALONE? Instagram re-serves carousels showing it first.',
  arrive: 'Does each swipe feel like a new place, or the same slide re-skinned?',
  save: 'Is there at least one slide worth a screenshot or a save?',
  family: 'Does it read as the same account as the other posts?'
};

export const PASS_MARK = 4;
const KEYS = Object.keys(DIMENSIONS);

// findings: [{ dimension, slide, element }]. Returns { ok, errors, scores, weakest }.
export function validateCritique({ scores = {}, findings = [] } = {}) {
  const errors = [];
  for (const k of KEYS) {
    const v = scores[k];
    if (!Number.isInteger(v) || v < 1 || v > 5) errors.push(`${k}: score must be an integer 1-5, got ${JSON.stringify(v)}`);
  }
  for (const k of KEYS) {
    if (!Number.isInteger(scores[k]) || scores[k] >= PASS_MARK) continue;
    const cited = findings.some((f) => f.dimension === k
      && Number.isInteger(f.slide) && f.slide >= 1
      && typeof f.element === 'string' && f.element.trim().length >= 3);
    if (!cited) errors.push(`${k}=${scores[k]} is under ${PASS_MARK}: cite the slide and the concrete element (--note ${k}:<slide>:<element>)`);
  }
  for (const f of findings) {
    if (!KEYS.includes(f.dimension)) errors.push(`finding names unknown dimension "${f.dimension}"`);
  }
  const valid = KEYS.filter((k) => Number.isInteger(scores[k]));
  const weakest = valid.length ? valid.reduce((a, b) => (scores[b] < scores[a] ? b : a)) : null;
  return { ok: errors.length === 0, errors, weakest };
}

// "stop:1:headline is five lines of serif" -> { dimension, slide, element }
export function parseNote(raw) {
  const m = /^([a-z]+):(\d+):(.+)$/.exec(String(raw).trim());
  return m ? { dimension: m[1], slide: Number(m[2]), element: m[3].trim() } : null;
}

export function packetText(post) {
  const lines = [
    `VISION CRITIC PACKET -- post-${post}`,
    '',
    'You are scoring a finished carousel. You did not make it. Look at the images, not the spec.',
    'Open both files, then score each dimension 1-5. Anything under 4 must cite the slide number',
    'and the concrete element (the headline, the hero number, the diagram) -- not a feeling.',
    '',
    `  out/post-${post}/contact-sheet.png   all slides side by side`,
    `  out/post-${post}/thumbs.png          slides 1 and 2 at feed scale (200px)`,
    '',
    ...Object.entries(DIMENSIONS).map(([k, q]) => `  ${k.toUpperCase().padEnd(7)} ${q}`),
    '',
    'Record with:',
    `  node tools/critic.mjs record ${post} --stop N --stand N --arrive N --save N --family N \\`,
    '    --note stop:1:"the headline is five lines of serif"   (one --note per score under 4)',
    '',
    'Do not alter slide copy or the Design System. A low score is a finding, not a fix order.'
  ];
  return lines.join('\n') + '\n';
}
