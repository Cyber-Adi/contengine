// validate.mjs — spec must pass carousel.schema.json before anything renders.
// A malformed spec used to render silently wrong; this fails loudly instead,
// naming the offending JSON path (BACKLOG P0.1).
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import { ROOT } from './slide-html.mjs';

const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'carousel.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateFn = ajv.compile(schema);

/** Throws with every offending instancePath if `spec` does not match the schema. */
export function validateSpec(spec) {
  if (validateFn(spec)) return;
  const lines = validateFn.errors.map(
    (e) => `  ${e.instancePath || '/'} ${e.message} (${JSON.stringify(e.params)})`
  );
  throw new Error(`spec failed carousel.schema.json validation:\n${lines.join('\n')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('usage: node src/validate.mjs specs/post-N.json');
    process.exit(2);
  }
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  try {
    validateSpec(spec);
    console.log(`valid: ${specPath}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
