// critic.mjs -- vision critic CLI. Prepares a packet, records a validated critique.
//
//   node tools/critic.mjs prepare 5        write out/post-5/critic-packet.txt and print it
//   node tools/critic.mjs record 5 --stop 3 --stand 4 --arrive 4 --save 4 --family 5 \
//        --note stop:1:"headline is five lines of serif"
//   node tools/critic.mjs status           which approved posts have no critique yet
//
// Report-only: it never blocks a post. A critique under 4 is a finding for Adi, and any
// Design System change it points toward is a hard stop that goes to him, not an edit.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './../src/tokens.mjs';
import { reconcile, loadLedger, atStage } from './../src/state.mjs';
import { DIMENSIONS, PASS_MARK, validateCritique, parseNote, packetText } from './../src/critic.mjs';

const FILE = path.join(ROOT, 'state', 'critic.json');
const load = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return { posts: {} }; } };
const [cmd, arg, ...rest] = process.argv.slice(2);
const flags = (name) => rest.flatMap((v, i) => (v === `--${name}` ? [rest[i + 1]] : []));

if (cmd === 'prepare' && arg) {
  const dir = path.join(ROOT, 'out', `post-${arg}`);
  for (const f of ['contact-sheet.png', 'thumbs.png']) {
    if (!fs.existsSync(path.join(dir, f))) { console.error(`missing out/post-${arg}/${f} -- render it first (npm run tap)`); process.exit(2); }
  }
  const text = packetText(arg);
  fs.writeFileSync(path.join(dir, 'critic-packet.txt'), text);
  process.stdout.write(text);
} else if (cmd === 'record' && arg) {
  const scores = Object.fromEntries(Object.keys(DIMENSIONS).map((k) => [k, flags(k)[0] === undefined ? undefined : Number(flags(k)[0])]));
  const notes = flags('note');
  const findings = notes.map(parseNote);
  if (findings.some((f) => f === null)) { console.error('--note must look like  dimension:slide:element'); process.exit(2); }
  const v = validateCritique({ scores, findings });
  if (!v.ok) { v.errors.forEach((e) => console.error(`  ${e}`)); process.exit(2); }
  const db = load();
  db.posts[arg] = { post: Number(arg), scoredAt: new Date().toISOString().slice(0, 10), scores, findings };
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2) + '\n');
  const low = Object.entries(scores).filter(([, s]) => s < PASS_MARK).map(([k, s]) => `${k}=${s}`);
  console.log(`post-${arg} recorded. weakest: ${v.weakest}=${scores[v.weakest]}${low.length ? `  under ${PASS_MARK}: ${low.join(', ')}` : '  all at or above the mark'}`);
} else if (cmd === 'status') {
  const db = load();
  const ready = atStage('approved', reconcile(loadLedger())).filter((p) => p.provenance !== 'reconstructed-fixture');
  const todo = ready.filter((p) => !db.posts[p.post]);
  console.log(`critiqued: ${Object.keys(db.posts).length}   approved and not yet critiqued: ${todo.length}`);
  todo.forEach((p) => console.log(`  node tools/critic.mjs prepare ${p.post}`));
} else {
  console.error('usage: critic.mjs prepare <N> | record <N> --stop N --stand N --arrive N --save N --family N [--note dim:slide:element]... | status');
  process.exit(2);
}
