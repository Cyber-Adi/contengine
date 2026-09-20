#!/usr/bin/env python3
"""Contact sheet + feed-scale thumbnails.

contact-sheet.png : all slides in a grid, for the vision critic and for a human glance.
thumbs.png        : slides 1 and 2 at the width Instagram actually shows them.
                    Gate 4 runs against these, not against the full-size render.
"""
import sys, os, glob
from PIL import Image, ImageDraw

def contact_sheet(slides_dir, out, cols=4, thumb_w=340, pad=18, bg=(232, 236, 234)):
    files = sorted(glob.glob(os.path.join(slides_dir, "slide-*.png")))
    if not files:
        raise SystemExit("no slides")
    im0 = Image.open(files[0])
    ratio = im0.height / im0.width
    tw, th = thumb_w, int(thumb_w * ratio)
    rows = (len(files) + cols - 1) // cols
    W = cols * tw + (cols + 1) * pad
    H = rows * th + (rows + 1) * pad
    sheet = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        r, c = divmod(i, cols)
        x = pad + c * (tw + pad)
        y = pad + r * (th + pad)
        sheet.paste(Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS), (x, y))
        d.rectangle([x, y, x + tw - 1, y + th - 1], outline=(120, 130, 128), width=1)
    sheet.save(out, "PNG", optimize=True)
    print(f"  contact sheet -> {out}  ({len(files)} slides, {W}x{H})")

def thumbs(slides_dir, out, width=200, which=(1, 2), pad=24, bg=(232, 236, 234)):
    ims = []
    for n in which:
        f = os.path.join(slides_dir, f"slide-{n:02d}.png")
        if os.path.exists(f):
            im = Image.open(f).convert("RGB")
            ims.append(im.resize((width, int(width * im.height / im.width)), Image.LANCZOS))
    if not ims:
        return
    W = sum(i.width for i in ims) + pad * (len(ims) + 1)
    H = max(i.height for i in ims) + pad * 2
    sheet = Image.new("RGB", (W, H), bg)
    x = pad
    for im in ims:
        sheet.paste(im, (x, pad)); x += im.width + pad
    # upscale 3x with NEAREST so the reviewer sees exactly the thumbnail's real detail,
    # just large enough to look at. No new information is added.
    sheet.resize((W * 3, H * 3), Image.NEAREST).save(out, "PNG", optimize=True)
    print(f"  feed-scale thumbs -> {out}  (rendered at {width}px wide)")

if __name__ == "__main__":
    sd = sys.argv[1]
    outdir = os.path.dirname(sd.rstrip("/"))
    contact_sheet(sd, os.path.join(outdir, "contact-sheet.png"))
    thumbs(sd, os.path.join(outdir, "thumbs.png"))
