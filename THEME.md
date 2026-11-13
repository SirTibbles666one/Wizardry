# The theme, measured

Theme v3 is live on `wizardry.slothlee.xyz`. It is applied as `branding.custom_css` on
`app_public_config` — no image, no deploy — and the source of record is
[`brand/theme.css`](./theme.css). This document says what it sets, what changed, and what it
cannot prove.

## Why a v3 at all

V2 set the brand colour and the three background surfaces, which was enough to make the sign-in
page look like ours. Measuring the rendered page found three leaks that no colour picker would
have shown:

| Symptom, measured on the live page | Cause | Fix |
|---|---|---|
| Document background `rgb(8, 6, 22)` — a violet near-black — behind and around the app | `--background-primary` was set, but `html`/`body` were not | `html,body{background:#18271c}` |
| Text `hsl(258, 10%, 96%)` — a violet-tinted white | `--text-primary` untouched | the full ink scale, hue-free: `#e4efe2` / `#c3d4bf` / `#9db39a` |
| Input borders `rgba(201,197,211,.15)` — violet-grey | `--border-color` and the modifier variables untouched | canopy borders at `rgba(163,189,160,.20)` |
| `--font-display` empty | never declared, only `h1,h2,h3` was targeted directly | declared, so components that use the token get Baloo 2 |

## What v3 sets

- **Canvas** — `#18271c` on `html` and `body`, `color-scheme: dark`, honey selection.
- **Ink** — a five-step green-neutral scale replacing the violet-tinted one, plus chat, code and
  warning colours.
- **Surfaces** — primary, secondary, secondary-alt, secondary-lighter, tertiary, header, textarea,
  and the four modifier states (hover, accent, selected, focus).
- **Honey** — the brand family, including the two variables that decide whether a button reads gold
  on gold: `--brand-primary-fill` and `--instance-brand-primary-fill` are the **label** colour.
- **Type** — `--font-sans`, `--font-sans-primary`, `--font-display`, plus element-level fallbacks
  so the first paint is right before React mounts.
- **Chrome** — scrollbars (thin, canopy thumb, honey on hover), `:focus-visible` ring at 85% honey,
  and 140 ms transitions on interactive elements.
- **Restraint** — `prefers-reduced-motion` kills the transitions, `prefers-reduced-data` drops the
  backdrop.

## The one thing v3 changed about behaviour

Measured at 390×844: the primary button was **342×36 px**, under the 44 px floor that a thumb
needs. It is now 44 px tall on phones and unchanged on desktop:

On phones only, every button whose class begins with `Button.module__button` gets
`min-height:44px!important`; desktop is untouched.

Two things had to be true for that to work, and both are worth recording. The selector targets a
**module class prefix** (`Button.module__button`), because the hash suffix changes every build and
a full class name is a rule that works until Thursday. And the declaration needs `!important`,
because the injected stylesheet lands *before* the app's own sheets, so an equal-specificity rule
of theirs wins on source order — the first attempt silently did nothing, and only re-measuring the
button's box caught it.

## What is verified, and what is not

**Verified by measurement on the live page**, at 390×844 and 1440×900: document and body
background, the ink scale, `--font-display`, the input border and focus ring, scrollbar colour,
and the button's height. A screenshot was reviewed for palette coherence: no violet or grey cast
remains outside the deliberately muted secondary line.

**Not verified: every signed-in surface.** The composer, channel list, member sidebar, modals and
settings screens all draw on the same token set, so they inherit the palette — but I cannot see
them without an account, and a token being set is not the same as a screen looking right. This is
the honest boundary of the work: the palette is proven and the screens are not.

## What still needs an app build

1. **The auth composition sits top-heavy.** At 390×844 the form occupies y=122 to y=294 and the
   lower 550 px is empty. Vertical centring is a layout change in a module the theme cannot reach
   safely.
2. **The disabled primary button fades to 50% opacity**, which makes the CTA look muddy on an empty
   form. A disabled state should read as unavailable, not as a different colour.
3. **The passkey link and the primary button share the honey accent.** Hierarchy currently rests on
   size and position alone; a secondary treatment for links would let the button own the accent.

Those three are in `BACKLOG.md` as Q20, because they need code and the queue is where code lives.
