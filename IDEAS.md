# The parking lot

Eight new features, written down so they stop being re-invented — and deliberately **not** added
to the queue. `BACKLOG.md` holds nineteen items with pass criteria; this file holds the ones that
have a case but not yet a reason to be next.

The rule is one line: **an idea leaves this file only by replacing something in the queue.** A
parking lot that grows is a second backlog, and a second backlog is how the first one stopped
being read.

## What was measured before writing any of it

Each idea was checked against the fork, in the direction that matters: does the capability exist
already, under another name?

| Supposed gap | What the search actually found | Verdict |
|---|---|---|
| A bridge to another chat network | `discord` appears in two places: guild-template import, and an unrelated certificate name. `relay` is 111 files of **upload relay** | genuinely absent |
| Mail arriving in a channel | zero files for any inbound-email path | genuinely absent |
| Guest access | five hits, all meaning "an unclaimed account is a guest", not a read-only visitor | genuinely absent |
| Messages revealed at a date | zero hits for `reveal_at`, `unlock_at`, "time capsule" | genuinely absent |
| Watchwords | zero hits for `watchword`, `savedSearch` | genuinely absent |
| A message as a shareable image | twelve hits, all the screen-share picker and image-preview fields | genuinely absent |
| Quiet hours on a schedule | zero hits for `quietHours`, `DoNotDisturb` | genuinely absent |
| A public reading page | no exportable thread surface; "blog" and "public" are unrelated | genuinely absent |

All eight are real gaps rather than already-shipped features wearing different words. That is the
only reason they are written at all.

## 1. A bridge to where your friends already are

One channel relayed to Discord and back, with names preserved and loops prevented.

- **Why it is the strongest idea here:** the people who would be invited already have somewhere to
  talk. A bridge means the instance does not have to win anyone over to be useful on day one.
- **Cost:** high. A bot, an identity mapping, message-id mapping for edits and deletes, and an
  attachment mirror.
- **What it must not become:** a two-way sync of every channel. One channel, named, both ways.
- **Falsifier:** if nobody in the target Discord actually uses the bridged channel for a week, the
  bridge was a reason to avoid asking rather than a reason to build.

## 2. Mail that lands in a channel

An address per channel — `general@wizardry.slothlee.xyz` — so a letter written by email appears as
a message, with the sender as the author.

- **Why it fits:** the tagline is about slow talk, and email is the slowest channel that already
  works. The mail server is already yours and already relays for this domain.
- **Cost:** medium-high: an inbound SMTP handler, address routing, spoofing rules (DMARC is already
  `p=reject`), and an attachment path.
- **What it must not become:** a way to post as someone else. A message from mail is labelled as
  having come by mail, with the address it came from.
- **Falsifier:** if no one sends a letter in a month, the feature was a clever idea about email
  rather than a need.

## 3. Guest access: look before joining

An invite that opens the guild read-only, with a join button, so an invitation can be a visit
rather than a decision.

- **Why it fits:** the front door is closed and the invitation is the only way in. Letting someone
  read the room first makes that invitation much easier to accept.
- **Cost:** medium: a role with no write permission, an expiry, and a clear marker that the visitor
  is a visitor.
- **What it must not become:** a public archive. A guest link expires, always.
- **Falsifier:** if guests never convert to members, the visit was the product, and a static page
  would have done.

## 4. Time capsules

A message sealed until a date, then revealed to the channel.

- **Why it fits:** it is the only feature in this file that is purely for the pleasure of the
  place, and "talk slowly" tolerates a message that arrives in a year.
- **Cost:** low-medium: a hidden-message flag, a scheduled reveal job, and an honest "sealed on"
  state. The job ledger already exists.
- **What it must not become:** a way to say something without ever being accountable for it. A
  capsule names its author when it opens.
- **Falsifier:** if nobody seals one in the first month, it is a demo, not a feature.

## 5. Watchwords

"Tell me when someone says this" — a phrase, a name, a channel, and a quiet notice when it appears.

- **Why it fits:** the index will exist after Q3, and this is the cheapest useful thing to build on
  top of it. It also gives a reason to open the app without being pinged.
- **Cost:** medium: a stored query per person, a per-message check, and a delivery that is a
  digest rather than a ping.
- **What it must not become:** surveillance. A watchword sees messages you can already read, and
  nothing else.
- **Falsifier:** if it fires more than a few times a week, people mute it and it was a filter, not
  a feature.

## 6. Postcards

Render a message, or three, as an image worth sending to someone who is not in the room.

- **Why it fits:** every other idea keeps the conversation inside; this one lets a good exchange
  leave, carrying the mascot and the name with it.
- **Cost:** medium: a client-side render, a typographic layout that survives a phone, and a rule
  about what a postcard may contain.
- **What it must not become:** a screenshot tool for arguments. A postcard carries the message and
  the names the people involved already chose to publish.
- **Falsifier:** if nobody sends one out, the room prefers being private and that is an answer.

## 7. Quiet hours

A window each person sets — say 22:00 to 08:00 — in which nothing pings, and a message that
arrived overnight is waiting in the morning.

- **Why it fits:** wave six made the room quiet by default; this makes it quiet by schedule, which
  is the version people actually need.
- **Cost:** low: a per-user window, checked where notifications are already decided.
- **What it must not become:** a reason a message is silently dropped. The queue is visible.
- **Falsifier:** if nobody sets a window, mentions-only was enough and this is decoration.

## 8. The reading garden

Chosen threads, exported to a page anyone can read, at `wizardry.slothlee.xyz/garden`.

- **Why it fits:** it is the only idea here that could make the place interesting to people who
  will never join.
- **Cost:** high: selection, redaction, a renderer, and the whole problem of consent for a
  conversation written in private.
- **What it must not become:** publishing by default. Nothing leaves the instance without the
  author of every message in the thread agreeing.
- **Falsifier:** it should not be built until there are threads worth reading, which is Q15 and a
  year of talking. **Never, until then.**

## The one that could jump the queue

The bridge (§1) is the only idea in this file that could reasonably displace a queued item,
because it changes the answer to "why would anyone come here" rather than improving the room for
people already in it.

It jumps only on one condition: that there is a named person in a named Discord channel who would
use the bridged channel. Without that name, it is infrastructure for an audience that does not
exist yet, which is the mistake this file exists to avoid repeating.

## The count, again

Thirty-two distinct items, six built, nineteen queued, seven buried — and now eight parked, which
makes forty. Nothing here is scheduled. If `BACKLOG.md`'s Q1 to Q4 are still unbuilt when this file
is next opened, the correct response is to delete three ideas from it at random, not to add
another: an idea that has survived a month of not being built is usually not waiting for its turn,
it is waiting to be let go.
