# Keeping Tabs

[![CI](https://github.com/lhnrdt/keeping-tabs/actions/workflows/ci.yml/badge.svg)](https://github.com/lhnrdt/keeping-tabs/actions/workflows/ci.yml)
[![Deploy](https://github.com/lhnrdt/keeping-tabs/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/lhnrdt/keeping-tabs/actions/workflows/deploy.yml?query=branch%3Amaster)
[![Release](https://img.shields.io/github/v/release/lhnrdt/keeping-tabs?label=release&color=526a58)](https://github.com/lhnrdt/keeping-tabs/releases/latest)

**Split shared expenses with friends, flatmates and partners. No signup.**

Keeping Tabs is a calm, mobile-first web app for keeping track of who paid what and who owes whom, in the spirit of Splitwise but without accounts. A group is shared through a secret link, and everything runs on free tiers.

**Live:** [app.keeping-tabs.workers.dev](https://app.keeping-tabs.workers.dev)

## Features

- **Groups without accounts:** create a group, share its unguessable link, regenerate the link if it reaches the wrong people.
- **Expenses and payments:** equal splits between any members, payments shown separately, edit and delete.
- **Balances and settling up:** everyone's balance, suggested payments (at most _n−1_), "All settled. Nice and easy."
- **Your total balance:** what you get back or owe, overall and per group, on the start screen.
- **Identity without signup:** each browser gets a private device identity. You claim your member in a group, and nobody else can pick it. Your name and avatar color follow you across groups.
- **Never lose your groups:** passkeys (synced by your phone or password manager), one-time links for another device, and recovery keys.
- **Feels like an app:** Konsta UI (iOS style), tabs, sheets and dialogs, view transitions, a warm light and dark theme. English, with German translations ready.
- **Accessible and resilient:** real labels, keyboard support, reduced-motion support, and forms that work without JavaScript.

## Privacy

No tracking, no analytics, no third-party requests (fonts and icons are bundled). The only personal data is the names you type in. Device keys, link tokens and recovery keys are stored only as hashes.

## Tech stack

| Layer     | Choice                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Framework | [SvelteKit](https://svelte.dev/docs/kit) 3 (Svelte 5 runes), TypeScript                                                        |
| UI        | [Konsta UI](https://konstaui.com) 5.5 (iOS theme), Tailwind CSS 4, [Tabler Icons](https://tabler.io/icons), Inter and Fraunces |
| Hosting   | Cloudflare Workers (`@sveltejs/adapter-cloudflare`)                                                                            |
| Database  | Cloudflare D1 (SQLite) with [Drizzle ORM](https://orm.drizzle.team)                                                            |
| Passkeys  | [SimpleWebAuthn](https://simplewebauthn.dev)                                                                                   |
| i18n      | [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)                                                       |
| Tests     | Vitest (unit), Playwright (end-to-end, against the production worker)                                                          |
| Toolchain | Node LTS and pnpm via [mise](https://mise.jdx.dev)                                                                             |

## Getting started

Requirements: [mise](https://mise.jdx.dev) (installs the pinned Node and pnpm) and a free Cloudflare account for deploying.

```sh
mise install                              # Node + pnpm from mise.toml
pnpm install
pnpm exec playwright install chromium     # browser for the tests
pnpm db:migrate:local                     # local D1 database
pnpm dev                                  # http://localhost:5173
```

The dev server uses a local D1 database through Wrangler; no Cloudflare login is needed for local development.

### Useful scripts

| Script                      | What it does                                                      |
| --------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                  | Dev server with hot reload                                        |
| `pnpm check`                | Worker types, translations, then type-check (must be 0 errors)    |
| `pnpm lint`                 | Prettier and ESLint                                               |
| `pnpm exec vitest --run`    | Unit tests                                                        |
| `pnpm exec playwright test` | End-to-end tests (builds and runs the production worker locally)  |
| `pnpm db:generate`          | Generate a migration after changing `src/lib/server/db/schema.ts` |
| `pnpm db:migrate:local`     | Apply migrations to the local database                            |

## Project structure

```
src/
  routes/                 pages and server actions (home, /new, /g/[token], /device)
  lib/components/         UI components, one concern per file (home/, group/, expense/, payment/, device/)
  lib/server/             server-only modules: database, groups, expenses, payments, claims, people, passkeys
  lib/styles/theme.css    design tokens (palette, fonts, tints) mapped onto Konsta
  lib/*.ts                pure logic with unit tests (money, settle, validation, tints)
drizzle/                  SQL migrations
worker/staging.ts         password protection for the staging environment
scripts/                  release versioning
```

## Workflow and releases

- **`master`** (default branch) deploys to production; **`staging`** deploys automatically to a password-protected staging environment.
- Every change goes through a pull request into `staging`, with a conventional title (`feat: …`, `fix: …`). CI checks the title, one-line commits, lint, types, unit and end-to-end tests.
- After each staging deploy a **release PR** (`staging → master`) is opened or updated; merging it ships to production, tags the release and creates a [GitHub release](https://github.com/lhnrdt/keeping-tabs/releases).
- **Versioning:** semantic versions from PR titles. `feat` raises the minor version, everything else the patch; breaking changes raise the minor version while the major version is 0. Staging builds are release candidates (`0.7.0-rc.2`).
- Every deployed page carries its version: in the footer, the `x-app-version` header and `/_app/version.json`. Deploys fail if the live site doesn't report the expected version.

## Status badges

The badges at the top are GitHub's own workflow badges and can be embedded anywhere (another README, a wiki, a website):

```markdown
[![CI](https://github.com/lhnrdt/keeping-tabs/actions/workflows/ci.yml/badge.svg)](https://github.com/lhnrdt/keeping-tabs/actions/workflows/ci.yml)
[![Deploy](https://github.com/lhnrdt/keeping-tabs/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/lhnrdt/keeping-tabs/actions/workflows/deploy.yml?query=branch%3Amaster)
```

As HTML:

```html
<a href="https://github.com/lhnrdt/keeping-tabs/actions/workflows/ci.yml">
	<img
		src="https://github.com/lhnrdt/keeping-tabs/actions/workflows/ci.yml/badge.svg"
		alt="CI status"
	/>
</a>
```

Add `?branch=staging` or `?branch=master` to the badge URL to show a specific branch.
