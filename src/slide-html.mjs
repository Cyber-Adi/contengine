// slide-html.mjs — the ONE place slide HTML is produced.
// Preview and export both call wrapSlideHtml(), so what you inspect is pixel-identical
// to what ships. (Pattern borrowed from open-carrusel.)
// NO HEX LITERALS IN THIS FILE. Every colour comes from tokens.json.

import fs from 'node:fs';
import path from 'node:path';
import { diagramHtml, diagramCss } from './diagrams.mjs';

import { tokens, C, esc, ROOT, scaleForWidth } from './tokens.mjs';
export { tokens, ROOT };

// Fonts are inlined as data URIs: no network, no file:// origin boundary, and the
// exported HTML is fully self-contained. Determinism is the point — a silent
// fallback to a system serif is the #1 way this output looks amateur.
const fontData = (file) =>
  fs.readFileSync(path.join(ROOT, 'assets/fonts', file)).toString('base64');

const fontFace = (family, file, weight) => `
@font-face{
  font-family:'${family}';
  src:url(data:font/woff2;base64,${fontData(file)}) format('woff2');
  font-weight:${weight}; font-style:normal; font-display:block;
}`;

const fontFaceItalic = (family, file, weight) => `
@font-face{
  font-family:'${family}';
  src:url(data:font/woff2;base64,${fontData(file)}) format('woff2');
  font-weight:${weight}; font-style:italic; font-display:block;
}`;

const FONT_FACES = [
  fontFace('Playfair Display', 'playfair-display-latin-400-normal.woff2', 400),
  fontFace('Playfair Display', 'playfair-display-latin-700-normal.woff2', 700),
  fontFaceItalic('Playfair Display', 'playfair-display-latin-400-italic.woff2', 400),
  fontFaceItalic('Playfair Display', 'playfair-display-latin-700-italic.woff2', 700),
  fontFace('DM Sans', 'dm-sans-latin-400-normal.woff2', 400),
  fontFace('DM Sans', 'dm-sans-latin-500-normal.woff2', 500),
  fontFace('DM Sans', 'dm-sans-latin-700-normal.woff2', 700),
  fontFace('Space Grotesk', 'space-grotesk-latin-700-normal.woff2', 700),
].join('\n');

// Inline markup, so a brief can pop one word without the renderer inventing anything:
//   **word**   -> set in the slide's accent colour  (the single cheapest scroll-stopping move)
//   ((word))   -> hand-drawn circle annotation
//   //word//   -> Playfair italic accent
function rich(text, accentHex) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, (_, w) => `<span class="pop" style="color:${accentHex}">${w}</span>`)
    .replace(/\(\((.+?)\)\)/g, (_, w) =>
      `<span class="circled">${w}<svg class="anno" viewBox="0 0 300 110" preserveAspectRatio="none">
        <path d="M18 62 C 22 22, 96 8, 158 12 C 232 17, 288 34, 284 60 C 280 88, 196 102, 132 99
                 C 66 96, 20 84, 22 58" fill="none" stroke="${accentHex}" stroke-width="4"
              stroke-linecap="round"/></svg></span>`)
    .replace(/\/\/(.+?)\/\//g, (_, w) => `<em class="it">${w}</em>`);
}

// Swipe affordance. Both reference accounts carry one on every non-final slide;
// fond had none, and swipe-through to slide 3 is the metric Strategy v2 optimises for.
function swipeHtml(spec, slide, accentHex, fg) {
  if (slide.swipe === false || slide.index >= spec.slides.length) return '';
  const label = slide.swipeLabel || (slide.index === 1 ? 'Swipe' : '');
  return `<div class="swipe">
    <span class="pill" style="border-color:${accentHex};color:${accentHex}">
      <svg viewBox="0 0 34 16" class="arw"><path d="M2 8h27m-7-6 7 6-7 6" fill="none"
        stroke="${accentHex}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </span>${label ? `<span class="swipe-l" style="color:${fg}">${esc(label)}</span>` : ''}
  </div>`;
}

// Bracketed micro-label, top-right. Cheap editorial credibility.
function microLabelHtml(spec, slide, fgMuted) {
  const t = slide.microLabel || spec.pillar;
  if (!t) return '';
  return `<div class="micro" style="color:${fgMuted}">[&nbsp;${esc(t.toUpperCase())}&nbsp;]</div>`;
}

