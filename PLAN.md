# Wizardry — operator plan

*Written 12 November 2026, against the live instance at `wizardry.slothlee.xyz` on Fluxer release 2026.1112.20122. Every number below was measured on that instance; the
command that produced it is named beside it.*

This is a plan for running and finishing a **private, self-hosted instance**, not for
forking a chat platform. Wizardry is a fork of Fluxer, and the fork's job is to carry
the name, the seal and the desktop build — not to re-implement messaging. Anything
the upstream does well is left alone.

## 1. Facts

| Fact | Value | How known |
| --- | --- | --- |
| Release | Fluxer `2026.1112.20122` | `rexctl status` |
| Host | 4 vCPU / 8 GB, 11 GB of 75 GB used, 1 GB RAM in use | `df -h /`, `free -g` |
| Accounts | 2 (tibs, eleven) | `count(*)` on `users` in the KV store |
| Guilds | 1 — "ooo aa up the ra", no icon | `guilds` row |
| Channels / messages / attachments | 9 / 8 / 5 | `count(*)` per table |
| Guild members | 2 | `guild_members` |
| Store size | 349 rows, 616 kB | `pg_total_relation_size('fluxer_kv')` |
| Registration | **open**, no allowed domains, admin URLs enabled | `registration_config` |
| Instance notice | none | `instance_notice` absent |
| Community / billing config | none / none | `instance_configuration` |
| Backups | **1** (manual, today, 2.2 MB), **0 scheduled jobs** | `/opt/fluxer/backups`, `crontab -l`, `systemctl list-timers` |
| Auto-upgrade | off | `rexctl auto-upgrade` |
| Email | SMTP `smtp.slothlee.xyz:25` STARTTLS, `noreply@slothlee.xyz` | `instance_integrations_config` |
| TLS | valid to 10 Feb 2027 | `openssl s_client` |
| DNS | A `78.47.152.93`, **no AAAA** | `dig` via 1.1.1.1 |
| Branding | name, seal, favicons, theme `#1b1330`, custom CSS — live | discovery document and served HTML |
| Operator tooling in the fork | none — no `scripts/` directory | `ls` |

Two numbers decide the shape of this plan: **2 accounts, 8 messages**. Nothing here
needs a feature that scales. Everything here needs to survive the owner forgetting
about it.

## 2. The questions worth answering

Each feature below answers a question an operator asks out loud. Nothing is on this
list because it would be impressive.

| # | Question | Evidence of absence or gap | Kind |
| --- | --- | --- | --- |
| 1 | "Can anyone just walk in?" | `registration.mode = open`, `allowed_email_domains: []` | finding |
| 2 | "Can I get it back if it breaks?" | 1 manual backup, 0 scheduled jobs, never restored once | finding |
| 3 | "Did that change do what I think it did?" | no gate; today every branding change was verified by hand, six checks per restart | finding |
| 4 | "Can I change the instance without hand-writing JSON?" | three bespoke KV scripts written and run today; repo carries no operator tooling | finding |
| 5 | "What does someone see on day one?" | no notice, no pinned welcome, 8 messages across 9 channels | finding |
| 6 | "Does it look like Wizardry everywhere the name appears?" | guild has no icon or banner; `BANNER`, `INVITE_SPLASH`, `ANIMATED_ICON` are enabled and unused | finding |

## 3. The six features

### 3.1 Invite-only front door
*Phase 1 · protects the instance*

Turn registration from open to invite-only, and keep the invite card on-brand so an
invited person's first impression is the seal rather than a generic join page.

- Rules: the instance refuses self-signup; an invite is the only door; an expired
  invite says so in words, never in an error code. Existing accounts keep working.
- Pass: `POST /api/v1/auth/register` returns the closed registration error; one invite
  link still creates an account end to end; the invite page renders the seal at 390 px
  wide with no broken image.
- Decision needed: open to `@slothlee.xyz` only, or strictly invites? (see §7)

### 3.2 A backup that runs without me
*Phase 1 · protects the instance*

Nightly snapshot, weekly verification, and one restore drilled for real.

- Rules: a failed backup is louder than a successful one; the drill restores into a
  scratch folder, never over the live store; retention keeps three (current setting).
- Pass: seven consecutive nightly archives with zero failures, each passing
  `rexctl backup verify`; one documented restore of today's archive with the wall-clock
  time it took; the oldest archive ages out on schedule rather than on a hunch.

### 3.3 Restart gate
*Phase 2 · proves the instance*

One command that answers "is Wizardry still Wizardry" after any restart, deploy or
`rexctl upgrade`.

