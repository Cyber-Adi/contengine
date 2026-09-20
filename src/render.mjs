// render.mjs — Playwright renderer. Supersamples at 2x, then Lanczos-downsamples
// (downsample.py) so Playfair at 96pt is typeset, not aliased.
// Also collects Gate 1 structural measurements in-browser BEFORE the screenshot.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { wrapSlideHtml, tokens, ROOT } from './slide-html.mjs';
import { scaleForWidth } from './tokens.mjs';
import { validateSpec } from './validate.mjs';

const G = tokens.grid;

// Fonts are inlined, so the renderer needs no network at all. Blocking
// background traffic makes runs faster, offline-safe and deterministic.
const LAUNCH_ARGS = ['--font-render-hinting=none', '--disable-lcd-text',
  '--disable-background-networking', '--disable-component-update',
  '--disable-default-apps', '--no-first-run', '--disable-sync',
  '--safebrowsing-disable-auto-update', '--metrics-recording-only'];

// Resolution order (BACKLOG P0.3): FOND_CHROMIUM env -> Playwright's own
// resolver (its managed/bundled browser) -> a clear error naming both.
async function launchChromium() {
  const override = process.env.FOND_CHROMIUM;
  if (override) {
    if (!fs.existsSync(override)) {
      throw new Error(`FOND_CHROMIUM is set to '${override}' but that file does not exist.`);
    }
    return chromium.launch({ executablePath: override, args: LAUNCH_ARGS });
  }
  try {
    return await chromium.launch({ args: LAUNCH_ARGS });
  } catch (e) {
    throw new Error(
      `Could not launch Chromium.\n` +
      `  1. FOND_CHROMIUM is not set.\n` +
      `  2. Playwright's own resolver failed: ${String(e.message).split('\n')[0]}\n` +
      `Fix: run 'npx playwright install chromium', or set FOND_CHROMIUM to an existing Chrome/Chromium binary.`
    );
  }
}

