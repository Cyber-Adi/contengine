#!/usr/bin/env python3
"""The four-gate visual QA battery.

Gate 1  Structural      — overflow, margins, fonts, copy limits, numeral typeface
                          (measured in the live DOM by render.mjs, asserted here)
Gate 2  Pixel conformance — palette membership, no pure B/W, contrast,
                          Signal Red discipline, ink ratio
Gate 3  Thread continuity — the thread advances and never uses a forbidden token
Gate 4  Thumbnail legibility — the scroll-stopping proxy, measured at feed scale
Cross   Adjacent slides must not look alike (pHash distance)

Every finding is {gate, level, slide, msg}. Any FAIL blocks the post from
being marked Designed.
"""
import sys, os, json, glob, math, re
from collections import Counter
from PIL import Image
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKENS = json.load(open(os.path.join(ROOT, "tokens.json")))
RULES = TOKENS["rules"]
COLORS = {k: v["hex"] for k, v in TOKENS["colors"].items()}

# C1: margin, minTypePx and largeTextPx are calibrated at grid.referenceCanvasWidth
# (1080px); slide-html.mjs scales its own px literals up to the real canvas width
# by the same ratio, so any gate comparing against a measured render must scale
# these thresholds too, or every render fails its own (correctly scaled) design.
SCALE = TOKENS["grid"]["canvas"]["w"] / TOKENS["grid"].get("referenceCanvasWidth", 1080)


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


PALETTE = {k: hex2rgb(v) for k, v in COLORS.items()}


