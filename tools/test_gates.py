#!/usr/bin/env python3
"""Fixture harness: every gate must catch its OWN failure mode.

A gate that passes a known-bad slide is worse than no gate, because it
manufactures confidence. This is the pass^3 requirement from the ECC plan.

Each fixture mutates the good spec in exactly one way and asserts the
expected gate fires. Run: python3 tools/test_gates.py
"""
import json, os, subprocess, sys, copy, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOOD = json.load(open(os.path.join(ROOT, "specs", "post-49.json")))

FIXTURES = []


def fixture(name, gate):
    def deco(fn):
        FIXTURES.append((name, gate, fn)); return fn
    return deco


@fixture("banned-word", "G1.4-copy")
def f_banned(s):
    s["slides"][0]["copy"]["body"] = "PantryPal tracks this for you automatically."


@fixture("body-too-long", "G1.4-copy")
def f_long(s):
    s["slides"][0]["copy"]["body"] = " ".join(["word"] * 55)


@fixture("decorative-signal-red", "G2.4-signalred")
def f_red(s):
    # Signal Red on a slide that declares no loss figure — the one palette
    # rule that is about meaning rather than looks.
    s["slides"][3]["accent"] = "signalRed"
    s["slides"][3]["declaresLoss"] = False


@fixture("thread-goes-backwards", "G3-thread")
def f_thread_back(s):
    s["slides"][4]["threadState"]["progress"] = 0.1


@fixture("thread-never-completes", "G3-thread")
def f_thread_incomplete(s):
    for sl in s["slides"]:
        sl["threadState"]["progress"] = min(sl["threadState"]["progress"], 0.5)


@fixture("adjacent-same-layout", "X-distinct")
def f_same_layout(s):
    s["slides"][3]["layout"] = s["slides"][2]["layout"]
    s["slides"][3]["copy"] = copy.deepcopy(s["slides"][2]["copy"])
    s["slides"][3]["background"] = s["slides"][2]["background"]


@fixture("slide2-not-standalone", "G4.4-slide2")
def f_slide2(s):
    s["slides"][1]["archetype"] = "value"


@fixture("empty-thumbnail", "G4.2-thumb")
def f_thin(s):
    # A hook so thin it vanishes at feed scale.
    s["slides"][0]["copy"] = {"headline": "Hi"}
    s["slides"][0]["layout"] = "hero-statement"


