# Wizardry — third wave: the brand, finished, and a status board

*Written 12 November 2026, after the theme and the wizard sloth shipped. Measured on the
live instance; every number names what produced it.*

Waves one and two were about keeping the instance alive and proving what it can already
do. This wave is about the part that is now half-built: the identity. The palette, the
mascot and the type are live. Four surfaces still show somebody else's defaults, and one
of them is visibly wrong the moment someone installs the app.

The last section is the part I would keep if the rest were lost: **a status board for all
three waves**, so nothing planned here can quietly evaporate.

## 1. What is live

| Fact | Value | How known |
| --- | --- | --- |
| Product name | `Wizardry` | `.well-known/fluxer` |
| Theme colour | `#18271c` (pine) | same document |
| Custom CSS | 1410 bytes, live | same document |
| Marks in use | icon, symbol, logo, wordmark, favicon, favicon-dark, backdrop | branding row |
| Palette | Sloth Lee `canopy`, token for token | `dashboard/src/tokens.css` |
| Type | Baloo 2 (display) + Nunito (UI), via `fonts.gstatic.com` | custom CSS; CSP allows it |
| Sign-in render | mascot badge, "Wizardry", honey CTA, honey passkey link | headless render, 1440×900 |
| Guild icon | **none** | `guilds` row |
| Instance notice | **none** | `instance_notice` absent |

The brand system itself — palette table, mascot rules, how each asset is generated — is
`brand/BRAND.md`. It is not repeated here.

## 2. Four surfaces still wearing default clothes

Each is a finding, not a preference, and each has the measurement beside it.

| Question | Evidence | Kind |
| --- | --- | --- |
| "Why does the app flash grey when I install it?" | `manifest.json` returns `background_color: #2b2d31` — upstream's Discord grey — while `theme_color` is our pine | finding |
| "What does this link look like when I paste it?" | `og:image` is the 512² icon, `twitter:card` is `summary`, and there is no `og:description` at all | finding |
| "Does the guild look like Wizardry?" | `guilds.icon_hash` is null; banner and splash unset | finding |
| "Do the emails look like Wizardry?" | verification and reset mail come from `noreply@slothlee.xyz`, name `Wizardry`, but the body is upstream's default template | finding |

### 3.1 A PWA splash that belongs to the forest
*Cheapest real bug on the list.*

`fluxer_app_proxy/src/routes/spa_static.rs` merges branding into the manifest — it
overrides `name`, `short_name` and `theme_color`, and leaves `background_color` at the
baked default. So the icon is a sloth and the splash behind it is Discord grey.

- Rules: the fix is one field in `apply_manifest_branding`, derived from the same
  `theme_color` the manifest already trusts; the fork carries the patch, the release
  image does not, so this is the first item that must survive an upstream upgrade.
- Pass: `manifest.json` returns `background_color: #18271c`; a phone install-launch shows
  pine before the app paints; `maskable` icon present with the mark inside the 80% safe
  circle.

### 3.2 A link card worth pasting
*Second, because an invitation is usually a pasted link.*

- Rules: 1200×630 landscape card, the wordmark on it, one line of tagline; no square icon
  where a card belongs; the description says what the thing is, in the brand's voice.
- Pass: pasting `https://wizardry.slothlee.xyz` into Telegram renders a large card with
  the art, a title and a description; Twitter/X shows the same; a client with images off
  still shows title and description.

### 3.3 Guild art
*Third, but it needs a decision first (see §7).*

- Rules: same seal and palette as `brand/`; generated from the existing sources, not drawn
  again; no second mascot.
- Pass: guild icon 512², banner 960×540, invite splash 1920×1080, all live; the guild rail
  and invite page both show the mascot; zero default placeholders left.

### 3.4 Transactional mail in the brand's hand
*Fourth, because it is the only part of Wizardry that arrives uninvited.*

- Rules: one header (the wordmark, not a photograph), one honey button, a pine footer;
  hi-dpi assets with alt text; a plain-text alternative that still reads; no tracking
  pixel — this instance does not phone home.
