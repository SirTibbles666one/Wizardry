"""Rebuild the transparent brand PNGs by rendering each asset over white and
over black and reconstructing alpha exactly.

Chromium's screenshot here returns an opaque canvas whatever we ask for, so the
alpha is solved instead of requested: for a colour C drawn at alpha a over white
W and black B, B = C*a and W = C*a + 255*(1-a), so a = 1 - (W-B)/255 and
C = B/a. That also keeps anti-aliased edges smooth, which keying white does not.
"""
import os
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = os.environ.get("CHROME_PATH", "chromium")
ASSETS = [
    ("symbol", 256, 256),
    ("logo", 1400, 400),
    ("wordmark", 1280, 320),
    ("favicon", 32, 32),
    ("favicon-dark", 32, 32),
]


def render(html_name, out_name, w, h):
    env = dict(os.environ, CHROME_PATH=CHROME)
    subprocess.run(
        ["node", os.path.join(HERE, "rasterize.mjs"), html_name, out_name, str(w), str(h)],
        cwd=HERE, env=env, check=True, capture_output=True, timeout=120,
    )


for name, w, h in ASSETS:
    source = open(os.path.join(HERE, f"{name}.html")).read()
    for bg, tag in (("#ffffff", "white"), ("#000000", "black")):
        variant = source.replace("background:transparent", f"background:{bg}")
        open(os.path.join(HERE, f"{name}-{tag}.html"), "w").write(variant)
        render(f"{name}-{tag}.html", f"{name}-{tag}.png", w, h)

    white = Image.open(os.path.join(HERE, f"{name}-white.png")).convert("RGB")
    black = Image.open(os.path.join(HERE, f"{name}-black.png")).convert("RGB")
    out = Image.new("RGBA", white.size)
    wp, bp, op = white.load(), black.load(), out.load()
    for y in range(white.size[1]):
        for x in range(white.size[0]):
            wr, wg, wb = wp[x, y]
            br, bg_, bb = bp[x, y]
            diff = ((wr - br) + (wg - bg_) + (wb - bb)) / 3.0
            a = max(0, min(255, int(round(255 - diff))))
            if a == 0:
                op[x, y] = (0, 0, 0, 0)
            else:
                scale = 255.0 / a
                op[x, y] = (
                    max(0, min(255, int(round(br * scale)))),
                    max(0, min(255, int(round(bg_ * scale)))),
                    max(0, min(255, int(round(bb * scale)))),
                    a,
                )
    out.save(os.path.join(HERE, f"{name}.png"))
    corner = out.getpixel((3, 3))
    print(f"{name}.png {out.size} corner={corner}")