def run_one(name, gate, mutate):
    spec = copy.deepcopy(GOOD)
    spec["postNumber"] = 9000
    mutate(spec)
    sp = os.path.join(ROOT, "specs", "post-9000.json")
    json.dump(spec, open(sp, "w"), indent=2)
    out = os.path.join(ROOT, "out", "post-9000")
    shutil.rmtree(out, ignore_errors=True)
    r = subprocess.run(["node", os.path.join(ROOT, "src", "render.mjs"), sp],
                       capture_output=True, text=True, cwd=ROOT)
    if r.returncode != 0:
        return False, f"render failed: {r.stderr.strip().splitlines()[-1][:90] if r.stderr else '?'}"
    subprocess.run(["python3", os.path.join(ROOT, "tools", "qa.py"), out],
                   capture_output=True, text=True, cwd=ROOT)
    rep = json.load(open(os.path.join(out, "qa-report.json")))
    hit = [f for f in rep["findings"] if f["gate"] == gate and f["level"] == "FAIL"]
    return (bool(hit), hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")


def synthetic_bgrestrict():
    """G2.6 can't be reached through a spec because the renderer SUBSTITUTES an
    illegal token before it ever paints. That is the right behaviour, so the gate
    is tested directly against a synthetic Harvest-Gold-on-Off-White slide."""
    from PIL import Image, ImageDraw
    import qa as Q
    out = os.path.join(ROOT, "out", "post-9001")
    sd = os.path.join(out, "slides")
    os.makedirs(sd, exist_ok=True)
    g = Q.TOKENS["grid"]["canvas"]
    im = Image.new("RGB", (g["w"], g["h"]), Q.hex2rgb(Q.COLORS["offWhite"]))
    ImageDraw.Draw(im).rectangle([100, 300, 980, 800], fill=Q.hex2rgb(Q.COLORS["harvestGold"]))
    im.save(os.path.join(sd, "slide-01.png"))
    meas = [dict(index=1, archetype="hook", layout="hero-statement", background="light",
                 declaresLoss=False, fontStatus=dict(playfair=True, dmsans=True, grotesk=True),
                 overflow=[], marginViolations=[], numeralFonts=[], accents=[], textBoxes=[])]
    json.dump(meas, open(os.path.join(out, "measurements.json"), "w"))
    findings = []
    Q.gate2({"slides": []}, meas, sd, findings)
    hit = [f for f in findings if f["gate"] == "G2.6-bgrestrict" and f["level"] == "FAIL"]
    shutil.rmtree(out, ignore_errors=True)
    return bool(hit), (hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")


def substitution_holds():
    """The complementary check: given a caution tone on a light ground, the
    renderer must substitute a legal token rather than emit Harvest Gold."""
    r = subprocess.run(["node", "-e",
        "import('./src/slide-html.mjs').then(m=>{"
        "const a=m.toneToken('caution','light'), b=m.toneToken('caution','dark');"
        "console.log(JSON.stringify({light:a,dark:b}))})"],
        capture_output=True, text=True, cwd=ROOT)
    try:
        v = json.loads(r.stdout.strip().splitlines()[-1])
    except Exception:
        return False, f"could not evaluate: {r.stderr.strip()[:70]}"
    ok = v["light"] != "harvestGold" and v["dark"] == "harvestGold"
    return ok, f"caution -> {v['light']} on light, {v['dark']} on dark"


def schema_rejects_bad_archetype():
    """P0.1: a spec with an invalid enum value must be REJECTED before it ever
    reaches the browser, not rendered and then silently wrong."""
    spec = copy.deepcopy(GOOD)
    spec["postNumber"] = 9002
    spec["slides"][0]["archetype"] = "not-a-real-archetype"
    sp = os.path.join(ROOT, "specs", "post-9002.json")
    json.dump(spec, open(sp, "w"), indent=2)
    out = os.path.join(ROOT, "out", "post-9002")
    shutil.rmtree(out, ignore_errors=True)
    r = subprocess.run(["node", os.path.join(ROOT, "src", "render.mjs"), sp],
                       capture_output=True, text=True, cwd=ROOT)
    rejected = r.returncode != 0
    not_rendered = not os.path.exists(out)
    names_path = "/slides/0/archetype" in (r.stderr or "")
    os.path.exists(sp) and os.remove(sp)
    shutil.rmtree(out, ignore_errors=True)
    ok = rejected and not_rendered and names_path
    if ok:
        msg = "rejected before render, path named"
    elif not rejected:
        msg = "spec was rendered instead of rejected"
    elif not not_rendered:
        msg = "rejected but out/ was still written"
    else:
        msg = f"rejected but didn't name the path: {(r.stderr or '').strip()[:60]}"
    return ok, msg


def synthetic_ocr_illegible():
    """G4.5 (P1.3) can't be reached through a normal spec mutation — it depends
    on actual rendered pixels matching the claimed copy, not a spec field. Fake
    a slide-01.png that has plenty of ink (clears G4.2/G4.3) but no real hook
    glyphs at all, against a spec claiming a real headline the pixels don't
    contain."""
    from PIL import Image, ImageDraw
    import random
    import qa as Q
    out = os.path.join(ROOT, "out", "post-9006")
    sd = os.path.join(out, "slides")
    os.makedirs(sd, exist_ok=True)
    g = Q.TOKENS["grid"]["canvas"]
    w, h = g["w"], g["h"]
    im = Image.new("RGB", (w, h), Q.hex2rgb(Q.COLORS["offWhite"]))
    d = ImageDraw.Draw(im)
    rnd = random.Random(9006)
    ink = Q.hex2rgb(Q.COLORS["slateBlack"])
    for _ in range(4000):  # noise, not glyphs — enough ink, no legible word
        x, y = rnd.randint(0, w - 8), rnd.randint(0, h - 8)
        d.rectangle([x, y, x + 6, y + 6], fill=ink)
    im.save(os.path.join(sd, "slide-01.png"))
    spec = {"slides": [{"index": 1, "copy": {"headline": "UNMISTAKABLE PROOF"}}]}
    findings = []
    Q.gate4(spec, sd, findings)
    hit = [f for f in findings if f["gate"] == "G4.5-ocr" and f["level"] == "FAIL"]
    shutil.rmtree(out, ignore_errors=True)
    return bool(hit), (hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")


def line_thread_continuity_holds():
    """P1.2: switching a spec's thread to kind='line' and rendering through the
    real pipeline must not raise any G3.2 edge-continuity failure — this is the
    'pass after the fix' half of the before/after proof, made repeatable."""
    spec = copy.deepcopy(GOOD)
    spec["postNumber"] = 9003
    spec["thread"]["kind"] = "line"
    sp = os.path.join(ROOT, "specs", "post-9003.json")
    json.dump(spec, open(sp, "w"), indent=2)
    out = os.path.join(ROOT, "out", "post-9003")
    shutil.rmtree(out, ignore_errors=True)
    r = subprocess.run(["node", os.path.join(ROOT, "src", "render.mjs"), sp],
                        capture_output=True, text=True, cwd=ROOT)
    if r.returncode != 0:
        os.remove(sp)
        shutil.rmtree(out, ignore_errors=True)
        last = r.stderr.strip().splitlines()[-1][:90] if r.stderr else "?"
        return False, f"render failed: {last}"
    subprocess.run(["python3", os.path.join(ROOT, "tools", "qa.py"), out],
                    capture_output=True, text=True, cwd=ROOT)
    rep = json.load(open(os.path.join(out, "qa-report.json")))
    edge_fails = [f for f in rep["findings"] if f["gate"] == "G3.2-edge" and f["level"] == "FAIL"]
    os.remove(sp)
    shutil.rmtree(out, ignore_errors=True)
    ok = not edge_fails
    msg = "no edge-continuity failures across the carousel" if ok else edge_fails[0]["msg"][:78]
    return ok, msg


def synthetic_edge_discontinuity():
    """The other half of the proof: two adjacent slide images whose thread rail
    sits at different y offsets at the shared edge must fail G3.2 directly —
    this is the 'fails before the fix' behaviour, pinned as a fixture so it
    can't silently regress back to a gate that never fires."""
    from PIL import Image, ImageDraw
    import qa as Q
    out = os.path.join(ROOT, "out", "post-9004")
    sd = os.path.join(out, "slides")
    os.makedirs(sd, exist_ok=True)
    g = Q.TOKENS["grid"]["canvas"]
    w, h = g["w"], g["h"]
    bg = Q.hex2rgb(Q.COLORS["offWhite"])
    rail = Q.hex2rgb(Q.COLORS["steelBlue"])
    # slide 1's rail sits at y=1200; slide 2's sits 40px higher at y=1160 —
    # a real discontinuity, not the antialiasing noise the 6px tolerance allows.
    im1 = Image.new("RGB", (w, h), bg)
    ImageDraw.Draw(im1).line([(0, 1200), (w, 1200)], fill=rail, width=6)
    im1.save(os.path.join(sd, "slide-01.png"))
    im2 = Image.new("RGB", (w, h), bg)
    ImageDraw.Draw(im2).line([(0, 1160), (w, 1160)], fill=rail, width=6)
    im2.save(os.path.join(sd, "slide-02.png"))
    meas = [
        dict(index=1, threadBox={"top": 1180, "bottom": 1220}),
        dict(index=2, threadBox={"top": 1180, "bottom": 1220}),
    ]
    spec = {
        "thread": {"kind": "line"},
        "slides": [
            {"index": 1, "layout": "hero-statement", "background": "light"},
            {"index": 2, "layout": "hero-number", "background": "light"},
        ],
    }
    findings = []
    Q.gate3(spec, meas, sd, findings)
    hit = [f for f in findings if f["gate"] == "G3.2-edge" and f["level"] == "FAIL"]
    shutil.rmtree(out, ignore_errors=True)
    return bool(hit), (hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")



def ocr_matcher_calibration():
    """G4.5's digit matcher, tested as a pure function so it runs without a
    render. Added when post-49 slide 2 FAILed for a '3' that is plainly legible
    at 200px and that Tesseract read as '5'. The matcher must keep catching a
    genuinely unread figure while reporting a same-skeleton misread as a WARN."""
    from qa import ocr_figure_verdict as v
    cases = [
        ("3", "55", "confusable"),    # the post-49 case: 3 read as 5
        ("3", "35", "ok"),            # plainly recovered
        ("2913", "2913", "ok"),       # the EPA hero number
        ("2913", "29", "missing"),    # truncated - genuinely not read
        ("43", "12", "missing"),      # different skeletons - a real failure
        ("35", "55", "confusable"),
    ]
    for expected, seen, want in cases:
        got = v(expected, seen)
        if got != want:
            return False, f"ocr_figure_verdict({expected!r}, {seen!r}) = {got}, expected {want}"
    return True, "digit matcher separates a misread from an unread figure"

def main():
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    print(f"\n  Gate fixture harness — {len(FIXTURES)} deliberately broken slides\n")
    passed = 0
    for name, gate, fn in FIXTURES:
        ok, msg = run_one(name, gate, fn)
        print(f"  {'PASS' if ok else 'MISS'}  {name:<26} {gate:<18} {msg}")
        passed += ok
    total = len(FIXTURES)
    for label, fn, gate in (("gold-on-light (synthetic)", synthetic_bgrestrict, "G2.6-bgrestrict"),
                            ("renderer substitutes gold", substitution_holds, "renderer-guard"),
                            ("bad-archetype-enum", schema_rejects_bad_archetype, "P0.1-schema"),
                    ("line-thread continuity (real)", line_thread_continuity_holds, "G3.2-edge"),
                    ("edge jump (synthetic)", synthetic_edge_discontinuity, "G3.2-edge"),
                    ("hook unreadable (synthetic)", synthetic_ocr_illegible, "G4.5-ocr"),
                    ("ocr digit matcher", ocr_matcher_calibration, "G4.5-ocr")):
        ok, msg = fn()
        print(f"  {'PASS' if ok else 'MISS'}  {label:<26} {gate:<18} {msg}")
        passed += ok; total += 1
    shutil.rmtree(os.path.join(ROOT, "out", "post-9000"), ignore_errors=True)
    p = os.path.join(ROOT, "specs", "post-9000.json")
    os.path.exists(p) and os.remove(p)
    print(f"\n  {passed}/{total} gates caught their own failure mode\n")
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