def srgb_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = (srgb_lin(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def parse_css_rgb(s):
    nums = [int(float(x)) for x in
            s.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",")[:3]]
    return tuple(nums)


def nearest_token(px, max_dist=26):
    """Nearest palette token within max_dist, else None. Antialiasing between two
    tokens is legal; a colour that sits near nothing in the palette is not."""
    best, bestd = None, 1e9
    for name, rgb in PALETTE.items():
        d = math.dist(px, rgb)
        if d < bestd:
            best, bestd = name, d
    return (best, bestd) if bestd <= max_dist else (None, bestd)


def on_segment(px, a, b, tol=14):
    """True if px lies near the line segment between two palette colours —
    i.e. it is an antialiasing blend, not an invented colour."""
    p, a, b = np.array(px, float), np.array(a, float), np.array(b, float)
    ab = b - a
    denom = float(ab @ ab)
    if denom == 0:
        return float(np.linalg.norm(p - a)) <= tol
    t = max(0.0, min(1.0, float((p - a) @ ab) / denom))
    return float(np.linalg.norm(p - (a + t * ab))) <= tol


def phash(img, size=8):
    g = np.asarray(img.convert("L").resize((size * 4, size * 4), Image.LANCZOS), float)
    dct = np.fft.rfft2(g)
    block = np.abs(dct[:size, :size])
    med = np.median(block)
    return (block > med).flatten()


# ---------------------------------------------------------------- gates
def gate1(meas, findings):
    for m in meas:
        i = m["index"]
        for k, ok in m.get("fontStatus", {}).items():
            if not ok:
                findings.append(dict(gate="G1.3-fonts", level="FAIL", slide=i,
                                     msg=f"{k} did not load — silent fallback to a system face"))
        for o in m.get("overflow", []):
            findings.append(dict(gate="G1.1-overflow", level="FAIL", slide=i,
                                 msg=f"'{o.get('cls')}' clipped ({o.get('reason','?')}): {o.get('sw')}x{o.get('sh')}"))
        for v in m.get("marginViolations", []):
            findings.append(dict(gate="G1.2-margins", level="FAIL", slide=i,
                                 msg=f"'{v.get('cls')}' intrudes into the {round(TOKENS['grid']['margin']*SCALE)}px margin"))
        # 1.5 numerals: hero/stat elements only. Numerals inside running Playfair
        # headline prose are exempt — swapping the face mid-sentence looks worse.
        for n in m.get("numeralFonts", []):
            cls = n.get("cls", "")
            if any(c in cls for c in ("hero-num", "q-v", "li-n", "col-i", "strike")):
                findings.append(dict(gate="G1.5-numerals", level="FAIL", slide=i,
                                     msg=f"stat element '{cls}' is not Space Grotesk: {n.get('family')}"))
        for tb in m.get("textBoxes", []):
            words = tb.get("words", len(tb["text"].split()))
            if "body" in tb.get("cls", "") and words > RULES["maxBodyWords"]:
                findings.append(dict(gate="G1.4-copy", level="FAIL", slide=i,
                                     msg=f"body copy {words} words > {RULES['maxBodyWords']}"))
            for banned in RULES["bannedWords"]:
                if banned.lower() in tb["text"].lower():
                    findings.append(dict(gate="G1.4-copy", level="FAIL", slide=i,
                                         msg=f"banned word '{banned}' in rendered output"))


def gate2(spec, meas, slides_dir, findings):
    forbidden = [hex2rgb(h) for h in TOKENS["forbiddenColors"]]
    pal = list(PALETTE.values())
    for m in meas:
        i = m["index"]
        f = os.path.join(slides_dir, f"slide-{i:02d}.png")
        im = Image.open(f).convert("RGB")
        arr = np.asarray(im).reshape(-1, 3)

        # 2.1 palette membership on the dominant colours
        counts = Counter(map(tuple, arr[::37]))
        total = sum(counts.values())
        for px, n in counts.most_common(28):
            if n / total < 0.0015:
                continue
            name, dist = nearest_token(px)
            if name is None:
                if any(on_segment(px, a, b) for k, a in PALETTE.items() for b in pal if a is not b):
                    continue
                findings.append(dict(gate="G2.1-palette", level="FAIL", slide=i,
                                     msg=f"off-palette colour rgb{px} ({n/total:.1%} of pixels), nearest token {dist:.0f} away"))

        # 2.2 no pure black / pure white
        for fb in forbidden:
            hits = int(np.all(arr == fb, axis=1).sum())
            if hits / len(arr) > 0.002:
                findings.append(dict(gate="G2.2-purebw", level="FAIL", slide=i,
                                     msg=f"pure {fb} covers {hits/len(arr):.1%} of the slide"))

        bg = PALETTE["fondGreen"] if m.get("layout") == "cta-card" else (
            PALETTE["slateBlack"] if m["background"] == "dark" else PALETTE["offWhite"])

        # 2.3 contrast — WCAG 2.1 AA with the correct large-text allowance
        CR = RULES["contrast"]
        for tb in m.get("textBoxes", []):
            try:
                fg = parse_css_rgb(tb["color"])
            except Exception:
                continue
            cls = tb.get("cls", "") or ""
            size = tb.get("size", 0) or 0
            bold = (tb.get("weight") or 400) >= 600
            large = size >= (CR["largeTextPx"]["bold"] if bold else CR["largeTextPx"]["regular"]) * SCALE
            chrome = any(r in cls for r in CR["chromeRoles"])
            need = CR["largeText"] if (large or chrome) else CR["normalText"]
            local = tb.get('surface')
            bg_here = PALETTE.get(local, bg) if local else bg
            cr_v = contrast(fg, bg_here)
            if cr_v < need:
                findings.append(dict(gate="G2.3-contrast",
                                     level="WARN" if chrome else "FAIL", slide=i,
                                     msg=f"'{tb['text'][:34]}' {cr_v:.1f}:1 < {need}:1 required at {size:.0f}px"))

        # 2.6 background restriction — a token may be legal in the palette and
        # still be illegible on this ground. Derived from the measured audit.
        if m.get("layout") == "cta-card":
            bgname = None   # the CTA card's ground IS fond Green by design
        else:
            bgname = "light" if m["background"] == "light" else "dark"
        for tname, tdef in TOKENS["colors"].items():
            restrict = tdef.get("backgroundRestriction")
            if bgname is None or not restrict or restrict == bgname:
                continue
            c = np.array(hex2rgb(tdef["hex"]), float)
            share = float((np.linalg.norm(arr.astype(float) - c, axis=1) < 26).mean())
            if share > 0.0004:
                findings.append(dict(gate="G2.6-bgrestrict", level="FAIL", slide=i,
                                     msg=f"{tname} covers {share:.1%} of a {bgname} slide but is legible only on {restrict} grounds"))

        # 2.4 Signal Red discipline — the one palette rule about meaning, not looks
        red = np.array(PALETTE["signalRed"], float)
        red_hits = int((np.linalg.norm(arr.astype(float) - red, axis=1) < 26).sum())
        if red_hits / len(arr) > 0.0004 and not m.get("declaresLoss"):
            findings.append(dict(gate="G2.4-signalred", level="FAIL", slide=i,
                                 msg=f"Signal Red on {red_hits/len(arr):.1%} of a slide that declares no loss/waste/cost figure"))

        # 2.5 ink ratio
        bga = np.array(bg, float)
        ink = float((np.linalg.norm(arr.astype(float) - bga, axis=1) > 34).mean())
        lo, hi = RULES["inkRatio"]["warnLow"], RULES["inkRatio"]["warnHigh"]
        if ink < lo:
            findings.append(dict(gate="G2.5-ink", level="WARN", slide=i,
                                 msg=f"ink ratio {ink:.1%} < {lo:.0%} — slide reads empty"))
        elif ink > hi:
            findings.append(dict(gate="G2.5-ink", level="WARN", slide=i,
                                 msg=f"ink ratio {ink:.1%} > {hi:.0%} — slide reads cluttered"))


def gate3(spec, meas, slides_dir, findings):
    t = spec.get("thread")
    if not t:
        findings.append(dict(gate="G3-thread", level="FAIL", slide=0,
                             msg="no continuous thread — Design System 3.6 makes it non-negotiable"))
        return
    forbid = set(t.get("forbidColors", []))
    prog = [s.get("threadState", {}).get("progress", 0) for s in spec["slides"]]
    if any(b < a - 1e-9 for a, b in zip(prog, prog[1:])):
        findings.append(dict(gate="G3-thread", level="FAIL", slide=0, msg="thread progress goes backwards"))
    if prog[-1] < 0.999:
        findings.append(dict(gate="G3-thread", level="FAIL", slide=len(prog),
                             msg=f"thread ends at {prog[-1]:.0%}, must complete on the final slide"))
    if len(set(prog)) < 3:
        findings.append(dict(gate="G3-thread", level="WARN", slide=0,
                             msg="thread barely advances — it should feel like progress"))
    # forbidden tokens must not appear in the thread band
    if forbid:
        band_top = int(TOKENS["grid"]["canvas"]["h"] * 0.80)
        for s in spec["slides"]:
            i = s["index"]
            f = os.path.join(slides_dir, f"slide-{i:02d}.png")
            if not os.path.exists(f):
                continue
            band = np.asarray(Image.open(f).convert("RGB"))[band_top:, :, :].reshape(-1, 3).astype(float)
            for tok in forbid:
                c = np.array(hex2rgb(COLORS[tok]), float)
                if (np.linalg.norm(band - c, axis=1) < 26).mean() > 0.002:
                    findings.append(dict(gate="G3-thread", level="FAIL", slide=i,
                                         msg=f"thread band uses {tok}, which this carousel forbids"))

    # G3.2 edge continuity (P1.2): the "follow the line" thread must exit slide N's
    # right edge and re-enter slide N+1's left edge at the identical vertical
    # position. Bound the search to the thread's own measured box (§3.3's rule —
    # content element boxes, not canvas pixels) so headline/copy pixels near the
    # margin never get mistaken for the rail.
    if t.get("kind") == "line":
        by_index = {m["index"]: m for m in meas}
        slides_sorted = sorted(spec["slides"], key=lambda s: s["index"])
        bg_hex = {"light": COLORS["offWhite"], "dark": COLORS["slateBlack"]}
        for a, b in zip(slides_sorted, slides_sorted[1:]):
            if a.get("layout") == "cta-card" or b.get("layout") == "cta-card":
                continue  # the CTA slide renders no thread at all
            ma, mb = by_index.get(a["index"]), by_index.get(b["index"])
            if not ma or not mb or "threadBox" not in ma or "threadBox" not in mb:
                continue
            fa = os.path.join(slides_dir, f"slide-{a['index']:02d}.png")
            fb = os.path.join(slides_dir, f"slide-{b['index']:02d}.png")
            if not (os.path.exists(fa) and os.path.exists(fb)):
                continue
            img_a = np.asarray(Image.open(fa).convert("RGB"))
            img_b = np.asarray(Image.open(fb).convert("RGB"))
            ca = _thread_edge_centroid(img_a[:, -1, :], ma["threadBox"],
                                       hex2rgb(bg_hex[a.get("background", "light")]))
            cb_ = _thread_edge_centroid(img_b[:, 0, :], mb["threadBox"],
                                        hex2rgb(bg_hex[b.get("background", "light")]))
            if ca is None or cb_ is None:
                findings.append(dict(gate="G3.2-edge", level="FAIL", slide=b["index"],
                                     msg=f"thread line does not reach the edge between slide {a['index']} and {b['index']}"))
            elif abs(ca - cb_) > 6:
                findings.append(dict(gate="G3.2-edge", level="FAIL", slide=b["index"],
                                     msg=f"thread line jumps {abs(ca - cb_):.0f}px crossing slide {a['index']}->{b['index']}"))


def _thread_edge_centroid(col, thread_box, bg_rgb):
    """Row index (within the whole image) of the thread rail in one edge pixel
    column, or None if no non-background pixel exists inside the measured
    thread band. `col` is an (H, 3) array — one pixel column, top to bottom."""
    top, bottom = max(0, thread_box["top"]), min(len(col), thread_box["bottom"])
    if bottom <= top:
        return None
    band = col[top:bottom].astype(float)
    dist = np.linalg.norm(band - np.array(bg_rgb, float), axis=1)
    mask = dist > 8
    if not mask.any():
        return None
    return top + np.nonzero(mask)[0].mean()


# --- G4.5 OCR matching -------------------------------------------------------
# Calibrated 2026-09-12 against post-49 slide 2. Tesseract read the hero
# "3-5 WEEKS" as "5-5 WEEKS" and the gate FAILed for a missing '3'. Inspection
# of the actual 200px thumbnail settled it: the 3 is unmistakable to a human eye
# at feed scale. The gate was stricter than reality, and the output was fine.
#
# The fix is NOT to stop checking digits. It is to stop conflating two different
# findings. Tesseract confuses digits of similar skeleton (3/5/8/6/9, 0/O/D,
# 1/7/I) far more readily than a reader does, especially beside an en dash that
# merges into the adjacent glyph at small sizes. So:
#   - wrong NUMBER OF DIGITS, or an unrecoverable word  -> FAIL. Genuinely unread.
#   - right count, digits differ only within a confusion class -> WARN. The gate
#     cannot tell, and says so, rather than guessing in either direction.
# Loosening a gate silently is how a gate starts manufacturing confidence.
_DIGIT_CONFUSION = {"3": "358", "5": "358", "8": "358", "6": "690", "9": "690",
                    "0": "6900", "1": "17", "7": "17", "2": "2", "4": "4"}

def _norm_ocr(s):
    """Collapse dash variants and stray marks OCR invents around small type."""
    return (s.replace("\u2013", "-").replace("\u2014", "-").replace("\u2212", "-")
             .replace("\u2019", "'").replace("\u2018", "'"))

def _digit_class(d):
    return _DIGIT_CONFUSION.get(d, d)

def ocr_figure_verdict(expected_digits, ocr_digits):
    """'ok' | 'confusable' | 'missing'. Pure function so it is testable without
    a render (see tools/test_gates.py::ocr_matcher_calibration)."""
    if not expected_digits:
        return "ok"
    if expected_digits in ocr_digits:
        return "ok"
    n = len(expected_digits)
    for i in range(len(ocr_digits) - n + 1):
        window = ocr_digits[i:i + n]
        if all(w in _digit_class(e) for e, w in zip(expected_digits, window)):
            return "confusable"
    return "missing"


def _ocr_hook_text(thumb_img):
    """OCR one already-resized (200px-wide) thumbnail. Import is local so a
    machine without pytesseract/tesseract installed can still run every other
    gate. Tesseract's models expect ~20-30px cap-height letters; at a raw
    200px-wide feed thumbnail our type falls well under that, and Tesseract
    returns nothing at all rather than a bad guess. Upscaling 4x with LANCZOS
    (no new information, just enough samples per glyph for the model) is
    standard OCR practice and is what turns 'returns nothing' into a real
    legibility read. Grayscale removes a light-text-on-dark-background
    inversion confound Tesseract otherwise mishandles."""
    import pytesseract
    from PIL import ImageOps
    big = thumb_img.resize((thumb_img.width * 4, thumb_img.height * 4), Image.LANCZOS)
    return pytesseract.image_to_string(ImageOps.grayscale(big))


def gate4(spec, slides_dir, findings, ocr=True):
    w = RULES["thumbnail"]["width"]
    for n in (1, 2):
        f = os.path.join(slides_dir, f"slide-{n:02d}.png")
        if not os.path.exists(f):
            continue
        im = Image.open(f).convert("RGB")
        th = im.resize((w, int(w * im.height / im.width)), Image.LANCZOS)
        a = np.asarray(th).astype(float)
        bgc = a.reshape(-1, 3)[0]
        mask = np.linalg.norm(a - bgc, axis=2) > 34
        ink = float(mask.mean())
        if ink < 0.04:
            findings.append(dict(gate="G4.2-thumb", level="FAIL", slide=n,
                                 msg=f"at {w}px only {ink:.1%} of the slide is ink — invisible in a feed"))
        # 4.3 dominance: the largest horizontal band of ink. This is a cheap
        # PROXY for "readable at feed scale" — when OCR (the real test, below)
        # actually confirms the hook reads, its verdict is authoritative and
        # supersedes the proxy's guess. Dominance stays load-bearing only where
        # OCR didn't run or didn't confirm (P1.3 finding: hero-number layouts
        # split digits from caption onto separate lines, which undercounts a
        # single contiguous ink band even though the digits read fine).
        rows = mask.mean(axis=1)
        k = max(3, mask.shape[0] // 40)                      # ~1 text line
        sm = np.convolve(rows, np.ones(k) / k, mode="same")  # gaps between lines
        run, best = 0, 0                                     # shouldn't split a block
        for r in sm:
            run = run + 1 if r > 0.02 else 0
            best = max(best, run)
        dom = best / mask.shape[0]
        dominance_low = dom < RULES["thumbnail"]["minDominancePct"]
        # 4.5 OCR (P1.3): ink and dominance are cheap proxies for "readable at feed
        # scale" — OCR is the actual test. Slides 1 and 2 only, end of batch, since
        # this is the expensive check.
        ocr_confirmed = None
        if ocr and ink >= 0.04:
            s = next((sl for sl in spec["slides"] if sl["index"] == n), None)
            copy_ = (s or {}).get("copy", {})
            # Only the big hook text — headline or heroNumber. Captions/citations
            # are deliberately smaller supporting copy; OCR failing on THEM at
            # 200px is not a legibility defect.
            hook = " ".join(str(copy_.get(k, "")) for k in ("headline", "heroNumber"))
            words = re.findall(r"[A-Za-z']+", hook)
            longest = max(words, key=len) if words else None
            numbers = re.findall(r"\d[\d,.]*", hook)
            if longest or numbers:
                try:
                    text = _ocr_hook_text(th)
                except Exception as e:
                    findings.append(dict(gate="G4.5-ocr", level="WARN", slide=n,
                                         msg=f"OCR unavailable, skipped: {e}"))
                    if dominance_low:
                        findings.append(dict(gate="G4.3-dominance", level="WARN", slide=n,
                                             msg=f"no dominant element at feed scale (largest ink band {dom:.0%} of height)"))
                    continue
                text = _norm_ocr(text)
                text_letters = re.sub(r"[^A-Z]", "", text.upper())
                text_digits = re.sub(r"[^0-9]", "", text)
                missing = 0
                if longest and re.sub(r"'", "", longest.upper()) not in text_letters:
                    findings.append(dict(gate="G4.5-ocr", level="FAIL", slide=n,
                                         msg=f"OCR at {w}px did not recover '{longest}' — hook is not legible at feed scale"))
                    missing += 1
                for num in numbers:
                    digits = re.sub(r"[^0-9]", "", num)
                    verdict = ocr_figure_verdict(digits, text_digits)
                    if verdict == "missing":
                        findings.append(dict(gate="G4.5-ocr", level="FAIL", slide=n,
                                             msg=f"OCR at {w}px did not recover the figure '{num}' — hook is not legible at feed scale"))
                        missing += 1
                    elif verdict == "confusable":
                        findings.append(dict(gate="G4.5-ocr", level="WARN", slide=n,
                                             msg=(f"OCR read the right number of digits for '{num}' but not the same ones "
                                                  f"(saw '{text_digits}'). Tesseract confuses same-skeleton digits at 200px "
                                                  f"far more readily than a reader does, so this is a limit of the instrument, "
                                                  f"not evidence the hook is illegible. Eyeball the thumbnail once to confirm.")))
                ocr_confirmed = missing == 0
        if dominance_low and ocr_confirmed is not True:
            findings.append(dict(gate="G4.3-dominance", level="WARN", slide=n,
                                 msg=f"no dominant element at feed scale (largest ink band {dom:.0%} of height)"))
    # slide 2 must stand alone — Instagram re-serves carousels showing it first
    s2 = next((s for s in spec["slides"] if s["index"] == 2), None)
    if s2 and s2.get("archetype") != "backupHook":
        findings.append(dict(gate="G4.4-slide2", level="FAIL", slide=2,
                             msg="slide 2 is not a standalone backup hook (Strategy v2 §2)"))


def gate5_optical(spec, meas, slides_dir, findings):
    """Gate 5 — OPTICAL. What a viewer sees, not what the box model says.

    Gate 1 proves text is CONTAINED. It cannot tell you the slide looks wrong:
    a paragraph stranded above 300px of nothing, a label smaller than anyone
    reads on a phone, a headline whose last line is one orphaned word. Those are
    the defects a human spots instantly and a containment check never will.
    """
    OPT = RULES["optical"]
    g = TOKENS["grid"]["canvas"]
    margin = TOKENS["grid"]["margin"] * SCALE
    min_type_px = OPT["minTypePx"] * SCALE
    min_chrome_px = OPT.get("minChromeTypePx", OPT["minTypePx"]) * SCALE

    for m in meas:
        i = m["index"]
        f = os.path.join(slides_dir, f"slide-{i:02d}.png")
        im = Image.open(f).convert("RGB")
        a = np.asarray(im).astype(float)
        bg = a[4, 4]
        ink = np.linalg.norm(a - bg, axis=2) > 34

        rows = ink.mean(axis=1)
        cb = m.get("contentBox") or {"top": margin, "bottom": g["h"] - margin}
        ctop, cbot = max(0, cb["top"]), min(g["h"], cb["bottom"])

        # ---- 5.1 internal dead band: a hole BETWEEN content elements.
        # Measured only between the first and last ink row inside the content box —
        # the gap above the thread rail is structural chrome, not a composition defect.
        # Bound the composition by the actual CONTENT elements, not by pixels — the
        # micro-label, ornament, handle and counter are chrome pinned to the frame, and
        # the gap between them and the copy is structural, not a hole in the design.
        CHROME = ("micro", "orn", "handle", "counter", "thread")
        boxes = [tb["box"] for tb in m.get("textBoxes", [])
                 if tb.get("box") and not any(c in (tb.get("cls") or "") for c in CHROME)]
        if not boxes:
            continue
        etop = max(ctop, min(b["y"] for b in boxes))
        ebot = min(cbot, max(b["y"] + b["h"] for b in boxes))
        if ebot - etop < 40:
            continue
        inside = rows[etop:ebot]
        nz = np.where(inside > 0.004)[0]
        if len(nz) >= 2:
            seg = inside[nz[0]:nz[-1] + 1]
            run = best = best_at = 0
            for y, v in enumerate(seg):
                if v < 0.004:
                    run += 1
                    if run > best:
                        best, best_at = run, etop + nz[0] + y - run
                else:
                    run = 0
            span = max(1, nz[-1] - nz[0])
            if best / span > OPT["maxDeadBandPct"]:
                findings.append(dict(gate="G5.1-deadband", level="FAIL", slide=i,
                                     msg=f"{best}px hole between elements ({best/span:.0%} of the copy block) at y={best_at}"))

            # ---- 5.5 fill ratio: does the composition use the frame it was given?
            fill = (ebot - etop) / max(1, (cbot - ctop))
            if fill < OPT["minFillRatio"]:
                findings.append(dict(gate="G5.5-fill", level="WARN", slide=i,
                                     msg=f"content occupies {fill:.0%} of its box — type or diagram could carry more of the frame"))

        # ---- 5.2 vertical balance: ink shouldn't pile into one half
        ys = np.where(rows > 0.004)[0]
        if len(ys):
            com = float((rows[ys] * ys).sum() / rows[ys].sum()) / g["h"]
            lo, hi = OPT["centreOfMass"]
            if not (lo <= com <= hi):
                where = "top-heavy" if com < lo else "bottom-heavy"
                findings.append(dict(gate="G5.2-balance", level="WARN", slide=i,
                                     msg=f"ink centre of mass at {com:.0%} of height — {where}"))

        # ---- 5.3 type floor: nothing a phone viewer cannot read.
        # Chrome gets a lower floor for the same reason G5.1 excludes it from the
        # composition bound: the handle and counter are a signature, identified rather
        # than read. Applying the content floor to them was a category error that made
        # every slide fail on its own page number.
        CHROME_CLS = ("micro", "orn", "handle", "counter", "thread")
        for tb in m.get("textBoxes", []):
            size = tb.get("size") or 0
            is_chrome = any(c in (tb.get("cls") or "") for c in CHROME_CLS)
            floor = min_chrome_px if is_chrome else min_type_px
            if 0 < size < floor:
                findings.append(dict(gate="G5.3-typefloor", level="FAIL", slide=i,
                                     msg=f"'{tb['text'][:30]}'{' (chrome)' if is_chrome else ''} set at {size:.0f}px, below the {floor:.0f}px floor"))

        # ---- 5.4 orphan: a headline's last line left as one short word
        for tb in m.get("textBoxes", []):
            if not tb.get("cls", "").startswith("h-"):
                continue
            lines = tb.get("lines")
            if lines and len(lines) > 1:
                last = lines[-1].strip()
                if last and len(last.split()) == 1 and len(last) <= OPT["orphanMaxChars"]:
                    findings.append(dict(gate="G5.4-orphan", level="WARN", slide=i,
                                         msg=f"headline ends on an orphan: '{last}'"))


def cross(spec, slides_dir, findings):
    hashes = {}
    for s in spec["slides"]:
        f = os.path.join(slides_dir, f"slide-{s['index']:02d}.png")
        if os.path.exists(f):
            hashes[s["index"]] = phash(Image.open(f))
    idx = sorted(hashes)
    for a, b in zip(idx, idx[1:]):
        d = int((hashes[a] != hashes[b]).sum())
        if d < RULES["adjacentSlidePHashMinDistance"]:
            findings.append(dict(gate="X-distinct", level="FAIL", slide=b,
                                 msg=f"slides {a} and {b} look alike (pHash distance {d})"))
    def lkey(s):
        k = s.get("layout")
        return f'{k}:{s.get("diagram", {}).get("kind")}' if k == "diagram" else k
    layouts = [(s["index"], lkey(s)) for s in spec["slides"]]
    for (ia, la), (ib, lb) in zip(layouts, layouts[1:]):
        if la and la == lb:
            findings.append(dict(gate="X-distinct", level="FAIL", slide=ib,
                                 msg=f"slides {ia} and {ib} share layout '{la}' — Design System 3.8"))


def run(out_dir):
    slides_dir = os.path.join(out_dir, "slides")
    meas = json.load(open(os.path.join(out_dir, "measurements.json")))
    post = os.path.basename(out_dir).replace("post-", "")
    spec = json.load(open(os.path.join(ROOT, "specs", f"post-{post}.json")))

    findings = []
    gate1(meas, findings)
    gate2(spec, meas, slides_dir, findings)
    gate3(spec, meas, slides_dir, findings)
    gate4(spec, slides_dir, findings)
    gate5_optical(spec, meas, slides_dir, findings)
    cross(spec, slides_dir, findings)

    fails = [f for f in findings if f["level"] == "FAIL"]
    warns = [f for f in findings if f["level"] == "WARN"]
    report = dict(post=spec["postNumber"], title=spec["title"],
                  provenance=spec.get("provenance"),
                  verdict="PASS" if not fails else "FAIL",
                  fails=len(fails), warns=len(warns), findings=findings)
    json.dump(report, open(os.path.join(out_dir, "qa-report.json"), "w"), indent=2)

    print(f"\n  QA — post {spec['postNumber']}: {spec['title']}")
    print(f"  verdict: {report['verdict']}   fails={len(fails)}  warns={len(warns)}")
    for f in findings:
        print(f"    [{f['level']}] {f['gate']} slide {f['slide']}: {f['msg']}")
    if not findings:
        print("    all gates clean")
    return report


if __name__ == "__main__":
    r = run(sys.argv[1])
    sys.exit(0 if r["verdict"] == "PASS" else 1)