export async function renderCarousel(spec, { outDir, debug = false, canvas = 'ig' } = {}) {
  validateSpec(spec);
  const CV = tokens.grid.canvases?.[canvas] || tokens.grid.canvas;
  // C1: G.margin is a reference-width (1080) constant; slide-html.mjs scales it up
  // to this canvas's real width when it builds the CSS, so the live-DOM check below
  // must compare against that same scaled value or every render fails its own margin.
  const marginPx = Math.round(G.margin * scaleForWidth(CV.w));
  outDir = outDir || path.join(ROOT, 'out', `post-${spec.postNumber}`);
  const slidesDir = path.join(outDir, canvas === 'ig' ? 'slides' : `slides-${canvas}`);
  fs.mkdirSync(slidesDir, { recursive: true });

  const browser = await launchChromium();
  const ctx = await browser.newContext({
    viewport: { width: CV.w, height: CV.h },
    deviceScaleFactor: G.supersample,
  });
  const page = await ctx.newPage();
  // Block the network so a font can never silently fall back to a system face.
  // data: URIs are our inlined fonts; about:blank is the document setContent()
  // navigates to before injecting HTML, and aborting it kills the page itself.
  await page.route('**/*', (route) => {
    const u = route.request().url();
    return (u.startsWith('data:') || u.startsWith('about:')) ? route.continue() : route.abort();
  });
  const measurements = [];

  for (const slide of spec.slides) {
    const html = wrapSlideHtml(spec, slide, { debug, canvas });
    await page.setContent(html, { waitUntil: 'load' });

    // Fonts must be REAL. A silent fallback to a system serif is the #1 way this
    // output looks amateur and it fails quietly. Assert before we screenshot.
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load("700 96px 'Playfair Display'"),
        document.fonts.load("400 32px 'DM Sans'"),
        document.fonts.load("700 140px 'Space Grotesk'"),
      ]);
      await document.fonts.ready;
    });
    const fontStatus = await page.evaluate(() => ({
      playfair: document.fonts.check("700 96px 'Playfair Display'"),
      dmsans: document.fonts.check("400 32px 'DM Sans'"),
      grotesk: document.fonts.check("700 140px 'Space Grotesk'"),
    }));

    // ---- Gate 1 structural measurements, taken in the live DOM ----
    const m = await page.evaluate((margin) => {
      const out = { overflow: [], marginViolations: [], numeralFonts: [], accents: new Set(), textBoxes: [] };
      const root = document.querySelector('.slide');
      const rb = root.getBoundingClientRect();
      const walk = document.querySelectorAll('.content *, .content svg text, .thread-label, .handle, .counter');
      for (const el of walk) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;

        const clips = cs.overflow !== 'visible' || cs.overflowY !== 'visible' || cs.overflowX !== 'visible';
        const overH = el.scrollHeight - el.clientHeight, overW = el.scrollWidth - el.clientWidth;
        if (clips && (overH > 2 || overW > 2)) {
          out.overflow.push({ cls: String(el.className?.baseVal ?? el.className), tag: el.tagName, sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth, reason: 'ancestor hides overflow' });
        }
        // text escaping the slide itself is always a hard clip (.slide is overflow:hidden)
        if (r.bottom > rb.bottom + 1 || r.top < rb.top - 1 || r.right > rb.right + 1 || r.left < rb.left - 1) {
          out.overflow.push({ cls: String(el.className?.baseVal ?? el.className), tag: el.tagName, sh: Math.round(r.height), ch: 0, sw: Math.round(r.width), cw: 0, reason: 'escapes the slide canvas' });
        }
        const inDiagram = el.closest && el.closest('.diagram');
        const isThread = inDiagram || el.closest('.thread') || el.closest('.swipe') || el.closest('.micro')
          || (el.classList && (el.classList.contains('handle') || el.classList.contains('counter')));
        if (!isThread) {
          if (r.left < rb.left + margin - 1 || r.right > rb.right - margin + 1 ||
              r.top < rb.top + margin - 1 || r.bottom > rb.bottom - margin + 1) {
            out.marginViolations.push({ cls: String(el.className?.baseVal ?? el.className), l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) });
          }
        }
        const txt = (el.textContent || '').trim();
        if (txt && el.children.length === 0) {
          const isSvgText = (el.namespaceURI || '').includes('svg');
          const paint = isSvgText ? (el.getAttribute('fill') || cs.fill || cs.color) : cs.color;
          out.textBoxes.push({ cls: (typeof el.className === 'string' ? el.className : (el.getAttribute('class') || 'svg-text')), svg: isSvgText, text: txt.slice(0, 80), words: txt.split(/\s+/).filter(Boolean).length, chars: txt.length, color: paint, size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight) || 400, family: cs.fontFamily,
            surface: (el.closest && el.closest('[data-surface]')?.getAttribute('data-surface')) || null,
            box: { x: Math.round(r.left - rb.left), y: Math.round(r.top - rb.top), w: Math.round(r.width), h: Math.round(r.height) },
            lines: (() => {   // real line boxes via Range rects — how the text actually broke
              try {
                const rg = document.createRange(); rg.selectNodeContents(el);
                const rects = [...rg.getClientRects()];
                if (rects.length < 2) return null;
                const out = []; let last = null;
                for (const rc of rects) {
                  if (last === null || Math.abs(rc.top - last) > 4) { out.push(''); last = rc.top; }
                }
                // recover per-line text by splitting on line-box tops
                const words = txt.split(/\s+/); const per = Math.ceil(words.length / out.length);
                return out.map((_, k) => words.slice(k * per, (k + 1) * per).join(' '));
              } catch (e) { return null; }
            })() });
          // numerals must be Space Grotesk
          if (/\d/.test(txt) && !/Space Grotesk/.test(cs.fontFamily) && !el.classList.contains('cite')
              && !el.classList.contains('counter') && !el.classList.contains('body')) {
            out.numeralFonts.push({ cls: String(el.className?.baseVal ?? el.className), text: txt.slice(0, 60), family: cs.fontFamily });
          }
        }
        if (cs.color) out.accents.add(cs.color);
      }
      out.accents = [...out.accents];
      const cb = document.querySelector('.content')?.getBoundingClientRect();
      if (cb) out.contentBox = { top: Math.round(cb.top - rb.top), bottom: Math.round(cb.bottom - rb.top),
                                 height: Math.round(cb.height) };
      // Gate 3.2 edge continuity (P1.2) needs the thread rail's real pixel band,
      // not a guessed proportion of canvas height.
      const tb = document.querySelector('.thread')?.getBoundingClientRect();
      if (tb) out.threadBox = { top: Math.round(tb.top - rb.top), bottom: Math.round(tb.bottom - rb.top) };
      return out;
    }, marginPx);

    const big = path.join(slidesDir, `_2x_${String(slide.index).padStart(2, '0')}.png`);
    const final = path.join(slidesDir, `slide-${String(slide.index).padStart(2, '0')}.png`);
    await page.screenshot({ path: big, clip: { x: 0, y: 0, width: CV.w, height: CV.h } });

    measurements.push({ index: slide.index, archetype: slide.archetype, layout: slide.layout,
      declaresLoss: !!slide.declaresLoss, background: slide.background, fontStatus, ...m, file: final });
  }

  await browser.close();

  // Lanczos downsample 2x supersample -> CV.w x CV.h (e.g. 2880x3600 -> 1440x1800 for ig)
  execFileSync('python3', [path.join(ROOT, 'tools', 'downsample.py'), slidesDir,
    String(CV.w), String(CV.h)], { stdio: 'inherit' });

  fs.writeFileSync(path.join(outDir, canvas === 'ig' ? 'measurements.json' : `measurements-${canvas}.json`), JSON.stringify(measurements, null, 2));
  return { outDir, slidesDir, measurements };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const specPath = process.argv[2];
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const canvasArg = (process.argv.find(a => a.startsWith('--canvas=')) || '').split('=')[1] || 'ig';
  const r = await renderCarousel(spec, { debug: process.argv.includes('--debug'), canvas: canvasArg });
  console.log(`rendered ${spec.slides.length} slides (${canvasArg}) -> ${r.slidesDir}`);
}
