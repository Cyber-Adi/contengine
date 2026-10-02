"""S2 fixtures (engine quality upgrades), kept apart from test_gates.py so that file
stays near its size limit and Slice 1 can append to it without a merge fight.

Every function returns (ok, message). test_gates.main() runs them after its own
fixtures and counts each one. A fixture that does not fire is a MISS and fails the suite.
"""
import copy
import hashlib
import json
import os
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOOD = json.load(open(os.path.join(ROOT, "specs", "post-49.json")))


def _qa():
    import qa as Q
    return Q


def synthetic_edge_5px():
    """S2c: the tolerance is 4px. A 5px step at the shared edge passed the old 6px
    gate; it must fail now. Pinned so the tolerance cannot drift back."""
    from PIL import Image, ImageDraw
    Q = _qa()
    out = os.path.join(ROOT, "out", "post-9007")
    sd = os.path.join(out, "slides")
    os.makedirs(sd, exist_ok=True)
    g = Q.TOKENS["grid"]["canvas"]
    w, h = g["w"], g["h"]
    bg = Q.hex2rgb(Q.COLORS["offWhite"])
    rail = Q.hex2rgb(Q.COLORS["steelBlue"])
    for n, y in ((1, 1200), (2, 1205)):
        im = Image.new("RGB", (w, h), bg)
        ImageDraw.Draw(im).line([(0, y), (w, y)], fill=rail, width=6)
        im.save(os.path.join(sd, f"slide-{n:02d}.png"))
    meas = [dict(index=n, threadBox={"top": 1180, "bottom": 1230}) for n in (1, 2)]
    spec = {"thread": {"kind": "line"},
            "slides": [{"index": 1, "layout": "hero-statement", "background": "light"},
                       {"index": 2, "layout": "hero-number", "background": "light"}]}
    findings = []
    Q.gate3(spec, meas, sd, findings)
    hit = [f for f in findings if f["gate"] == "G3.2-edge" and f["level"] == "FAIL"]
    shutil.rmtree(out, ignore_errors=True)
    return bool(hit), (hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")


def synthetic_gridsafe():
    """S2e: slide 1's hook box reaches into the strip the 3:4 grid crop removes."""
    Q = _qa()
    g = Q.TOKENS["grid"]["canvas"]
    strip = Q.grid_safe_strip(g["w"], g["h"])
    ok_box = dict(x=96, y=400, w=g["w"] - 192, h=300)
    bad_box = dict(x=int(strip) - 20, y=400, w=g["w"] - 2 * int(strip) + 40, h=300)
    good = [dict(index=1, textBoxes=[dict(cls="h-hook", text="Safe headline", box=ok_box)])]
    bad = [dict(index=1, textBoxes=[dict(cls="h-hook", text="Cropped headline", box=bad_box),
                                    dict(cls="hero-num", text="2913", box=dict(x=0, y=900, w=700, h=200))])]
    f_good, f_bad = [], []
    Q.gate4_gridsafe(good, f_good)
    Q.gate4_gridsafe(bad, f_bad)
    hit = [f for f in f_bad if f["gate"] == "G4.6-gridsafe" and f["level"] == "FAIL"]
    if f_good:
        return False, "gate fired on an in-crop hook"
    return len(hit) == 2, (hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")


def synthetic_centroid_rhythm():
    """S2a: two adjacent slides whose ink sits at the same height. The measured
    centroid, not a spec field, is what the gate reads."""
    from PIL import Image, ImageDraw
    Q = _qa()
    out = os.path.join(ROOT, "out", "post-9008")
    sd = os.path.join(out, "slides")
    os.makedirs(sd, exist_ok=True)
    g = Q.TOKENS["grid"]["canvas"]
    w, h = g["w"], g["h"]
    bg = Q.hex2rgb(Q.COLORS["offWhite"])
    ink = Q.hex2rgb(Q.COLORS["slateBlack"])
    cb = dict(top=0, bottom=1465, height=1465)
    ys = {1: 600, 2: 640, 3: 1100}      # 1 and 2 are 40px apart; 3 is far enough
    for n, y in ys.items():
        im = Image.new("RGB", (w, h), bg)
        ImageDraw.Draw(im).rectangle([100, y, 1300, y + 200], fill=ink)
        im.save(os.path.join(sd, f"slide-{n:02d}.png"))
    meas = [dict(index=n, layout="hero-statement", background=("light" if n % 2 else "dark"), contentBox=cb)
            for n in ys]
    findings = []
    Q.gate5_rhythm(meas, sd, findings)
    hit = [f for f in findings if f["gate"] == "G5.7-rhythm-centroid"]
    shutil.rmtree(out, ignore_errors=True)
    ok = len(hit) == 1 and "slides 1 and 2" in hit[0]["msg"]    # 2->3 must NOT fire
    return ok, (hit[0]["msg"][:78] if hit else "GATE DID NOT FIRE")


def _node_json(code):
    r = subprocess.run(["node", "--input-type=module", "-e", code], capture_output=True, text=True, cwd=ROOT)
    try:
        return json.loads(r.stdout.strip().splitlines()[-1]), None
    except Exception:
        return None, (r.stderr.strip().splitlines() or ["no output"])[-1][:70]


def rhythm_solver_repairs():
    """S2a: tools/rhythm.mjs on a spec with a background run and a same-layout pair
    must return a plan that passes its own checker, touches no copy, changes only
    design fields and logs a why for each change."""
    spec = copy.deepcopy(GOOD)
    for i in (0, 1, 2):
        spec["slides"][i]["background"] = "dark"
    spec["slides"][3]["layout"] = spec["slides"][2]["layout"]
    code = ("import {repairRhythm} from './tools/rhythm.mjs';import {checkRhythm} from './src/rhythm-core.mjs';"
            f"const spec={json.dumps(spec)};const r=repairRhythm(spec);"
            "const bg=checkRhythm(r.spec.slides.map(s=>({...s,valign:s.valign||'center'}))).filter(v=>v.kind!=='centroid');"
            "const copyKept=JSON.stringify(r.spec.slides.map(s=>s.copy))===JSON.stringify(spec.slides.map(s=>s.copy));"
            "const fields=[...new Set(r.changes.map(c=>c.field))];"
            "const whys=r.changes.every(c=>c.why&&c.from!==c.to);"
            "console.log(JSON.stringify({bg:bg.length,copyKept,fields,whys,n:r.changes.length}))")
    v, err = _node_json(code)
    if v is None:
        return False, err
    ok = (v["bg"] == 0 and v["copyKept"] and v["whys"] and v["n"] > 0
          and set(v["fields"]) <= {"background", "layout", "valign"})
    return ok, f"plan lawful, copy untouched, {v['n']} design change(s) logged ({','.join(v['fields'])})"


def normalizer_closed_table():
    """S2f: the closed table does exactly its job, logs each hit, and leaves
    everything else (including a number range's hyphen) alone."""
    cases = [["a -> b", "a → b"], ["wait - then go", "wait – then go"],
             ['He said "stop" now', "He said “stop” now"], ["don't", "don’t"],
             ["'quoted' text", "‘quoted’ text"], ["3-5 weeks", "3-5 weeks"],
             ["already → done", "already → done"]]
    code = ("import {normalizeText} from './src/normalize.mjs';"
            f"const cases={json.dumps(cases)};"
            "const bad=cases.filter(([i,o])=>normalizeText(i).text!==o).map(([i])=>i);"
            "const idem=cases.every(([i,o])=>normalizeText(o).text===o);"
            "const logged=normalizeText('a -> b').hits.length===1;"
            "console.log(JSON.stringify({bad,idem,logged}))")
    v, err = _node_json(code)
    if v is None:
        return False, err
    ok = not v["bad"] and v["idem"] and v["logged"]
    return ok, "table applies, is idempotent and logs" if ok else f"wrong output for {v['bad']}, idem={v['idem']}"


def renderer_logs_normalizations():
    """S2f: a spec containing '->' must render with the substitution recorded in
    measurements.json and carried into the QA report, never silently."""
    spec = copy.deepcopy(GOOD)
    spec["postNumber"] = 9009
    spec["slides"][3]["copy"]["headline"] = "Check the label -> then decide"
    sp = os.path.join(ROOT, "specs", "post-9009.json")
    json.dump(spec, open(sp, "w"), indent=2)
    out = os.path.join(ROOT, "out", "post-9009")
    shutil.rmtree(out, ignore_errors=True)
    r = subprocess.run(["node", os.path.join(ROOT, "src", "render.mjs"), sp], capture_output=True, text=True, cwd=ROOT)
    ok, msg = False, "render failed"
    if r.returncode == 0:
        subprocess.run(["python3", os.path.join(ROOT, "tools", "qa.py"), out], capture_output=True, text=True, cwd=ROOT)
        rep = json.load(open(os.path.join(out, "qa-report.json")))
        hit = [n for n in rep.get("normalizations", []) if n["rule"] == "arrow" and n["slide"] == 4]
        ok = bool(hit)
        msg = "arrow substitution logged in qa-report" if ok else "substitution NOT logged"
    os.path.exists(sp) and os.remove(sp)
    shutil.rmtree(out, ignore_errors=True)
    return ok, msg


def render_is_deterministic():
    """Re-rendering the same spec must give byte-identical PNGs and identical
    measurements. A 49%/50% flip between runs is what hid real fill regressions."""
    spec = copy.deepcopy(GOOD)
    spec["postNumber"] = 9005
    sp = os.path.join(ROOT, "specs", "post-9005.json")
    json.dump(spec, open(sp, "w"), indent=2)
    out = os.path.join(ROOT, "out", "post-9005")
    digests = []
    for _ in range(2):
        shutil.rmtree(out, ignore_errors=True)
        r = subprocess.run(["node", os.path.join(ROOT, "src", "render.mjs"), sp], capture_output=True, text=True, cwd=ROOT)
        if r.returncode != 0:
            os.remove(sp)
            return False, "render failed"
        h = hashlib.sha256()
        for f in sorted(os.listdir(os.path.join(out, "slides"))):
            h.update(open(os.path.join(out, "slides", f), "rb").read())
        h.update(open(os.path.join(out, "measurements.json"), "rb").read())
        digests.append(h.hexdigest())
    os.remove(sp)
    shutil.rmtree(out, ignore_errors=True)
    same = digests[0] == digests[1]
    return same, ("two renders byte-identical" if same else "RENDERS DIFFER")


CHECKS = (
    ("edge step 5px (synthetic)", synthetic_edge_5px, "G3.2-edge"),
    ("hook in grid strip (synth)", synthetic_gridsafe, "G4.6-gridsafe"),
    ("same centroid (synthetic)", synthetic_centroid_rhythm, "G5.7-rhythm-cen"),
    ("rhythm.mjs repairs plan", rhythm_solver_repairs, "S2a-solver"),
    ("normalizer closed table", normalizer_closed_table, "S2f-normalize"),
    ("normalizer logs (real)", renderer_logs_normalizations, "S2f-log"),
    ("re-render byte-identical", render_is_deterministic, "determinism"),
)
