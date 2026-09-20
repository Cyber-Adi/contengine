#!/usr/bin/env python3
"""Reproduce CONTRAST-AUDIT.md from tokens.json. WCAG 2.1 relative luminance."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = {k: v["hex"] for k, v in json.load(open(os.path.join(ROOT, "tokens.json")))["colors"].items()}
h2r = lambda h: tuple(int(h.lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
lin = lambda c: (c/255)/12.92 if c/255 <= 0.04045 else (((c/255)+0.055)/1.055)**2.4
L = lambda r: 0.2126*lin(r[0]) + 0.7152*lin(r[1]) + 0.0722*lin(r[2])
def cr(a, b):
    la, lb = L(a), L(b); return (max(la,lb)+.05)/(min(la,lb)+.05)
print(f"{'token':<14}{'on Slate Black':>16}{'on Off-White':>16}")
for k in C:
    a, b = cr(h2r(C[k]), h2r(C['slateBlack'])), cr(h2r(C[k]), h2r(C['offWhite']))
    f = lambda v: f"{v:.2f}" + ("  AA" if v >= 4.5 else ("  lg" if v >= 3.0 else " FAIL"))
    print(f"{k:<14}{f(a):>16}{f(b):>16}")
print("\nAA = passes 4.5:1 normal text | lg = large text / graphics only (3:1) | FAIL = below 3:1")