// Flat geometric ornament. Legal under 3.5 (flat vector, single colour, no shadow).
function ornamentHtml(slide, accentHex) {
  if (!slide.ornament) return '';
  const n = slide.ornament === 'starburst' ? 12 : 8;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI) / n - Math.PI / 2, r = i % 2 ? 9 : 26;
    return `${(30 + r * Math.cos(a)).toFixed(1)},${(30 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `<svg class="orn" viewBox="0 0 60 60"><polygon points="${pts}" fill="${accentHex}"/></svg>`;
}

// ---------- thread renderer ----------
// The continuous thread is a first-class parameterised element, never hand-placed art.
function threadHtml(spec, slide, canvasW = tokens.grid.canvas.w) {
  const t = spec.thread;
  if (!t) return '';
  const st = slide.threadState || { progress: 0 };
  const forbidden = new Set(t.forbidColors || []);
  const toneMap = { good: 'steelBlue', caution: 'harvestGold', loss: 'signalRed', neutral: 'inkGray' };
  let toneToken = toneMap[st.tone || 'neutral'] || 'inkGray';
  if (forbidden.has(toneToken)) toneToken = 'harvestGold';
  const onLight = slide.background === 'light';
  if (onLight && (tokens.colors[toneToken]?.backgroundRestriction === 'dark')) toneToken = 'steelBlue';

  const heightPct = t.heightPct || 12;
  const dark = slide.background === 'dark';
  const trackColor = dark ? C.offWhite : C.slateBlack;
  const total = spec.slides.length;

  if (t.kind === 'meter') {
    const segs = 5;
    const lit = Math.round(st.progress * segs);
    const cells = Array.from({ length: segs }, (_, i) => {
      const on = i < lit;
      // W1-3 Steel Blue, W4-5 Harvest Gold per the brief's thread spec
      let tok = i < 3 ? 'steelBlue' : 'harvestGold';
      if (forbidden.has(tok)) tok = 'harvestGold';
      if (onLight && tokens.colors[tok]?.backgroundRestriction === 'dark') tok = 'steelBlue';
      const fill = on ? C[tok] : 'transparent';
      return `<div class="seg" data-thread="1" style="background:${fill};border-color:${trackColor}33"></div>`;
    }).join('');
    return `<div class="thread meter" style="height:${heightPct}%">
      <div class="segs">${cells}</div>
      ${st.label ? `<div class="thread-label" style="color:${C.inkGray}">${esc(st.label)}</div>` : ''}
    </div>`;
  }

  if (t.kind === 'line') {
    // Exit-right / enter-left at an identical vertical position — QA Gate 3.2 measures
    // this. Unlike the other thread kinds, this one must genuinely touch both slide
    // edges, so it skips .thread's horizontal margin padding (see .thread.line in the
    // stylesheet) and its viewBox is sized to the real canvas width, not a fixed 1080.
    const y = 50;
    const w = Math.max(0, Math.min(1, st.progress)) * 100;
    const x2 = (w / 100) * canvasW;
    return `<div class="thread line" style="height:${heightPct}%">
      <svg width="100%" height="100%" viewBox="0 0 ${canvasW} 160" preserveAspectRatio="none">
        <line x1="0" y1="${y * 1.6}" x2="${canvasW}" y2="${y * 1.6}" stroke="${trackColor}" stroke-opacity="0.18" stroke-width="4"/>
        <line data-thread="1" x1="0" y1="${y * 1.6}" x2="${x2}" y2="${y * 1.6}" stroke="${C[toneToken]}" stroke-width="8" stroke-linecap="round"/>
      </svg>
    </div>`;
  }

  // accumulator / builder / clearing — a filling bar
  const w = Math.max(0, Math.min(1, st.progress)) * 100;
  const idx = slide.index, filled = Math.round(st.progress * total);
  return `<div class="thread bar" style="height:${heightPct}%">
    <div class="bar-track" style="background:${trackColor}1F">
      <div class="bar-fill" data-thread="1" style="width:${w}%;background:${C[toneToken]}"></div>
    </div>
    <div class="thread-label" style="color:${C.inkGray}">${esc(st.label || `${filled} of ${total}`)}</div>
  </div>`;
}

// Shared tone -> token resolver. A token can be legal in the palette and still be
// illegible on this ground (Harvest Gold is 2.01:1 on Off-White). Substitute rather
// than ship something unreadable; the gate reports any substitution.
// A token can be legal in the palette and still be illegible on this ground.
// Every accent paint goes through here so chrome can never disagree with content.
export function legalAccent(token, background) {
  const t = token || 'steelBlue';
  const r = tokens.colors[t]?.backgroundRestriction;
  if (r && r !== background) return background === 'light' ? 'steelBlue' : 'harvestGold';
  return t;
}

export function toneToken(tone, background) {
  const map = { good: 'fondGreen', caution: 'harvestGold', loss: 'signalRed', neutral: 'inkGray' };
  let tok = map[tone || 'neutral'] || 'inkGray';
  const restrict = tokens.colors[tok]?.backgroundRestriction;
  if (restrict && restrict !== background) {
    tok = background === 'light' ? (tone === 'good' ? 'fondGreen' : 'steelBlue') : 'steelBlue';
  }
  return tok;
}

// ---------- layout bodies ----------
function layoutHtml(spec, slide) {
  const c = slide.copy || {};
  const accent = C[legalAccent(slide.accent, slide.background)];
  const dark = slide.background === 'dark';
  const fg = dark ? C.offWhite : C.slateBlack;
  const layout = slide.layout || 'hero-statement';

  const eyebrow = c.eyebrow ? `<div class="eyebrow" style="color:${accent}">${esc(c.eyebrow)}</div>` : '';
  const cite = c.citation ? `<div class="cite" style="color:${C.inkGray}">${esc(c.citation)}</div>` : '';
  const body = c.body ? `<p class="body" style="color:${fg}">${rich(c.body, accent)}</p>` : '';

  switch (layout) {
    case 'hero-number': {
      const strike = c.strikethrough
        ? `<div class="strike" style="color:${C.inkGray}">${esc(c.strikethrough)}</div>` : '';
      return `${eyebrow}
        ${strike}
        <div class="hero-num" style="color:${fg}">${esc(c.heroNumber || '')}<span class="unit" style="color:${accent}">${esc(c.heroNumberUnit || '')}</span></div>
        ${c.heroNumberCaption ? `<div class="hero-cap" style="color:${fg}">${esc(c.heroNumberCaption)}</div>` : ''}
        ${c.headline ? `<h1 class="h-sub" style="color:${fg}">${rich(c.headline, accent)}</h1>` : ''}
        ${body}${cite}`;
    }
    case 'split-compare': {
      const [a, b] = c.items || [];
      return `${eyebrow}<h1 class="h-mid" style="color:${fg}">${rich(c.headline, accent)}</h1>
        <div class="split">
          <div class="col" style="border-color:${C.inkGray}55"><div class="col-i" style="color:${C.inkGray}">01</div><div class="col-t" style="color:${fg}">${esc(a || '')}</div></div>
          <div class="col" style="border-color:${accent}"><div class="col-i" style="color:${accent}">02</div><div class="col-t" style="color:${fg}">${esc(b || '')}</div></div>
        </div>${body}${cite}`;
    }
    case 'stack-list': {
      const items = (c.items || []).map((it, i) => `
        <li><span class="li-n" style="color:${accent}">${String(i + 1).padStart(2, '0')}</span>
        <span class="li-t" style="color:${fg}">${esc(it)}</span></li>`).join('');
      return `${eyebrow}<h1 class="h-mid" style="color:${fg}">${rich(c.headline, accent)}</h1>
        <ul class="stack">${items}</ul>${body}${cite}`;
    }
    case 'quadrant-card': {
      const q = (c.quadrants || []).map(x => {
        const col = C[toneToken(x.tone, slide.background)];
        return `<div class="quad" style="border-color:${col}">
          <div class="q-l" style="color:${C.inkGray}">${esc(x.label)}</div>
          <div class="q-v" style="color:${col}">${esc(x.value)}</div></div>`;
      }).join('');
      return `${eyebrow}<h1 class="h-mid" style="color:${fg}">${rich(c.headline, accent)}</h1>
        <div class="quads">${q}</div>${body}${cite}`;
    }
    case 'timeline': {
      const steps = (c.items || []).map((it, i, arr) => `
        <div class="step">
          <div class="dot" style="background:${i === arr.length - 1 ? accent : C.inkGray}"></div>
          <div class="step-t" style="color:${fg}">${esc(it)}</div>
        </div>`).join(`<div class="rule" style="background:${C.inkGray}55"></div>`);
      return `${eyebrow}<h1 class="h-mid" style="color:${fg}">${rich(c.headline, accent)}</h1>
        <div class="timeline">${steps}</div>${body}${cite}`;
    }
    case 'cta-card': {
      return `<div class="cta-wrap">
        <div class="wordmark" style="color:${C.offWhite}">fond</div>
        <h1 class="h-cta" style="color:${C.offWhite}">${rich(c.headline, C.harvestGold)}</h1>
        ${c.ctaLine ? `<div class="cta-line" style="color:${C.offWhite}">${esc(c.ctaLine)}</div>` : ''}
        ${c.sendTrigger ? `<div class="send" style="color:${C.offWhite}B3">${esc(c.sendTrigger)}</div>` : ''}
        <div class="arrow" style="color:${C.offWhite}B3">&#8595;</div>
      </div>`;
    }
    case 'diagram': {
      return `${eyebrow}<h1 class="h-mid" style="color:${fg}">${rich(c.headline, accent)}</h1>
        <div class="dia">${diagramHtml(slide.diagram, slide.background, accent)}</div>
        ${body}${cite}`;
    }
    default: { // hero-statement
      return `${eyebrow}<h1 class="h-hook" style="color:${fg}">${rich(c.headline, accent)}</h1>${body}${cite}`;
    }
  }
}

export function slideInner(spec, slide, canvasW = tokens.grid.canvas.w) {
  const dark = slide.background === 'dark';
  const isCta = (slide.layout === 'cta-card');
  const bg = isCta ? C.fondGreen : (dark ? C.slateBlack : C.offWhite);
  const chrome = isCta ? C.offWhite : C.inkGray;
  return `<div class="slide" data-index="${slide.index}" data-archetype="${slide.archetype}"
     data-layout="${slide.layout || 'hero-statement'}" data-declares-loss="${!!slide.declaresLoss}"
     style="background:${bg}">
    ${microLabelHtml(spec, slide, isCta ? C.offWhite + 'B3' : C.inkGray)}
    ${ornamentHtml(slide, isCta ? C.harvestGold : C[legalAccent(slide.accent, slide.background)])}
    <div class="content">${layoutHtml(spec, slide)}${swipeHtml(spec, slide, isCta ? C.offWhite : C[legalAccent(slide.accent, slide.background)], isCta ? C.offWhite : (dark ? C.offWhite : C.slateBlack))}</div>
    ${isCta ? '' : threadHtml(spec, slide, canvasW)}
    <div class="chrome">
      <div class="handle" style="color:${chrome}">${esc(tokens.grid.handle.text)}</div>
      <div class="counter" style="color:${chrome}">${slide.index}/${spec.slides.length}</div>
    </div>
  </div>`;
}

export function wrapSlideHtml(spec, slide, { debug = false, canvas = 'ig' } = {}) {
  const cv = tokens.grid.canvases?.[canvas] || tokens.grid.canvas;
  const g = { ...tokens.grid, canvas: cv }, T = tokens.type;
  // C1: g.canvas.w/h is the REAL target resolution (tokens.json > grid.canvases),
  // never scaled. Every other bare px constant below (margin, type, gaps, borders,
  // icon sizes) is written at the 1080-wide reference and gets multiplied by S —
  // see scalePxLiterals() at the bottom of this function. This is why the canvas
  // could go from 1080 to 1440 as a one-line tokens.json change: nothing here had
  // to be individually re-tuned.
  const S = scaleForWidth(g.canvas.w);
  const rawCss = `
