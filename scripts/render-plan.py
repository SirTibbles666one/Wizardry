#!/usr/bin/env python3
"""Render PLAN.md to a print-ready HTML page, then hand it to Chromium for PDF.

The markdown is small and hand-written, so a focused converter beats pulling in a
renderer: headings, paragraphs, lists, tables, bold, italics and inline code are all
this document uses. Paragraphs are joined before formatting, otherwise emphasis that
straddles a line break prints as literal asterisks.
"""
import html
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# One renderer serves every plan: pass the source, the output and the title, so a
# second document never inherits the first one's footer.
_args = sys.argv[1:]
SOURCE = Path(_args[0]) if _args else ROOT / "PLAN.md"
PDF_OUT = Path(_args[1]) if len(_args) > 1 else ROOT / "PLAN.pdf"
DOC_TITLE = _args[2] if len(_args) > 2 else "Wizardry — operator plan"
FOOTER_LABEL = _args[3] if len(_args) > 3 else "Wizardry — operator plan · 12 November 2026"
HTML_OUT = PDF_OUT.with_suffix(".html")

INLINE_CODE = re.compile(r"`([^`]+)`")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ITALIC = re.compile(r"(?<!\*)\*([^*\n]+)\*(?!\*)")


def inline(text: str) -> str:
    text = html.escape(text, quote=False)
    text = INLINE_CODE.sub(lambda m: f"<code>{m.group(1)}</code>", text)
    text = BOLD.sub(lambda m: f"<strong>{m.group(1)}</strong>", text)
    text = ITALIC.sub(lambda m: f"<em>{m.group(1)}</em>", text)
    return text


def render(md: str) -> str:
    lines = md.splitlines()
    out: list[str] = []
    para: list[str] = []
    items: list[str] = []
    ordered = False
    list_start = 1
    table: list[list[str]] = []

    def flush_para():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    def flush_list():
        nonlocal ordered
        if items:
            # A numbered list interrupted by a blank line is still one list: carry the
            # starting number so the second half does not restart at 1.
            if ordered:
                start = f' start="{list_start}"' if list_start != 1 else ""
                out.append(f"<ol{start}>" + "".join(f"<li>{inline(i)}</li>" for i in items) + "</ol>")
            else:
                out.append("<ul>" + "".join(f"<li>{inline(i)}</li>" for i in items) + "</ul>")
            items.clear()
            ordered = False

    def flush_table():
        if not table:
            return
        head, *body = table
        cells = "".join(f"<th>{inline(c)}</th>" for c in head)
        rows = "".join(
            "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>" for row in body
        )
        out.append(f"<table><thead><tr>{cells}</tr></thead><tbody>{rows}</tbody></table>")
        table.clear()

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()

        if not stripped:
            flush_para()
            flush_list()
            flush_table()
            continue

        if stripped.startswith("|"):
            flush_para()
            flush_list()
            cells = [c.strip() for c in stripped.strip("|").split("|")]
            if all(set(c) <= {"-", ":"} and c for c in cells):
                continue
            table.append(cells)
            continue

        flush_table()

        if stripped.startswith("#"):
            flush_para()
            flush_list()
            level = len(stripped) - len(stripped.lstrip("#"))
            text = stripped[level:].strip()
            out.append(f"<h{level}>{inline(text)}</h{level}>")
            continue

        bullet = re.match(r"^[-*+]\s+(.*)$", stripped)
        number = re.match(r"^\d+\.\s+(.*)$", stripped)
        if bullet or number:
            flush_para()
            is_ordered = bool(number)
            if items and is_ordered != ordered:
                flush_list()
            if is_ordered and not items:
                list_start = int(number.group(0).split(".", 1)[0])
            ordered = is_ordered
            items.append((number or bullet).group(1))
            continue

        if stripped == "---":
            flush_para()
            flush_list()
            out.append("<hr/>")
            continue

        if items:
            # A wrapped list item: indented continuation belongs to the item, not to a
            # new paragraph — otherwise emphasis that straddles the wrap prints literally.
            if raw.startswith((" ", "\t")):
                items[-1] += " " + stripped
                continue
            flush_list()
        para.append(stripped)

    flush_para()
    flush_list()
    flush_table()
    return "\n".join(out)


CSS = """
@page { size: A4; margin: 18mm 16mm 16mm 16mm; }
body { font-family: "DejaVu Sans", sans-serif; font-size: 9.6pt; line-height: 1.52;
       color: #14121c; margin: 0; }
h1 { font-size: 21pt; margin: 0 0 6mm 0; color: #1b1330; letter-spacing: -0.01em; }
h2 { font-size: 13pt; margin: 8mm 0 3mm; color: #1b1330; border-bottom: 1.5pt solid #e9b65a;
     padding-bottom: 1.6mm; page-break-after: avoid; }
h3 { font-size: 10.6pt; margin: 5.5mm 0 2mm; color: #2c1d50; page-break-after: avoid; }
p { margin: 0 0 2.6mm; text-align: left; }
em { color: #4a4360; }
strong { color: #14121c; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 8.6pt; background: #f3f0ea;
       padding: 0.3mm 1mm; border-radius: 1mm; }
ul, ol { margin: 0 0 3mm 0; padding-left: 5.5mm; }
li { margin: 0 0 1.4mm; break-inside: avoid; }
table { width: 100%; border-collapse: collapse; margin: 2mm 0 4mm; font-size: 8.6pt;
        page-break-inside: auto; }
th { text-align: left; background: #1b1330; color: #f6f1e6; padding: 1.6mm 2mm; font-weight: 600; }
td { border-bottom: 0.4pt solid #ddd8cc; padding: 1.5mm 2mm; vertical-align: top; }
tr { page-break-inside: avoid; }
hr { border: none; border-top: 0.6pt solid #ddd8cc; margin: 5mm 0; }
"""


def main() -> int:
    md = SOURCE.read_text()
    body = render(md)
    HTML_OUT.write_text(
        "<!doctype html><html><head><meta charset='utf-8'>"
        f"<title>{DOC_TITLE}</title><style>{CSS}</style></head>"
        f"<body>{body}</body></html>"
    )
    node = Path(__file__).with_name("pdf.mjs")
    result = subprocess.run(
        ["node", str(node), str(HTML_OUT), str(PDF_OUT), FOOTER_LABEL],
        capture_output=True, text=True,
        env={**__import__("os").environ},
    )
    print(result.stdout.strip() or result.stderr.strip())
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
