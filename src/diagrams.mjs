// diagrams.mjs — flat vector diagram primitives, HTML/CSS-first.
//
// ARCHITECTURE NOTE, and the reason this file was rewritten:
// v1 drew labels as SVG <text>. SVG text does not wrap and does not clip — it either
// runs past its shape or gets silently truncated by whatever hand-rolled character
// heuristic wraps it. Both happened. Worse, the structural gate could not see it,
// because there is no box for the browser to overflow.
//
// So: every text-bearing part of a diagram is real HTML in a real box. SVG is used
// only for marks that genuinely need vector geometry — arrows, the receipt's torn
// edge. The payoff is that Gate 1's existing DOM overflow measurement now covers
// diagram labels automatically, and CSS does the wrapping with true glyph metrics.
//
// Design System 3.5: flat vector only, 2px stroke, no 3D/shadows/gradients.
// NO HEX LITERALS. Every colour resolves through tokens.

import { tokens, C, esc } from './tokens.mjs';

const TONE = { good: 'fondGreen', caution: 'harvestGold', loss: 'signalRed', neutral: 'inkGray' };

// A token can be legal in the palette and still be illegible on this ground.
function tok(tone, bg) {
  let t = TONE[tone || 'neutral'] || 'inkGray';
  const r = tokens.colors[t]?.backgroundRestriction;
  if (r && r !== bg) t = (bg === 'light' && tone === 'good') ? 'fondGreen' : 'steelBlue';
  return C[t];
}
const fgOf = (bg) => (bg === 'dark' ? C.offWhite : C.slateBlack);

// The one SVG mark used across diagrams.
const arrowRight = (col, w = 40) => `<svg class="d-arw" viewBox="0 0 40 18" width="${w}" height="18"
  ><path d="M2 9h32m-9-7 9 7-9 7" fill="none" stroke="${col}" stroke-width="2.6"
   stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------------------------------------------------------------- bar-compare
function barCompare(d, bg, accent) {
  const rows = d.rows || [];
  const max = Math.max(...rows.map(r => r.max ?? r.value), 1);
  const fg = fgOf(bg);
  return `<div class="d-bars">${rows.map(r => {
    const pct = Math.max(2, (r.value / max) * 100);
    const col = r.tone ? tok(r.tone, bg) : accent;
    return `<div class="d-bar-row">
      <div class="d-bar-label" style="color:${fg}">${esc(r.label)}</div>
      <div class="d-bar-track" style="background:${fg}14">
        <div class="d-bar-fill" style="width:${pct}%;background:${col}"></div>
      </div>
      <div class="d-bar-val" style="color:${col}">${esc(r.display ?? r.value)}</div>
    </div>`;
  }).join('')}</div>`;
}

// ---------------------------------------------------------------- before-after
function beforeAfter(d, bg, accent) {
  const fg = fgOf(bg);
  const side = (o, col) => `<div class="d-ba-col" style="background:${col}12;border-left:7px solid ${col}">
    <div class="d-ba-label" style="color:${fg}">${esc((o?.label || '').toUpperCase())}</div>
    <div class="d-ba-val" style="color:${col}">${esc(o?.value || '')}</div>
    ${o?.note ? `<div class="d-ba-note" style="color:${fg}">${esc(o.note)}</div>` : ''}
  </div>`;
  return `<div class="d-ba">
    ${side(d.before, tok(d.before?.tone || 'loss', bg))}
    <div class="d-ba-mid">${arrowRight(accent, 46)}</div>
    ${side(d.after, tok(d.after?.tone || 'good', bg))}
  </div>`;
}

// ---------------------------------------------------------------- shelf-map
function shelfMap(d, bg, accent) {
  const fg = fgOf(bg);
  return `<div class="d-shelf" style="border-color:${accent}">
    ${(d.zones || []).map(z => `<div class="d-zone" style="border-color:${fg}38">
      <div class="d-zone-bar" style="background:${tok(z.tone, bg)}"></div>
      <div class="d-zone-txt">
        <div class="d-zone-l" style="color:${fg}">${esc(z.label)}</div>
        ${z.note ? `<div class="d-zone-n" style="color:${fg}">${esc(z.note)}</div>` : ''}
      </div>
    </div>`).join('')}
  </div>`;
}

// ---------------------------------------------------------------- flow-loop
// A horizontal chain with a visible return. A radial loop collides its own labels
// at this width; the cycle reads better as steps that return to the start.
function flowLoop(d, bg, accent) {
  const steps = (d.steps || []).slice(0, 4);
  const fg = fgOf(bg);
  return `<div class="d-flow">
    <div class="d-flow-row">
      ${steps.map((s, i) => `<div class="d-step" style="border-color:${fg}3D">
        <div class="d-step-cap" style="background:${accent}"></div>
        <div class="d-step-t" style="color:${fg}">${esc(s)}</div>
      </div>${i < steps.length - 1 ? `<div class="d-step-arw">${arrowRight(accent, 30)}</div>` : ''}`).join('')}
    </div>
    <div class="d-flow-return">
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" class="d-ret">
        <path d="M960 2 L960 34 L40 34 L40 8" fill="none" stroke="${accent}" stroke-width="3"
              stroke-dasharray="9 9" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M31 16 L40 4 L49 16" fill="none" stroke="${accent}" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="d-ret-l" style="color:${fgOf(bg)}">${esc((d.returnLabel || 'and again').toUpperCase())}</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- receipt
