#!/usr/bin/env python3
"""Lanczos downsample the 2x supersampled renders to final canvas size.

Supersampling then downsampling is the single biggest 'does it look professional'
lever in the pipeline: at 1x, Playfair Display's thin strokes alias visibly at 96pt.
"""
import sys, os, glob
from PIL import Image

def main(slides_dir, w, h):
    n = 0
    for big in sorted(glob.glob(os.path.join(slides_dir, "_2x_*.png"))):
        idx = os.path.basename(big).replace("_2x_", "").replace(".png", "")
        out = os.path.join(slides_dir, f"slide-{idx}.png")
        im = Image.open(big).convert("RGB")
        im.resize((w, h), Image.LANCZOS).save(out, "PNG", optimize=True)
        os.remove(big)
        n += 1
    print(f"  downsampled {n} slides -> {w}x{h} (Lanczos)")

if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
