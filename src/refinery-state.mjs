// refinery-state.mjs - resumable state for the Refinery lane (state/refinery.json).
//
// Why this file exists: a refine run is long, calls a model, and gets stopped when the
// usage window runs low. If state is half-written when it stops, the next run cannot
// tell what finished. So every write goes to a temp file in the SAME directory and is
// renamed over the target: rename is atomic on one filesystem, so a reader sees the old
// state or the new state, never a torn one. All updates are immutable (return copies).
import fs from 'node:fs';
import path from 'node:path';
import { STATE_DIR } from './state.mjs';

export const REFINERY_FILE = path.join(STATE_DIR, 'refinery.json');

/** Refinery pipeline stages for one post, in order. rejected is terminal. */
export const STAGES = ['queued', 'designing', 'copy', 'critic', 'vault', 'picked', 'rejected'];

const empty = () => ({ updatedAt: null, posts: {} });

export function loadRefinery(file = REFINERY_FILE) {
  try { return { ...empty(), ...JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch { return empty(); }
}

export function saveRefinery(state, file = REFINERY_FILE) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

/** Returns a new state with post `n` moved to `stage`; `extra` merges into its row. */
export function setPostStage(state, n, stage, extra = {}) {
  if (!STAGES.includes(stage)) throw new Error(`unknown refinery stage "${stage}" (expected ${STAGES.join('|')})`);
  const key = String(n);
  const prev = state.posts?.[key] ?? { rounds: 0, bestScores: null, lastError: null };
  const now = new Date().toISOString();
  return { ...state, posts: { ...state.posts, [key]: { ...prev, ...extra, stage, updatedAt: now } } };
}