- Pass: a real verification email renders correctly in Gmail web and Apple Mail; with
  images blocked the button still reads; the plain-text part names the same link.

### 3.5 First-run copy
*Last, because it is the only item whose content depends on who is being welcomed.*

- Rules: one notice, one pinned message, one empty-state line. No tour, no checklist, no
  carousel. British spelling, no exclamation marks, no "Welcome to the community!".
- Pass: a new account sees the notice, the pinned message is first in `#general`, and an
  empty channel says something true instead of nothing.

### 3.6 A blank screen that says nothing
*Added the day after this plan was written, because it happened.*

Reported from a phone: `wizardry.slothlee.xyz/chai` rendered a full-screen pine
background with nothing on it. What the measurements say:

| Check | Result |
| --- | --- |
| `/chai` from the server | `200 text/html`, the app shell, 62,845 bytes |
| `/chai` in a clean 390×844 mobile-emulated browser | renders "404: page not found", title `Wizardry | Not found`, **console clean** |
| HTML caching | `cache-control: public, max-age=0, s-maxage=1` — not stale-able |
| `sw.js` caching | `cache-control: no-cache` |
| Hashed assets | `max-age=31536000, immutable` — correct |
| Service worker strategy | **NetworkFirst** for navigations, with a cached shell as fallback |

So the route is fine, the page is fine, the caching is correct — and the screen was still
blank. The shell had loaded (the pine background is inline in the document, which is why
the colour was right) and the client never mounted. The likely mechanism: a flaky
connection — the screenshot shows a VPN — makes the navigation fall back to a **cached
shell from an earlier build**, whose asset hashes no longer resolve; the modules fail, the
root stays empty, and there is no watchdog to say so.

- Rules: a boot failure must say so in the brand's voice within eight seconds, with one
  action; the worker's offline fallback is a small self-contained page, never a cached app
  shell; a cache version bump deletes the previous generation rather than accumulating it.
- Pass: with the network throttled to offline in devtools, the page shows the branded
  message and a Retry control within eight seconds; a shell from an older build can no
  longer be served (cache name carries the version and old caches are purged on activate);
  no route renders an empty root at 390×844.

## 4. Order

1. **3.1 manifest** and **3.6 watchdog** — one build carries both, and both are bugs
   rather than niceties.
2. **3.2 link card** — an invitation is a pasted link; this is the first impression.
3. **3.4 mail** — arrives uninvited, so it carries the brand whether we like it or not.
4. **3.3 guild art** — needs the owner's decision on the guild name first.
5. **3.5 copy** — last, and only once there is someone to welcome.

## 5. Considered and rejected

- **Animating the mascot (Lottie, sprite sheet).** The app draws its own motion; a second
  motion language inside a chat client fights it. The character is still.
- **A sticker/emoji pack of the mascot.** Fun, and useless at two accounts. Revisit when
  there is a third person.
- **A light theme variant of Wizardry.** Sloth Lee already owns the daylight; Wizardry is
  the night. Two themes would make both less distinct.
- **Theming the Rust admin panel.** Operator-only, session-only, and it costs a rebuild
  every upstream release. It can stay plain.
- **Replacing Fluxer's in-app artwork.** CC BY-SA, and not ours to redraw.
- **Putting the mascot back into the backdrop.** Tried twice; the client crops the image
  harder than `cover` predicts and cuts the character at both edges. Documented in
  `BRAND.md` so it is not retried a third time.

## 6. Correction

The first brand document said, in its rules, "do not add a second mark, **a mascot**, or
an illustration". The owner has since asked for exactly that, so the rule is retired and
v2 of the document replaces the seal with the mascot. The reasoning that produced the rule
— one mark, one accent — still holds; only which mark changed.

Also worth recording, because it cost an outage: writing the branding row as a JSON
**object** instead of a JSON **string** makes the API log "Stored app public configuration
is not valid JSON" and serve first-run defaults, which drops the instance back to its
setup screen. The write must be `to_jsonb(...::text)`.

## 7. Decisions (the owner delegated all three, 12 November)

