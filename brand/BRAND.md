# Wizardry — brand system (v2)

The mark changed on 12 November 2026. This document replaces the original one-mark,
obsidian-and-gold system: the identity now belongs to the same family as Sloth Lee, and
the mark is the mascot rather than the compass seal.

## The idea

**A sloth in a wizard's hat, in a forest at night.** Sloth Lee is the daytime of that
family — cream paper, leaf green, honey light, a sloth who is in no hurry. Wizardry is
the same forest after dark: pine, moss, fireflies, the same honey accent, the same
animal, now wearing a hat.

That is the whole concept. Everything below is the consequences of it.

## Palette

The values are Sloth Lee's `canopy` theme, token for token, so the two products read as
one family rather than two brands that happen to be green.

| Role | Value | Where it is used |
| --- | --- | --- |
| Ground | `#18271c` | page background |
| Ground, raised | `#1d3123` | cards, panels |
| Ground, higher | `#213a2b` | inputs, icon badge |
| Ink | `#e4efe2` | body text |
| Ink, muted | `#a3bda0` | secondary text, the domain line |
| Accent (honey) | `#e0b45c` | the only accent: buttons, links, stars, moon |
| Label on honey | `#16241a` | text on a honey button — never white |
| Fur | `#8a6f4f` | the mascot's head |
| Face | `#e9dcc3` | the mascot's face |
| Mask | `#6d5842` | the sloth's eye patches |
| Blush | `#dda089` | cheeks, at 75% |
| Line | `#142b1c` | eyes, smile, hat brim shadow |

One accent, no gradients in the marks, and no second colour that competes with honey.
Violet and obsidian from v1 are retired.

## Type

- **Baloo 2** (700/800) — the wordmark and headings. Rounded, friendly, slightly
  top-heavy: the same letterforms Sloth Lee uses for display.
- **Nunito** (400/600/700) — interface text.
- Both are declared as `@font-face` inside the instance's custom CSS, pointing at
  `fonts.gstatic.com`, which the app-proxy's `font-src` already allows. No font is
  bundled, so there is nothing to serve or expire.

## The mark

The mascot, drawn in flat vector geometry from the same four shapes Sloth Lee's mark is
built from — fur disc, cream face, two dot eyes, blush — plus the two things that make
him a wizard:

- a **pointed hat** (leaf green cone, honey brim, one four-pointed star) that sits *on*
  the skull, brim overlapping the crown so it is worn rather than balanced;
- a **staff** with a honey crescent, held by a visible paw.

Sloth cues that must survive: dark eye masks, a low blunt nose, the cream face patch.
Remove any one of them and the character becomes a generic bear.

## Assets and how they are made

Everything in `brand/` is rendered from `brand/src/*.html` by `python3 brand/make.py`
(headless Chromium, then alpha solved from a white render and a black render, because
Chromium here returns an opaque canvas whatever it is asked for). No asset is drawn
twice and none is hand-exported.

| Asset | Size | Used for |
| --- | --- | --- |
| `icon.png` | 512² | guild icon, panel badge, app icon |
| `symbol.png` | 512² | the full bust with staff |
| `hero.png` | 560×680 | the standalone portrait, not currently served |
| `wordmark.png` | 1280×320 | the "Wizardry" lockup in the auth panel |
| `favicon.png` / `favicon-dark.png` | 64² | browser tabs (mini mascot, no staff) |
| `backdrop.png` | 1920×1080 | sign-in atmosphere: moon, mist, fireflies |

### Two sizes of the same character

The detailed bust is for 128 px and up. Below that, `MINI` — a separate, zoomed,
simplified composition — takes over: masks and eyes grow, the nose stays, and the smile
and blush are dropped because at 32 px they are noise. Same character, two drawings,
chosen by final size. This is the one place duplication is correct.

### Rule learned the hard way
**The backdrop carries no character.** The client crops `sign_in_backdrop_url` harder
than `cover` predicts; a mascot placed inside the 1920×1080 safe area was still cut off
at both edges across two attempts. The backdrop is therefore atmosphere only — moon,
mist, fireflies — and the mascot appears in the icon and the wordmark, where it is
composited by the app rather than cropped by it.

## Clear space and minimum sizes

- Mark: clear space of one eye-patch width on every side.
- Minimum sizes: badge 32 px, bust 64 px, wordmark 96 px wide.
- On honey, the mark is never placed; honey is for text and controls.

## The link card

`card.png` (1200×630) is the picture a pasted invite shows: mascot badge left, wordmark,
honey rule, tagline, address. Rendered from `src/card.html` like every other asset, so it is
reproducible. The proxy injects it as `og:image` with explicit width and height, sets
`twitter:card` to `summary_large_image`, and carries the tagline as `og:description` — the
first place the line is published, since no branding field holds a description.

## Quiet rules

Four things this product does not do, written down so a future branch does not add them helpfully:

- **No read receipts.** The absence is deliberate. Knowing that someone read your message and did
  not answer is a pressure this place is not for.
- **Typing indicators are never the ambient state of the room.** They may be switched on; they are
  not the default background noise.
- **An announcement does not ping.** A notice is something you find, not something that finds you.
- **Nothing is summarised by a model.** Counts, first lines and dates are honest; a generated
  summary of a conversation that invented a decision would be worse than silence.

## Voice

One sentence, used wherever the instance describes itself: **"A private forest for people
who talk slowly."** It is the tagline for the link card and the first line of the notice.
Rules: no exclamation marks, no "community", no growth language, British spelling.

Name of the guild: **Nightgrove** — the same forest as Sloth Lee's grove, after dark.

Mail carries the **mascot's face** in the header and the wordmark in the footer, always
with alt text and a plain-text part, because a face reads as a place rather than a service
and the text covers clients that block images.

## What stays deliberately unchanged

- Fluxer's UI artwork, icons and illustrations — CC BY-SA 4.0, and not ours to redraw.
- Internal identifiers (`fluxer_*` tables, container names, env prefixes).
- Upstream feature behaviour. The brand is a skin; it does not change what the software
  does.

## Changing it

Edit the `.html` source in `brand/src/`, run `python3 brand/make.py`, commit the PNGs,
then point the instance's branding URLs at them with a bumped `?v=`. The instance reads
branding from `app_public_config` in its KV store — and the value there must be stored
as a **JSON string**, not an object: an object makes the API log "Stored app public
configuration is not valid JSON" and fall back to the first-run setup screen.
