# Rebrand: Fluxer → Wizardry

This file records exactly where the product name lives in the tree, what has been changed, and
what is deliberately left alone. Keep it current: it is the difference between a rebrand and a
half-renamed mess.

Rule of thumb: **user-visible identity is renamed, internal identifiers are not.** A crate called
`fluxer_api` or a `@fluxer/constants` import never appears on screen, but renaming them touches
thousands of lines and breaks the build silently. The `fluxer_*` skeleton stays.

## Changed

| File | What |
| --- | --- |
| `fluxer_app/src/features/app/config/ProductConstants.ts` | `PRODUCT_NAME` → `Wizardry`. This is the single source for most in-app copy, which interpolates `{productName}`. |
| `fluxer_app/src/features/app/config/I18nDisplayConstants.ts` | `DESKTOP_ENTRY_NAME`, `CANARY_DESKTOP_ENTRY_NAME` → `Wizardry`, `Wizardry Canary`. |
| `fluxer_app/index.html` | `<title>`, `apple-mobile-web-app-title`, meta description. |
| `fluxer_desktop/src/common/DesktopIdentity.ts` | Desktop app names, macOS bundle IDs (`app.wizardry`, `.canary`, `.development`), Linux desktop-entry IDs. Legacy IDs kept so existing installs of a Fluxer build are still recognised. |
| `fluxer_desktop/electron-builder.config.cjs` | `productName`, `linuxOptDirName`, `artifactProductName`, `appId`, `linuxPackageName`, `linuxDesktopId`, `linuxComment` for all three channels. |
| `fluxer_desktop/src/main/FluxerAudioIdentity.ts` | `Wizardry` added to the fallback product names and to the audio-node prefixes, so the app still excludes its own audio from virtual-mic capture. |
| `fluxer_desktop/src/main/Spellcheck.ts` | `Wizardry` / `wizardry` added to the spellcheck allowlist. |
| `fluxer_api/src/api/instance/ProductName.ts` | `UPSTREAM_PRODUCT_NAME` → `Wizardry`; the fallback when an instance has set no branding of its own. |
| `fluxer_api/src/api/stripe/BillingBranding.ts` | Hosted product name and UPI mandate description. Note: the legal seller named in the checkout disclaimer is still Fluxer Platform AB — that is an entity, not a string, and it must not be renamed. |
| `fluxer_admin/src/templates/pages/instance_branding.rs` | Branding-preview default name. |
| `packages/desktop_ipc/src/NativeTitlebarShell.ts` | Default product name in the native titlebar before the instance reports its own. |
| `package.json` | Root package name → `wizardry`. |

The admin branding page and the self-hosted setup wizard already let an operator set
`branding.product_name` at runtime; that is the supported way to brand an instance, and it
overrides every fallback above.

## Deliberately unchanged

- **Internal identifiers.** Rust crates (`fluxer_api`, `fluxer_gateway`, …), the `@fluxer/*`
  package scope, `FLUXER_*` environment variables, CSS class names, debug globals, gRPC service
  names. No user ever sees these.
- **Domains.** `fluxer.com`, `fluxer.app`, `fluxer_static`, the `pkgs.fluxer.com` package
  repositories. Pointing them at Wizardry infrastructure is a deployment job, not a rename.
- **`packages/instance_bootstrap/src/OfficialInstance.ts`.** These constants identify the official
  hosted instance; changing the name alone would leave the endpoints pointing at Fluxer anyway.
  Redo this whole file together, once there is a Wizardry instance to point at.
- **Deep-link scheme (`fluxer://`).** Also the `protocolScheme` in the electron-builder config and
  the Apple associated-domain file (`fluxer_app_proxy/src/routes/apple_association.rs`). Changing
  the scheme needs matching server-side redirect URIs and app-site association on the new domain.
- **Updater identity.** Velopack IDs, Windows AUMID (`Fluxer.Fluxer`), toast activator CLSIDs,
  legacy Squirrel ID. These are install-continuity keys: change them and existing installs stop
  receiving updates instead of switching to yours.
- **macOS provisioning profiles.** `electron-builder.config.cjs` still names
  `Fluxer.provisionprofile` / `Fluxer_Canary.provisionprofile`, which do not exist in this tree.
  Signing and notarisation need a Wizardry Apple developer identity.
- **Translation copy.** ~50 locales under `fluxer_app/src/features/i18n/locales/` contain the
  literal name "Fluxer" in strings that spell it out (for example "{domain} runs a newer version
  of Fluxer than this app"). Renaming them is a translation pass, not a find-and-replace: many
  strings are marked `#.` with translator context that names the product, and the `.po` files are
  regenerated from source.
- **`fluxer_static/marketing/branding/`** — the logo, wordmark and symbol are Fluxer artwork
  (CC BY-SA 4.0). Wizardry needs its own.

## Next steps, in the order that unblocks the most

1. New artwork: logo, wordmark, symbol, favicon set, app icons for all three desktop channels,
   Android/iOS icons. Everything else can stay ugly for a while; the icon cannot.
2. A domain, and the deployment docs repointed at it (`deploy/`, `fluxer_docs/`, `config/env/`).
3. Decide whether to rename the `fluxer://` scheme and the internal crate/package names. Doing it
   as one scripted pass, with a full `pnpm typecheck` + `cargo check` afterwards, is the only safe
   way; doing it piecemeal is how a fork stops building.