- Checks: `rexctl doctor`; `/`, `/.well-known/fluxer`, `/app`, `/admin` status codes;
  branding present in the served HTML (name, theme colour, both favicons, custom CSS
  block); the sign-in page rendered in headless Chromium with the mark loaded and the
  primary button's label colour not equal to its fill; the discovery document agreeing
  with the branding row.
- Rules: it fails on a missing asset, not only on a non-200; it never writes anything;
  a check it cannot compute reports as a warning with the reason, never as a pass.
- Pass: one command, exit 0 only when all eight checks pass; proven by breaking one
  thing on purpose (wrong favicon URL) and watching it fail.

### 3.4 Operator CLI
*Phase 2 · proves the instance*

The three operations I hand-wrote today — apply branding, transfer guild ownership,
append an audit entry — as checked commands with `--dry-run`.

- Rules: every command prints the diff it would make before making it; the audit entry
  is written by the tool, not remembered by the operator; no command invents a value it
  was not given; re-running is idempotent.
- Pass: three commands (`brand`, `own`, `audit`), each with a dry run, each re-runnable
  with zero diff on the second pass; the KV rows they write match what the client reads.

### 3.5 A welcome that isn't blank
*Phase 3 · presents the instance*

A first-run notice and one pinned message, in the voice the brand already uses.

- Rules: no feature tour, no carousel, no "getting started" checklist — one notice, one
  pinned message, three lines each; it says what the instance is for and how to get an
  invite.
- Pass: a test account's first screen shows the notice; the pinned message is the first
  thing in `#general`; both read correctly at 390 px and in the desktop client.

### 3.6 Identity surfaces finished
*Phase 3 · presents the instance*

Guild icon, banner and invite splash from the same seal, so the name appears nowhere
as a placeholder.

- Rules: same palette as `brand/BRAND.md`, no second mark, no mascot; art is generated
  from the HTML sources in `brand/`, not drawn anew.
- Pass: guild icon 512×512, banner 960×540, splash 1920×1080, all rendering in the
  client; the invite card and the guild header both show the seal; zero default-art
  placeholders left.

## 4. Order, and what would change it

1. **Backup that runs without me** (3.2) — the only item whose absence can destroy the
   other five.
2. **Invite-only front door** (3.1) — cheap, and it closes a door that is currently open
   to the internet.
3. **Restart gate** (3.3) — every later change depends on being able to prove it.
4. **Operator CLI** (3.4) — pays for itself the second time branding changes.
5. **Identity surfaces** (3.6) — visible, but nothing is broken without it.
6. **Welcome** (3.5) — last, because its content depends on who is being welcomed.

If only one thing is built: **3.2**, and specifically the restore drill. A backup that
has never been restored is a rumour.

## 5. Considered and rejected

- **Forking the API to add messaging features.** The fork exists to carry identity and
  the desktop build. Every feature above is operator-level; none touches the Rust tree.
- **Turning on premium/billing.** `instance_billing_config` is absent and premium is off.
  Selling to two accounts is a support burden with no upside.
- **Message search tuning.** Eight messages. Meilisearch is running and unbothered.
- **Voice quality work.** LiveKit reports healthy and `rexctl doctor` agrees; there is
  nobody on the other end of a call yet.
- **Custom badges, themes marketplace, multiple palettes.** `BRAND.md` says one accent,
  and badges need someone who wants one. Both are answers to a question nobody asked.
- **An AI agent in the guild that writes records.** It would put a model's words where a
  person's belong; the plan keeps authorship human.
- **Fixing the mail server's "everything is encrypted" symptom in this document.** It is
  a different product, and it still needs one screenshot to diagnose.

## 6. Correction

Earlier in this arc I read "the reset link says 404" as a Wizardry routing problem and
spent effort on the app's `/reset` route. The link was the **mail server's** recovery
email, which built its URL from the mail domain — so it pointed at the brochure site,
which has no reset page. Fixed in that server's `send_recovery`, rebuilt and deployed;
the app's `/reset` was never broken. Recording it here so the next session does not
re-derive the wrong fix.

## 7. Open questions for the owner

1. Signup: invites only, or open to `@slothlee.xyz` addresses? (Both are one setting.)
2. Who else is joining, and roughly when? Phase 3 exists for them, not for you.
3. Is the guild staying "ooo aa up the ra" with no icon, or should it carry the seal?
4. IPv6: add the AAAA record yourself, or hand me a Cloudflare token to do it?

## 8. What would falsify this plan

If ninety days pass with **two accounts and no new member**, phases 2 and 3 are
decoration: the instance is a private tool, and the honest plan collapses to §3.2 plus
§3.1, with everything else struck. The plan should then be re-issued shorter rather
than defended.

## Change log

- 12 Nov 2026 — first issue. Measured against the live instance; branding already
  shipped, so it is not a feature here, it is a fact.
