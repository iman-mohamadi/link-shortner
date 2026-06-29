# Lumen — links that bend light

A premium link shortener: forge short links with custom slugs, passwords and
expiry, then watch every click travel the world in real time.

Monorepo managed with **Turborepo** + **pnpm**.

```
apps/
  api/   Fastify 5 + Prisma 7 (Postgres) + Redis — REST API & redirects
  web/   Next.js 16 + React 19 — marketing site & app dashboard
packages/
  types/             Shared Zod schemas / TS types (@repo/types)
  ui/                Shared shadcn/ui components (@workspace/ui)
  eslint-config/     Shared ESLint config
  typescript-config/ Shared tsconfig bases
```

## Features

- **Phone OTP auth** — passwordless sign-in via one-time codes (Redis-backed,
  rate-limited, single-use).
- **Short links** with auto-fetched title/description/favicon previews.
- **Pro plan**: custom branded slugs, password-protected links, expiring links.
- **Real-time analytics** — clicks broken down by country, device and browser.
- **High-speed redirects** — clicks are buffered in Redis and flushed to
  Postgres in batches.
- **Instant QR codes** for every link.

## Prerequisites

- Node.js >= 20
- pnpm 10+
- PostgreSQL and Redis running locally (or reachable via env vars)

## Setup

```bash
pnpm install

# Configure the API — copy and edit the env file
# apps/api/.env  (DB connection, JWT_SECRET, PUBLIC_BASE_URL, WEB_ORIGIN, …)

# Apply database migrations
pnpm --filter @link-shortner/api exec prisma migrate deploy

# Run everything (API on :5000, web on :3000)
pnpm dev
```

### Environment variables (apps/api/.env)

| Variable          | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `DB_*`            | Postgres host/port/database/user/password                     |
| `JWT_SECRET`      | Signs auth tokens. **Required in production** (boot fails otherwise) |
| `REDIS_URL`       | OTP storage, rate limiting and click buffering                |
| `PUBLIC_BASE_URL` | Origin that serves slug redirects + QR codes (your short domain) |
| `WEB_ORIGIN`      | Allowed browser origin(s) for CORS (comma separated)          |
| `ADMIN_PHONES`    | Phone numbers allowed to call `/api/admin/*` (comma separated) |
| `PORT`            | API port (default 5000)                                       |
| `NODE_ENV`        | `development` \| `production`                                 |

The web app reads `NEXT_PUBLIC_API_URL` (see `apps/web/.env.local`).

## Scripts

```bash
pnpm dev        # run all apps in watch mode
pnpm build      # build all apps
pnpm lint       # lint all packages
pnpm typecheck  # type-check all packages
pnpm format     # prettier --write
```

## Notes

- In **development**, the send-OTP endpoint returns the code in its response and
  `/api/billing/checkout` simulates a successful Pro upgrade so the full flow can
  be demoed without an SMS or payment provider. Both are disabled in production.
- Admin endpoints (`/api/admin/*`) require a JWT whose phone is listed in
  `ADMIN_PHONES`.