*{margin:0;padding:0;box-sizing:border-box}
.slide{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}
.content{padding:${Math.round(g.margin*1.28)}px ${g.margin}px 0 ${g.margin}px;flex:1;display:flex;
  flex-direction:column;justify-content:center;gap:32px;min-height:0;padding-bottom:2%}

.eyebrow{font-family:${T.body.stack};font-weight:700;font-size:32px;
  letter-spacing:.15em;text-transform:uppercase}

.h-hook{font-family:${T.display.stack};font-weight:700;font-size:${T.display.sizes.hook.max}px;
  line-height:1.03;letter-spacing:-.015em;text-align:left;max-width:13.5ch;text-wrap:balance}
.h-mid{font-family:${T.display.stack};font-weight:700;font-size:64px;
  line-height:1.06;letter-spacing:-.012em;text-align:left;max-width:16ch;text-wrap:balance}
.h-sub{font-family:${T.display.stack};font-weight:700;font-size:${T.display.sizes.reframe.min}px;
  line-height:1.08;letter-spacing:-.012em;text-align:left;max-width:17ch;text-wrap:balance}
.h-cta{font-family:${T.display.stack};font-weight:700;font-size:${T.display.sizes.reframe.min}px;
  line-height:1.16;text-align:left;max-width:15ch;text-wrap:balance}

