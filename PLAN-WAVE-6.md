# Wizardry — the quiet wave

Sixth wave. Wave five ended by recommending that planning stop until a third person had used
the instance for a week. This wave does not overrule that; it answers a different question.

Wave five asked *what is missing*. This one asks *what this place is for*. The tagline is "a
private forest for people who talk slowly", and almost every default a chat product ships is
built for the opposite: typing echoes, pings, unread counts that shout, a composer that rewards
speed. So the ideas here are not capabilities the product lacks in the abstract. They are the
places where the product's defaults contradict its own sentence.

Treat this document as a menu, not a queue. Wave five's build order stands and nothing here
pre-empts it.

## 1. What was measured

Every claim below was checked against the fork's source, not against how a chat app usually
behaves. The counts that looked promising and turned out to be nothing are listed too, because
a wave that only prints its successes is a pitch.

| Claim | Evidence | Reading |
|---|---|---|
| Guilds can already choose "mentions only" as the default for new members | `DefaultNotificationsSection.tsx`, `MessageNotifications.ONLY_MENTIONS` | The quiet default is a **setting**, not code — but it is per guild and set by hand |
| There is no instance-level default for a new guild or a new member | nothing writes `notificationLevel` outside the guild settings surface | gap |
| Typing indicators are rendered and have no display toggle | `ChannelItem.tsx` renders `typingIndicator`; no `showTyping` setting exists | gap |
| No quiet hours, no scheduled do-not-disturb | zero hits for `quietHours`, `DoNotDisturb` | gap |
| No digest of what happened while you were away | zero hits for `notificationDigest`, `DigestService`; the two "catch up" hits are message-boot caching | gap |
| Unread state already exists and is per channel | `read_states` (5 rows), `ReadStateService` | the data a catch-up panel needs is already written |
| No send-later | zero hits for `scheduledMessage`; the "schedule" hits are audit-log batch deletes | gap |
| Bookmarks exist; collections and export do not | `BookmarksBottomSheet`, `requestToggleBookmark`, `MaxBookmarksModal`; no export path | gap, half-shipped |
| Presence already includes invisible | `StatusConstants` — `online`, `dnd`, `idle`, `invisible`, `offline` | the stance is available; the default is not |
| Slow mode exists as a rate limit | `slowmodeThreadKey`, rate-limit service | a noticeboard can be built on it |

## 2. The six ideas

### 2.1 Quiet by default, not by decision

A person who accepts an invite should not have to mute the place to enjoy it. Set the house
defaults once, at the instance: new members arrive on mentions-only, new guilds start on
mentions-only, and typing indicators are off in the channel list by default with a per-person
switch to turn them back on.

- The setting lives in instance configuration and is applied at join time, so it is one decision
  rather than a rule every member has to discover.
- An existing member's choices are never rewritten by changing the default.
- Typing indicators stay available; they stop being the ambient state of the room.
- Nothing here changes what is delivered — only what arrives loudly.

### 2.2 Catch-up: what happened while you were away

Open the app after two days and see one panel: how many messages arrived, in which channels,
with the first line of each. Not a generated summary, not a notification, not an email.

- Counts and first lines, taken from data that already exists; no model writes a word of it.
- Reading the panel marks nothing as read. Leaving it does not consume anything.
- If nothing happened, the panel does not appear — an empty state that says "no news" is a
  notification about the absence of notifications.
- The panel is local to the client; nothing is stored server-side about when someone looked.

### 2.3 Hold until morning

Write at midnight, deliver at eight. The message waits in a queue the sender can see and
cancel, and when it lands it says when it was written.

- The queue is visible and cancellable until the moment it sends.
- If the app is closed when the time arrives, it sends on next open, stamped with the time it
  actually sent — never pretending the delay did not happen.
- A held message is never shown as sent before it is.
- One held message per channel at a time, so the queue cannot become a mailbox.

### 2.4 Letters: a slower composer

The same message box, in a mode for paragraphs instead of lines: more generous spacing, a
preview that reads like a page, no character counter ticking, and no live typing echo to the
other person.

- It is the same message underneath; a letter is a shape, not a new object.
- The other person sees a letter as a letter, so the mode is honest rather than cosmetic.
- No length limit is raised: this is about rhythm, and a raised limit is a different feature
  wearing the same name.
- Available in every channel, never required anywhere.

### 2.5 Keepsakes: collections of what you saved

Bookmarks exist and stop at a flat list. Collections group them — "the good arguments", "how we
built the thing" — and export to plain markdown so the file is still readable in ten years.

- Private by default; sharing a collection is a separate, deliberate act, and out of scope here.
- Export is markdown with a date and channel on each entry, no proprietary structure and no
  styling that only we can render.
- Deleting a message removes it from a collection rather than leaving a tombstone with a quote
  in it.

### 2.6 The noticeboard

One channel per guild where people react but do not post: announcements, the handbook, the
rules. Built from permissions and slow mode rather than a new channel type.

- Reactions and threads on a post stay open; only top-level posting is closed.
- It never pings `@everyone`, and an announcement carries no notification.
- It is a permission pattern the owner can build today, so the feature is a **preset** — one
  button that configures it — not a new object.

## 3. Order, if any of it is built

1. **2.1**, because it is configuration plus one display toggle and it sets the tone for
   everyone who arrives afterwards.
2. **2.2**, because the data already exists and it is the feature a returning person notices.
3. **2.5**, because it makes the first two months of conversation survivable.
4. **2.3**, then **2.4**, then **2.6** — the three that change how writing feels.

Everything here needs an app build; 2.1 also needs an api build for the instance default. That
puts the whole wave behind the pipeline work wave five opens.

## 4. Considered and rejected

- **Read receipts.** The absence is the feature. Recorded as a stance in `BRAND.md` rather than
  planned as work, because the risk is a future contributor adding them helpfully.
- **A digest by email.** Email delivery was excluded by the owner; the panel in 2.2 is the
  same idea without leaving the app.
- **A model-written summary of what you missed.** It would be the most useful sentence in the
  product and the least trustworthy: a summary that invents a decision is worse than no summary.
- **Longer message limits.** Nothing in eleven messages suggests anyone has hit one.
- **A second theme, or a light mode.** The canopy palette is the identity; a light mode is a
  different product with the same assets.

## 5. The honest bit

Running count: eighteen rows in wave three, six shipped, eight written in wave five, six here.
That is thirty-two planned against six built, and this document makes the ratio worse rather
than better.

Wave five named the three things worth building next — the update offer, the offline page and
the search truth — and none of them appear in this wave. That is deliberate. This wave is the
answer to "what should this place feel like when it has people in it", and it has no evidence
that it ever will.

Falsifier: if the first guest does not come back for a second week, every idea here was aimed
at the wrong problem, and the correct next document is one paragraph about why the instance is
not being used rather than another six ideas. The sample that would make this wave meaningful
is one person returning twice, unasked, and then five.

## 6. Decisions that are yours

1. **Whether mentions-only becomes the house default** — it is a strong opinion and it will
   make the instance feel quiet to someone who expected pings.
2. **Whether letters ship as a mode or as a channel type**, which decides whether the idea is
   small or large.
3. **Whether the noticeboard is a preset or a promise** — a preset is a button; a promise is a
   channel type we maintain for ever.
