# SETUP-STATUS.md — verified on Adi's machine, 2026-09-06

Recorded from an actual run in the folder, not assumed. Re-run the checks below and update
this file if anything changes.

## Verified working

| Check | Result |
|---|---|
| Node | v22.23.2 |
| npm | 10.9.8 |
| Python | 3.10.12 |
| Pillow / numpy | 12.3.0 / 2.2.6 |
| `npm install` | ✅ all deps resolved, incl. playwright + ajv + fontsource |
| `python3 tools/contrast_audit.py` | ✅ reproduces the palette table exactly |
| `tokens.json` + `carousel.schema.json` | ✅ parse clean — 7 colours, 2 canvases, 4 gate configs |
| Both fixture specs | ✅ 8 slides each, marked `reconstructed-fixture` |
| All 46 project files | ✅ present |

## The one blocker: Chromium

`npx playwright install chromium` fails with `Download failure, code=1`.

**This was run inside the Claude bridge VM, whose network egress is restricted.** It is very
likely NOT a problem when you run Claude Code on the Mac directly. Try it there first.

### If it fails on the Mac too, in order of preference

1. **Point at a Chrome you already have.** The renderer takes an env override:
   ```bash
   FOND_CHROMIUM="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ./run.sh specs/post-5.json
   ```
   Any recent Chrome or Chromium works — the renderer only needs headless screenshots.

2. **Install the browser via Homebrew** and point at that:
   ```bash
   brew install --cask chromium
   FOND_CHROMIUM="/Applications/Chromium.app/Contents/MacOS/Chromium" ./run.sh specs/post-5.json
   ```

3. **Retry the Playwright download on a different network.** It pulls from
   `playwright.azureedge.net`, which some networks block.

**This is exactly BACKLOG P0.3.** The current `render.mjs` hardcodes a Linux container path
as its default with `FOND_CHROMIUM` as the override, which is backwards for your machine.
Fix it to resolve in this order: `FOND_CHROMIUM` env → Playwright's own resolver → a clear
error naming both. That is a 10-minute job and should be the first thing you do.

## Not yet verifiable here

- `npm test` (needs Chromium — it renders broken fixtures to prove the gates catch them)
- `./run.sh` on either fixture (needs Chromium)
- Slice 1 coverage report — `briefs/` is empty, see `briefs/README.txt`
- Vision critic — `baseline/` is empty, see `baseline/README.txt`

Once Chromium resolves, the full verify loop from CLAUDE.md §5 should pass:
`npm test` → 10/10, and both fixtures → verdict PASS.