.hero-num{font-family:${T.numeric.stack};font-weight:700;font-size:${T.numeric.sizes.hero.max}px;
  line-height:.92;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.hero-cap{font-family:${T.body.stack};font-weight:500;font-size:44px;line-height:1.26;max-width:19ch}
.strike{font-family:${T.numeric.stack};font-weight:700;font-size:56px;text-decoration:line-through;
  text-decoration-thickness:5px;letter-spacing:-.02em}

.body{font-family:${T.body.stack};font-weight:400;font-size:40px;
  line-height:1.38;text-align:left;max-width:22ch}
.cite{font-family:${T.body.stack};font-weight:400;font-size:24px;
  line-height:1.35;letter-spacing:.01em}

.split{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.col{border:3px solid;border-radius:2px;padding:34px 30px;display:flex;flex-direction:column;gap:18px}
.col-i{font-family:${T.numeric.stack};font-weight:700;font-size:34px}
.col-t{font-family:${T.body.stack};font-weight:400;font-size:34px;line-height:1.34}

.stack{list-style:none;display:flex;flex-direction:column;gap:22px}
.stack li{display:grid;grid-template-columns:76px 1fr;align-items:baseline;gap:12px}
.li-n{font-family:${T.numeric.stack};font-weight:700;font-size:36px;font-variant-numeric:tabular-nums}
.li-t{font-family:${T.body.stack};font-weight:400;font-size:38px;line-height:1.32}

.quads{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.quad{border-left:6px solid;padding:26px 28px;display:flex;flex-direction:column;gap:12px}
.q-l{font-family:${T.body.stack};font-weight:700;font-size:32px;letter-spacing:.08em;text-transform:uppercase}
.q-v{font-family:${T.numeric.stack};font-weight:700;font-size:52px;line-height:1.16;font-variant-numeric:tabular-nums}

.timeline{display:flex;align-items:flex-start;gap:16px;padding:8px 0}
.step{display:flex;flex-direction:column;gap:20px;flex:1}
.dot{width:28px;height:28px;border-radius:50%;flex:none}
.step-t{font-family:${T.body.stack};font-weight:400;font-size:33px;line-height:1.28}
.rule{height:3px;flex:0 0 40px;margin-top:12px}

.cta-wrap{display:flex;flex-direction:column;gap:22px}
.wordmark{font-family:${T.body.stack};font-weight:500;font-size:44px;letter-spacing:.02em}
.cta-line{font-family:${T.body.stack};font-weight:500;font-size:${T.body.sizes.body.max}px;line-height:1.34;max-width:24ch}
.send{font-family:${T.body.stack};font-weight:400;font-size:30px;line-height:1.34;max-width:24ch}
.arrow{font-family:${T.body.stack};font-size:44px;line-height:1.2}

.thread{padding:0 ${g.margin}px;display:flex;flex-direction:column;justify-content:center;gap:14px;flex:none}
.thread.line{padding:0}
.segs{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.seg{height:16px;border:3px solid;border-radius:2px}
.thread-label{font-family:${T.body.stack};font-weight:400;font-size:${Math.round(22 * S)}px;letter-spacing:.06em;text-transform:uppercase}
.bar-track{height:16px;border-radius:2px;overflow:hidden}
.bar-fill{height:100%}

/* C1 follow-up: chrome font sizes are calibrated at grid.referenceCanvasWidth like
   every other px constant, so they must be scaled by S too. They were not, which
   meant the 1440 canvas rendered the handle, counter, micro-label and thread label
   proportionally SMALLER than designed - a real regression, caught by G5.3. */
.chrome{display:flex;justify-content:space-between;align-items:flex-end;
  padding:0 ${g.margin}px ${Math.round(g.margin * 0.5)}px ${g.margin}px;flex:none}
.handle,.counter{font-family:${T.body.stack};font-weight:400;font-size:${Math.round(g.handle.size * S)}px;letter-spacing:.04em}


${diagramCss(T)}
/* --- reference-derived chrome: swipe affordance, micro-label, ornament, annotation --- */
.micro{position:absolute;top:${g.margin}px;right:${g.margin}px;
  font-family:${T.body.stack};font-weight:500;font-size:${Math.round(22 * S)}px;letter-spacing:.22em}
.orn{position:absolute;top:${g.margin - 6}px;left:${g.margin}px;width:52px;height:52px}
.swipe{display:flex;align-items:center;gap:16px;flex:none;margin-top:6px}
.pill{display:inline-flex;align-items:center;justify-content:center;width:78px;height:44px;
  border:3px solid;border-radius:999px}
.arw{width:34px;height:16px;display:block}
.swipe-l{font-family:${T.display.stack};font-style:italic;font-weight:400;font-size:29px;opacity:.85}
.pop{font-weight:inherit}
.circled{position:relative;display:inline-block;white-space:nowrap}
.anno{position:absolute;left:-7%;top:-16%;width:114%;height:132%;overflow:visible;pointer-events:none}
.it{font-family:${T.display.stack};font-style:italic}
.unit{font-size:.62em}
.dia{width:100%;display:flex;align-items:center;justify-content:center}
.diagram{display:block;max-width:100%}

${debug ? `
.slide::after{content:"";position:absolute;inset:${g.margin}px;outline:2px dashed ${C.signalRed};pointer-events:none}
.content *{outline:1px solid ${C.steelBlue}66}` : ''}
`;
  // Scale every bare px literal above (margin, type, gaps, borders, icon/svg box
  // sizes) from the 1080-wide reference up to this canvas's real width. Values
  // already computed FROM g.canvas.w (e.g. threadHtml's viewBox) contain no
  // trailing "px" and are untouched — they are already sized to the real canvas.
  //
  // FONT_FACES IS DELIBERATELY NOT IN rawCss AND MUST NEVER BE PUT BACK.
  //
  // The fonts are inlined as base64, and base64's alphabet includes the letters
  // p and x and every digit. So a blind /(\d+)px/g pass over a string containing
  // them will match a run like "...33px..." INSIDE the font binary and rewrite it,
  // corrupting the face. Chromium then reports ERR_INVALID_URL and
  // document.fonts.load() throws a bare "NetworkError" that names nothing.
  //
  // Dormant while the canvas was 1080 (S = 1, so every replacement was
  // byte-identical); live the moment C1 moved the canvas to 1440. Whether it
  // fires depends on whether a given font's base64 happens to contain that
  // pattern - DM Sans 400 and Playfair 700-italic do, the other six do not.
  const scaledCss = rawCss.replace(/(-?\d+(?:\.\d+)?)px/g,
    (_, n) => `${Math.round(parseFloat(n) * S * 100) / 100}px`);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{width:${g.canvas.w}px;height:${g.canvas.h}px;overflow:hidden}
${FONT_FACES}
${scaledCss}
/* The slide must be EXACTLY the canvas. It never had an explicit height: as a
   block-level flex column it took its content's height, which happened to equal
   1350 while the canvas was 1080x1350, so nothing looked wrong. C1 moved the
   canvas to 1440x1800 and the content kept ending at 1350, leaving the bottom
   25% of every slide as the browser's default white - which is also why G2.2
   reports pure #FFF covering a quarter of the frame. Written here, after
   scaledCss and from g.canvas directly, because these two values are the real
   target resolution and must never go through the reference-scale pass. */
.slide{width:${g.canvas.w}px;height:${g.canvas.h}px}
</style></head><body>${slideInner(spec, slide, g.canvas.w)}</body></html>`;
}
