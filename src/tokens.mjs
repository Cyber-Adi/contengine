// tokens.mjs — the single load point for the design contract.
// Both the renderer and the diagram layer read from here, so neither imports the other.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens.json'), 'utf8'));
export const C = Object.fromEntries(Object.entries(tokens.colors).map(([k, v]) => [k, v.hex]));
export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// C1: every bare px constant in slide-html.mjs/diagrams.mjs/qa.py is calibrated at
// grid.referenceCanvasWidth (1080). scaleForWidth() converts that to a ratio of
// whatever canvas is actually rendering, so a future canvas resize is a tokens.json
// edit, not a re-tune of every constant. See tokens.json > grid.referenceNote.
export const REFERENCE_CANVAS_WIDTH = tokens.grid.referenceCanvasWidth || 1080;
export const scaleForWidth = (w) => w / REFERENCE_CANVAS_WIDTH;