// The metaphor object. §3.5 calls these "the signature move for reframing data."
// Torn edge is the one genuinely vector part; everything else is HTML.
function receipt(d, bg) {
  const lines = d.lines || [];
  const teeth = 26;
  const pts = Array.from({ length: teeth * 2 + 2 }, (_, i) => {
    if (i === 0) return '0,0';
    if (i === teeth * 2 + 1) return '100,0';
    return `${((i - 1) / (teeth * 2 - 1)) * 100},${(i % 2) ? 100 : 0}`;
  }).join(' ');
  return `<div class="d-rcpt">
    <div class="d-rcpt-card" data-surface="offWhite">
      <div class="d-rcpt-title">${esc((d.title || 'RECEIPT').toUpperCase())}</div>
      <div class="d-rcpt-rule"></div>
      ${lines.map(l => `<div class="d-rcpt-line">
        <span class="d-rcpt-lbl">${esc(l.label)}</span>
        <span class="d-rcpt-dots"></span>
        <span class="d-rcpt-amt" style="color:${l.tone ? tok(l.tone, 'light') : C.slateBlack}">${esc(l.value)}</span>
      </div>`).join('')}
      ${d.total ? `<div class="d-rcpt-total">
        <span class="d-rcpt-tl">${esc(d.total.label)}</span>
        <span class="d-rcpt-tv" style="color:${tok('loss', 'light')}">${esc(d.total.value)}</span>
      </div>` : ''}
    </div>
    <svg class="d-rcpt-tear" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon points="${pts}" fill="${C.offWhite}"/></svg>
  </div>`;
}

const KINDS = { 'bar-compare': barCompare, 'before-after': beforeAfter, 'shelf-map': shelfMap,
                'flow-loop': flowLoop, 'receipt': receipt };

export const DIAGRAM_KINDS = Object.keys(KINDS);

export function diagramHtml(diagram, background, accentHex) {
  if (!diagram || !KINDS[diagram.kind]) return '';
  return `<div class="diagram" data-kind="${diagram.kind}">${
    KINDS[diagram.kind](diagram.data || {}, background, accentHex)}</div>`;
}

