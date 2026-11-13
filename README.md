<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./fluxer_static/marketing/branding/logo-white.svg">
    <img src="./fluxer_static/marketing/branding/logo-color.svg" alt="Wizardry logo" width="400">
  </picture>
</p>

# Wizardry

A free and open source instant messaging and VoIP chat app built for friends, groups and
communities — and yours to host.

> [!NOTE]
> **Working on this fork? Read [BACKLOG.md](./BACKLOG.md) first.** It is the one queue: nineteen
> distinct items with pass criteria, an order, and the reasons the other twenty-six were merged or
> buried. The `PLAN*.md` documents are history and evidence, not a to-do list.

> [!IMPORTANT]
> **Wizardry is a rebranded fork of [Fluxer](https://github.com/fluxerapp/fluxer)**, used and
> distributed under the AGPL-3.0. The code is Fluxer's work; the product identity here is
> Wizardry's. [NOTICE](./NOTICE) carries the attribution the licence requires, and
> [REBRAND.md](./REBRAND.md) lists exactly what has been renamed and what is still `fluxer_*`
> underneath, on purpose.
>
> Two things in this tree are still upstream's property and are **not** covered by the code
> licence: the artwork in `fluxer_static/marketing/branding/` (logo, wordmark, symbol — CC BY-SA
> 4.0, Fluxer's marks) and the hosted infrastructure the code still points at (the `fluxer.com`
> / `fluxer.app` domains, the package repositories, the app-store listings, the Apple signing
> identities and the payment entity named in the billing copy). Replace the artwork and repoint
> the domains before shipping this as an independent product.

## What is in the box

A whole chat platform in one monorepo:

- **`fluxer_app/`** — the web client (React + TypeScript, Vite)
- **`fluxer_desktop/`** — the Electron desktop client (Windows, macOS, Linux)
- **`fluxer_api/`** — HTTP API, plus email, billing and moderation services
- **`fluxer_gateway/`** — the realtime WebSocket gateway
- **`fluxer_admin/`**, **`fluxer_app_proxy/`**, **`fluxer_media_proxy/`**, **`fluxer_unfurl/`**, **`fluxer_push/`** — supporting services
- **`packages/`** — shared TypeScript packages, `@fluxer/*` workspace scope
- **`fluxer_static/`** — marketing site and branding assets
- **`deploy/`**, **`packaging/`**, **`tools/`** — deployment, packaging, CI

## Requirements

- Rust (toolchain pinned in `rust-toolchain.toml`) for the services and the dev tooling
- Node.js 24+ and pnpm 11 (`corepack enable pnpm`)
- Docker for local infrastructure (Cassandra, Redis, object storage)
- A native C toolchain, plus whatever your platform needs to build Electron and the media stack

## Build and run

```sh
corepack enable pnpm
pnpm install
pnpm dev:bootstrap      # prepare local config and infrastructure
pnpm dev:infra:start    # Cassandra, Redis, object storage
pnpm dev                # build and run the stack
```

The desktop client is packaged on its own:

```sh
pnpm dev:desktop:deps
pnpm dev:desktop:package
```

`fluxer_docs/` holds the full documentation and `fluxer_desktop/PACKAGING.md` the installer and
store pipeline. To run your own server, follow the self-hosting documentation in `fluxer_docs/`.

## What Wizardry is not (yet)

This is a code-and-identity fork, not a finished product. Not done, and not pretended otherwise:

- no new artwork — the logo and icons are still Fluxer's (see above)
- no independent domains, package repositories or release pipeline
- no app-store listings, code-signing or notarisation identities of its own
- the translation copy still says "Fluxer" in the strings that spell the name out
- internal identifiers — Rust crates, `@fluxer/*` packages, `FLUXER_*` environment variables,
  the `fluxer://` deep-link scheme — are deliberately unchanged, because renaming them is a
  build-breaking change with no user-visible benefit

See [REBRAND.md](./REBRAND.md) for the full list and what each remaining item costs.

## Licence

AGPL-3.0-or-later — see [LICENSE](./LICENSE). If you run a modified version of this software as
a network service, the AGPL requires you to offer its users the corresponding source.

Artwork in `fluxer_static/` keeps its own terms: [fluxer_static/LICENSE](./fluxer_static/LICENSE)
(CC BY-SA 4.0, Fluxer) and
[fluxer_static/THIRD_PARTY_LICENSES.md](./fluxer_static/THIRD_PARTY_LICENSES.md).
