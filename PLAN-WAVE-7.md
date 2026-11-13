# Wizardry — what you already own and have never opened

Seventh wave, and a different question again. Waves five and six asked what is missing and what
the place is for. This one starts from the opposite direction: **nine capabilities are installed,
compiled and healthy on `wizardry-01`, and not one of them has ever been used.**

The measurement is the wave. Everything else follows from it.

## 1. What was measured

Two queries, both against the live instance on 13 November: one on the fork's source, one on the
database.

The source check asks whether a capability exists at all — how many files in `fluxer_api/src`
carry it. The database check asks whether it has ever produced a row: `fluxer_kv` holds 57 tables
that have been written to at least once, and a capability that is never used has no table there.

| Capability | In the source | Ever written | Reading |
|---|---|---|---|
| Invites | 18 files (`createInvite`, `CreateInvite`) | **no invite table exists** | the only way in is an admin registration URL |
| Webhooks | 38 files | no webhook table | nothing outside the instance can post into it |
| Custom emoji | 15 files | no emoji table | the mascot has no voice |
| Stickers | 46 files | no sticker table | — |
| Threads | 6 files | no thread exists — `guild_thread_state` holds one row for the guild, and the nine channels are categories, text and voice | every reply is a new line in the same room |
| Pins | 8 files | no pin table | nothing in a channel can be made to stay put |
| Scheduled events | 6 files | no event table | there is no reason to come back on a particular evening |
| Polls | 14 files | no poll table | the only way to answer is to type |
| Bookmarks | `BookmarksBottomSheet`, `requestToggleBookmark` | no bookmark table | nothing has been saved |

Everything else that is used is small and unsurprising: 12 messages, 2 users, 1 guild, 5
read states, 2 reactions, 4 attachments, 186 audit rows. The instance is a working chat with a
beautiful coat, and eight of its nine rooms have never had the light on.

## 2. The eight ideas

None of these is a new backend. Seven are presets, flows or content on capability that already
ships; the eighth is one page. That is what makes this wave worth more than the last two.

### 2.1 An invite that reads like an invitation

Invite creation exists and has never been called. Make the flow: create an invite, see it the way
the recipient will see it, set how long it lives and how many people it admits.

- An invite is previewed before it is sent, with the splash and the guild name as the recipient
  sees them.
- Every invite carries an expiry. An invite with no end is a key left under the mat.
- The join screen says who invited you, because a person is a better reason than a link.

### 2.2 Threads for the conversations that deserve one

Threads ship and have never been used. A thread is the natural shape for two people continuing a
thought without splitting the room, and it is what "talk slowly" needs: a reply that does not
interrupt.

- One click from any message; no separate thread browser to learn first.
- A thread never notifies the whole channel — only the people in it.
- Threads auto-archive, so an abandoned thread tidies itself up.

### 2.3 The mascot as an emoji pack

Custom emoji ship; the pack is content. Twelve expressions of the wizard sloth at 128×128, drawn
from the same shapes as the icon, named in the product's voice.

- Every emoji reads at 32 px: fewer shapes, no text, no thin lines.
- The set is small enough to learn — twelve, not a hundred and twenty.
- Emoji are identity, not decoration: they should be the thing people use instead of a word.

### 2.4 Pins, so something can stay put

Pins ship and nothing is pinned. The handbook, the rules and the three things a new person needs
should be pinned in one channel, and the channel should be the noticeboard from wave six.

- A pinned message carries a date, so "how we do things" has a history.
- Pins are for things true for months, not for announcements.
- The noticeboard's pins are the first thing a new member is pointed at.

### 2.5 A weekly hour, as an event

Scheduled events ship and none exists. The cheapest reason to return is a time: one evening a
week, in voice, with no agenda.

- The event exists whether or not anyone comes; an empty room is not a failure.
- It is named for the place, not for the activity.
- Voice rooms are the same rooms; the event is a marker, not a new surface.

### 2.6 Webhooks, so the place is useful before it is social

Webhooks ship and none exists. One channel can carry the outside world — the repository's
commits, a feed, the backup result — which makes the instance worth opening on a day when nobody
has spoken.

- A webhook posts as itself, never as a person.
- One channel, so the feed can be muted as a unit.
- No webhook may post into a conversation channel.

### 2.7 Polls, for the people who will not type

Polls ship and none has been run. A poll is the lowest-effort way to say something, and the
person who will not type a paragraph will click a button.

- A poll is a question with a date; it closes.
- No anonymous polls: in a room of five, anonymity is a lie.
- Polls are for decisions the room actually needs, which means rarely.

### 2.8 A front door for strangers

Everything above serves someone who is already inside. The first thing a stranger sees today is
a login form. One public page — the card art, one sentence, what this place is, and how to ask
for an invitation — is a different first impression, and it is the only new surface in this wave.

- The page carries no sign-up form, because registration is closed.
- It says how to ask, not who to ask, and it does not publish anyone's address.
- It is static, cacheable, and works with JavaScript off.

## 3. Order

Cheapest first, because this wave's whole argument is that most of it is already paid for:

1. **2.4 pins, 2.6 one webhook, 2.5 one event** — three configuration actions, no build. They can
   be done the day the first guest arrives.
2. **2.3 the emoji pack** — art only, and it closes wave five's identity kit.
3. **2.1 the invite flow** — a small app change on top of shipped capability, and the first thing
   anyone actually needs.
4. **2.7 polls** — a channel setting and a habit, no code.
5. **2.2 threads** — the one that needs a real interface decision.
6. **2.8 the front door** — one static page, and the last thing worth doing, because it is for
   people who are not here yet.

## 4. Considered and rejected

- **Turning on every unused capability at once.** Eight rooms with the light on and nobody in
  them is a worse impression than four that are used.
- **Public discovery of the guild.** It contradicts the invite-only front door settled in wave
  three, and a directory listing is how a private forest stops being one.
- **A bot that posts the feed rather than a webhook.** Bots need a persona and a token; a webhook
  needs a URL.
- **Custom badges.** The catalogue exists (`custom_badge_catalog`, 100 per user) and badges only
  mean something once there are enough people for them to distinguish.
- **Voice on a schedule as a second weekly event.** One is a rhythm; two is a calendar.

## 5. The honest bit

Running count: eighteen rows in wave three, eight in five, six in six, eight here. Thirty-two
planned became forty against six built — but this wave is the first whose items are mostly
configuration, art and one page, so the cost column is not comparable with the last two.

The recommendation stands and does not change: build wave five's three (update offer, offline
page, search truth) first. This wave is what to do *in the hour after the first guest accepts an
invite*, and that hour is the only thing that can make any of it matter.

Falsifier: the wave assumes that unused capability is a *reason people are not here*. The
alternative reading — that nobody is here because nobody has been asked — is more likely, and it
costs nothing to test: one invitation, one person, one week. If they come and stay, this wave is
right and the rooms matter. If they do not come, the inventory was never the problem.

## 6. Decisions that are yours

1. **Whether the weekly hour is voice or text**, which decides whether it needs a microphone or
   just a time.
2. **Whether the front door names Sloth Lee**, which links the two places publicly or deliberately
   keeps them separate.
3. **Whether threads are on everywhere or only in the slow channels**, which is a taste decision
   about how the room reads.