// Styles live here so the diagram layer owns its own layout. Injected once.
export function diagramCss(T) {
  return `
.diagram{width:100%}
.d-arw{display:block;flex:none}

.d-bars{display:flex;flex-direction:column;gap:28px}
.d-bar-row{display:grid;grid-template-columns:minmax(0,260px) 1fr auto;align-items:center;gap:22px}
.d-bar-label{font-family:${T.body.stack};font-weight:500;font-size:33px;line-height:1.2;min-width:0;
  overflow-wrap:break-word}
.d-bar-track{height:54px;border-radius:2px;overflow:hidden;min-width:0}
.d-bar-fill{height:100%}
.d-bar-val{font-family:${T.numeric.stack};font-weight:700;font-size:46px;
  font-variant-numeric:tabular-nums;white-space:nowrap}

.d-ba{display:grid;grid-template-columns:1fr auto 1fr;align-items:stretch;gap:18px}
.d-ba-col{padding:34px 30px;border-radius:3px;display:flex;flex-direction:column;gap:14px;min-width:0}
.d-ba-label{font-family:${T.body.stack};font-weight:700;font-size:26px;letter-spacing:.1em;
  line-height:1.25;overflow-wrap:break-word}
.d-ba-val{font-family:${T.numeric.stack};font-weight:700;font-size:74px;line-height:1.08;
  font-variant-numeric:tabular-nums}
.d-ba-note{font-family:${T.body.stack};font-weight:400;font-size:30px;line-height:1.28;
  overflow-wrap:break-word}
.d-ba-mid{display:flex;align-items:center}

.d-shelf{border:3px solid;border-radius:4px;padding:12px;display:flex;flex-direction:column;gap:10px}
.d-zone{display:grid;grid-template-columns:14px 1fr;gap:0;border:3px solid;border-radius:2px;
  overflow:hidden;min-height:108px;align-items:stretch}
.d-zone-bar{width:14px}
.d-zone-txt{padding:16px 22px;display:flex;flex-direction:column;justify-content:center;gap:6px;min-width:0}
.d-zone-l{font-family:${T.body.stack};font-weight:700;font-size:33px;line-height:1.2;overflow-wrap:break-word}
.d-zone-n{font-family:${T.body.stack};font-weight:400;font-size:29px;opacity:.82;line-height:1.25;overflow-wrap:break-word}

.d-flow{display:flex;flex-direction:column;gap:0}
.d-flow-row{display:flex;align-items:stretch;gap:0}
.d-step{flex:1 1 0;min-width:0;border:3px solid;border-radius:3px;overflow:hidden;
  display:flex;flex-direction:column}
.d-step-cap{height:8px;flex:none}
.d-step-t{font-family:${T.body.stack};font-weight:500;font-size:29px;line-height:1.24;
  padding:24px 14px;text-align:center;flex:1;display:flex;align-items:center;
  justify-content:center;overflow-wrap:break-word;hyphens:auto}
.d-step-arw{display:flex;align-items:center;padding:0 8px;flex:none}
.d-flow-return{position:relative;height:62px;margin-top:2px}
.d-ret{position:absolute;inset:0;width:100%;height:100%}
.d-ret-l{position:absolute;left:50%;top:2px;transform:translateX(-50%);
  font-family:${T.body.stack};font-weight:700;font-size:24px;opacity:.7;letter-spacing:.16em;
  background:inherit;padding:0 14px}

.d-rcpt{display:flex;flex-direction:column;align-items:center;width:100%}
.d-rcpt-card{width:84%;background:${C.offWhite};padding:34px 38px 26px 38px;
  display:flex;flex-direction:column;gap:0}
.d-rcpt-title{font-family:${T.body.stack};font-weight:700;font-size:25px;letter-spacing:.2em;
  color:${C.slateBlack};line-height:1.2;overflow-wrap:break-word}
.d-rcpt-rule{height:2px;margin:16px 0 6px;background:repeating-linear-gradient(
  to right,${C.slateBlack}59 0 8px,transparent 8px 16px)}
.d-rcpt-line{display:flex;align-items:baseline;gap:10px;padding:12px 0}
.d-rcpt-lbl{font-family:${T.body.stack};font-weight:400;font-size:29px;color:${C.slateBlack};
  line-height:1.25;min-width:0;overflow-wrap:break-word}
.d-rcpt-dots{flex:1;min-width:16px;border-bottom:2px dotted ${C.slateBlack}4D;transform:translateY(-6px)}
.d-rcpt-amt{font-family:${T.numeric.stack};font-weight:700;font-size:33px;
  font-variant-numeric:tabular-nums;white-space:nowrap}
.d-rcpt-total{display:flex;justify-content:space-between;align-items:baseline;gap:16px;
  margin-top:12px;padding-top:14px;border-top:3px solid ${C.slateBlack}}
.d-rcpt-tl{font-family:${T.body.stack};font-weight:700;font-size:28px;color:${C.slateBlack};
  line-height:1.25;min-width:0;overflow-wrap:break-word}
.d-rcpt-tv{font-family:${T.numeric.stack};font-weight:700;font-size:52px;
  font-variant-numeric:tabular-nums;white-space:nowrap}
.d-rcpt-tear{width:84%;height:18px;display:block}
`;
}