1. **Guild name: renamed to Nightgrove.** Executed — `guilds.name` changed from "ooo aa up
   the ra", with a `GUILD_UPDATE` audit entry so the app shows it as deliberate; four
   audit rows exist now (three from the ownership transfer, one for the rename). The name
   is the same forest as Sloth Lee's grove, after dark, which is what this instance is.
2. **Tagline: "A private forest for people who talk slowly."** It goes into
   `og:description` when 3.2 is built — there is no branding field that carries a
   description today, so writing it anywhere else would be a promise the app cannot keep.
3. **Mail carries the mascot's face in the header**, the wordmark in the footer. A face in
   an inbox reads as a place with a character rather than a service with a logo, and the
   alt text plus a plain-text part covers clients that block images by default.

What each decision still needs: 1 needs nothing further; 2 and 3 are gated on the builds
below, which is why they are recorded here rather than applied.

## 8. Status board — all three waves

| # | Item | Wave | State |
| --- | --- | --- | --- |
| — | Instance live at `wizardry.slothlee.xyz`, 21 services healthy | 0 | **shipped** |
| — | Rebrand in the fork, AGPL attribution | 0 | **shipped** |
| — | Guild ownership → `1570442583027482624`, with audit entry | 0 | **shipped** |
| — | Theme: Sloth Lee canopy palette, Baloo 2 + Nunito | 0 | **shipped** |
| — | Mascot: wizard sloth, six assets, two size variants | 0 | **shipped** |
| — | Guild renamed **Nightgrove**, with audit entry | 3 | **shipped** |
| 1.1 | Invite-only front door | 1 | blocked: owner's choice (§7 wave 1) |
| 1.2 | Backup that runs without me + one restore drill | 1 | **next to build** |
| 1.3 | Restart gate | 1 | planned |
| 1.4 | Operator CLI (`brand`, `own`, `audit`) | 1 | planned |
| 1.5 | Welcome copy | 1 | planned (merged into 3.5) |
| 1.6 | Identity surfaces | 1 | planned (merged into 3.3) |
| 2.1 | Second administrator | 2 | blocked: owner's choice |
| 2.2 | Message index filled (0 documents today) | 2 | **broken, unfixed** |
| 2.3 | Push that reaches a phone | 2 | needs a device |
| 2.4 | Export that produces a file | 2 | planned |
| 2.5 | A call actually made | 2 | needs two devices |
| 2.6 | Desktop build, or strike the claim | 2 | planned (0 releases) |
| 3.1 | Manifest splash colour | 3 | **shipped** — `#18271c`, verified |
| 3.2 | Link card | 3 | planned |
| 3.3 | Guild art (name done: **Nightgrove**) | 3 | art needs one upload by the owner |
| 3.4 | Branded transactional mail | 3 | planned |
| 3.5 | First-run copy | 3 | planned |
| 3.6 | Blank screen that says nothing | 3 | **watchdog shipped**; custom offline page still planned |
| — | AAAA record for IPv6 clients | — | blocked: no Cloudflare token |

Two items in that table are not plans but defects: **2.2** (search indexes nothing) and
**3.1** (the install splash is grey). They should be fixed before any planned item is
started, because both are visible to a user who does nothing wrong.

Evidence gathered on 2.2 while writing this: `fluxer-worker-1` is up and healthy, holds
the search environment, and its batch lane logs `syncDiscoveryIndex` every fifteen minutes
("No discoverable guilds to sync") — so the queue is alive and no message-index job is ever
enqueued. The index was created at 14:01 and has never been written to since. The next step
is not a rebuild but a read: find whether message indexing is gated behind a feature flag,
a lane that is not running, or a code path that only fires on edit.

## 9. When to stop planning

Three waves is the limit, and this is the third. From here the only useful document is a
changelog. If a fourth is ever tempting, the test is the status board: if the two rows
marked *broken* are still broken, writing another plan is a way of avoiding them.

## Change log

- 12 Nov 2026 — first issue. Written the day the theme and mascot shipped; records the
  four surfaces still default and the state of every item from waves one and two.
