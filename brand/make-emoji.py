#!/usr/bin/env python3
"""Generate the wizard sloth emoji pack.

Twelve expressions of the same character, drawn from the shapes the icon is made of,
so the pack reads as one creature rather than twelve stickers. Each is written as an
HTML page, rendered twice — over white and over black — and the alpha solved, exactly
as `make.py` does for the larger assets.

    CHROME_PATH=... python3 make-emoji.py
"""
import os
import sys

from PIL import Image

import make as mk

HERE = mk.HERE
SRC = mk.SRC
OUT = os.path.join(HERE, "emoji")
SIZE = 128

FUR = "#8a6f4f"
FUR_DARK = "#6d5842"
FACE = "#e9dcc3"
EYE = "#142b1c"
NOSE = "#5a4834"
HAT = "#4d7a3f"
BRIM = "#e0b45c"
CREAM = "#f4ece0"
HONEY = "#e0b45c"

PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{{margin:0;padding:0;background:transparent;width:100vw;height:100vh;overflow:hidden}}
  svg{{display:block;width:100%;height:100%}}
</style></head><body>
<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">{body}</svg>
</body></html>"""


def head(eyes: str, mouth: str, extra: str = "", hat: str = "") -> str:
    return f"""{hat}
<ellipse cx="64" cy="76" rx="40" ry="33" fill="{FUR}" stroke="rgba(20,43,28,0.18)" stroke-width="1.5"/>
<ellipse cx="64" cy="80" rx="28" ry="24" fill="{FACE}"/>
<ellipse cx="46" cy="72" rx="12" ry="10.5" fill="{FUR_DARK}"/>
<ellipse cx="82" cy="72" rx="12" ry="10.5" fill="{FUR_DARK}"/>
{eyes}
<ellipse cx="64" cy="90" rx="6" ry="4.4" fill="{NOSE}"/>
{mouth}
{extra}"""


def default_hat() -> str:
    return f"""<path d="M22 46 L56 6 Q62 -2 68 6 L102 46 Z" fill="{HAT}"/>
<path d="M16 48 Q64 42 112 48 L108 34 Q64 28 20 34 Z" fill="{BRIM}"/>
<path d="M85 18 l2.6 6.2 6.2 2.6 -6.2 2.6 -2.6 6.2 -2.6 -6.2 -6.2 -2.6 6.2 -2.6 z" fill="{BRIM}"/>{''}"""


def open_eyes(dx: int = 0, dy: int = 0) -> str:
    return f"""<circle cx="{47 + dx}" cy="{73 + dy}" r="5.6" fill="{EYE}"/>
<circle cx="{81 + dx}" cy="{73 + dy}" r="5.6" fill="{EYE}"/>
<circle cx="{48.8 + dx}" cy="{71 + dy}" r="1.9" fill="{CREAM}"/>
<circle cx="{82.8 + dx}" cy="{71 + dy}" r="1.9" fill="{CREAM}"/>"""


def closed_eyes() -> str:
    return f"""<path d="M41 73 q6 5 12 0" stroke="{EYE}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M75 73 q6 5 12 0" stroke="{EYE}" stroke-width="3.4" fill="none" stroke-linecap="round"/>"""


def happy_eyes() -> str:
    return f"""<path d="M41 75 q6 -6 12 0" stroke="{EYE}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
