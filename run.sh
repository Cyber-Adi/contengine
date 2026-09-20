#!/usr/bin/env bash
# Render -> QA -> contact sheet for one spec.  ./run.sh specs/post-49.json
set -euo pipefail
SPEC="${1:?usage: ./run.sh specs/post-N.json}"
N=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['postNumber'])" "$SPEC")
node src/validate.mjs "$SPEC"
node src/gtm-check.mjs "$SPEC"        # gate 6 - message conformance, before any pixels are spent
node src/render.mjs "$SPEC"
python3 tools/contact_sheet.py "out/post-$N/slides"
python3 tools/qa.py "out/post-$N"
node src/seed-ledger.mjs >/dev/null   # keep the ledger honest after every render
