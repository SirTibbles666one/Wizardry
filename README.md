# Wizardry

Guided setup for [Fluxer](https://fluxer.com) servers — a bot that reads a server, shows exactly what a
layout would create, and applies it only when somebody says apply.

Fluxer is a free, open-source Discord alternative you can self-host. It has a Discord-shaped API
(snowflakes, a gateway WebSocket, applications with bot accounts), which is what makes a bot like this
possible without a framework.

## What it does

```
!wiz plan community     show what a community layout would create, channel by channel
!wiz apply              create it
!wiz cancel             forget the plan
!wiz show               show the plan already offered in this channel
!wiz preview {...}      plan from a blueprint you paste as JSON
!wiz help               the list
```

Presets: `community`, `gaming`, `study`, `support`. A blueprint is plain data (roles, categories,
channels with topics), so a preset, a JSON file and — later — something a model proposes are the same
object.

**The rule the planner keeps:** it creates, it never deletes, never renames and never converts. A
channel that exists with a different type is reported as a question, because turning a text channel
into a voice channel destroys its messages, and that is a person's decision. A second run against a
finished server says "nothing to do" rather than pretending to work.

## Run it

```bash
git clone https://github.com/SirTibbles666one/Wizardry && cd Wizardry
cp .env.example .env      # FLUXER_BOT_TOKEN and FLUXER_API_BASE
node src/index.js         # connect the gateway and answer !wiz
```

There are no dependencies — Node 22+ has `fetch` and `WebSocket`. Tests are `node --test`.

One-shot, no bot invite needed (it reads only):

```bash
node src/index.js snapshot --guild 123456789012345678
node src/index.js plan community --guild 123456789012345678
```

## Making a bot account

1. Sign in to your Fluxer instance (or fluxer.com) and open **Applications**.
2. Create an application — it owns exactly one bot account.
3. Copy the bot token into `FLUXER_BOT_TOKEN` and invite the bot to your server.
4. Set `FLUXER_API_BASE` to your instance's API root: `https://api.fluxer.app/api` for fluxer.com,
   or `https://<your-host>/api` when self-hosting.

## What is verified, and what is not

Verified against [docs.fluxer.com](https://docs.fluxer.com) on 2026-11-12: the application/bot model,
the gateway endpoint's existence and its `url`, the opcodes used here (Hello 10, Identify 2, Heartbeat
1, Heartbeat ACK 11, Dispatch 0), `POST /v1/channels/{id}/messages`, `GET /v1/guilds/{id}`, and the
error shape (`code` + `message`, `ACCESS_DENIED`, `UNKNOWN_APPLICATION`).

**Not yet verified against a live instance** — this is the first thing to check when you have a token:

- `POST /v1/guilds/{id}/channels` and `POST /v1/guilds/{id}/roles` (create). The docs describe guild
  channel *modify* and *delete* routes; the create routes live on the guild resource. If they differ,
  fix `src/fluxer/routes.js` — every path is declared there once.
- The Identify payload: this client sends `{ op: 2, d: { token } }`. Fluxer may want an intents field
  or a properties block; the gateway closes with a code that says which (the close code is logged).
- The gateway path: the docs say bots call "this endpoint" without spelling the suffix, so
  `rest.gatewayUrl()` tries `/v1/gateway` then `/v1/gateway/bot` and remembers whichever answers.

The snapshot assumed by the planner is `guild.channels` and `guild.roles` on the guild object; if your
instance reports them elsewhere, `snapshotOf()` in `src/index.js` and `src/bot.js` is the single place
to change.

## Layout

```
src/
  config.js              environment in, config out (fails loudly on half a config)
  fluxer/routes.js       every path and opcode, declared once, with its doc page
  fluxer/rest.js         fetch wrapper: token, errors as FluxerError, 429 waited out
  fluxer/gateway.js      hello/identify/heartbeat/dispatch; no bot logic inside
  wizard/blueprint.js    presets and the reader that refuses a broken blueprint
  wizard/plan.js         snapshot + blueprint -> steps, kept, questions  (pure)
  wizard/render.js       the message a person reads before pressing anything
  wizard/apply.js        steps -> REST calls, stopping at the first failure
  bot.js                 commands; holds only the plan it has offered
test/                    plan, render, blueprint, rest — no socket, no server
```

## Roadmap

- Slash commands, once the instance's command registration endpoint is pinned down.
- Permissions: set the category overwrites a layout implies (staff-only categories stay staff-only).
- A second opinion: let the AI propose a blueprint from a one-line brief, then plan it like any other.

## License

MIT.