<path d="M75 75 q6 -6 12 0" stroke="{EYE}" stroke-width="3.4" fill="none" stroke-linecap="round"/>"""


def smile(width: int = 10) -> str:
    return (f'<path d="M{64 - width} 98 q{width} 7 {width * 2} 0" stroke="{NOSE}" '
            f'stroke-width="3" fill="none" stroke-linecap="round"/>')


def flat_mouth() -> str:
    return f'<path d="M56 99 h16" stroke="{NOSE}" stroke-width="3" stroke-linecap="round"/>'


def open_mouth() -> str:
    return (f'<ellipse cx="64" cy="98" rx="8" ry="7" fill="#5a2f2f"/>'
            f'<ellipse cx="64" cy="101" rx="4.6" ry="3.4" fill="#c76b6b"/>')


def paw(side: str) -> str:
    x = 108 if side == "right" else 20
    return f'<ellipse cx="{x}" cy="86" rx="10" ry="12" fill="{FUR}" stroke="rgba(20,43,28,0.18)" stroke-width="1.5"/>'


def sparkle(x: int, y: int, r: float = 3.4, colour: str = HONEY) -> str:
    return (f'<path d="M{x} {y - r * 2} l{r * 0.8} {r * 1.2} {r * 1.2} {r * 0.8} '
            f'-{r * 1.2} {r * 0.8} -{r * 0.8} {r * 1.2} -{r * 0.8} -{r * 1.2} '
            f'-{r * 1.2} -{r * 0.8} {r * 1.2} -{r * 0.8} z" fill="{colour}"/>')


CUPS = "M92 92 h18 v12 a9 9 0 0 1 -9 9 h-0 a9 9 0 0 1 -9 -9 z"
STEAM = ('<path d="M96 88 q4 -6 0 -12" stroke="rgba(244,236,224,0.55)" stroke-width="2.6" '
         'fill="none" stroke-linecap="round"/>'
         '<path d="M105 88 q4 -6 0 -12" stroke="rgba(244,236,224,0.55)" stroke-width="2.6" '
         'fill="none" stroke-linecap="round"/>')

VARIANTS = {
    "hello": head(open_eyes(), smile(9), paw("right")),
    "sleepy": head(closed_eyes(), smile(7),
                   f'<text x="98" y="40" font-size="20" fill="{CREAM}" font-family="sans-serif">z</text>'
                   f'<text x="110" y="26" font-size="14" fill="rgba(244,236,224,0.7)" font-family="sans-serif">z</text>'),
    "yes": head(open_eyes(0, 1), smile(12),
                f'<path d="M22 58 q-6 -5 -6 -12" stroke="{CREAM}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.6"/>'
                f'<path d="M106 58 q6 -5 6 -12" stroke="{CREAM}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.6"/>'),
    "love": head(happy_eyes(),
                 f'<path d="M64 104 c-7 -7 -12 -10 -12 -15 a6 6 0 0 1 12 -3 a6 6 0 0 1 12 3 c0 5 -5 8 -12 15 z" fill="#d9534f"/>'),
    "cast": head(open_eyes(), smile(8),
                 f'<path d="M114 112 L96 40" stroke="{FUR_DARK}" stroke-width="4.5" stroke-linecap="round"/>'
                 f'<circle cx="96" cy="36" r="7.5" fill="none" stroke="{HONEY}" stroke-width="3.6"/>'
                 f'<ellipse cx="107" cy="86" rx="9" ry="8" fill="{FUR}" stroke="rgba(20,43,28,0.18)" stroke-width="1.5"/>'
                 + sparkle(30, 40, 3.2) + sparkle(112, 22, 2.6)),
    "tea": head(happy_eyes(), smile(7), f'<rect x="88" y="92" width="22" height="18" rx="4" fill="{CREAM}"/>'
                                        f'<path d="M110 96 q8 4 0 10" stroke="{CREAM}" stroke-width="3" fill="none"/>' + STEAM),
    "think": head(open_eyes(0, -1), flat_mouth(),
                  f'<circle cx="94" cy="52" r="4.2" fill="{CREAM}" opacity="0.85"/>'
                  f'<circle cx="106" cy="38" r="6.4" fill="{CREAM}" opacity="0.95"/>'
                  f'<circle cx="119" cy="22" r="9" fill="{CREAM}"/>'),
    "laugh": head(happy_eyes(), open_mouth()),
    "shrug": head(open_eyes(), f'<path d="M56 100 q8 -6 16 0" stroke="{NOSE}" stroke-width="3" fill="none" stroke-linecap="round"/>',
                  f'<ellipse cx="12" cy="58" rx="12" ry="14" fill="{FUR}" stroke="rgba(20,43,28,0.18)" stroke-width="1.5"/>'
                  f'<ellipse cx="116" cy="58" rx="12" ry="14" fill="{FUR}" stroke="rgba(20,43,28,0.18)" stroke-width="1.5"/>'
                  f'<path d="M12 44 v-10 M12 34 l-5 5 M12 34 l5 5" stroke="{CREAM}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.75"/>'
                  f'<path d="M116 44 v-10 M116 34 l-5 5 M116 34 l5 5" stroke="{CREAM}" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.75"/>'),
    "star": head(happy_eyes(), smile(8),
                 sparkle(102, 44, 6.2) + sparkle(116, 58, 3.0) + paw("right")),
    "no": head(open_eyes(), flat_mouth(),
               f'<path d="M40 62 l10 5" stroke="{EYE}" stroke-width="3" stroke-linecap="round"/>'
               f'<path d="M88 62 l-10 5" stroke="{EYE}" stroke-width="3" stroke-linecap="round"/>'),
    "night": head(closed_eyes(), smile(6),
                  f'<path d="M104 26 a18 18 0 1 0 0 32 a14 14 0 1 1 0 -32 z" fill="{CREAM}" opacity="0.9"/>'
                  + sparkle(24, 34, 2.6, CREAM) + sparkle(34, 54, 2.0, CREAM)),
}


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    made = []
    for name, body in VARIANTS.items():
        page = PAGE.format(body=default_hat() + body)
        src_path = os.path.join(SRC, f"emoji-{name}.html")
        with open(src_path, "w") as fh:
            fh.write(page)
        mk.render(f"emoji-{name}", SIZE, SIZE, "#ffffff", mk.WHITE, "white")
        mk.render(f"emoji-{name}", SIZE, SIZE, "#000000", mk.BLACK, "black")
        image = mk.solve(SIZE, SIZE)
        target = os.path.join(OUT, f"{name}.png")
        image.save(target)
        made.append((name, target))
        print(f"{name}.png {os.path.getsize(target) // 1024}kB")

    # a contact sheet, on the theme's own ground, so the pack can be judged as a set
    cols, pad, label_h = 6, 16, 22
    rows = (len(made) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (SIZE + pad) + pad,
                              rows * (SIZE + pad + label_h) + pad), (24, 39, 28))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(sheet)
    for i, (name, path) in enumerate(made):
        r, c = divmod(i, cols)
        x = pad + c * (SIZE + pad)
        y = pad + r * (SIZE + pad + label_h)
        sheet.paste(Image.open(path), (x, y), Image.open(path))
        draw.text((x + 4, y + SIZE + 4), name, fill=(228, 239, 226))
    sheet.save(os.path.join(HERE, "emoji-sheet.png"))
    print("sheet:", os.path.join(HERE, "emoji-sheet.png"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
