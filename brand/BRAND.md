# Wizardry — brand system

A dark, arcane identity for the self-hosted instance at `wizardry.slothlee.xyz`.
One mark, one accent, no decoration that does not survive at 32 px.

## The idea

Wizardry is a messenger that runs on your own machine. The brand says so quietly:
an obsidian ground, a single ember-gold seal, and lettering that is set, not
shouted. Nothing glows, sparkles or drips — the strength is the restraint, so the
interface chrome (which the app draws) stays the loudest thing on screen.

## The mark — "the Seal"

A tall diamond drawn from four straight strokes, a thin reticle through its
centre, and a solid gold orb at the crossing. It is a compass rose read as a
seal: a fixed point you navigate by, which is the whole promise of a self-hosted
instance. At 32 px it reduces to diamond + orb and still reads.

- Diamond: single closed path, 18 px stroke, `stroke-linejoin: round`
- Reticle: vertical 0.42 and horizontal 0.30 opacity — texture, never structure
- Orb: r 38 of 512, solid accent, ringed at r 62 for large sizes only

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| Obsidian | `#0B0A12` | grounds, `theme_color`, backdrop base |
| Deep violet | `#1B1330` | icon body, panels |
| Arcane indigo | `#2C1D50` | the lit corner of a gradient |
| Ember gold | `#E9B65A` | the seal, the wordmark's first half |
| Dim gold | `#B98A3C` | hover/pressed states, hairlines |
| Mist | `#C9C2DB` | the wordmark's second half, secondary labels |

Gold on obsidian is the entire colour story. Violet only ever appears as depth,
never as a second accent — two accents is how a dark brand starts to look cheap.

## Type

DejaVu Sans Bold for the wordmark, `letter-spacing: 0.16em`, all caps. Wide
tracking is what makes a plain geometric sans read as set rather than typed. The
wordmark splits `WIZA` in gold and `RDRY` in mist — the break lands on a letter
boundary after four characters, so it reads as a deliberate rule, not a gradient.

## Assets

| File | Size | Where it goes |
| --- | --- | --- |
| `icon.png` | 512×512 | app icon, `branding.icon_url` |
| `symbol.png` | 256×256 | compact mark, `branding.symbol_url` |
| `logo.png` | 1400×400 | horizontal lockup, `branding.logo_url` |
| `wordmark.png` | 1280×320 | type only, `branding.wordmark_url` |
| `favicon.png` | 32×32 | dark glyph for light browser chrome, `branding.favicon_url` |
| `favicon-dark.png` | 32×32 | gold glyph for dark chrome, `branding.favicon_dark_url` |
| `backdrop.png` | 1920×1080 | sign-in card background, `branding.sign_in_backdrop_url` |

Sources are the `.html` files beside each PNG: each one is a page the size of the
asset, rendered by headless Chromium (`rasterize.mjs` in the build scratch dir).
There is no design file to keep in sync — the HTML *is* the artwork.

## Rules

- Clear space around the seal: one quarter of its width on every side.
- Never place the seal on gold, or the wordmark on violet lighter than `#2C1D50`.
- Minimum sizes: seal 24 px, wordmark 96 px wide, lockup 140 px wide.
- Do not add a second mark, a mascot, or an illustration. One seal, everywhere.

## Changing it

Edit the `.html` source, re-render, replace the PNG here, and update the URLs the
instance points at. The instance reads branding from `app_public_config` in its
KV store; the app-proxy allowlists each branding URL's origin in its CSP
automatically, so a new host needs no proxy change.
