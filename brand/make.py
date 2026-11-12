#!/usr/bin/env python3
"""Render the Wizardry mascot assets from their HTML sources.

Chromium returns an opaque canvas however transparent the page is, so each asset
is rendered twice — once over white, once over black — and the alpha is solved:
for colour C at alpha a over white W and black B, B = C*a and W = C*a + 255*(1-a),
so a = 1 - (W-B)/255 and C = B/a. Edges stay smooth, which keying white does not.

    CHROME_PATH=... python3 make.py
"""
import os
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
RASTER = os.path.join(HERE, "rasterize.mjs")
CHROME = os.environ.get("CHROME_PATH", "chromium")

ASSETS = [
    ("icon", 512, 512),
    ("card", 1200, 630),
    ("symbol", 512, 512),
    ("hero", 560, 680),
    ("wordmark", 1280, 320),
    ("backdrop", 1920, 1080),
    ("favicon", 64, 64),
    ("favicon-dark", 64, 64),
]

WHITE = os.path.join(HERE, ".over-white.png")
BLACK = os.path.join(HERE, ".over-black.png")


def render(name, w, h, background, out, label):
    # The label, not the colour, names the temp file: a '#' in a path becomes a URL
    # fragment, and Chromium then loads nothing and screenshots a blank page.
    page = os.path.join(HERE, f".{name}-{label}.html")
    with open(os.path.join(SRC, f"{name}.html")) as src:
        html = src.read()
    html = html.replace("background:transparent", f"background:{background}")
    with open(page, "w") as fh:
        fh.write(html)
    env = {**os.environ, "CHROME_PATH": CHROME}
    subprocess.run(
        ["node", RASTER, page, out, str(w), str(h)],
        check=True, capture_output=True, env=env,
    )
    os.unlink(page)


def solve(w, h):
    over_white = Image.open(WHITE).convert("RGB")
    over_black = Image.open(BLACK).convert("RGB")
    if over_white.size != (w, h):
        raise SystemExit(f"render size mismatch: {over_white.size}; check {SRC}")
    out = Image.new("RGBA", (w, h))
    pw, pb, po = over_white.load(), over_black.load(), out.load()
    for y in range(h):
        for x in range(w):
            wr, wg, wb = pw[x, y]
            br, bg, bb = pb[x, y]
            a = 1.0 - ((wr - br) + (wg - bg) + (wb - bb)) / (3 * 255)
            if a <= 0.004:
                po[x, y] = (0, 0, 0, 0)
                continue
            a = min(a, 1.0)
            po[x, y] = (
                min(255, round(br / a)), min(255, round(bg / a)), min(255, round(bb / a)),
                round(a * 255),
            )
    return out


def main():
    for name, w, h in ASSETS:
        render(name, w, h, "#ffffff", WHITE, "white")
        render(name, w, h, "#000000", BLACK, "black")
        image = solve(w, h)
        target = os.path.join(HERE, f"{name}.png")
        image.save(target)
        corner = image.load()[0, 0]
        print(f"{name}.png {w}x{h} {os.path.getsize(target) // 1024}kB corner={corner}")
    for leftover in (WHITE, BLACK):
        if os.path.exists(leftover):
            os.unlink(leftover)
    return 0


if __name__ == "__main__":
    sys.exit(main())
