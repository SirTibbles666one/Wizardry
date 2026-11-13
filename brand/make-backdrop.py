#!/usr/bin/env python3
"""Build the sign-in backdrop: a portrait forest with texture, not a gradient.

The old backdrop was 1920x1080 landscape, so a phone cropped a thin middle sliver out
of it and got a flat green wash. This one is 1440x2160 (2:3) — closer to the shape the
phone actually shows — with the interest at the top and bottom edges and a calm middle,
because the form sits in the middle.

Textures are drawn, not filtered on at runtime: three depth layers of foliage blobs,
grain from feTurbulence, mist bands, and fireflies placed on a jittered grid so they
never line up.

    CHROME_PATH=... python3 make-backdrop.py
"""
import os
import random
import sys

from PIL import Image

import make as mk

W, H = 1440, 2160
OUT = os.path.join(mk.HERE, "backdrop.png")
rng = random.Random(20261113)


def leaves(count, y_band, radius, spread, fill, opacity, blur=0):
    """A canopy band: overlapping blobs plus a few singled-out leaves for edge texture."""
    parts = [f'<g opacity="{opacity}"' + (f' filter="url(#b{blur})"' if blur else "") + ">"]
    for _ in range(count):
        x = rng.uniform(-60, W + 60)
        y = rng.uniform(*y_band)
        r = rng.uniform(*radius)
        parts.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{fill}"/>')
    for _ in range(count // 4):
        x = rng.uniform(-40, W + 40)
        y = rng.uniform(*y_band)
        r = rng.uniform(radius[0] * 0.5, radius[1] * 0.8)
        rot = rng.uniform(0, 180)
        parts.append(
            f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{r:.0f}" ry="{r * 0.42:.0f}" fill="{fill}" '
            f'transform="rotate({rot:.0f} {x:.0f} {y:.0f})"/>'
        )
    parts.append("</g>")
    return "".join(parts)


def svg() -> str:
    fireflies = []
    for gx in range(6):
        for gy in range(9):
            if rng.random() < 0.42:
                continue
            x = gx * (W / 6) + rng.uniform(-50, 50)
            y = gy * (H / 9) + rng.uniform(-60, 60)
            r = rng.uniform(2.2, 5.6)
            fireflies.append(
                f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="#e8c46a" '
                f'opacity="{rng.uniform(0.18, 0.55):.2f}"/>'
            )

    return f"""<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="night" cx="58%" cy="26%" r="86%">
      <stop offset="0%" stop-color="#24402c"/>
      <stop offset="46%" stop-color="#1a2d20"/>
      <stop offset="78%" stop-color="#132219"/>
      <stop offset="100%" stop-color="#0b1610"/>
    </radialGradient>
    <radialGradient id="moonglow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#e8c46a" stop-opacity="0.30"/>
      <stop offset="55%" stop-color="#e0b45c" stop-opacity="0.09"/>
      <stop offset="100%" stop-color="#e0b45c" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9fd6a4" stop-opacity="0"/>
      <stop offset="45%" stop-color="#9fd6a4" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#9fd6a4" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="46%" r="72%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
    <mask id="crescent">
      <rect width="{W}" height="{H}" fill="black"/>
      <circle cx="1010" cy="470" r="196" fill="white"/>
      <circle cx="1092" cy="410" r="176" fill="black"/>
    </mask>
    <filter id="b6"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="b18"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="b40"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="{W}" height="{H}" fill="url(#night)"/>

  <!-- moon: glow, then the crescent itself -->
  <circle cx="1010" cy="470" r="420" fill="url(#moonglow)"/>
  <circle cx="1010" cy="470" r="196" fill="#e8c46a" opacity="0.16" mask="url(#crescent)" filter="url(#b18)"/>
  <circle cx="1010" cy="470" r="196" fill="#f0d79a" opacity="0.55" mask="url(#crescent)"/>

  <!-- canopy: far layer, blurred, then nearer layers that bite into frame -->
  {leaves(46, (-90, 320), (70, 190), 0, "#16301f", 0.85, 40)}
  {leaves(38, (-60, 260), (55, 150), 0, "#102518", 0.95, 18)}
  {leaves(30, (-70, 190), (45, 120), 0, "#0a1a11", 1.0, 6)}

  <!-- undergrowth, rising from the bottom edge -->
  {leaves(40, (H - 330, H + 90), (70, 200), 0, "#142a1c", 0.9, 40)}
  {leaves(34, (H - 250, H + 60), (55, 150), 0, "#0d1f14", 0.95, 18)}
  {leaves(26, (H - 190, H + 40), (45, 120), 0, "#08150d", 1.0, 6)}

  <!-- mist bands across the quiet middle -->
  <rect x="0" y="{H * 0.42:.0f}" width="{W}" height="{H * 0.22:.0f}" fill="url(#mist)"/>
  <ellipse cx="{W * 0.35:.0f}" cy="{H * 0.63:.0f}" rx="{W * 0.7:.0f}" ry="90" fill="#9fd6a4" opacity="0.05" filter="url(#b40)"/>
  <ellipse cx="{W * 0.7:.0f}" cy="{H * 0.78:.0f}" rx="{W * 0.55:.0f}" ry="70" fill="#9fd6a4" opacity="0.04" filter="url(#b40)"/>

  <!-- fireflies on a jittered grid, never in rows -->
  <g>{"".join(fireflies)}</g>

  <!-- grain, then vignette on top of everything -->
  <rect width="{W}" height="{H}" filter="url(#grain)" opacity="0.10"/>
  <rect width="{W}" height="{H}" fill="url(#vignette)"/>
</svg>"""


def main() -> int:
    src = os.path.join(mk.SRC, "backdrop.html")
    page = (
        '<!doctype html><html><head><meta charset="utf-8"><style>'
        "html,body{margin:0;padding:0;background:#0b1610;width:100vw;height:100vh;overflow:hidden}"
        f"svg{{display:block;width:100%;height:100%}}</style></head><body>{svg()}</body></html>"
    )
    with open(src, "w") as fh:
        fh.write(page)
    tmp = os.path.join(mk.HERE, "_backdrop-raw.png")
    mk.render("backdrop", W, H, "#0b1610", tmp, "white")
    Image.open(tmp).convert("RGB").save(OUT, optimize=True)
    os.remove(tmp)
    print(f"{OUT} {os.path.getsize(OUT) // 1024}kB {W}x{H}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
